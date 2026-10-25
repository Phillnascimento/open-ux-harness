# Relatório Oficial de Auditoria — Craft Guardian & WCAG 2.2 / APCA

> **Projeto / Escopo Auditado:** `<Nome da Tela, Fluxo ou Componente>`
> **Veredito do Gate (`gate_passed`):** `<✅ APROVADO (PASSED) | ❌ REPROVADO (BLOCKED)>`
> **Veredito do Gate:** [PASS | HOLD]
> **Nível WCAG 2.2 Atingido:** `<AAA | AA | FALHA>` | **Score de Craft:** `<0.00 - 1.00>` | **Data:** `<YYYY-MM-DD>`

---

## 1. Sumário Executivo do Gate
- **Insumos Auditados:** `.harness/memory/figma-state.json` + `.harness/memory/tokens-state.json`
- **Cobertura dos 4 Estados de UI:** `Default` [`x`] | `Loading` [`x`] | `Empty` [`x`] | `Error` [`x`]
- **Conformidade de Ritmo Espacial (`4pt / 8pt`):** `<100% | Violações detectadas>`
- **Conformidade de Touch Targets ($\ge 24\text{px}$ AA / $\ge 44\text{px}$ Mobile):** `<100% | Violações detectadas>`

---

## 2. Auditoria Matemática de Contraste (WCAG 2.2 & APCA $L_c$)

| Elemento / Par de Tokens | Foreground (`Hex`) | Background (`Hex`) | Papel Tipográfico | Razão WCAG 2.2 | APCA ($L_c$) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CardTitle` (`color.text.primary` / `color.bg.surface`) | `#0F172A` | `#FFFFFF` | Headline (`20px bold`) | `19.17:1` | `Lc 104.2` | ✅ PASS (AAA) |
| `BodyCopy` (`color.text.secondary` / `color.bg.surface`) | `#475569` | `#FFFFFF` | Body (`16px regular`) | `7.58:1` | `Lc 82.5` | ✅ PASS (AAA) |
| `MutedCaption` (`color.text.muted` / `color.bg.surface`) | `#94A3B8` | `#FFFFFF` | Body (`14px regular`) | `2.56:1` | `Lc 46.1` | ❌ FAIL (< 4.5:1 / Lc < 60) |

---

## 3. Auditoria de Alvos de Toque (WCAG 2.5.8) e Ritmo Espacial (`4pt/8pt`)

| Componente / Nó | Dimensão Medida (`W` $\times$ `H`) | Piso Exigido (Contexto) | Paddings / Gaps (`px`) | Múltiplo `4pt/8pt`? | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `PrimarySubmitButton` | `160px` $\times$ `44px` | $44\times44\text{px}$ (Mobile) | `12px 24px`, `gap: 8px` | Sim | ✅ PASS |
| `CloseModalIconBtn` | `20px` $\times$ `20px` | $24\times24\text{px}$ (WCAG 2.5.8 AA) | `padding: 3px` | Não (`3px`) | ❌ FAIL |

---

## 4. Matriz de Cobertura dos 4 Estados de UI & Heurísticas de Craft

| Dimensão Avaliada | Status | Evidência / Observação Técnica |
| :--- | :--- | :--- |
| **Estado 1: Default (Happy Path)** | ✅ / ❌ | `<Dados realistas, hierarquia clara, sem texto Lorem Ipsum>` |
| **Estado 2: Loading (Skeleton / CLS=0)** | ✅ / ❌ | `<Skeleton respeitando dimensões exatas do container + aria-busy="true">` |
| **Estado 3: Empty State (Orientativo)** | ✅ / ❌ | `<Mensagem explicativa + CTA primário para criar primeiro registro>` |
| **Estado 4: Error State (Acionável)** | ✅ / ❌ | `<Feedback claro + botão de retry + aria-describedby / role="alert">` |
| **Alinhamento Numérico (`tabular-nums`)** | ✅ / ❌ | `<Aplicado em todas as colunas de valor monetário, contadores e KPIs>` |
| **Foco Visível (WCAG 2.4.11 `:focus-visible`)** | ✅ / ❌ | `<Token color.border.focus com outline 2px e scroll-margin configurado>` |

---

## 5. Plano de Correção Prescritivo (Violações Encontradas)

| ID | Severidade (`Blocker` / `Major` / `Minor`) | Código da Violação | Elemento Afetado | Correção Exata com Design Tokens |
| :--- | :--- | :--- | :--- | :--- |
| `V-01` | **Blocker** | `CONTRAST_WCAG_AA_FAIL` | `MutedCaption` (`#94A3B8`) | Substituir por token `color.text.secondary` (`#475569`, contraste `7.58:1`, `Lc 82.5`). |
| `V-02` | **Blocker** | `TARGET_SIZE_TOO_SMALL` | `CloseModalIconBtn` (`20x20px`) | Expandir container para `32x32px` (Desktop) ou `44x44px` (Mobile) usando `space.inset.sm` (`8px`). |
| `V-03` | **Major** | `MISSING_UI_STATE` | `TransactionList` (`empty`) | Adicionar variante `State=Empty` no Figma com componente `EmptyStateCard` e CTA `"Nova Transação"`. |

---

## Evidências Anexadas

| Tipo de Evidência | Viewport | Caminho / Identificador | Observação |
| :--- | :--- | :--- | :--- |
| `screenshot` | `desktop` | `<caminho/screenshot-desktop.png>` | Resolução canônica (ex: 1440x900) |
| `screenshot` | `tablet` | `<caminho/screenshot-tablet.png>` | Resolução canônica (ex: 768x1024) |
| `screenshot` | `mobile` | `<caminho/screenshot-mobile.png>` | Resolução canônica (ex: 375x812) |
| `audit-report` | N/A | `<caminho/craft-audit-report.md>` | Relatório executivo de auditoria |
| `design-contract` | N/A | `<caminho/design-contract.md>` | Contrato de design anti-visual-slop |

