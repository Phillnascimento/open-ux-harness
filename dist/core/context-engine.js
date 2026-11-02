import fs from 'node:fs';
import path from 'node:path';
import { ConfigLoader } from './config-loader.js';
export class ContextEngine {
    baseDir;
    registry;
    config;
    preset;
    constructor(baseDir = process.cwd()) {
        this.baseDir = baseDir;
        const loader = new ConfigLoader(baseDir);
        const resolved = loader.getResolvedConfiguration();
        this.config = resolved.config;
        this.preset = resolved.preset;
        const registryPath = path.resolve(baseDir, 'mcp-registry', 'servers.json');
        if (!fs.existsSync(registryPath)) {
            throw new Error(`MCP Registry file not found at: ${registryPath}`);
        }
        this.registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    }
    /**
     * Executa o MCP Pruning Dinâmico para uma skill específica.
     * Apenas os servidores que a skill precisa e que estão autorizados no preset ativo são mantidos no contexto.
     */
    pruneForSkill(skillName) {
        const activeServers = {};
        const prunedServers = [];
        const allowedInPreset = new Set(this.preset.mcpServers);
        for (const [serverId, serverDef] of Object.entries(this.registry.servers)) {
            const isAllowedByPreset = allowedInPreset.has(serverId);
            const isNeededBySkill = serverDef.usedBySkills.includes(skillName);
            if (isAllowedByPreset && isNeededBySkill) {
                activeServers[serverId] = serverDef;
            }
            else {
                prunedServers.push(serverId);
            }
        }
        const totalAvailable = Object.keys(this.registry.servers).length;
        const activeCount = Object.keys(activeServers).length;
        const savings = totalAvailable > 0
            ? Math.round(((totalAvailable - activeCount) / totalAvailable) * 100)
            : 0;
        const staticCacheablePromptBlock = this.generateCacheableSystemPrompt(skillName);
        return {
            activeSkill: skillName,
            activeServers,
            prunedServers,
            tokenSavingsEstimatePercentage: savings,
            staticCacheablePromptBlock
        };
    }
    /**
     * Monta o micro-contexto cirúrgico para uma tarefa focada em um nó específico do UX Graph.
     * Inspirado no Graphify para evitar context rot e economizar tokens.
     */
    assembleSubGraphContext(graph, targetNodeId, maxHops = 2) {
        const targetNode = graph.getNode(targetNodeId);
        if (!targetNode) {
            throw new Error(`Nó-alvo não encontrado no grafo para montagem de contexto: ${targetNodeId}`);
        }
        const sub = graph.getSubGraph(targetNodeId, maxHops);
        const totalNodesInGraph = graph.getAllNodes().length;
        const reduction = totalNodesInGraph > 0
            ? Math.max(0, Math.round(((totalNodesInGraph - sub.nodes.length) / totalNodesInGraph) * 100))
            : 0;
        const tokensList = sub.nodes.filter(n => n.type === 'token').map(n => `- Token: ${n.label} (${n.metadata?.value || 'N/A'})`).join('\n');
        const compList = sub.nodes.filter(n => n.type === 'component').map(n => `- Componente: ${n.label}`).join('\n');
        const screenList = sub.nodes.filter(n => n.type === 'screen').map(n => `- Tela: ${n.label}`).join('\n');
        const contextPromptBlock = `<!-- GRAPH_AWARE_MICRO_CONTEXT: ${targetNodeId} (Hops: ${maxHops}) -->
# SUBGRAFO TOPOLÓGICO DA TAREFA ATIVA
- Nó em Foco: [${targetNode.type.toUpperCase()}] ${targetNode.label} (${targetNode.id})
- Total de Nós Conectados: ${sub.nodes.length} (Economia de contexto: ~${reduction}%)

## Tokens Diretamente Relacionados:
${tokensList || '- Nenhum token imediato.'}

## Componentes Conectados:
${compList || '- Nenhum componente vizinho.'}

## Telas de Impacto:
${screenList || '- Nenhuma tela no subgrafo.'}
<!-- END_GRAPH_AWARE_MICRO_CONTEXT -->`;
        return {
            targetId: targetNodeId,
            subGraphNodesCount: sub.nodes.length,
            subGraphEdgesCount: sub.edges.length,
            contextPromptBlock,
            estimatedTokenReductionPercentage: reduction
        };
    }
    /**
     * Gera o bloco de prompt estático para Prompt Caching (W3C DTCG, WCAG 2.2, 8pt grid).
     * Por ser imutável e colocado no topo, pode usufruir de cache e economizar até 90% dos tokens de entrada.
     */
    generateCacheableSystemPrompt(skillName) {
        return `<!-- CACHE_CONTROL: EPHEMERAL_STATIC_SYSTEM_PROMPT -->
# OPEN UX HARNESS - CORE PROCEDURAL CONTRACT
- Mode: ${this.preset.id.toUpperCase()} (${this.preset.name})
- Target Skill: ${skillName}
- W3C DTCG Format: ${this.preset.tokens.strictDtcg ? 'Strict DTCG 2025.10' : 'Flexible JSON Tokens'}
- Quality Assurance: Craft Guardian Active (8pt Grid, WCAG 2.2 AA/AAA, 4 UI States: default, empty, loading, error).
- Zero YOLO Mode: Enabled. Breaking and destructive operations require human confirmation.
<!-- END_CACHE_CONTROL -->`;
    }
}
