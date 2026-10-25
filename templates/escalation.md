# Notificação de Escalonamento para Decisão Humana (Escalation)

Acionado quando as tentativas automatizadas de correção entre agentes se esgotam sem convergir para o veredito `PASS`, suspendendo o fluxo autônomo para mediação pelo Designer ou Tech Lead humano.

---

## 1. Identificação do Escalonamento
| Campo | Valor |
| :--- | :--- |
| **ID da Tarefa (TaskId)** | `[Ex.: TASK-104]` |
| **Fase de Origem** | `[Ex.: 06-zero-drift-handoff / 08-reality-gate]` |
| **Agente Executor** | `[Ex.: 06-zero-drift-handoff]` |
| **Agente Auditor** | `[Ex.: 08-reality-gate / QA Auditor]` |
| **Tentativas Realizadas** | **`3 de 3` (Limite Máximo Atingido)** |
| **Status do Guardrail** | **`SCHEMA_MISMATCH / RETRY_EXHAUSTED`** |
| **Timestamp** | `[AAAA-MM-DDTHH:MM:SSZ]` |

---

## 2. Motivo do Escalonamento
O pipeline autônomo atingiu o teto da política de repetições configurada (`maxAttempts: 3`). O agente executor não conseguiu solucionar de forma determinística as pendências apontadas pelo auditor, demandando arbitragem técnica ou alinhamento de escopo por um humano responsável.

---

## 3. Histórico de Feedbacks das Tentativas
### Tentativa 1 (`[Data/Hora ISO]`)
- **Veredito:** `FAIL / HOLD`
- **Falha Principal:** Inconsistência de token de cor primária em estado hover; violação WCAG AA reportada.
- **Ação Executada:** Agente tentou ajustar a cor utilizando token alternativo de surface.

### Tentativa 2 (`[Data/Hora ISO]`)
- **Veredito:** `FAIL / HOLD`
- **Falha Principal:** O token alternativo causou quebra de contraste com o fundo escuro (`3.8:1`).
- **Ação Executada:** Agente tentou forçar cor personalizada, disparando erro de hardcoded color no linter.

### Tentativa 3 (`[Data/Hora ISO]`)
- **Veredito:** `FAIL / HOLD`
- **Falha Persistente:** Conflito irresolvível entre a paleta aprovada pelo Design System e a exigência mínima de contraste WCAG AA no estado hover.

---

## 4. Bloqueio Atual (Current Blocker)
### Descrição Técnica do Bloqueio
[Detalhamento claro da causa raiz do bloqueio: conflito de requisitos, limitação de catálogo, ambiguidade de especificação ou trade-off visual x acessibilidade.]

### Arquivos e Artefatos Afetados
- `[caminho/do/componente.tsx]` (linhas [X-Y])
- `[caminho/do/design-tokens.json]` (`token: color.interactive.hover`)
- `[caminho/do/relatorio-auditoria.md]`

---

## 5. Perguntas e Decisões Necessárias para o Humano
Solicita-se ao Lead Designer ou Tech Lead a tomada de decisão sobre os itens abaixo:

- [ ] **Decisão 1 (Design / Acessibilidade):**
  - **Opção A:** Alterar o token de hover global para `#1D4ED8` (garante 4.8:1 em ambos os fundos).
  - **Opção B:** Adicionar sublinhado ou indicador morfológico no estado hover para isentar a exigência estrita de cor.
- [ ] **Decisão 2 (Escopo de Catálogo):**
  - **Opção A:** Criar novo componente modular específico (`NEW_COMPONENT`) em vez de estender o botão legado.
  - **Opção B:** Autorizar flexibilização temporária com justificativa documentada na memória episódica.

---

## 6. Procedimento Pós-Resolução Humana
1. O responsável humano seleciona as decisões aplicáveis e responde ao harness.
2. O resultado é gravado na memória episódica em `.harness/memory/decisions.json`.
3. O contador de tentativas da tarefa é reinicializado (`attempt: 1`) e o agente executor retoma o fluxo com as novas diretrizes.
