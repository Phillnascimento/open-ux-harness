export interface SkillsLintReport {
  total: number;
  passed: number;
  failed: string[];
  missingActive: string[];
  errors: Record<string, string[]>;
}

export function lintAllSkills(baseDir: string, strict: boolean = false): SkillsLintReport {
  throw new Error('STUB: To be implemented by subagent B4');
}
