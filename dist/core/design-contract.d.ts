/**
 * Open UX Harness — Core Design Contract Engine
 *
 * Módulo de validação determinística de Design Contracts e combate a "visual slop"
 * (anti-patterns genéricos de IA, falta de referências reais e ausência de especificidade de produto).
 */
export interface DesignContractCheck {
    valid: boolean;
    missingSections: string[];
    errors: string[];
}
export declare const REQUIRED_DESIGN_SECTIONS: readonly ["Usuário e Job Principal", "Fluxo de Maior Frequência", "Objetos do Domínio", "Referências de Mercado", "Escolhas Deliberadas de Design", "Padrões Genéricos Proibidos"];
/**
 * Extrai os padrões proibidos descritos no contrato Markdown.
 */
export declare function extractForbiddenPatterns(markdown: string): string[];
/**
 * Valida o conteúdo Markdown de um Design Contract contra as seções obrigatórias
 * e os limites mínimos de referências reais e padrões proibidos.
 */
export declare function validateDesignContract(markdown: string): DesignContractCheck;
/**
 * Compara uma lista de padrões/técnicas usadas contra os padrões proibidos no Design Contract.
 * Retorna as violações detectadas via case-insensitive substring matching.
 */
export declare function checkAgainstContract(markdown: string, usedPatterns: string[]): {
    violations: string[];
};
