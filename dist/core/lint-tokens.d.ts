export interface TokenValidationResult {
    valid: boolean;
    format: 'w3c-dtcg' | 'simple-json';
    totalTokens: number;
    errors: string[];
    warnings: string[];
}
export declare class DesignTokensLinter {
    static validateTokenFile(filePath: string): TokenValidationResult;
}
