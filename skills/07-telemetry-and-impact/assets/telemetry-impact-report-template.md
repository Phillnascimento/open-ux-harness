# Relatório Executivo de Telemetria, Experimentação e Impacto de UX: {{FLOW_OR_FEATURE_NAME}}

- **Projeto / Produto:** `{{PROJECT_NAME}}`
- **Preset Operacional:** `{{PRESET_MODE}}` (`freelance` | `enterprise`)
- **Hipótese Original (`01-briefing-discovery`):** {{ORIGINAL_HYPOTHESIS}}
- **Referência do Handoff (`06-zero-drift-handoff`):** `{{HANDOFF_SPEC_PATH}}`

---

## 1. Matriz Google HEART & Goals $\rightarrow$ Signals $\rightarrow$ Metrics (GSM)

| Dimensão HEART | Goal (Objetivo Estratégico de UX) | Signal (Comportamento do Usuário) | Metric (KPI Mensurável) | Meta / Alvo |
| :--- | :--- | :--- | :--- | :--- |
| **Task Success (Primary)** | {{TASK_SUCCESS_GOAL}} | Conclusão do fluxo sem erros de validação | `{{PRIMARY_METRIC_ID}}` | `{{PRIMARY_METRIC_TARGET}}` |
| **Adoption** | {{ADOPTION_GOAL}} | Primeiro uso completo da nova interface em 7 dias | `{{ADOPTION_METRIC_ID}}` | `{{ADOPTION_METRIC_TARGET}}` |
| **Happiness** | {{HAPPINESS_GOAL}} | Avaliação positiva no micro-survey pós-tarefa | `{{HAPPINESS_METRIC_ID}}` | `{{HAPPINESS_METRIC_TARGET}}` |

---

## 2. Plano de Tracking Determinístico de Eventos (`snake_case`)

> **Convenção Obrigatória:** Todos os eventos seguem o formato `[objeto]_[verbo_no_passado]` (`^[a-z0-9]+(_[a-z0-9]+)+$`).

| Nome do Evento (`snake_case`) | Gatilho na UI (Componente / Estado Gherkin) | Propriedades Obrigatórias (`payload`) | Etapa do Funil |
| :--- | :--- | :--- | :--- |
| `checkout_started` | Renderização inicial do container de Checkout (`default`) | `surface_area`, `viewport_category`, `experiment_variant` | Etapa 1 (Entrada) |
| `payment_method_selected` | Seleção de método no `PaymentMethodCard` (`active`) | `payment_type`, `viewport_category`, `experiment_variant` | Etapa 2 (Interação) |
| `form_validation_failed` | Estado `error` acionado com `aria-invalid="true"` | `field_name`, `error_code`, `viewport_category` | Diagnóstico de Atrito |
| `payment_completed` | Sucesso após estado `loading` do `PaymentConfirmButton` | `duration_ms`, `payment_type`, `experiment_variant` | Etapa 3 (Conversão) |

---

## 3. Configuração do Experimento A/B & Guardrail Metrics

- **Feature Flag / Experiment Key:** `{{FEATURE_FLAG_KEY}}`
- **Alocação de Tráfego Esperada:** `50% Control` vs. `50% Variant`
- **Primary Metric (OEC):** `{{PRIMARY_METRIC_ID}}`

### Guardrail Metrics (Métricas de Proteção Invioláveis)

| Guardrail Metric | Limite Máximo de Degradação (*Threshold*) | Valor Observado | Status |
| :--- | :--- | :--- | :--- |
| **Latência de Interação / INP p95 (`latency_p95_ms`)** | $\le +100\text{ms}$ vs. Controle | `{{OBSERVED_LATENCY_DELTA}}` | `{{LATENCY_GUARDRAIL_STATUS}}` |
| **Taxa de Erro de API/JS (`client_error_rate`)** | $\le +0.2\text{ p.p.}$ vs. Controle | `{{OBSERVED_ERROR_DELTA}}` | `{{ERROR_GUARDRAIL_STATUS}}` |
| **Taxa de Rage Clicks (`rage_click_rate`)** | $\le +10\%$ vs. Controle | `{{OBSERVED_RAGE_CLICK_DELTA}}` | `{{RAGE_CLICK_GUARDRAIL_STATUS}}` |

---

## 4. Análise Comparativa Pré vs. Pós-Deploy (Resultados Estatísticos)

| Grupo / Coorte | Usuários ($N$) | Conversões ($C$) | Taxa de Conversão (%) | Lift Relativo (%) | $p\text{-value}$ / Significância | Check de SRM |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Controle (Baseline)** | `{{CONTROL_USERS}}` | `{{CONTROL_CONVERSIONS}}` | `{{CONTROL_RATE_PCT}}%` | — | — | `{{SRM_STATUS}}` |
| **Variante (Novo Fluxo)** | `{{VARIANT_USERS}}` | `{{VARIANT_CONVERSIONS}}` | `{{VARIANT_RATE_PCT}}%` | **`{{RELATIVE_LIFT_PCT}}%`** | `p = {{P_VALUE}}` | `p_srm = {{SRM_P_VALUE}}` |

- **Veredito Estatístico (`experiment_verdict`):** **`{{EXPERIMENT_VERDICT}}`** (`SHIP` | `ITERATE_UI` | `REFRAME_DISCOVERY` | `AWAITING_DATA`)
- **Diagnóstico por Segmento (Mobile vs. Desktop / Browser):**
  - {{SEGMENT_DIAGNOSIS_SUMMARY}}

---

## 5. Registro de Aprendizado na Memória Episódica (`memory/episodic/experiments-log.jsonl`)

```json
{"timestamp":"{{ISO_TIMESTAMP}}","experiment_id":"{{EXPERIMENT_ID}}","skill_origin":"07-telemetry-and-impact","hypothesis":"{{ORIGINAL_HYPOTHESIS}}","primary_metric":"{{PRIMARY_METRIC_ID}}","relative_lift_pct":{{RELATIVE_LIFT_NUMBER}},"p_value":{{P_VALUE_NUMBER}},"srm_detected":false,"guardrails_passed":true,"verdict":"{{EXPERIMENT_VERDICT}}","key_learning":"{{KEY_UX_LEARNING}}"}
```
