/**
 * Open UX Harness — Deterministic Skill Validator (Code as Action)
 * Validates any skill folder against the "Super-Padrão Agnóstico"
 * (agentskills.io + Anthropic Claude + OpenAI GPT/Codex + Google Gemini/ADK + xAI Grok).
 *
 * Usage:
 *   npx tsx skills/00-skill-architect/scripts/validate-skill.ts skills/<skill-folder>
 */
export interface ValidationIssue {
    code: string;
    severity: 'error' | 'warning';
    message: string;
    line?: number;
}
export interface SkillValidationResult {
    status: 'passed' | 'failed';
    skill_path: string;
    skill_name: string | null;
    line_count: number;
    confidence_score: number;
    validation_errors: ValidationIssue[];
}
export declare function validateSkillDirectory(skillDirPath: string): SkillValidationResult;
