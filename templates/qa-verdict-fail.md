# Relatório de Veredito de Qualidade / Reality Gate: FAIL / HOLD

Registro determinístico de reprovação ou retenção emitido pelo agente auditor / Reality Gate. Contém a discriminação exata de violações, evidências faltantes e orientações prescritivas para correção no próximo ciclo de tentativa.

---

## 1. Identificação da Auditoria
| Campo | Valor |
| :--- | :--- |
| **ID da Tarefa (TaskId)** | `[Ex.: TASK-104]` |
| **Agente Executor** | `[Ex.: 06-zero-drift-handoff]` |
| **Agente Auditor** | `[Ex.: 08-reality-gate / QA Auditor]` |
| **Ciclo Atual** | **Tentativa `[N]` de `[M]`** (ex.: Tentativa 1 de 3) |
| **Timestamp** | `[AAAA-MM-DDTHH:MM:SSZ]` |
| **Veredito** | **`FAIL / HOLD`** |

---

## 2. Justificativa do Veredito
[Resumo executivo do motivo da reprovação/retenção. Alerta sobre inconformidades críticas que impedem o avanço do handoff para a fase subsequente.]

---

## 3. Lista de Falhas Identificadas
| ID | Categoria | Descrição da Inconformidade | Severidade | Impacto |
| :--- | :--- | :--- | :--- | :--- |
| **F-01** | *Craft / Tokens* | `[Ex.: Valor de espaçamento arbitrário p-[15px] viola escala 8pt]` | Alta | Quebra consistência de layout |
| **F-02** | *Acessibilidade* | `[Ex.: Contraste no estado hover 3.1:1 viola WCAG AA (4.5:1)]` | Crítica | Barreira de uso para baixa visão |
| **F-03** | *Comportamento* | `[Ex.: Ausência de especificação Gherkin para o estado empty]` | Média | Drift de implementação no frontend |

---

## 4. Evidências Faltantes ou Rejeitadas
- [ ] **Viewport Mobile (`375px`):** Captura ausente ou evidenciando corte de texto.
- [ ] **Validador Determinístico:** O script `validate-handoff-spec.ts` reportou código de saída diferente de 0.
- [ ] **Demonstração de Estados:** Ausência de evidência visual do estado `error` com `aria-describedby`.

---

## 5. Instruções Prescritivas para Correção (Tentativa [N+1])
Para ser aprovado na tentativa `[N+1]`, o agente executor deve obrigatoriamente executar as seguintes ações:
1. **Correção de Tokens:** Substituir `p-[15px]` por classe/token semântico canônico (`p-4` -> `16px`).
2. **Correção de Contraste:** Ajustar a cor de texto em hover para token de alto contraste (ex.: `text.contrast.high`), garantindo razão $\ge 4.5:1$.
3. **Completude de Gherkin:** Redigir cenário comportamental formal para o estado `empty` cobrindo o botão de call-to-action de recuperação.
4. **Coleta de Evidências:** Regerar capturas nos 3 viewports (`1440px`, `768px`, `375px`) e anexar ao novo envelope.

---

## 6. Política de Limite de Tentativas
> [!WARNING]
> Este ciclo consome a tentativa **[N] de [M]**. Caso a tentativa subsequente também resulte em reprovação e atinja o limite máximo (`[M]`), o processo entrará imediatamente em **Escalonamento Humano (`templates/escalation.md`)** e será suspenso até decisão do Tech Lead ou Lead Designer.
