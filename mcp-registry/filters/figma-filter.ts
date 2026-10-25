/**
 * Filtro Server-Side para respostas do Figma MCP.
 * Converte a árvore de nós JSON (que pode ter 40k+ tokens) em um resumo cirúrgico em Markdown (~1.2k tokens).
 */

export interface FigmaNodeSummary {
  id: string;
  name: string;
  type: string;
  layoutMode?: string;
  width?: number;
  height?: number;
  padding?: string;
  fills?: string[];
  boundVariables?: Record<string, string>;
}

export function filterFigmaNodesToMarkdown(rawFigmaResponse: any): string {
  if (!rawFigmaResponse || !rawFigmaResponse.nodes) {
    return 'Nenhum nó retornado pelo Figma.';
  }

  const nodes = Array.isArray(rawFigmaResponse.nodes) 
    ? rawFigmaResponse.nodes 
    : Object.values(rawFigmaResponse.nodes);

  let md = '### Resumo Sintético de Nós do Figma (Otimizado para Contexto)\n\n';
  md += '| ID | Nome | Tipo | Layout | Dimensões | Padding | Cores/Fills |\n';
  md += '| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n';

  for (const node of nodes) {
    const doc = node.document || node;
    const bbox = doc.absoluteBoundingBox || {};
    const dims = bbox.width && bbox.height ? `${Math.round(bbox.width)}x${Math.round(bbox.height)}px` : 'Auto';
    const padding = `${doc.paddingTop || 0}/${doc.paddingRight || 0}/${doc.paddingBottom || 0}/${doc.paddingLeft || 0}px`;
    const fills = (doc.fills || [])
      .map((f: any) => f.color ? `rgb(${Math.round(f.color.r * 255)},${Math.round(f.color.g * 255)},${Math.round(f.color.b * 255)})` : '')
      .filter(Boolean)
      .join(', ') || 'Nenhum';

    md += `| \`${doc.id}\` | ${doc.name} | \`${doc.type}\` | ${doc.layoutMode || 'None'} | ${dims} | ${padding} | ${fills} |\n`;
  }

  return md;
}
