# Guia Definitivo: W3C DTCG 2025.10, Espaço Perceptual OKLCH e Arquitetura de Design Tokens em 3 Camadas

Este guia estabelece a fundação matemática e de engenharia para a **Skill 03: Design Tokens & UI Foundations (`03-design-tokens`)**. Ele elimina "números mágicos", contrastes quebrados em Dark Mode e inconsistências entre Figma e Código através da especificação **W3C Design Tokens Community Group (DTCG 2025.10)** e da ciência perceptual de cores **OKLCH**.

---

## 1. Especificação W3C DTCG 2025.10 (Regras Sintáticas)

Todo arquivo de tokens (`.json` ou `.tokens.json`) produzido ou auditado pelo Open UX Harness deve obedecer às propriedades reservadas prefixadas por `$`:

- **`$value` (Obrigatório em nós-folha):** O valor atômico do token (ex.: `"oklch(0.55 0.22 260)"`, `"16px"`, `600`) ou uma referência de alias (`"{primitive.color.blue.600}"`).
- **`$type` (Obrigatório no nó ou herdado do grupo pai):** Tipos oficiais suportados:
  - `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`, `shadow`, `typography`, `border`, `transition`.
- **`$description` (Altamente recomendado na camada semântica):** Explica a intenção de uso, restrições de contraste WCAG/APCA e onde **não** utilizar o token.
- **`$extensions` (Opcional):** Metadados de sincronização (ex.: `com.figma.variableId`, modos `light`/`dark`).
- **Caracteres Proibidos em Chaves de Token:** Chaves de grupos ou tokens **NUNCA** devem começar com `$` nem conter `{`, `}`, `.` (ponto), pois o ponto é o delimitador de resolução de caminho (`{a.b.c}`).

---

## 2. Arquitetura em 3 Camadas (Three-Tier Token Hierarchy)

Para suportar múltiplos temas (Light/Dark/High-Contrast) e rebranding instantâneo sem tocar nos componentes, estruture os tokens em 3 níveis estritos:

### Camada 1: `primitive` (Opções Brutas / Paleta Global)
- **Função:** Catalogar todas as possibilidades visuais permitidas no sistema.
- **Nomenclatura:** Descritiva da escala física (`primitive.color.indigo.600`, `primitive.spacing.16`, `primitive.radius.md`).
- **Regra de Ouro:** Componentes de UI **NUNCA** devem consumir tokens `primitive` diretamente em produção; eles existem apenas para alimentar a camada `semantic`.

### Camada 2: `semantic` (Decisões de Intenção / Contexto)
- **Função:** Atribuir propósito de interface apontando via alias `{...}` para a camada `primitive`.
- **Domínios Canônicos Obrigatórios:**
  1. `semantic.surface.*` (`canvas`, `card`, `elevated`, `overlay`, `sunken`)
  2. `semantic.text.*` (`primary`, `secondary`, `muted`, `inverse`, `on-brand`)
  3. `semantic.border.*` (`subtle`, `default`, `focus`, `strong`)
  4. `semantic.action.*` (`primary-bg`, `primary-hover`, `secondary-bg`, `ghost-hover`)
  5. `semantic.status.*` (`success`, `warning`, `danger`, `info` — cada um com variantes `bg`, `text` e `border`)
- **Proibição de Nomes Literais:** **NUNCA** nomeie um token semântico com o nome de uma cor física (ex.: `semantic.color.blue` ou `semantic.text.gray` são erros graves auditados pelo `validate-tokens.ts`).

### Camada 3: `component` (Escopo Específico — Opcional / Enterprise)
- **Função:** Sobrescrever ou encapsular decisões de componentes complexos apontando sempre para tokens `semantic` (ex.: `component.button.primary.bg` $\rightarrow$ `"{semantic.action.primary-bg}"`).

---

## 3. Modelagem Perceptual de Cores em OKLCH (`oklch(L C H)`)

Diferente do `HSL` ou `HEX`, o espaço de cor **OKLCH** possui **Luminosidade Perceptual Uniforme ($L$)**. Isso significa que duas cores com o mesmo valor de $L$ (ex.: `L = 0.60`), mesmo tendo matizes ($H$) completamente diferentes (azul vs. amarelo), apresentam o **mesmo contraste perceptual** aos olhos humanos.

### Anatomia da Função `oklch(L C H / alpha)`
- **$L$ (Lightness — Luminosidade Perceptual):** `0.00` (preto puro) a `1.00` (branco puro) ou `0%` a `100%`.
- **$C$ (Chroma — Pureza/Saturação):** `0.00` (cinza neutro acromático) a `~0.37` (saturação máxima P3/sRGB).
  - *Dica de Craft:* Neutros sofisticados usam um levíssimo matiz da marca com croma baixíssimo (`C = 0.005` a `0.015`), evitando cinzas "mortos".
- **$H$ (Hue — Ângulo do Matiz):** `0` a `360` graus (ex.: `25` = Vermelho/Erro, `85` = Âmbar/Alerta, `150` = Verde/Sucesso, `260` = Azul/Indigo).

### Tabela de Calibragem Automática Light Mode vs. Dark Mode via $L$

| Papel Semântico | Light Mode ($L$ alvo) | Dark Mode ($L$ alvo) | Garantia de Contraste |
| :--- | :---: | :---: | :--- |
| `surface.canvas` (Fundo Base) | `0.98 - 0.99` | `0.13 - 0.16` | Base de leitura |
| `surface.card` (Superfície Elevada 1) | `1.00` | `0.18 - 0.21` | Elevação por luminosidade no Dark Mode |
| `text.primary` (Corpo Principal) | `0.18 - 0.22` | `0.94 - 0.97` | $\Delta L \ge 0.75$ ($\ge 12:1$ WCAG AAA) |
| `text.secondary` (Subtítulos/ Apoio) | `0.40 - 0.46` | `0.74 - 0.80` | $\Delta L \ge 0.50$ ($\ge 5.5:1$ WCAG AA) |
| `action.primary-bg` (Botão CTA) | `0.52 - 0.58` | `0.62 - 0.68` | Texto `on-brand` com $\ge 4.5:1$ |

---

## 4. Grade Espacial Matemática de 4pt / 8pt

Para garantir ritmo vertical e alinhamento perfeito com sistemas de layout modernos (Auto Layout no Figma e Flexbox/Grid no CSS):
- **Unidade Base:** `8px` (`0.5rem`), com meio-passo de `4px` (`0.25rem`) reservado para micro-espaçamentos internos (ícone-texto, badges, bordas internas).
- **Progressão Homologada (em `px`):** `0`, `2` (apenas hairline/focus offset), `4`, `8`, `12`, `16`, `20`, `24`, `32`, `40`, `48`, `64`, `80`, `96`, `128`.
- **Qualquer valor ímpar ou fora da progressão** (ex.: `13px`, `15px`, `22px`, `35px`) dispara erro imediato no validador `scripts/validate-tokens.ts`.

---

## 5. Exportação Direta para CSS Variables (`:root`) e Tailwind v4 (`@theme`)

Além do JSON W3C DTCG canônico, mapeie os tokens semânticos para consumo imediato no front-end:

```css
/* CSS Custom Properties + Tailwind v4 @theme */
:root {
  --surface-canvas: oklch(0.985 0.004 260);
  --surface-card: oklch(1.00 0 0);
  --text-primary: oklch(0.19 0.015 260);
  --text-secondary: oklch(0.44 0.015 260);
  --action-primary-bg: oklch(0.55 0.21 260);
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}

[data-theme="dark"] {
  --surface-canvas: oklch(0.14 0.01 260);
  --surface-card: oklch(0.19 0.012 260);
  --text-primary: oklch(0.95 0.008 260);
  --text-secondary: oklch(0.76 0.012 260);
  --action-primary-bg: oklch(0.64 0.19 260);
}
```
