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

export function validateRunbooks(baseDir: string): { valid: boolean; errors: string[] } {
  throw new Error('STUB: To be implemented by subagent B2');
}
