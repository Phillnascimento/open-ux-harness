# Receitas de Tool-Calling Autônomo com Servidores MCP

Para evitar perguntar ao usuário dados que já existem nos sistemas corporativos, o **UX Strategic Framer Pro** deve consultar proativamente os servidores MCP conectados antes de formular perguntas na Fase 2.

---

## 🔍 Receita 1: Consulta Analítica Preliminar com PostHog MCP

Antes de perguntar *"Qual é a taxa de abandono do checkout?"*, o agente verifica se o MCP do PostHog está ativo.

### Cenário de Uso:
1. O usuário cita que "o fluxo de checkout está com problemas".
2. O agente invoca a ferramenta do PostHog para inspecionar funis ou anomalias recentes:
   ```json
   {
     "tool": "posthog_query_funnel",
     "parameters": {
       "funnelId": "checkout_mobile_v1",
       "dateRange": "last_30_days"
     }
   }
   ```
3. A resposta bruta é filtrada pelo middleware (`posthog-filter.ts`).
4. **Comportamento com o Usuário:** O agente já traz a constatação validada:
   > *"Consultei a telemetria recente no PostHog e confirmei que a maior perda ocorre entre as etapas de Endereço e Pagamento (queda de 51.9% no mobile). Vamos focar nossa causa raiz especificamente nesse ponto?"*

---

## 📄 Receita 2: Ingestão de PRDs com Notion ou Jira MCP

Antes de perguntar *"Quais são os requisitos técnicos e prazos da squad?"*, o agente busca documentos existentes no repositório corporativo.

### Cenário de Uso:
1. O usuário menciona o nome de uma funcionalidade (ex: "Checkout Rápido").
2. O agente executa busca semântica no Notion/Jira:
   ```json
   {
     "tool": "notion_search_pages",
     "parameters": {
       "query": "PRD Checkout Rápido"
     }
   }
   ```
3. O agente lê a página encontrada (`get_page`), extrai os OKRs, prazos e a squad responsável.
4. **Comportamento com o Usuário:** O agente não pede para redigitar o PRD:
   > *"Localizei o PRD da iniciativa no Notion atualizado em 05/10. Já importei os OKRs e a lista de stakeholders principais. Preciso apenas validar convosco se o escopo da v1 permanece restrito à web móvel."*
