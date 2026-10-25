/**
 * Open UX Harness — Deterministic Skills Linter
 * Inspiração: agency-agents lint-agents.sh adaptado para o padrão agnóstico
 * Valida a integridade, conformidade estrutural e presença de todas as skills do harness.
 */
export interface SkillsLintReport {
    total: number;
    passed: number;
    failed: string[];
    missingActive: string[];
    errors: Record<string, string[]>;
}
/**
 * Determina se a skill é considerada "nova" no ciclo de governança do harness
 * (08-reality-gate, 09-persona-walkthrough, 00-skill-architect).
 */
export declare function isNewSkill(name: string): boolean;
/**
 * Executa o lint determinístico de todas as skills do repositório ou diretório base.
 *
 * @param baseDir Diretório raiz do repositório ou diretório contendo a pasta `skills`.
 * @param strict Quando true, qualquer aviso ou erro quebra a validação. Quando false,
 *               skills legadas com avisos históricos são toleradas, mas skills novas
 *               (08, 09, 00) devem passar com 0 erros.
 * @returns Relatório estruturado de validação de skills.
 */
export declare function lintAllSkills(baseDir: string, strict?: boolean): SkillsLintReport;
