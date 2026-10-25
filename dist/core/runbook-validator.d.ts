/**
 * Open UX Harness — Validador de Runbooks de Cenário
 * Garante que os runbooks declarados em runbooks/runbooks.json
 * possuam todos os metadados obrigatórios, documentos existentes no disco
 * e referenciem exclusivamente skills válidas do repositório.
 */
export interface RunbookRosterGroup {
    group: string;
    activation: string;
    skills: string[];
}
export interface RunbookDefinition {
    slug: string;
    title: string;
    mode: string;
    duration?: string;
    summary: string;
    doc: string;
    roster: RunbookRosterGroup[];
}
export interface RunbookCatalog {
    runbooks: RunbookDefinition[];
}
export interface RunbookValidationResult {
    valid: boolean;
    errors: string[];
}
/**
 * Valida o catálogo de runbooks em runbooks/runbooks.json relativo a baseDir.
 * Verifica existência do catálogo, campos obrigatórios, slugs únicos,
 * existência do arquivo markdown de documentação e existência física de cada skill citada.
 */
export declare function validateRunbooks(baseDir: string): RunbookValidationResult;
