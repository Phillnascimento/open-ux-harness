export type SlopCategory = 'slop' | 'quality' | 'drift';
export type SlopSeverity = 'error' | 'warning' | 'advisory';
export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3';
export interface AntiSlopRule {
    id: string;
    category: SlopCategory;
    severity: SlopSeverity;
    priority: PriorityLevel;
    name: string;
    description: string;
    check: (content: string, filePath: string, knownTokens?: Set<string>) => SlopFinding[];
}
export interface SlopFinding {
    ruleId: string;
    category: SlopCategory;
    severity: SlopSeverity;
    priority: PriorityLevel;
    name: string;
    message: string;
    filePath: string;
    line?: number;
    snippet?: string;
    suggestedFix: string;
}
export interface AntiSlopScanResult {
    passed: boolean;
    score: number;
    totalFindings: number;
    findings: SlopFinding[];
    summary: {
        p0Count: number;
        p1Count: number;
        p2Count: number;
        p3Count: number;
        slopCount: number;
        qualityCount: number;
        driftCount: number;
    };
}
/**
 * Motor determinístico anti-slop e guardião de integridade visual.
 * Incorpora as 62 regras canônicas de craft visual e qualidade de implementação (inspirado em Impeccable),
 * funcionando nativamente em TypeScript com suporte opcional ao binário Impeccable CLI.
 */
export declare class AntiSlopEngine {
    static readonly RULES: AntiSlopRule[];
    /**
     * Executa varredura estática de regras sobre um conteúdo de arquivo.
     */
    static scan(content: string, filePath: string, knownTokens?: Set<string>): AntiSlopScanResult;
    /**
     * Executa varredura em um arquivo no disco.
     */
    static scanFile(filePath: string, knownTokens?: Set<string>): AntiSlopScanResult;
    /**
     * Executa varredura em um diretório recursivamente.
     */
    static scanDirectory(dirPath: string, extensions?: string[]): AntiSlopScanResult;
    /**
     * Suporte Híbrido: Executa o CLI do Impeccable (caso instalado via npm global ou local)
     * delegando a execução para máxima performance em Rust sem disparar downloads interativos.
     */
    static runImpeccableCli(targetPath: string): {
        available: boolean;
        output?: string;
        error?: string;
    };
}
