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
/**
 * Extrai amostras canônicas de tom de voz (Brand Voice Samples) do Design Contract.
 * Inspirado no padrão Voice Matching do Humanizer para calibrar microcopy.
 */
export declare function extractVoiceSamples(markdown: string): string[];
/**
 * Modos canônicos de superfície (Surface Modes), inspirados na filosofia Impeccable:
 * Calibram o grau de ambição estética, densidade e restrições da interface.
 */
export type SurfaceMode = 'persuade' | 'operate' | 'read' | 'experience';
export interface SurfaceModeGuidelines {
    mode: SurfaceMode;
    intent: string;
    expressiveness: 'high' | 'restrained' | 'balanced' | 'receding';
    strictBans: string[];
    keyHeuristics: string[];
}
/**
 * Identifica o Modo de Superfície declarado no Design Contract.
 * Fallback padrão: 'operate' (foco em ferramentas e produto digital).
 */
export declare function extractSurfaceMode(markdown: string): SurfaceMode;
/**
 * Retorna as diretrizes normativas para o modo de superfície correspondente.
 */
export declare function getSurfaceModeGuidelines(mode: SurfaceMode): SurfaceModeGuidelines;
/**
 * Especificação estruturada do formato DESIGN.md (Google Labs standard com tokens YAML + seções canônicas).
 */
export interface DesignMdSpec {
    name: string;
    description: string;
    surfaceMode?: SurfaceMode;
    colors: Record<string, string>;
    typography?: Record<string, {
        fontFamily: string;
        fontSize?: string;
        fontWeight?: string | number;
        lineHeight?: string | number;
    }>;
    rounded?: Record<string, string>;
    spacing?: Record<string, string>;
    components?: Record<string, Record<string, string>>;
    overview?: string;
    dosAndDonts?: {
        dos: string[];
        donts: string[];
    };
}
/**
 * Gera um documento DESIGN.md no padrão da especificação aberta oficial (Google Labs standard),
 * com tokens em frontmatter YAML seguidos pelas seções canônicas de documentação.
 */
export declare function generateDesignMd(spec: DesignMdSpec): string;
/**
 * Faz o parsing de um documento DESIGN.md extraindo seus tokens YAML e seções textuais.
 */
export declare function parseDesignMd(content: string): DesignMdSpec;
