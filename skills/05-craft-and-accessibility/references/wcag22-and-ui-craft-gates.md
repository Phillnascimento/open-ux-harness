# WCAG 2.2 AA/AAA, APCA & High-Craft UI Gates (`05-craft-and-accessibility`)

> **Propósito:** Matriz normativa e heurística do **Craft Guardian** no **Open UX Harness**. Erradica o *"visual slop"* gerado por LLMs e bloqueia qualquer especificação ou código de interface que viole normas internacionais de acessibilidade (**WCAG 2.2 AA/AAA / ISO/IEC 40500:2025**), contraste perceptual **APCA ($L_c$)**, ritmo espacial de precisão (**Linear / Stripe / Refactoring UI**) ou cobertura dos **4 Estados Obrigatórios de UI**.

---

## 1. Conformidade Matemática e Perceptual de Acessibilidade (WCAG 2.2 & APCA)

### 1.1. Contraste de Luminância Relativa (WCAG 2.2 Critério 1.4.3 AA, 1.4.6 AAA & 1.4.11 Non-Text)
A razão de contraste clássica é dada por $CR = \frac{L_1 + 0.05}{L_2 + 0.05}$, onde $L_1$ é a luminância relativa da cor mais clara e $L_2$ da cor mais escura:
- **Texto Normal ($< 18\text{pt}$ ou $< 14\text{pt bold}$):**
  - Mínimo **AA:** $\ge 4.5:1$
  - Meta **AAA:** $\ge 7.0:1$
- **Texto Grande ($\ge 18\text{pt}$ / $24\text{px}$ ou $\ge 14\text{pt bold}$ / $18.66\text{px bold}$):**
  - Mínimo **AA:** $\ge 3.0:1$
  - Meta **AAA:** $\ge 4.5:1$
- **Componentes de UI, Bordas de Inputs e Ícones Funcionais (WCAG 1.4.11):**
  - Mínimo **AA:** $\ge 3.0:1$ contra a superfície adjacente (ex.: borda de campo de texto ou ícone de ação isolado).

### 1.2. Contraste Perceptual APCA ($L_c$ — Accessible Perceptual Contrast Algorithm)
Em temas escuros (*Dark Mode*), a fórmula WCAG 2.x frequentemente falha em refletir a percepção humana real de polaridade (texto claro sobre fundo escuro). O Craft Guardian audita simultaneamente o valor absoluto de contraste perceptual $|L_c|$:
- **Leitura Fluente / Corpo de Texto Longo (`body`, tabelas densas, artigos):** $|L_c| \ge 75$ (Mínimo tolerável para texto curto secundário: $|L_c| \ge 60$).
- **Texto de Interface / Labels de Controles / Botões (`ui-text`, `14px–16px`):** $|L_c| \ge 60$.
- **Headlines / Títulos Grandes ($\ge 24\text{px bold}$) e Elementos Gráficos Grandes:** $|L_c| \ge 45$.
- **Proibição de Inversão Cega:** Nunca inverta paletas de `Light` para `Dark` apenas trocando branco por preto puro (`#000000`) sem recalibrar a luminância de superfícies elevadas (`surface-1`, `surface-2`) e reduzir a halation de textos brancos puros.

### 1.3. Critérios Críticos Novos da WCAG 2.2
1. **SC 2.5.8 Target Size (Minimum — Nível AA) & Touch Ergonomics:**
   - **Piso Legal WCAG 2.2 AA (Desktop / Web):** Todo alvo interativo (botão, ícone clicável, checkbox, chip) deve possuir área mínima de **$24\times24\text{px}$** (ou espaçamento equivalente que garanta círculo livre de $24\text{px}$).
   - **Padrão de Alto Craft Mobile / Touch (Apple HIG / Material):** Todo alvo primário de toque mobile deve possuir no mínimo **$44\times44\text{px}$** (recomendado $48\times48\text{px}$).
2. **SC 2.4.11 Focus Not Obscured (Minimum — Nível AA) & SC 2.4.13 Focus Appearance:**
   - Todo elemento interativo deve exibir anel de foco explícito via `:focus-visible` (ex.: `outline: 2px solid var(--color-focus-ring); outline-offset: 2px;`). É **proibido** usar `outline: none` sem substituto de alto contraste ($\ge 3.0:1$).
   - Elementos focados via teclado (`Tab`) **nunca** podem ficar ocultos atrás de *sticky headers*, *bottom navbars* ou *floating action buttons* — exija `scroll-padding-top` e `scroll-margin-bottom` adequados nos containers de rolagem.
3. **SC 3.2.6 Consistent Help & SC 3.3.7 Redundant Entry:**
   - Mecanismos de ajuda e estados de erro devem manter posição consistente; formulários multi-etapas nunca devem exigir redigitação de dados já informados na mesma sessão.

---

## 2. Heurísticas de Alto Craft (Linear / Stripe / Refactoring UI)

Para erradicar a aparência genérica de interfaces geradas por IA (*AI UI Slop*), aplique estas regras determinísticas:

1. **Ritmo Espacial Estrito de `4pt / 8pt`:**
   - Todos os valores de `padding`, `margin`, `gap` (`itemSpacing`) e dimensões estruturais devem pertencer à progressão espacial canônica: `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`, `80px`, `96px`.
   - **Proibição de Valores Mágicos:** Números arbitrários como `padding: 13px`, `gap: 7px` ou `margin-top: 19px` reprovam imediatamente o Gate.
2. **Alinhamento Numérico & Dados Tabulares (`tabular-nums`):**
   - Qualquer tabela financeira, KPI card, contador regressivo, preço, badge numérico ou coluna de métricas deve aplicar obrigatoriamente `font-variant-numeric: tabular-nums` para evitar jitter horizontal e desalinhamento de casas decimais.
3. **Hierarquia Tipográfica e Medida de Leitura (*Measure*):**
   - Limite a largura de blocos de texto corrido entre **$45\text{ch}$ e $75\text{ch}$** (`max-width: 65ch`).
   - Diferencie hierarquia combinando **tamanho + peso + cor semântica (`text.primary` vs. `text.secondary`)**, nunca apenas tamanho.
4. **Bordas Sutis de `1px` e Elevação Coerente (*Hairline Borders*):**
   - Em vez de sombras pesadas e borradas (`box-shadow: 0 10px 30px rgba(0,0,0,0.3)`), utilize bordas sutis de `1px solid` vinculadas a `color.border.subtle` (ou `rgba(255,255,255,0.08)` em Dark Mode) combinadas com sombras em camadas de baixa opacidade.
   - **Raios de Borda Concêntricos:** Quando um elemento com raio interno $R_{\text{inner}}$ está dentro de um container com padding $P$, o raio externo do container deve respeitar $R_{\text{outer}} = R_{\text{inner}} + P$ (ou usar tokens escalonados equivalentes).

---

## 3. Regra Inegociável dos 4 Estados de UI (Completeness Gate)

Nenhuma tela, lista, tabela, card de dados ou fluxo de formulário pode avançar para Handoff (`06-zero-drift-handoff`) se contemplar apenas o *Happy Path*. O Craft Guardian exige a especificação explícita dos **4 Estados**:

| Estado Obrigatório | Chave no JSON (`states_covered`) | Requisitos de Alto Craft & Acessibilidade |
| :--- | :--- | :--- |
| **1. Default (Happy Path)** | `"default"` | Dados reais realistas (proibido *"Lorem ipsum"* ou *"John Doe"* repetido), truncamento previsível (`text-overflow: ellipsis` + tooltip quando necessário) e `tabular-nums` em métricas. |
| **2. Loading (Skeleton / Shimmer)** | `"loading"` | Skeleton estrutural que espelha a geometria exata do estado Default para garantir **CLS = 0** (*Cumulative Layout Shift*), mais atributo `aria-busy="true"`. |
| **3. Empty State (Orientativo)** | `"empty"` | Explicação clara de por que não há dados, ícone ou ilustração discreta e **CTA primário acionável** para criar o primeiro item ou limpar filtros ativos. |
| **4. Error State (Acionável)** | `"error"` | Mensagem em linguagem humana explicando a causa e **como resolver** (ex.: botão *"Tentar novamente"*, validação inline vinculada via `aria-describedby` e `role="alert"`), nunca códigos técnicos crus (`Error 500`). |
