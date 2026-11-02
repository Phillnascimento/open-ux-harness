import { UXGraphEngine } from './ux-graph-engine.js';
export interface ReporterOptions {
    projectName?: string;
    outDir?: string;
}
export declare class UXGraphReporter {
    /**
     * Gera o relatório arquitetural em Markdown (UX_GRAPH_REPORT.md).
     * Inspirado no GRAPH_REPORT.md do Graphify, adaptado para Product Design & Design Systems.
     */
    static generateMarkdownReport(graph: UXGraphEngine, options?: ReporterOptions): string;
    /**
     * Gera o visualizador gráfico standalone em HTML (ux-graph.html).
     * Totalmente autocontido (single-file), sem chamadas de rede ou CDNs externas.
     */
    static generateHtmlVisualizer(graph: UXGraphEngine, options?: ReporterOptions): string;
    /**
     * Exporta o grafo em formato de diagrama Mermaid (flowchart TD).
     */
    static exportMermaid(graph: UXGraphEngine, maxNodes?: number): string;
    /**
     * Salva a tríade completa de artefatos no diretório de saída (default: harness-out/).
     */
    static saveAllArtifacts(graph: UXGraphEngine, options?: ReporterOptions): {
        reportPath: string;
        htmlPath: string;
        jsonPath: string;
        mermaidPath: string;
    };
}
