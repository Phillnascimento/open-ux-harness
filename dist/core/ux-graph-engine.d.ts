export type UXNodeType = 'token' | 'component' | 'screen' | 'user-flow' | 'contract' | 'story' | 'persona';
export type UXEdgeType = 'uses_token' | 'composes_component' | 'navigates_to' | 'satisfies_contract' | 'renders_state' | 'impacts_persona';
export type EdgeProvenance = 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS';
export interface UXNode {
    id: string;
    type: UXNodeType;
    label: string;
    filePath?: string;
    metadata?: Record<string, any>;
}
export interface UXEdge {
    source: string;
    target: string;
    type: UXEdgeType;
    provenance: EdgeProvenance;
    confidence: number;
    label?: string;
    metadata?: Record<string, any>;
}
export interface BlastRadiusResult {
    targetId: string;
    targetNode?: UXNode;
    directDependents: UXNode[];
    allImpactedNodes: UXNode[];
    impactedByType: Record<UXNodeType, UXNode[]>;
    totalImpactedCount: number;
    depthMap: Record<string, number>;
    isHighRisk: boolean;
}
export interface GodComponentMetric {
    node: UXNode;
    inDegree: number;
    outDegree: number;
    totalDegree: number;
}
export interface OrphanNodesResult {
    orphanTokens: UXNode[];
    orphanComponents: UXNode[];
    orphanScreens: UXNode[];
}
export interface UXGraphSnapshot {
    version: string;
    createdAt: string;
    nodes: UXNode[];
    edges: UXEdge[];
    stats: {
        totalNodes: number;
        totalEdges: number;
        byNodeType: Record<UXNodeType, number>;
        byEdgeType: Record<UXEdgeType, number>;
        byProvenance: Record<EdgeProvenance, number>;
    };
}
export declare class UXGraphEngine {
    private nodes;
    private edges;
    private outgoing;
    private incoming;
    addNode(node: UXNode): void;
    getNode(id: string): UXNode | undefined;
    hasNode(id: string): boolean;
    getAllNodes(): UXNode[];
    getNodesByType(type: UXNodeType): UXNode[];
    addEdge(edge: UXEdge): void;
    getEdges(): UXEdge[];
    getOutgoingEdges(nodeId: string): UXEdge[];
    getIncomingEdges(nodeId: string): UXEdge[];
    /**
     * Calcula o Raio de Impacto (Blast Radius) de uma alteração no nó-alvo.
     * Se um Token muda, todos os Componentes que usam o Token, e todas as Telas que
     * compõem esses Componentes, são afetados (propagação reversa/dependência).
     */
    calculateBlastRadius(nodeId: string, riskThreshold?: number): BlastRadiusResult;
    /**
     * Encontra o menor caminho entre dois nós usando BFS (Breadth-First Search).
     */
    findShortestPath(fromId: string, toId: string): string[] | null;
    /**
     * Retorna um subgrafo em torno de um nó central até uma profundidade maxHops.
     * Usado para montagem de micro-contexto com baixo consumo de tokens.
     */
    getSubGraph(centerNodeId: string, maxHops?: number): {
        nodes: UXNode[];
        edges: UXEdge[];
    };
    /**
     * Identifica "God Components" (componentes com acoplamento/grau excessivo).
     */
    findGodComponents(threshold?: number): GodComponentMetric[];
    /**
     * Identifica nós órfãos (Tokens nunca utilizados por componentes, e componentes nunca renderizados).
     */
    findOrphanNodes(): OrphanNodesResult;
    /**
     * Detecta comunidades temáticas simples agrupando componentes e telas conectados.
     */
    detectCommunities(): Record<string, UXNode[]>;
    /**
     * Ingestão determinística de Tokens no padrão W3C DTCG 2025.10.
     */
    ingestTokensFromDTCG(dtcgObject: Record<string, any>, filePath?: string): number;
    /**
     * Ingestão de Contrato de Design (design-contract.md).
     */
    ingestDesignContract(contractContent: string, filePath?: string): void;
    /**
     * Exporta um snapshot completo serializável em JSON.
     */
    toSnapshot(): UXGraphSnapshot;
    /**
     * Carrega o grafo a partir de um snapshot persistido.
     */
    static fromSnapshot(snapshot: UXGraphSnapshot): UXGraphEngine;
}
