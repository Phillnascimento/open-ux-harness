export interface DesignContractCheck {
    valid: boolean;
    missingSections: string[];
    errors: string[];
}
export declare function validateDesignContract(markdown: string): DesignContractCheck;
export declare function checkAgainstContract(markdown: string, usedPatterns: string[]): {
    violations: string[];
};
