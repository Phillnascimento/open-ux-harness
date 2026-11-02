/**
 * Open UX Harness — Deterministic UX Humanizer & Anti-Slop Linter
 *
 * Motor determinístico de auditoria e purificação de microcopy para interfaces digitais.
 * Identifica e reporta os 15 padrões de "AI Slop" em textos, headers, botões e modais,
 * calculando score de craft textual e sugerindo alternativas diretas em Português do Brasil.
 */
export type PatternSeverity = 'critical' | 'major' | 'minor';
export interface UXCopyTell {
    patternId: string;
    patternName: string;
    severity: PatternSeverity;
    matchedText: string;
    suggestedFix: string;
    line?: number;
}
export interface UXCopyAuditResult {
    passed: boolean;
    score: number;
    totalTells: number;
    criticalCount: number;
    majorCount: number;
    minorCount: number;
    tells: UXCopyTell[];
    humanizedDraft?: string;
}
interface PatternRule {
    id: string;
    name: string;
    severity: PatternSeverity;
    regex: RegExp;
    suggestedFix: string | ((match: string) => string);
}
export declare const UX_COPY_RULES: PatternRule[];
export declare class UXHumanizerLinter {
    /**
     * Executa a auditoria heurística completa em uma string de texto, JSX ou Markdown.
     */
    static auditText(content: string): UXCopyAuditResult;
    /**
     * Audita o conteúdo de um arquivo existente no sistema de arquivos.
     */
    static auditFile(filePath: string): UXCopyAuditResult;
    /**
     * Aplica correções seguras e imediatas em padrões conhecidos de alta incidência.
     */
    static cleanKnownPatterns(text: string): string;
}
export {};
