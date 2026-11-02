export class UXGraphEngine {
    nodes = new Map();
    edges = [];
    // Adjacency: source -> edges saindo
    outgoing = new Map();
    // Reverse adjacency: target -> edges entrando (quem depende deste nó)
    incoming = new Map();
    addNode(node) {
        if (!node.id || !node.type) {
            throw new Error('UXNode deve conter id e type válidos.');
        }
        this.nodes.set(node.id, {
            ...node,
            label: node.label || node.id
        });
        if (!this.outgoing.has(node.id))
            this.outgoing.set(node.id, []);
        if (!this.incoming.has(node.id))
            this.incoming.set(node.id, []);
    }
    getNode(id) {
        return this.nodes.get(id);
    }
    hasNode(id) {
        return this.nodes.has(id);
    }
    getAllNodes() {
        return Array.from(this.nodes.values());
    }
    getNodesByType(type) {
        return this.getAllNodes().filter(n => n.type === type);
    }
    addEdge(edge) {
        if (!this.nodes.has(edge.source)) {
            throw new Error(`Nó de origem (source) não encontrado no grafo: ${edge.source}`);
        }
        if (!this.nodes.has(edge.target)) {
            throw new Error(`Nó de destino (target) não encontrado no grafo: ${edge.target}`);
        }
        const normalizedEdge = {
            ...edge,
            confidence: Math.max(0, Math.min(1, edge.confidence ?? (edge.provenance === 'EXTRACTED' ? 1.0 : 0.8)))
        };
        this.edges.push(normalizedEdge);
        if (!this.outgoing.has(edge.source))
            this.outgoing.set(edge.source, []);
        this.outgoing.get(edge.source).push(normalizedEdge);
        if (!this.incoming.has(edge.target))
            this.incoming.set(edge.target, []);
        this.incoming.get(edge.target).push(normalizedEdge);
    }
    getEdges() {
        return [...this.edges];
    }
    getOutgoingEdges(nodeId) {
        return this.outgoing.get(nodeId) || [];
    }
    getIncomingEdges(nodeId) {
        return this.incoming.get(nodeId) || [];
    }
    /**
     * Calcula o Raio de Impacto (Blast Radius) de uma alteração no nó-alvo.
     * Se um Token muda, todos os Componentes que usam o Token, e todas as Telas que
     * compõem esses Componentes, são afetados (propagação reversa/dependência).
     */
    calculateBlastRadius(nodeId, riskThreshold = 5) {
        const targetNode = this.getNode(nodeId);
        if (!targetNode) {
            throw new Error(`Nó não encontrado para cálculo de Blast Radius: ${nodeId}`);
        }
        const visited = new Set();
        const depthMap = {};
        const queue = [{ id: nodeId, depth: 0 }];
        const directDependents = [];
        const allImpactedNodes = [];
        visited.add(nodeId);
        depthMap[nodeId] = 0;
        while (queue.length > 0) {
            const { id: currentId, depth } = queue.shift();
            // Quem depende de currentId?
            // Arestas onde target == currentId (ex: Component uses_token Token -> source é Component, target é Token)
            // E também arestas de navegação / composição downstream
            const incomingEdges = this.getIncomingEdges(currentId);
            for (const edge of incomingEdges) {
                const dependentId = edge.source;
                if (!visited.has(dependentId)) {
                    visited.add(dependentId);
                    const nextDepth = depth + 1;
                    depthMap[dependentId] = nextDepth;
                    const node = this.getNode(dependentId);
                    if (node) {
                        allImpactedNodes.push(node);
                        if (nextDepth === 1) {
                            directDependents.push(node);
                        }
                    }
                    queue.push({ id: dependentId, depth: nextDepth });
                }
            }
            // Além disso, se o nó é uma Tela, quem navega a partir dela ou telas filhas podem ser impactadas
            if (currentId !== nodeId) {
                const outgoingEdges = this.getOutgoingEdges(currentId);
                for (const edge of outgoingEdges) {
                    if (edge.type === 'impacts_persona') {
                        const personaId = edge.target;
                        if (!visited.has(personaId)) {
                            visited.add(personaId);
                            depthMap[personaId] = depth + 1;
                            const node = this.getNode(personaId);
                            if (node) {
                                allImpactedNodes.push(node);
                            }
                        }
                    }
                }
            }
        }
        const impactedByType = {
            token: [],
            component: [],
            screen: [],
            'user-flow': [],
            contract: [],
            story: [],
            persona: []
        };
        for (const node of allImpactedNodes) {
            impactedByType[node.type].push(node);
        }
        const totalImpactedCount = allImpactedNodes.length;
        return {
            targetId: nodeId,
            targetNode,
            directDependents,
            allImpactedNodes,
            impactedByType,
            totalImpactedCount,
            depthMap,
            isHighRisk: totalImpactedCount > riskThreshold
        };
    }
    /**
     * Encontra o menor caminho entre dois nós usando BFS (Breadth-First Search).
     */
    findShortestPath(fromId, toId) {
        if (!this.hasNode(fromId) || !this.hasNode(toId)) {
            return null;
        }
        if (fromId === toId) {
            return [fromId];
        }
        const queue = [fromId];
        const visited = new Set([fromId]);
        const parent = new Map();
        while (queue.length > 0) {
            const current = queue.shift();
            if (current === toId) {
                // Reconstrói o caminho
                const path = [];
                let step = toId;
                while (step) {
                    path.unshift(step);
                    step = parent.get(step);
                }
                return path;
            }
            // Checa arestas saintes e arestas entrantes para navegação bidirecional
            const neighbors = [];
            for (const e of this.getOutgoingEdges(current)) {
                neighbors.push(e.target);
            }
            for (const e of this.getIncomingEdges(current)) {
                neighbors.push(e.source);
            }
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    parent.set(neighbor, current);
                    queue.push(neighbor);
                }
            }
        }
        return null;
    }
    /**
     * Retorna um subgrafo em torno de um nó central até uma profundidade maxHops.
     * Usado para montagem de micro-contexto com baixo consumo de tokens.
     */
    getSubGraph(centerNodeId, maxHops = 2) {
        const center = this.getNode(centerNodeId);
        if (!center) {
            return { nodes: [], edges: [] };
        }
        const visitedNodes = new Set([centerNodeId]);
        const queue = [{ id: centerNodeId, depth: 0 }];
        while (queue.length > 0) {
            const { id, depth } = queue.shift();
            if (depth >= maxHops)
                continue;
            const neighbors = [];
            for (const e of this.getOutgoingEdges(id))
                neighbors.push(e.target);
            for (const e of this.getIncomingEdges(id))
                neighbors.push(e.source);
            for (const neighbor of neighbors) {
                if (!visitedNodes.has(neighbor)) {
                    visitedNodes.add(neighbor);
                    queue.push({ id: neighbor, depth: depth + 1 });
                }
            }
        }
        const subNodes = [];
        for (const nodeId of visitedNodes) {
            const n = this.getNode(nodeId);
            if (n)
                subNodes.push(n);
        }
        const subEdges = this.edges.filter(e => visitedNodes.has(e.source) && visitedNodes.has(e.target));
        return { nodes: subNodes, edges: subEdges };
    }
    /**
     * Identifica "God Components" (componentes com acoplamento/grau excessivo).
     */
    findGodComponents(threshold = 4) {
        const components = this.getNodesByType('component');
        const results = [];
        for (const comp of components) {
            const inDegree = this.getIncomingEdges(comp.id).length;
            const outDegree = this.getOutgoingEdges(comp.id).length;
            const totalDegree = inDegree + outDegree;
            if (totalDegree >= threshold) {
                results.push({
                    node: comp,
                    inDegree,
                    outDegree,
                    totalDegree
                });
            }
        }
        return results.sort((a, b) => b.totalDegree - a.totalDegree);
    }
    /**
     * Identifica nós órfãos (Tokens nunca utilizados por componentes, e componentes nunca renderizados).
     */
    findOrphanNodes() {
        const orphanTokens = [];
        const orphanComponents = [];
        const orphanScreens = [];
        // Tokens órfãos: nenhum componente usa
        for (const token of this.getNodesByType('token')) {
            const dependents = this.getIncomingEdges(token.id);
            if (dependents.length === 0) {
                orphanTokens.push(token);
            }
        }
        // Componentes órfãos: não compõem nenhuma tela nem outro componente
        for (const comp of this.getNodesByType('component')) {
            const usedBy = this.getIncomingEdges(comp.id);
            if (usedBy.length === 0) {
                orphanComponents.push(comp);
            }
        }
        // Telas órfãs: sem fluxos de entrada nem saída
        for (const screen of this.getNodesByType('screen')) {
            const inEdges = this.getIncomingEdges(screen.id);
            const outEdges = this.getOutgoingEdges(screen.id);
            if (inEdges.length === 0 && outEdges.length === 0) {
                orphanScreens.push(screen);
            }
        }
        return {
            orphanTokens,
            orphanComponents,
            orphanScreens
        };
    }
    /**
     * Detecta comunidades temáticas simples agrupando componentes e telas conectados.
     */
    detectCommunities() {
        const visited = new Set();
        const communities = {};
        let clusterIndex = 1;
        for (const node of this.getAllNodes()) {
            if (visited.has(node.id))
                continue;
            const clusterNodes = [];
            const queue = [node.id];
            visited.add(node.id);
            while (queue.length > 0) {
                const currId = queue.shift();
                const currNode = this.getNode(currId);
                if (currNode)
                    clusterNodes.push(currNode);
                const neighbors = [];
                for (const e of this.getOutgoingEdges(currId))
                    neighbors.push(e.target);
                for (const e of this.getIncomingEdges(currId))
                    neighbors.push(e.source);
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }
            const clusterName = `Cluster_${clusterIndex++} (${clusterNodes[0].label})`;
            communities[clusterName] = clusterNodes;
        }
        return communities;
    }
    /**
     * Ingestão determinística de Tokens no padrão W3C DTCG 2025.10.
     */
    ingestTokensFromDTCG(dtcgObject, filePath) {
        let tokenCount = 0;
        const traverse = (obj, currentPath = []) => {
            if (!obj || typeof obj !== 'object')
                return;
            if (Object.prototype.hasOwnProperty.call(obj, '$value')) {
                const tokenId = `token:${currentPath.join('.')}`;
                const label = currentPath.join('.');
                this.addNode({
                    id: tokenId,
                    type: 'token',
                    label,
                    filePath,
                    metadata: {
                        value: obj.$value,
                        type: obj.$type || 'unknown',
                        description: obj.$description
                    }
                });
                tokenCount++;
                return;
            }
            for (const [key, value] of Object.entries(obj)) {
                if (!key.startsWith('$')) {
                    traverse(value, [...currentPath, key]);
                }
            }
        };
        traverse(dtcgObject);
        return tokenCount;
    }
    /**
     * Ingestão de Contrato de Design (design-contract.md).
     */
    ingestDesignContract(contractContent, filePath) {
        const contractId = 'contract:design-contract';
        this.addNode({
            id: contractId,
            type: 'contract',
            label: 'Design Contract (Anti-Slop)',
            filePath,
            metadata: { rawLength: contractContent.length }
        });
    }
    /**
     * Exporta um snapshot completo serializável em JSON.
     */
    toSnapshot() {
        const nodes = this.getAllNodes();
        const edges = this.getEdges();
        const byNodeType = {
            token: 0,
            component: 0,
            screen: 0,
            'user-flow': 0,
            contract: 0,
            story: 0,
            persona: 0
        };
        for (const n of nodes) {
            byNodeType[n.type] = (byNodeType[n.type] || 0) + 1;
        }
        const byEdgeType = {
            uses_token: 0,
            composes_component: 0,
            navigates_to: 0,
            satisfies_contract: 0,
            renders_state: 0,
            impacts_persona: 0
        };
        for (const e of edges) {
            byEdgeType[e.type] = (byEdgeType[e.type] || 0) + 1;
        }
        const byProvenance = {
            EXTRACTED: 0,
            INFERRED: 0,
            AMBIGUOUS: 0
        };
        for (const e of edges) {
            byProvenance[e.provenance] = (byProvenance[e.provenance] || 0) + 1;
        }
        return {
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            nodes,
            edges,
            stats: {
                totalNodes: nodes.length,
                totalEdges: edges.length,
                byNodeType,
                byEdgeType,
                byProvenance
            }
        };
    }
    /**
     * Carrega o grafo a partir de um snapshot persistido.
     */
    static fromSnapshot(snapshot) {
        const engine = new UXGraphEngine();
        for (const node of snapshot.nodes) {
            engine.addNode(node);
        }
        for (const edge of snapshot.edges) {
            engine.addEdge(edge);
        }
        return engine;
    }
}
