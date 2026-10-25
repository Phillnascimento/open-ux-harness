export interface LinterIssue {
    type: 'grid' | 'contrast' | 'state' | 'typography';
    severity: 'error' | 'warning';
    message: string;
    element?: string;
    suggestedFix?: string;
}
export interface CraftAuditResult {
    passed: boolean;
    score: number;
    issues: LinterIssue[];
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
     * Executa auditoria heurística completa em uma especificação de UI.
     */
    auditComponent(spec: {
        textColorHex: string;
        bgColorHex: string;
        paddingPx: number[];
        statesCovered: string[];
    }): CraftAuditResult;
}
