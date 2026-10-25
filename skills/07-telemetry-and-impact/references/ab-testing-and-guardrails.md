# Experimentação A/B, Guardrail Metrics e Memória Episódica de UX

Este guia define as regras estatísticas e de engenharia de decisão para avaliar o impacto pós-deploy de mudanças de UX/UI e registrar aprendizados permanentes no **Open UX Harness**.

---

## 1. Arquitetura de Métricas: Primary Goal vs. Guardrail Metrics

Um redesenho de interface nunca deve otimizar uma métrica local às custas da saúde técnica ou da confiança a longo prazo do usuário. Todo plano de telemetria e experimento A/B **DEVE** parear:

### 1.1 Primary Goal Metric (Métrica Primária de Sucesso — *OEC*)
- Define o critério principal de vitória da hipótese de design oriunda de `01-briefing-discovery`.
- Exemplos: *Checkout Conversion Rate (%)*, *Onboarding Task Completion Rate (%)*, *Time-to-Complete Key Action (s)*.

### 1.2 Guardrail Metrics (Métricas de Proteção Invioláveis)
Métricas que **NÃO PODEM degradar** além do limite de tolerância durante o experimento ou rollout:

| Categoria de Guardrail | Indicador Técnico / UX | Limite Crítico de Alerta (*Threshold*) | Ação em Caso de Violação |
| :--- | :--- | :--- | :--- |
| **Performance de UI** | Latência de renderização / LCP / INP (p95) | Aumento $> +150\text{ms}$ ou $\text{CLS} > 0.1$ | Reverter ou investigar bloqueio de bundle/hidratação. |
| **Estabilidade Técnica** | Taxa de erro de API (`5xx`/`4xx`) ou exceções JS | Aumento $> +0.5\text{ p.p.}$ | Acionar *kill-switch* da Feature Flag imediatamente. |
| **Atrito Comportamental** | Taxa de *Rage Clicks* (`$rageclick`) | Aumento $> +15\%$ na tela alterada | Inspecionar gravações de sessão e estados `loading`/`disabled`. |
| **Qualidade da Receita/Retenção** | Taxa de estorno, cancelamento imediato ou *Support Tickets* | Aumento estatisticamente significativo ($p < 0.05$) | Descartar padrão de UI por induzir clique acidental (*Dark Pattern*). |

---

## 2. Rigor Estatístico e Detecção de Anomalias em Testes A/B

### 2.1 Verificação de Sample Ratio Mismatch (SRM)
Antes de analisar qualquer ganho de conversão (*Lift*), verifique se a divisão de tráfego entre Controle ($A$) e Variante ($B$) respeita a proporção configurada (ex.: $50\% / 50\%$):
- Execute o teste Qui-Quadrado ($\chi^2$) de aderência:
  $$\chi^2 = \sum \frac{(O_i - E_i)^2}{E_i}$$
- **Regra Crítica:** Se $p_{\text{SRM}} < 0.01$ (ou desvio $> 2\%$ em amostras grandes), há **Sample Ratio Mismatch (SRM)**. **INVALIDAR IMEDIATAMENTE O EXPERIMENTO** e investigar bugs de roteamento, atraso no disparo da Feature Flag ou incompatibilidade em navegadores específicos (ex.: Safari iOS).

### 2.2 Significância Estatística, Poder e MDE
- **Nível de Significância ($\alpha$):** Adote $\alpha = 0.05$ bilateral ($|Z| \ge 1.96 \implies p < 0.05$).
- **Poder Estatístico ($1 - \beta$):** Mínimo de $80\%$ para evitar falsos negativos.
- **MDE (*Minimum Detectable Effect*):** Defina o efeito mínimo relevante para o negócio antes de iniciar a coleta e respeite um ciclo mínimo de **7 dias completos** (para capturar sazonalidade semanal entre dias úteis e fim de semana).
- **Proibição de *Peeking* Prematuro:** Nunca encerre um teste no segundo dia apenas porque atingiu $p < 0.05$ com amostra insuficiente ($n < 100$ conversões por braço).

### 2.3 Matriz de Veredito do Experimento (`experiment_verdict`)

| Veredito | Condição Estatística e de Guardrails | Roteamento Recomendado no Harness |
| :--- | :--- | :--- |
| **`SHIP`** | Lift primário positivo com $p < 0.05$, sem SRM e **todas** as Guardrail Metrics saudáveis. | **Caminho A:** Consolidar 100% do rollout e documentar padrão vencedor no Design System. |
| **`ITERATE_UI`** | Lift neutro ($p \ge 0.05$) ou atrito pontual de usabilidade/arquitetura de informação detectado no funil. | **Caminho B:** Iniciar ciclo cirúrgico em `02-information-architecture` ou `05-craft-and-accessibility`. |
| **`REFRAME_DISCOVERY`** | Degradação da métrica primária ou hipótese de valor refutada apesar da UI estar tecnicamente perfeita. | **Caminho B:** Retornar para `01-briefing-discovery` com as evidências empíricas coletadas. |
| **`INVALID_SRM_OR_DATA`** | Presença de SRM ($p_{\text{SRM}} < 0.01$) ou falha no disparo dos eventos de tracking. | Corrigir instrumentação de telemetria antes de tomar decisão de produto. |

---

## 3. Memória Episódica Contínua (`memory/episodic/experiments-log.jsonl`)

Para que o **Open UX Harness** evolua como um sistema cognitivo que aprende com cada lançamento e nunca repita erros de UX já refutados, todo diagnóstico de impacto **DEVE** anexar uma linha JSON válida (JSON Lines) em `memory/episodic/experiments-log.jsonl`:

```json
{"timestamp":"2026-10-18T23:45:00Z","experiment_id":"exp-checkout-one-page-2026-10","skill_origin":"07-telemetry-and-impact","hypothesis":"Reduzir o checkout de 3 etapas para 1 etapa com resumo fixo aumenta a conclusão em +8%","primary_metric":"payment_completed_rate","baseline_rate":0.612,"variant_rate":0.674,"relative_lift_pct":10.13,"p_value":0.0042,"srm_detected":false,"guardrails_passed":true,"verdict":"SHIP","key_learning":"Resumo fixo eliminou idas e vindas no desktop (+12.4%), mas exigiu drawer colapsável em telas <375px para não empurrar o CTA."}
```
