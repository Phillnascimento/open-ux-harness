/**
 * Filtro Server-Side para respostas do Storybook MCP.
 * Extrai apenas assinaturas de props e estados sem carregar bundles de código desnecessários.
 */

export function filterStorybookPropsToMarkdown(rawStorybookResponse: any): string {
  if (!rawStorybookResponse || !rawStorybookResponse.component) {
    return 'Nenhum componente encontrado no Storybook.';
  }

  const { name, props, stories } = rawStorybookResponse.component;
  let md = `### Componente Storybook: \`${name}\`\n\n`;
  md += '#### Propriedades (Props):\n';
  md += '| Nome da Prop | Tipo | Obrigatório | Padrão | Descrição |\n';
  md += '| :--- | :--- | :--- | :--- | :--- |\n';

  if (props && Array.isArray(props)) {
    for (const p of props) {
      md += `| \`${p.name}\` | \`${p.type}\` | ${p.required ? 'Sim' : 'Não'} | \`${p.defaultValue || '-'}\` | ${p.description || '-'} |\n`;
    }
  }

  if (stories && Array.isArray(stories)) {
    md += `\n**Variantes/Histórias Homologadas:** ${stories.map((s: any) => `\`${s.name}\``).join(', ')}\n`;
  }

  return md;
}
