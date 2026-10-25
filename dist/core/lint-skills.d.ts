export interface SkillsLintReport {
    total: number;
    passed: number;
    failed: string[];
    missingActive: string[];
    errors: Record<string, string[]>;
}
export declare function lintAllSkills(baseDir: string, strict?: boolean): SkillsLintReport;
