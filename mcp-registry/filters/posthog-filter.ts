/**
 * Filtro Server-Side para respostas do PostHog MCP.
 * Extrai anomalias de funil e quebras percentuais sem passar logs brutos de eventos.
 */

export function filterPostHogMetricsToMarkdown(rawPostHogResponse: any): string {
  if (!rawPostHogResponse) {
    return 'Nenhum dado retornado pelo PostHog.';
  }

  let md = '### Diagnóstico de Telemetria e Métricas de Funil (PostHog)\n\n';

  if (rawPostHogResponse.funnelSteps && Array.isArray(rawPostHogResponse.funnelSteps)) {
    md += '| Etapa do Funil | Usuários | Conversão do Passo | Abandono (Drop-off) |\n';
    md += '| :--- | :--- | :--- | :--- |\n';

    for (const step of rawPostHogResponse.funnelSteps) {
      md += `| ${step.name} | ${step.count} | ${step.conversionRate}% | ${step.dropOffRate}% |\n`;
    }
  }

  if (rawPostHogResponse.anomalies && Array.isArray(rawPostHogResponse.anomalies)) {
    md += '\n#### 🚨 Anomalias Estatísticas Detectadas:\n';
    for (const anomaly of rawPostHogResponse.anomalies) {
      md += `- **${anomaly.metricName}:** Variação de ${anomaly.percentageChange}% em relação à média esperada. Dispositivos mais afetados: ${anomaly.affectedDevices?.join(', ') || 'Geral'}.\n`;
    }
  }

  return md;
}
