import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { UXGraphEngine } from './ux-graph-engine.js';
import { UXGraphReporter } from './ux-graph-reporter.js';
function createPopulatedGraph() {
    const graph = new UXGraphEngine();
    graph.addNode({ id: 'token:color.primary', type: 'token', label: 'Color Primary' });
    graph.addNode({ id: 'token:color.zombie', type: 'token', label: 'Zombie Color' });
    graph.addNode({ id: 'comp:Button', type: 'component', label: 'Button' });
    graph.addNode({ id: 'comp:Card', type: 'component', label: 'Card' });
    graph.addNode({ id: 'screen:Home', type: 'screen', label: 'Home Screen' });
    graph.addNode({ id: 'screen:Checkout', type: 'screen', label: 'Checkout Screen' });
    graph.addNode({ id: 'persona:Buyer', type: 'persona', label: 'Buyer Persona' });
    graph.addEdge({ source: 'comp:Button', target: 'token:color.primary', type: 'uses_token', provenance: 'EXTRACTED', confidence: 1.0 });
    graph.addEdge({ source: 'comp:Card', target: 'token:color.primary', type: 'uses_token', provenance: 'EXTRACTED', confidence: 1.0 });
    graph.addEdge({ source: 'screen:Home', target: 'comp:Button', type: 'composes_component', provenance: 'EXTRACTED', confidence: 1.0 });
    graph.addEdge({ source: 'screen:Checkout', target: 'comp:Button', type: 'composes_component', provenance: 'EXTRACTED', confidence: 1.0 });
    graph.addEdge({ source: 'screen:Checkout', target: 'persona:Buyer', type: 'impacts_persona', provenance: 'INFERRED', confidence: 0.85 });
    return graph;
}
test('UXGraphReporter — 1. Geração de Relatório Markdown (UX_GRAPH_REPORT.md)', () => {
    const graph = createPopulatedGraph();
    const md = UXGraphReporter.generateMarkdownReport(graph, { projectName: 'Test Suite Design System' });
    assert.ok(md.includes('# 🗺️ Relatório de Grafo e Saúde Arquitetural UX: Test Suite Design System'));
    assert.ok(md.includes('**Total de Nós Registrados** | `7`'));
    assert.ok(md.includes('**Total de Arestas / Relações** | `5`'));
    assert.ok(md.includes('EXTRACTED (Confiabilidade 1.0)'));
    assert.ok(md.includes('INFERRED (Confiabilidade 0.7 - 0.9)'));
    assert.ok(md.includes('Zombie Color')); // Token órfão detectado
    assert.ok(md.includes('Color Primary')); // Blast radius
    assert.ok(md.includes('Comunidades Temáticas'));
});
test('UXGraphReporter — 2. Geração do Visualizador HTML Standalone (ux-graph.html)', () => {
    const graph = createPopulatedGraph();
    const html = UXGraphReporter.generateHtmlVisualizer(graph, { projectName: 'Visual Test' });
    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('<svg id="viewport">'));
    assert.ok(html.includes('const graphData ='));
    assert.ok(html.includes('Calcular Blast Radius'));
    assert.ok(html.includes('search-input'));
    // Verifica que é 100% autônomo e não depende de CDNs externas
    assert.strictEqual(html.includes('https://cdn'), false);
    assert.strictEqual(html.includes('http://cdn'), false);
});
test('UXGraphReporter — 3. Exportação em Diagrama Mermaid (exportMermaid)', () => {
    const graph = createPopulatedGraph();
    const mermaid = UXGraphReporter.exportMermaid(graph);
    assert.ok(mermaid.startsWith('flowchart TD'));
    assert.ok(mermaid.includes('-->|uses_token|'));
    assert.ok(mermaid.includes('-->|composes_component|'));
});
test('UXGraphReporter — 4. Salvamento completo da Tríade de Artefatos no disco', () => {
    const graph = createPopulatedGraph();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-out-test-'));
    try {
        const result = UXGraphReporter.saveAllArtifacts(graph, { outDir: tempDir });
        assert.strictEqual(fs.existsSync(result.reportPath), true);
        assert.strictEqual(fs.existsSync(result.htmlPath), true);
        assert.strictEqual(fs.existsSync(result.jsonPath), true);
        assert.strictEqual(fs.existsSync(result.mermaidPath), true);
        const jsonContent = JSON.parse(fs.readFileSync(result.jsonPath, 'utf-8'));
        assert.strictEqual(jsonContent.nodes.length, 7);
        assert.strictEqual(jsonContent.edges.length, 5);
    }
    finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
});
