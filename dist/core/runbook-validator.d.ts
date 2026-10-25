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
export declare function validateRunbooks(baseDir: string): {
    valid: boolean;
    errors: string[];
};
