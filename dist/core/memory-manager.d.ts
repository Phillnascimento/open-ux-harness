export interface EpisodicEntry {
    timestamp: string;
    featureName: string;
    problemStatement: string;
    decisionSummary: string;
    outcomeMetric?: string;
    learnedLessons: string[];
}
export interface SavepointInfo {
    label: string;
    timestamp: string;
    path: string;
}
export declare class MemoryManager {
    private baseDir;
    private memoryDir;
    private semanticDir;
    private episodicDir;
    private proceduralDir;
    private savepointsDir;
    private lastTimestamp;
    constructor(baseDir?: string);
    private ensureDirsExist;
    /**
     * Normaliza o label do savepoint removendo caracteres especiais, acentos e espaços.
     */
    normalizeLabel(label: string): string;
    /**
     * Gera um timestamp numérico estritamente crescente para evitar colisões em testes velozes.
     */
    private getUniqueTimestamp;
    /**
     * Cria uma cópia integral do diretório memory/ em .harness/savepoints/<label>-<timestamp>/.
     * Normaliza o label e retorna o caminho absoluto do savepoint criado.
     */
    createSavepoint(label: string): string;
    /**
     * Lista todos os savepoints existentes ordenados por data decrescente (mais recente primeiro).
     */
    listSavepoints(): SavepointInfo[];
    /**
     * Localiza o savepoint mais recente correspondente ao label informado e restaura
     * o conteúdo para o diretório memory/, criando previamente um savepoint de segurança.
     */
    rollback(label: string): boolean;
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
