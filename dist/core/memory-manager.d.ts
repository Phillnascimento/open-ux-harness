export interface EpisodicEntry {
    timestamp: string;
    featureName: string;
    problemStatement: string;
    decisionSummary: string;
    outcomeMetric?: string;
    learnedLessons: string[];
}
export declare class MemoryManager {
    private baseDir;
    private semanticDir;
    private episodicDir;
    private proceduralDir;
    constructor(baseDir?: string);
    private ensureDirsExist;
    /**
     * Lê o contexto semântico da marca e do produto.
     */
    getSemanticContext(): string;
    /**
     * Adiciona um aprendizado de experimento ou decisão à memória episódica (JSONL compactado).
     */
    appendEpisodicLog(entry: EpisodicEntry): void;
    /**
     * Recupera os últimos aprendizados episódicos relevantes para evitar cometer os mesmos erros de design do passado.
     */
    getRecentEpisodicLessons(limit?: number): EpisodicEntry[];
    /**
     * Obtém o checklist procedural obrigatório do Craft Guardian.
     */
    getProceduralChecklist(): string;
}
