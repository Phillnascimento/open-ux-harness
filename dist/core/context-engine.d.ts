import { UXGraphEngine } from './ux-graph-engine.js';
export interface MCPServerDefinition {
    name: string;
    transport: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
    capabilities: string[];
    usedBySkills: string[];
    filteringStrategy: string;
}
export interface MCPRegistry {
    servers: Record<string, MCPServerDefinition>;
}
export interface PrunedContextResult {
    activeSkill: string;
    activeServers: Record<string, MCPServerDefinition>;
    prunedServers: string[];
    tokenSavingsEstimatePercentage: number;
    staticCacheablePromptBlock: string;
}
export interface SubGraphContextResult {
    targetId: string;
    subGraphNodesCount: number;
    subGraphEdgesCount: number;
    contextPromptBlock: string;
    estimatedTokenReductionPercentage: number;
}
export declare class ContextEngine {
    private baseDir;
    private registry;
    private config;
    private preset;
    constructor(baseDir?: string);
    /**
     * Executa o MCP Pruning Dinâmico para uma skill específica.
     * Apenas os servidores que a skill precisa e que estão autorizados no preset ativo são mantidos no contexto.
     */
    pruneForSkill(skillName: string): PrunedContextResult;
    /**
     * Monta o micro-contexto cirúrgico para uma tarefa focada em um nó específico do UX Graph.
     * Inspirado no Graphify para evitar context rot e economizar tokens.
     */
    assembleSubGraphContext(graph: UXGraphEngine, targetNodeId: string, maxHops?: number): SubGraphContextResult;
    /**
     * Gera o bloco de prompt estático para Prompt Caching (W3C DTCG, WCAG 2.2, 8pt grid).
     * Por ser imutável e colocado no topo, pode usufruir de cache e economizar até 90% dos tokens de entrada.
     */
    private generateCacheableSystemPrompt;
}
