# Envelope de Handoff entre Agentes (Handoff Envelope)

Template padronizado para transferência de contexto e atribuição de tarefas entre agentes no Open UX Harness, minimizando perda de contexto (*context drift*) e garantindo rastreabilidade executiva.

---

## 1. Metadados do Envelope
| Campo | Valor | Descrição |
| :--- | :--- | :--- |
| **De (From)** | `[Nome / ID do Agente Emissor]` | Agente que concluiu a etapa anterior |
| **Para (To)** | `[Nome / ID do Agente Destinatário]` | Agente responsável pela próxima entrega |
| **Fase (Phase)** | `[Ex.: 06-zero-drift-handoff]` | Fase do ciclo do harness |
| **ID da Tarefa (TaskId)** | `[Ex.: TASK-104]` | Identificador unívoco da tarefa |
| **Prioridade (Priority)** | `[Critical \| High \| Medium \| Low]` | Severidade / urgência da demanda |
| **Timestamp** | `[AAAA-MM-DDTHH:MM:SSZ]` | Data e hora em formato ISO 8601 |

---

## 2. Contexto da Demanda
### Estado Atual (Current State)
[Descrição detalhada do estado atual da interface ou fluxo, sintetizando o que foi homologado nas etapas precedentes, decisões chave tomadas e pontos de atenção.]

### Arquivos Relevantes (Relevant Files)
- `[caminho/do/arquivo-1.ext]` — [Descrição breve do papel do arquivo]
- `[caminho/do/arquivo-2.ext]` — [Descrição breve do papel do arquivo]

### Dependências (Dependencies)
- `[Artefato ou estado precedente, ex.: .harness/memory/craft-audit-state.json]`
- `[Catálogo de tokens / componentes, ex.: templates/tokens-starter.json]`

### Restrições (Constraints)
- Reúso estrito sobre reinvenção (`REUSE` $\ge 90\%$ antes de propor novos componentes).
- Zero valores arbitrários em pixels ou cores hexadecimais fora dos tokens semânticos W3C DTCG.
- Máximo de 3 tentativas com feedback automatizado antes de escalonamento humano.

---

## 3. Pedido de Entregável (Deliverable Request)
### Descrição do Entregável
[Descrição concisa e acionável do entregável técnico esperado, detalhando escopo, comportamento esperado e artefatos a produzir.]

### Critérios de Aceite (Acceptance Criteria)
- [ ] **Critério 1:** [Critério mensurável e testável de aceitação do entregável]
- [ ] **Critério 2:** [Contrato de interface TypeScript completo pareado com variantes do design]
- [ ] **Critério 3:** [Cenários comportamentais em Gherkin cobrindo os 8 estados de interface]
- [ ] **Critério 4:** [Validação determinística por scripts da skill sem erros ou avisos]

### Materiais de Referência (Reference Materials)
- `[caminho/ou/url/referencia-1.md]` — [Especificação ou guideline vinculado]
- `[caminho/ou/url/referencia-2.md]` — [Referência visual, Figma link ou documentação Storybook]

---

## 4. Expectativas de Qualidade (Quality Expectations)
### Critérios Mandatórios (Must Pass)
1. **Reality Gate:** Veredito aprovado (`PASS`) com contra-prova em todos os viewports mandatórios.
2. **Acessibilidade WCAG 2.2 AA:** Razão de contraste mínima de 4.5:1 para texto normal e 3:1 para elementos de interface.
3. **8-Point Grid:** Espaçamentos e dimensões aderentes à escala canônica de 8px (ou 4px defensivo).
4. **Scripts de Validação:** Execução com saída de código 0 nos validadores determinísticos da skill.

### Evidências Exigidas (Evidence Required)
- [ ] Captura de tela em viewport Desktop (`1440px`).
- [ ] Captura de tela em viewport Tablet (`768px`).
- [ ] Captura de tela em viewport Mobile (`375px`).
- [ ] Log de execução limpa do validador determinístico correspondente.
- [ ] Relatório de auditoria de acessibilidade sem violações críticas.

### Próximo Destinatário (Handoff To Next)
`[Ex.: 07-telemetry-and-impact / Engenheiro Frontend Líder]`
