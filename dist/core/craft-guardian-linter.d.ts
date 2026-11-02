import { SlopFinding } from './anti-slop-engine.js';
export interface LinterIssue {
    type: 'grid' | 'contrast' | 'state' | 'typography' | 'slop' | 'quality' | 'drift';
    severity: 'error' | 'warning';
    message: string;
    element?: string;
    suggestedFix?: string;
    priority?: 'P0' | 'P1' | 'P2' | 'P3';
}
export interface CraftAuditResult {
    passed: boolean;
    score: number;
    issues: LinterIssue[];
    slopFindings?: SlopFinding[];
}
export declare class CraftGuardianLinter {
    /**
     * Calcula a taxa de contraste (WCAG 2.1 / 2.2) entre duas cores hexadecimais (#RRGGBB).
     */
    static calculateContrastRatio(hex1: string, hex2: string): number;
    private static getRelativeLuminance;
    /**
     * Valida se um valor em pixels adere ao grid de 8 pontos (ou múltiplo de 4px defensivo).
     */
    static validateSpacing(pixelValue: number): boolean;
    /**
     * Executa auditoria heurística completa em uma especificação de UI em memória.
     */
    auditComponent(spec: {
        textColorHex: string;
        bgColorHex: string;
        paddingPx: number[];
        statesCovered: string[];
    }): CraftAuditResult;
    /**
     * Executa auditoria heurística profunda diretamente no código-fonte de interface,
     * integrando o AntiSlopEngine e as 62 regras de qualidade e blindagem visual.
     */
    auditSourceCode(code: string, filePath: string, knownTokens?: Set<string>): CraftAuditResult;
}
