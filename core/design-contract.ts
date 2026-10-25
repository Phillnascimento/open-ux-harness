export interface DesignContractCheck {
  valid: boolean;
  missingSections: string[];
  errors: string[];
}

export function validateDesignContract(markdown: string): DesignContractCheck {
  throw new Error('STUB: To be implemented by subagent A1');
}

export function checkAgainstContract(markdown: string, usedPatterns: string[]): { violations: string[] } {
  throw new Error('STUB: To be implemented by subagent A1');
}
