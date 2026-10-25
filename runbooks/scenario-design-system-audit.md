# Runbook de Cenário: Auditoria de Design System

> **Slug:** `design-system-audit`  
> **Modo de Operação:** `micro` (Duração estimada: 2 a 3 dias)  
> **Perfil Recomendado:** `freelance` ou `enterprise`  
> **Classificação de Risco:** Médio (auditoria cirúrgica de consistência e a11y)

---

## 1. Visão Geral e Contexto de Negócio

Este runbook executa uma auditoria técnica e visual focada nos alicerces de um Design System ou UI Kit existente. O objetivo é sanar divergências entre design e código, eliminar anti-patterns visuais e assegurar que todos os tokens e componentes atendam a critérios estritos de conformidade WCAG e W3C DTCG.

### Quando Utilizar
- Antes de iniciar uma grande refatoração de produto ou nova funcionalidade.
- Após atualizações de dependências visuais, bibliotecas de componentes ou paleta da marca.
- Como gate de qualidade periódica para manter a dívida técnica de acessibilidade sob controle.

### Objetivos do Cenário
1. Auditar 100% da biblioteca de tokens de design sob a especificação W3C DTCG.
2. Identificar falhas de contraste de cor, touch targets abaixo de 44x44px e estados de foco ausentes.
3. Emitir parecer formal e estruturado via **Reality Gate** apontando itens aprovados ou bloqueios críticos.

---

## 2. Roster de Agentes e Momentos de Ativação

| Fase | Agentes / Skills | Momento de Ativação | Responsabilidade Principal |
| :--- | :--- | :--- | :--- |
| **Fase 1: Token Integrity** | `03-design-tokens` | Dia 1 | Validação sintática e taxonômica de tokens (cores, espaçamento, tipografia, elevação) |
| **Fase 2: Craft & A11y** | `05-craft-and-accessibility` | Dia 2 | Inspeção de contraste WCAG 2.1 AA/AAA, hierarquia tipográfica e touch targets |
| **Fase 3: Reality Gate** | `08-reality-gate` | Dia 3 | Consolidação dos apontamentos e emissão de veredito PASS ou HOLD com plano de ação |

---

## 3. Passo a Passo de Execução

### Fase 1: Auditoria de Tokens de Design
1. Ativar `03-design-tokens` sobre o repositório de tokens existente:
   - Verificar conformidade com a convenção W3C DTCG (`$value`, `$type`, `$description`).
   - Identificar valores 'hardcoded' ou órfãos (ex: cores hexadecimais soltas sem semântica).
   - Validar a escala de espaçamento com múltiplos de 4pt ou 8pt.
   - Executar `npm run lint:tokens` para verificação automatizada.

### Fase 2: Inspeção de Craft e Acessibilidade
1. Ativar `05-craft-and-accessibility` para varredura de componentes:
   - **Contraste de Cores:** Avaliar todas as combinações de cores texto/fundo nos modos Light e Dark. Garantir contraste mínimo de 4.5:1 para texto normal e 3:1 para elementos de interface essenciais.
   - **Áreas de Interação (Touch Targets):** Conferir dimensões de botões, inputs, checkboxes e ícones interativos (mínimo de 44x44px em viewport mobile ou 24x24px com padding compensatório).
   - **Estados Interativos:** Assegurar que botões e links possuam estados visuais inequívocos para `:hover`, `:focus-visible`, `:active` e `:disabled`.
   - **Anti-patterns Proibidos:** Identificar sombras difusas arbitrárias, fontes abaixo de 12px ou perda de hierarquia visual.

### Fase 3: Veredito do Reality Gate
1. Ativar `08-reality-gate` com a lista consolidada de achados:
   - Se houver findings de severidade `critical` (ex: falha de contraste em CTA principal ou campo sem label): emitir veredito **HOLD** com apontamentos de correção imediata.
   - Se a conformidade for validada com pontuação adequada e sem impedimentos críticos: emitir veredito **PASS**.

---

## 4. Entregáveis Esperados (Outputs)

- `token-audit-report.json`: Relatório estruturado de tokens validados, tokens obsoletos e inconsistências sintáticas.
- `a11y-compliance-matrix.md`: Matriz de componentes auditados com pontuações WCAG, tabela de contrastes e status de conformidade.
- `reality-gate-audit-verdict.json`: Parecer formal do Reality Gate contendo scorecard e plano de remediação.
