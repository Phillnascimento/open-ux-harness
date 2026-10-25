# Google HEART Framework, Taxonomia de Eventos e Receitas PostHog MCP

Este guia estabelece o padrão de engenharia de Product Analytics e Telemetria de UX do **Open UX Harness (`07-telemetry-and-impact`)**, conectando cada decisão de design a sinais comportamentais auditáveis.

---

## 1. Google HEART Framework via Goals $\rightarrow$ Signals $\rightarrow$ Metrics (GSM)

Nunca instrumente eventos avulsos sem propósito ("vaidade de dados"). Utilize o processo **GSM** para derivar métricas acionáveis nas dimensões relevantes do **HEART** (selecione de 2 a 3 dimensões críticas por fluxo):

| Dimensão HEART | **Goal** (Objetivo de UX/Produto) | **Signal** (Comportamento Observável) | **Metric** (Indicador Quantitativo) |
| :--- | :--- | :--- | :--- |
| **H — Happiness** | Percepção de fluidez, confiança e satisfação subjetiva com o novo fluxo. | Respostas em micro-pesquisas in-app pós-tarefa; ausência de feedback negativo no suporte. | **CSAT Pós-Fluxo (%)**, **CES (Customer Effort Score)** ou **NPS Transacional**. |
| **E — Engagement** | Profundidade e frequência voluntária de uso da funcionalidade principal. | Sessões com interações significativas por usuário ativo. | **Core Actions per DAU/WAU**, **Tempo ativo na feature**. |
| **A — Adoption** | Descoberta e ativação bem-sucedida por novos usuários ou contas existentes. | Usuários que completam o primeiro ciclo de valor (*Aha! Moment*). | **Feature Adoption Rate (%)** em $7\text{d}$, **Time-to-First-Value (TTFV)**. |
| **R — Retention** | Retorno recorrente do usuário para realizar a tarefa no produto. | Coortes de usuários que repetem a ação chave nas semanas subsequentes. | **D7 / D30 Feature Retention (%)**, **Churn Rate do Fluxo**. |
| **T — Task Success** | Eficiência, eficácia e ausência de atrito na execução da tarefa (foco central de UX). | Conclusão do funil sem erros de validação, *rage clicks* ou abandono. | **Task Completion Rate (%)**, **Time-on-Task (mediana / p90)**, **Validation Error Rate (%)**. |

---

## 2. Convenção Estrita de Taxonomia de Eventos (`snake_case`)

Todo evento rastreado no código ou auditado pelo script `validate-telemetry-plan.ts` **DEVE** obedecer à gramática determinística **`[objeto]_[verbo_no_passado]`** exclusivamente em `snake_case` (`^[a-z0-9]+(_[a-z0-9]+)+$`):

### Regras de Nomenclatura
1. **Sempre `snake_case` minúsculo:** Proibido `camelCase` (`checkoutStarted`), `PascalCase` (`CheckoutStarted`), espaços ou hífens (`checkout-started`).
2. **Padrão `[objeto]_[verbo_no_passado]`:**
   - **Correto:** `checkout_started`, `payment_method_selected`, `coupon_applied`, `payment_completed`, `form_validation_failed`, `onboarding_step_viewed`.
   - **Proibido:** `click_button`, `page_view_checkout`, `submit`, `error`.

### Propriedades Tipadas Obrigatórias por Evento (`event_properties`)
Cada evento deve carregar um payload enxuto, tipado e livre de PII (Dados Pessoais Identificáveis sem hash):

```typescript
export interface StandardTelemetryEventPayload {
  /** Identificador do fluxo ou componente do Design System (ex: 'checkout_v2') */
  surface_area: string;
  /** Variante ativa do componente ou experimento (ex: 'control' | 'variant_a') */
  experiment_variant?: string;
  /** Dispositivo ou classe de viewport ('mobile' | 'tablet' | 'desktop') */
  viewport_category: 'mobile' | 'tablet' | 'desktop';
  /** Latência percebida pelo usuário em milissegundos (quando aplicável) */
  duration_ms?: number;
  /** Código semântico do erro quando o verbo indicar falha (ex: 'ERR_CARD_DECLINED') */
  error_code?: string;
}
```

---

## 3. Receitas de Consulta para o PostHog MCP Server (`posthog-mcp`)

No perfil **Enterprise (`preset == "enterprise"`)**, utilize o servidor MCP do PostHog para consultar dados reais pré e pós-deploy:

### 3.1 Análise de Funil de Conversão (HogQL)
```sql
SELECT
  properties.viewport_category AS device,
  countIf(event = 'checkout_started') AS step_1_started,
  countIf(event = 'payment_method_selected') AS step_2_method,
  countIf(event = 'payment_completed') AS step_3_completed,
  round((step_3_completed / nullIf(step_1_started, 0)) * 100, 2) AS conversion_rate_pct
FROM events
WHERE timestamp >= now() - INTERVAL 14 DAY
  AND event IN ('checkout_started', 'payment_method_selected', 'payment_completed')
GROUP BY device
ORDER BY step_1_started DESC
```

### 3.2 Diagnóstico de Atrito Cognitivo (*Rage Clicks* & Erros de Validação)
```sql
SELECT
  properties.$current_url AS page_url,
  countIf(event = '$rageclick') AS rage_clicks,
  countIf(event = 'form_validation_failed') AS validation_failures,
   uniq(distinct_id) AS affected_users
FROM events
WHERE timestamp >= now() - INTERVAL 7 DAY
  AND event IN ('$rageclick', 'form_validation_failed')
GROUP BY page_url
ORDER BY rage_clicks DESC
LIMIT 10
```

### 3.3 Gatilhos para Gravação de Sessão (*Session Replay Triggers*)
Para economizar cota e focar em sessões de alto aprendizado diagnóstico, configure a captura automática de Session Replay quando:
- O evento `form_validation_failed` ocorrer $\ge 2$ vezes na mesma sessão;
- O evento nativo `$rageclick` ou `$exception` for emitido;
- O usuário abandonar o fluxo após `payment_method_selected` sem emitir `payment_completed` em até 5 minutos.

### 3.4 Vinculação com Feature Flags
Sempre amarre o lançamento de novos fluxos a uma Feature Flag (`posthog.isFeatureEnabled('ux-checkout-redesign-v2')`) permitindo *rollout* gradual ($5\% \rightarrow 25\% \rightarrow 50\% \rightarrow 100\%$) e *kill-switch* instantâneo caso uma Guardrail Metric degrade.
