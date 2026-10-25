# Runbook de Cenário: Redesign de Fluxo de Checkout

> **Slug:** `checkout-redesign`  
> **Modo de Operação:** `sprint` (Duração estimada: 2 semanas)  
> **Perfil Recomendado:** `freelance` ou `enterprise`  
> **Classificação de Risco:** Alto (fluxo crítico de transação financeira)

---

## 1. Visão Geral e Contexto de Negócio

O redesign de fluxo de checkout tem como objetivo atacar a taxa de abandono de carrinho e atritos em transações mobile e desktop. O fluxo envolve entrada de endereço, cálculo de frete, seleção de método de pagamento (Pix, Cartão, Boleto) e confirmação de pedido.

### Problema Típico
- Abandono elevado na etapa de pagamento por lentidão, inputs complexos ou falta de feedback visual imediato.
- Dívida de acessibilidade: mensagens de erro com contraste inadequado e ausência de atributos ARIA para leitores de tela.
- Inconsistência de tokens entre o protótipo no Figma e o código React/Tailwind.

### Objetivos do Cenário
1. Simplificar o fluxo de checkout para no máximo 3 etapas claras ou checkout de 1 página (accordion/stepper).
2. Garantir 100% de conformidade com tokens W3C DTCG e WCAG 2.1 AA.
3. Submeter todas as telas e variantes ao **Reality Gate** antes do handoff para desenvolvimento.

---

## 2. Roster de Agentes e Momentos de Ativação

| Fase | Agentes / Skills | Momento de Ativação | Responsabilidade Principal |
| :--- | :--- | :--- | :--- |
| **Fase 1: Discovery & Framing** | `01-briefing-discovery`<br>`02-information-architecture` | Início da sprint | Problem framing, métricas de negócio (conversão/abandono), wireflow e mapeamento de estados |
| **Fase 2: Foundation & UI** | `03-design-tokens`<br>`04-figma-engineering` | Semana 1 | Criação de tokens W3C DTCG e componentes no Figma com auto-layout e variantes completas |
| **Fase 3: Quality & Gate** | `05-craft-and-accessibility`<br>`08-reality-gate` | Meio da Semana 2 | Auditoria estrita de contraste, alvos de toque, estados de erro e veredito PASS/HOLD |
| **Fase 4: Delivery** | `06-zero-drift-handoff` | Final da sprint | Envelope de handoff estruturado, diff visual e especificações técnicas sem ambiguidade |

---

## 3. Passo a Passo de Execução

### Fase 1: Problem Framing e Arquitetura de Informação
1. Ativar `01-briefing-discovery` para preencher o **Problem Framing**:
   - Mapear a causa raiz do abandono de checkout.
   - Definir KPIs de negócio: meta de conversão, tempo médio de fechamento de compra e CSAT.
   - Estabelecer restrições técnicas (gateways existentes, tempo de resposta de API).
2. Ativar `02-information-architecture`:
   - Construir o wireflow mermaid do fluxo de checkout (Carrinho -> Identificação -> Endereço/Frete -> Pagamento -> Sucesso/Erro).
   - Mapear explicitamente todos os 4 estados de cada tela: `default`, `empty`, `loading`, `error`.

### Fase 2: Design Tokens e Engenharia de Componentes
1. Ativar `03-design-tokens`:
   - Definir tokens semânticos de cores para feedback financeiro: `color.feedback.success`, `color.feedback.error`, `color.feedback.warning`.
   - Definir tokens de espaçamento na escala 8pt e dimensões de touch target (mínimo 44px).
   - Validar com `npm run lint:tokens`.
2. Ativar `04-figma-engineering`:
   - Estruturar componentes no Figma: campos de cartão com máscara, seletores táteis de frete e resumo de pedido.
   - Configurar auto-layout e propriedades de componentes para responsividade (mobile 375px e desktop 1440px).

### Fase 3: Craft Guardian e Reality Gate
1. Ativar `05-craft-and-accessibility`:
   - Auditar contraste de texto contra fundo (mínimo 4.5:1 para texto normal, 3:1 para badges e ícones informativos).
   - Verificar navegação por teclado: tab order sequencial sem armadilhas de foco (focus traps).
   - Validar mensagens de erro associadas aos campos via `aria-describedby`.
2. Ativar `08-reality-gate`:
   - Inspecionar evidências obrigatórias: capturas mobile e desktop, cobertura de estados e pontuação de craft.
   - Veredito **PASS**: autoriza avanço para o handoff.
   - Veredito **HOLD**: aciona a política de retry com apontamento das correções necessárias.

### Fase 4: Handoff Zero-Drift
1. Ativar `06-zero-drift-handoff`:
   - Gerar envelope de handoff contendo mapa de tokens exportados, assets SVG otimizados e especificações de comportamento de microinterações.
   - Incluir evidências do Reality Gate no relatório para a equipe de engenharia frontend.

---

## 4. Entregáveis Esperados (Outputs)

- `briefing.md`: Documento de Problem Framing aprovado com stakeholders.
- `wireflow.mermaid`: Fluxo completo de navegação com caminhos alternativos e de falha.
- `tokens.json`: Arquivo de design tokens no formato W3C DTCG válido.
- Componentes Figma inspecionados com variantes de estado.
- `craft-audit.md`: Relatório de conformidade WCAG 2.1 AA.
- `reality-gate-verdict.json`: Veredito PASS emitido pelo Reality Gate.
- `handoff-spec.md`: Pacote de entrega técnica para desenvolvedores.
