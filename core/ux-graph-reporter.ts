import fs from 'node:fs';
import path from 'node:path';
import { UXGraphEngine, UXNode, UXEdge, UXNodeType } from './ux-graph-engine.js';

export interface ReporterOptions {
  projectName?: string;
  outDir?: string;
}

export class UXGraphReporter {
  /**
   * Gera o relatório arquitetural em Markdown (UX_GRAPH_REPORT.md).
   * Inspirado no GRAPH_REPORT.md do Graphify, adaptado para Product Design & Design Systems.
   */
  public static generateMarkdownReport(graph: UXGraphEngine, options: ReporterOptions = {}): string {
    const projectName = options.projectName || 'Open UX Harness Project';
    const snapshot = graph.toSnapshot();
    const stats = snapshot.stats;

    const godComponents = graph.findGodComponents(3);
    const orphans = graph.findOrphanNodes();
    const communities = graph.detectCommunities();

    // Calcula blast radius dos principais tokens
    const tokens = graph.getNodesByType('token');
    const tokenBlastTable: Array<{ id: string; label: string; direct: number; total: number; isHighRisk: boolean }> = [];
    for (const token of tokens.slice(0, 10)) {
      const blast = graph.calculateBlastRadius(token.id);
      tokenBlastTable.push({
        id: token.id,
        label: token.label,
        direct: blast.directDependents.length,
        total: blast.totalImpactedCount,
        isHighRisk: blast.isHighRisk
      });
    }

    return `# 🗺️ Relatório de Grafo e Saúde Arquitetural UX: ${projectName}

> Gerado automaticamente pelo **Open UX Harness (UX Knowledge Graph Engine)**  
> Inspirado na arquitetura determinística de grafos do **Graphify** (Graphify-Labs).  
> Data de geração: \`${snapshot.createdAt}\` | Versão: \`${snapshot.version}\`

---

## 1. Sumário Executivo do Grafo

| Métrica | Total |
| :--- | :--- |
| **Total de Nós Registrados** | \`${stats.totalNodes}\` |
| **Total de Arestas / Relações** | \`${stats.totalEdges}\` |
| **Design Tokens (W3C DTCG)** | \`${stats.byNodeType.token || 0}\` |
| **Componentes de Interface** | \`${stats.byNodeType.component || 0}\` |
| **Telas / Visões Mapeadas** | \`${stats.byNodeType.screen || 0}\` |
| **Fluxos de Usuário (User Flows)** | \`${stats.byNodeType['user-flow'] || 0}\` |
| **Contratos de Design & PRDs** | \`${stats.byNodeType.contract || 0}\` |
| **Personas Vinculadas** | \`${stats.byNodeType.persona || 0}\` |

### Proveniência das Conexões (Rastreabilidade Algorítmica)
- 🟢 **EXTRACTED (Confiabilidade 1.0):** \`${stats.byProvenance.EXTRACTED || 0}\` conexões extraídas deterministicamente de código, tokens ou AST.
- 🟡 **INFERRED (Confiabilidade 0.7 - 0.9):** \`${stats.byProvenance.INFERRED || 0}\` conexões inferidas por análise de personas ou PRD.
- 🔴 **AMBIGUOUS (Requer Validação Humana):** \`${stats.byProvenance.AMBIGUOUS || 0}\` conexões incertas sinalizadas para o Design Gate.

---

## 2. Componentes Centrais e "God Components" (Alerta de Acoplamento)

Componentes com grau de dependência desproporcional. Alterações nestes nós propagam quebras em cascata pelo sistema.

${
  godComponents.length === 0
    ? '_Nenhum God Component identificado com acoplamento crítico. A arquitetura de componentes apresenta distribuição balanceada._'
    : `| Componente | Grau Total | Entrantes (Quem Usa) | Saintes (O que Usa) | Nível de Risco |
| :--- | :---: | :---: | :---: | :--- |
${godComponents
  .map(
    g =>
      `| **\`${g.node.label}\`** (\`${g.node.id}\`) | ${g.totalDegree} | ${g.inDegree} | ${g.outDegree} | ${
        g.totalDegree >= 6 ? '🚨 ALTO (God Component)' : '⚠️ MODERADO'
      } |`
  )
  .join('\n')}`
}

---

## 3. Análise de Raio de Impacto (Blast Radius de Tokens Críticos)

Simulação determinística de propagação reversa: se o token mudar, quantos componentes e telas sofrerão mutação downstream?

${
  tokenBlastTable.length === 0
    ? '_Nenhum token mapeado no grafo._'
    : `| Token | Dependentes Diretos | Telas e Nós Downstream Impactados | Alerta Reality Gate |
| :--- | :---: | :---: | :--- |
${tokenBlastTable
  .map(
    t =>
      `| \`${t.label}\` | ${t.direct} componentes | ${t.total} nós totais | ${
        t.isHighRisk ? '🛡️ **HOLD OBRIGATÓRIO** (Blast > 5)' : '✅ PASS DIRETO'
      } |`
  )
  .join('\n')}`
}

---

## 4. Análise de Resíduos: Nós Órfãos e Tokens Zumbis

Eliminação de inchaço de tokens e código morto no repositório.

- **Tokens Zumbis (${orphans.orphanTokens.length}):** Declarados nos arquivos W3C DTCG mas nunca consumidos por nenhum componente.
${
  orphans.orphanTokens.length === 0
    ? '  - _Nenhum token zumbi detectado. 100% de aproveitamento de tokens._'
    : orphans.orphanTokens.map(t => `  - 🧟 \`${t.label}\` (\`${t.id}\`)`).slice(0, 10).join('\n') +
      (orphans.orphanTokens.length > 10 ? `\n  - _...e mais ${orphans.orphanTokens.length - 10} tokens órfãos._` : '')
}

- **Componentes Órfãos (${orphans.orphanComponents.length}):** Componentes criados que não compõem nenhuma tela.
${
  orphans.orphanComponents.length === 0
    ? '  - _Nenhum componente órfão detectado._'
    : orphans.orphanComponents.map(c => `  - 📦 \`${c.label}\` (\`${c.id}\`)`).join('\n')
}

- **Telas Isoladas (${orphans.orphanScreens.length}):**
${
  orphans.orphanScreens.length === 0
    ? '  - _Nenhuma tela isolada no fluxo de navegação._'
    : orphans.orphanScreens.map(s => `  - 🖥️ \`${s.label}\` (\`${s.id}\`)`).join('\n')
}

---

## 5. Comunidades Temáticas e Subsistemas de Interface

Detecção topológica de clusters funcionais de interface:

${Object.entries(communities)
  .map(([name, nodes]) => {
    return `### 🏷️ ${name} (${nodes.length} nós)
${nodes.map(n => `- [\`${n.type}\`] **${n.label}** (\`${n.id}\`)`).slice(0, 8).join('\n')}${
      nodes.length > 8 ? `\n- _...mais ${nodes.length - 8} nós neste subsistema._` : ''
    }`;
  })
  .join('\n\n')}

---

## 6. Recomendações Táticas para o Próximo Ciclo de Design

1. **Revisão de Blast Radius:** Para qualquer alteração em tokens marcados com risco alto, exija screenshots automatizados nas telas downstream antes de aprovar o PR.
2. **Higienização de Tokens:** Remova ou documente os tokens zumbis listados na seção 4 para evitar confusão no design system.
3. **Desacoplamento de God Components:** Considere quebrar componentes centrais com alto grau em subcomponentes atômicos menores.
`;
  }

  /**
   * Gera o visualizador gráfico standalone em HTML (ux-graph.html).
   * Totalmente autocontido (single-file), sem chamadas de rede ou CDNs externas.
   */
  public static generateHtmlVisualizer(graph: UXGraphEngine, options: ReporterOptions = {}): string {
    const title = options.projectName ? `UX Knowledge Graph — ${options.projectName}` : 'UX Knowledge Graph';
    const snapshot = graph.toSnapshot();
    const dataJson = JSON.stringify(snapshot);

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root {
      --bg: #0F172A;
      --panel: #1E293B;
      --border: #334155;
      --text: #F8FAFC;
      --muted: #94A3B8;
      --token: #8B5CF6;
      --component: #3B82F6;
      --screen: #10B981;
      --user-flow: #06B6D4;
      --contract: #F59E0B;
      --story: #EC4899;
      --persona: #6366F1;
      --high-risk: #EF4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    header {
      position: absolute;
      top: 16px;
      left: 16px;
      z-index: 10;
      background: rgba(30, 41, 59, 0.85);
      backdrop-filter: blur(8px);
      padding: 12px 20px;
      border-radius: 10px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    header h1 { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    header p { font-size: 12px; color: var(--muted); margin-top: 4px; }
    #controls {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 10;
      display: flex;
      gap: 10px;
    }
    input[type="text"] {
      background: var(--panel);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      outline: none;
      width: 240px;
    }
    input[type="text"]:focus { border-color: var(--component); }
    .filter-btn {
      background: var(--panel);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn:hover { background: var(--border); }
    #canvas-container {
      flex: 1;
      height: 100%;
      position: relative;
    }
    svg {
      width: 100%;
      height: 100%;
      cursor: grab;
    }
    svg:active { cursor: grabbing; }
    #sidebar {
      width: 360px;
      background: var(--panel);
      border-left: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      height: 100%;
      z-index: 20;
      box-shadow: -4px 0 20px rgba(0,0,0,0.3);
      padding: 24px;
      overflow-y: auto;
    }
    .sidebar-header {
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 20px;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .node-title { font-size: 18px; font-weight: 700; word-break: break-all; }
    .node-id { font-size: 11px; color: var(--muted); font-family: monospace; margin-top: 4px; }
    .metric-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 20px 0;
    }
    .metric-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .metric-value { font-size: 20px; font-weight: 700; }
    .metric-label { font-size: 11px; color: var(--muted); margin-top: 4px; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: var(--muted); margin: 16px 0 8px 0; }
    .list-item {
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 12px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .btn-blast {
      background: var(--component);
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      width: 100%;
      margin-top: 16px;
      transition: background 0.2s;
    }
    .btn-blast:hover { opacity: 0.9; }
    .legend {
      position: absolute;
      bottom: 20px;
      left: 20px;
      background: rgba(30, 41, 59, 0.85);
      backdrop-filter: blur(8px);
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid var(--border);
      font-size: 11px;
      z-index: 10;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      max-width: 600px;
    }
    .legend-item { display: flex; align-items: center; gap: 6px; }
    .legend-color { width: 10px; height: 10px; border-radius: 50%; }
  </style>
</head>
<body>
  <header>
    <h1>🚀 Open UX Harness — Knowledge Graph</h1>
    <p>GraphRAG Visualizer | Nós: <span id="stat-nodes">0</span> | Arestas: <span id="stat-edges">0</span></p>
  </header>

  <div id="controls">
    <input type="text" id="search-input" placeholder="Buscar nós por nome ou id...">
    <button class="filter-btn" id="btn-reset">Resetar Vista</button>
  </div>

  <div id="canvas-container">
    <svg id="viewport">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748B" />
        </marker>
        <marker id="arrow-active" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" />
        </marker>
      </defs>
      <g id="transform-group">
        <g id="edges-layer"></g>
        <g id="nodes-layer"></g>
      </g>
    </svg>

    <div class="legend">
      <div class="legend-item"><div class="legend-color" style="background: var(--token)"></div> Token</div>
      <div class="legend-item"><div class="legend-color" style="background: var(--component)"></div> Component</div>
      <div class="legend-item"><div class="legend-color" style="background: var(--screen)"></div> Screen</div>
      <div class="legend-item"><div class="legend-color" style="background: var(--user-flow)"></div> Flow</div>
      <div class="legend-item"><div class="legend-color" style="background: var(--contract)"></div> Contract</div>
      <div class="legend-item"><div class="legend-color" style="background: var(--persona)"></div> Persona</div>
    </div>
  </div>

  <div id="sidebar">
    <div class="sidebar-header">
      <span class="badge" id="side-badge">SELECIONE UM NÓ</span>
      <h2 class="node-title" id="side-title">Inspeção de Grafo</h2>
      <div class="node-id" id="side-id">Clique em qualquer nó para detalhes</div>
    </div>

    <div id="side-content" style="display: none;">
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value" id="val-incoming">0</div>
          <div class="metric-label">Quem Depende Dele</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" id="val-outgoing">0</div>
          <div class="metric-label">O que ele Consome</div>
        </div>
      </div>

      <button class="btn-blast" id="btn-calc-blast">Calcular Blast Radius 💥</button>

      <div class="section-title">Metadados & Contrato</div>
      <div id="side-metadata"></div>

      <div class="section-title">Conexões Imediatas</div>
      <div id="side-neighbors"></div>
    </div>
  </div>

  <script>
    const graphData = ${dataJson};
    document.getElementById('stat-nodes').textContent = graphData.nodes.length;
    document.getElementById('stat-edges').textContent = graphData.edges.length;

    const colorMap = {
      token: '#8B5CF6',
      component: '#3B82F6',
      screen: '#10B981',
      'user-flow': '#06B6D4',
      contract: '#F59E0B',
      story: '#EC4899',
      persona: '#6366F1'
    };

    // Inicialização da simulação espacial circular em SVG
    const nodes = graphData.nodes.map((n, i) => {
      const angle = (i / graphData.nodes.length) * 2 * Math.PI;
      const radius = 260 + (i % 3) * 60;
      return {
        ...n,
        x: 500 + radius * Math.cos(angle),
        y: 400 + radius * Math.sin(angle),
        vx: 0,
        vy: 0
      };
    });

    const nodeById = new Map();
    nodes.forEach(n => nodeById.set(n.id, n));

    const edges = graphData.edges.map(e => ({
      ...e,
      sourceNode: nodeById.get(e.source),
      targetNode: nodeById.get(e.target)
    })).filter(e => e.sourceNode && e.targetNode);

    const svg = document.getElementById('viewport');
    const transformGroup = document.getElementById('transform-group');
    const nodesLayer = document.getElementById('nodes-layer');
    const edgesLayer = document.getElementById('edges-layer');

    let scale = 0.9;
    let panX = 100;
    let panY = 50;
    let isPanning = false;
    let startX = 0;
    let startY = 0;

    function updateTransform() {
      transformGroup.setAttribute('transform', \`translate(\${panX}, \${panY}) scale(\${scale})\`);
    }
    updateTransform();

    svg.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'svg' || e.target.id === 'transform-group') {
        isPanning = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
      }
    });
    window.addEventListener('mousemove', (e) => {
      if (isPanning) {
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        updateTransform();
      }
    });
    window.addEventListener('mouseup', () => { isPanning = false; });
    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      scale = Math.max(0.2, Math.min(3, scale * zoomFactor));
      updateTransform();
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      scale = 0.9;
      panX = 100;
      panY = 50;
      updateTransform();
      render(nodes, edges);
    });

    function render(renderNodes, renderEdges, highlightedIds = new Set()) {
      nodesLayer.innerHTML = '';
      edgesLayer.innerHTML = '';

      renderEdges.forEach(e => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', e.sourceNode.x);
        line.setAttribute('y1', e.sourceNode.y);
        line.setAttribute('x2', e.targetNode.x);
        line.setAttribute('y2', e.targetNode.y);
        const isActive = highlightedIds.has(e.source) && highlightedIds.has(e.target);
        line.setAttribute('stroke', isActive ? '#3B82F6' : '#334155');
        line.setAttribute('stroke-width', isActive ? '2.5' : '1.2');
        line.setAttribute('stroke-opacity', highlightedIds.size > 0 && !isActive ? '0.2' : '0.8');
        line.setAttribute('marker-end', isActive ? 'url(#arrow-active)' : 'url(#arrow)');
        edgesLayer.appendChild(line);
      });

      renderNodes.forEach(n => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', \`translate(\${n.x}, \${n.y})\`);
        g.style.cursor = 'pointer';

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', n.type === 'token' ? '12' : '16');
        circle.setAttribute('fill', colorMap[n.type] || '#94A3B8');
        const isHighlight = highlightedIds.has(n.id);
        if (isHighlight) {
          circle.setAttribute('stroke', '#FFFFFF');
          circle.setAttribute('stroke-width', '3');
        } else if (highlightedIds.size > 0) {
          circle.setAttribute('opacity', '0.3');
        }
        g.appendChild(circle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.textContent = n.label;
        text.setAttribute('y', n.type === 'token' ? '24' : '28');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#F8FAFC');
        text.setAttribute('font-size', '10px');
        text.setAttribute('font-weight', '500');
        if (highlightedIds.size > 0 && !isHighlight) {
          text.setAttribute('opacity', '0.2');
        }
        g.appendChild(text);

        g.addEventListener('click', (evt) => {
          evt.stopPropagation();
          selectNode(n);
        });

        nodesLayer.appendChild(g);
      });
    }

    render(nodes, edges);

    let selectedNode = null;
    function selectNode(node) {
      selectedNode = node;
      document.getElementById('side-content').style.display = 'block';
      const badge = document.getElementById('side-badge');
      badge.textContent = node.type;
      badge.style.backgroundColor = colorMap[node.type] || '#334155';
      document.getElementById('side-title').textContent = node.label;
      document.getElementById('side-id').textContent = node.id;

      const incoming = edges.filter(e => e.target === node.id);
      const outgoing = edges.filter(e => e.source === node.id);
      document.getElementById('val-incoming').textContent = incoming.length;
      document.getElementById('val-outgoing').textContent = outgoing.length;

      const metaDiv = document.getElementById('side-metadata');
      metaDiv.innerHTML = '';
      if (node.metadata) {
        for (const [k, v] of Object.entries(node.metadata)) {
          const item = document.createElement('div');
          item.className = 'list-item';
          item.innerHTML = \`<span>\${k}</span><strong style="color: #38BDF8;">\${v}</strong>\`;
          metaDiv.appendChild(item);
        }
      } else {
        metaDiv.innerHTML = '<span style="color: var(--muted); font-size: 12px;">Sem metadados extras.</span>';
      }

      const neighborsDiv = document.getElementById('side-neighbors');
      neighborsDiv.innerHTML = '';
      const activeIds = new Set([node.id]);

      incoming.forEach(e => {
        activeIds.add(e.source);
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = \`<span>⬅️ \${e.sourceNode.label}</span><small style="color:var(--muted)">\${e.type}</small>\`;
        neighborsDiv.appendChild(item);
      });

      outgoing.forEach(e => {
        activeIds.add(e.target);
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = \`<span>➡️ \${e.targetNode.label}</span><small style="color:var(--muted)">\${e.type}</small>\`;
        neighborsDiv.appendChild(item);
      });

      render(nodes, edges, activeIds);
    }

    document.getElementById('btn-calc-blast').addEventListener('click', () => {
      if (!selectedNode) return;
      // Propagação downstream (quem depende deste nó)
      const blastSet = new Set([selectedNode.id]);
      const queue = [selectedNode.id];
      while (queue.length > 0) {
        const curr = queue.shift();
        edges.filter(e => e.target === curr).forEach(e => {
          if (!blastSet.has(e.source)) {
            blastSet.add(e.source);
            queue.push(e.source);
          }
        });
      }
      render(nodes, edges, blastSet);
      alert(\`Raio de Impacto (Blast Radius): \${blastSet.size - 1} nós downstream afetados por '\${selectedNode.label}'.\`);
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
      const term = searchInput.value.toLowerCase().trim();
      if (!term) {
        render(nodes, edges);
        return;
      }
      const matchIds = new Set(
        nodes
          .filter(n => n.label.toLowerCase().includes(term) || n.id.toLowerCase().includes(term))
          .map(n => n.id)
      );
      render(nodes, edges, matchIds);
    });
  </script>
</body>
</html>`;
  }

  /**
   * Exporta o grafo em formato de diagrama Mermaid (flowchart TD).
   */
  public static exportMermaid(graph: UXGraphEngine, maxNodes: number = 40): string {
    const nodes = graph.getAllNodes().slice(0, maxNodes);
    const nodeIds = new Set(nodes.map(n => n.id));
    const edges = graph.getEdges().filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    const lines: string[] = ['flowchart TD'];

    for (const node of nodes) {
      const cleanLabel = node.label.replace(/["[\]()]/g, '');
      const shape = node.type === 'token' ? `(("${cleanLabel}"))` : `["${cleanLabel}"]`;
      lines.push(`    ${node.id.replace(/[^a-zA-Z0-9_]/g, '_')}${shape}`);
    }

    for (const edge of edges) {
      const s = edge.source.replace(/[^a-zA-Z0-9_]/g, '_');
      const t = edge.target.replace(/[^a-zA-Z0-9_]/g, '_');
      lines.push(`    ${s} -->|${edge.type}| ${t}`);
    }

    return lines.join('\n');
  }

  /**
   * Salva a tríade completa de artefatos no diretório de saída (default: harness-out/).
   */
  public static saveAllArtifacts(
    graph: UXGraphEngine,
    options: ReporterOptions = {}
  ): { reportPath: string; htmlPath: string; jsonPath: string; mermaidPath: string } {
    const outDir = path.resolve(options.outDir || path.resolve(process.cwd(), 'harness-out'));
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const reportPath = path.resolve(outDir, 'UX_GRAPH_REPORT.md');
    const htmlPath = path.resolve(outDir, 'ux-graph.html');
    const jsonPath = path.resolve(outDir, 'ux-graph.json');
    const mermaidPath = path.resolve(outDir, 'ux-graph.mmd');

    fs.writeFileSync(reportPath, this.generateMarkdownReport(graph, options), 'utf-8');
    fs.writeFileSync(htmlPath, this.generateHtmlVisualizer(graph, options), 'utf-8');
    fs.writeFileSync(jsonPath, JSON.stringify(graph.toSnapshot(), null, 2), 'utf-8');
    fs.writeFileSync(mermaidPath, this.exportMermaid(graph), 'utf-8');

    return { reportPath, htmlPath, jsonPath, mermaidPath };
  }
}
