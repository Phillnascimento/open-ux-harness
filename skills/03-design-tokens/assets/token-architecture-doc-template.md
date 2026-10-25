# Especificação Executiva de Arquitetura de Design Tokens (W3C DTCG 2025.10 & OKLCH)

> **Projeto:** `{{PROJECT_NAME}}` | **Preset:** `{{PRESET_MODE}}` | **Data:** `{{DATE}}`  
> **Skill Emissora:** `03-design-tokens` | **Confidence Score:** `{{CONFIDENCE_SCORE}}`

---

## 1. Diretrizes de Marca & Contexto Herdado

| Dimensão | Definição Estratégica Herdada (`framing-state.json` / `ia-state.json`) |
| :--- | :--- |
| **Personalidade Visual / Arquétipo** | {{BRAND_PERSONALITY}} |
| **Matiz Primário OKLCH ($H$)** | `{{PRIMARY_HUE_ANGLE}}` |
| **Unidade de Grid Espacial** | Escala estrita de `4pt / 8pt` (`4px` a `64px`) |
| **Padrão de Contraste Alvo** | WCAG 2.2 AA/AAA ($\ge 4.5:1$ texto normal, $\ge 3.0:1$ UI e estados de foco) |

---

## 2. Catálogo de Tokens Semânticos de Cor (Light vs. Dark Mode em OKLCH)

| Token Semântico (`semantic.*`) | Alias Primitivo (Light) | Valor OKLCH (Light Mode) | Valor OKLCH (Dark Mode) | Uso Obrigatório na Interface |
| :--- | :--- | :--- | :--- | :--- |
| `semantic.surface.canvas` | `{primitive.color.neutral.50}` | `oklch(0.985 0.004 260)` | `oklch(0.14 0.012 260)` | Plano de fundo geral das telas do wireflow |
| `semantic.surface.card` | `{primitive.color.neutral.100}` | `oklch(0.96 0.006 260)` | `oklch(0.19 0.015 260)` | Containers de objetos OOUX, cards e modais |
| `semantic.text.primary` | `{primitive.color.neutral.900}` | `oklch(0.19 0.015 260)` | `oklch(0.96 0.006 260)` | Títulos e atributos *Core* dos objetos |
| `semantic.text.secondary` | `{primitive.color.neutral.600}` | `oklch(0.44 0.018 260)` | `oklch(0.76 0.014 260)` | Metadados, subtítulos e legendas |
| `semantic.border.default` | `{primitive.color.neutral.300}` | `oklch(0.84 0.014 260)` | `oklch(0.32 0.015 260)` | Bordas de inputs e divisores estruturais |
| `semantic.action.primary-bg` | `{primitive.color.brand.600}` | `oklch(0.55 0.21 260)` | `oklch(0.62 0.19 260)` | Botões de Call-to-Action (CTA) principais |
| `semantic.status.success-text` | `{primitive.color.emerald.600}` | `oklch(0.54 0.16 150)` | `oklch(0.72 0.15 150)` | Confirmação de estados concluídos |
| `semantic.status.danger-text` | `{primitive.color.rose.600}` | `oklch(0.55 0.21 25)` | `oklch(0.70 0.18 25)` | Alertas de erro e recuperação no wireflow |

---

## 3. Escala Espacial (Grid de 4pt/8pt) e Raios de Borda

| Token Semântico | Alias Primitivo | Valor Resolvido | Equivalente `rem` | Aplicação Estrutural |
| :--- | :--- | :---: | :---: | :--- |
| `semantic.layout.gap-xs` | `{primitive.spacing.4}` | `4px` | `0.25rem` | Espaço interno entre ícone e texto de badge/botão |
| `semantic.layout.gap-sm` | `{primitive.spacing.8}` | `8px` | `0.50rem` | Espaçamento entre campos ou itens de lista compacta |
| `semantic.layout.gap-md` | `{primitive.spacing.16}` | `16px` | `1.00rem` | Padding interno padrão de cards e modais |
| `semantic.layout.gap-lg` | `{primitive.spacing.24}` | `24px` | `1.50rem` | Separação entre blocos de objetos relacionados |
| `semantic.layout.gap-xl` | `{primitive.spacing.32}` | `32px` | `2.00rem` | Margem vertical entre seções macro de página |
| `semantic.layout.radius-control` | `{primitive.radius.md}` | `8px` | `0.50rem` | Botões, inputs de texto e selects |
| `semantic.layout.radius-container` | `{primitive.radius.lg}` | `12px` | `0.75rem` | Cards de objetos, painéis e modais |

---

## 4. Exportação Pronta para Consumo (CSS `:root` & Tailwind v4 `@theme`)

```css
:root {
  /* Surfaces & Text */
  --surface-canvas: oklch(0.985 0.004 260);
  --surface-card: oklch(0.96 0.006 260);
  --text-primary: oklch(0.19 0.015 260);
  --text-secondary: oklch(0.44 0.018 260);

  /* Actions & Borders */
  --border-default: oklch(0.84 0.014 260);
  --border-focus: oklch(0.55 0.21 260);
  --action-primary-bg: oklch(0.55 0.21 260);
  --action-primary-hover: oklch(0.48 0.20 260);

  /* Status */
  --status-success-text: oklch(0.54 0.16 150);
  --status-warning-text: oklch(0.58 0.16 75);
  --status-danger-text: oklch(0.55 0.21 25);

  /* Spatial Grid (4pt/8pt) */
  --gap-xs: 4px;
  --gap-sm: 8px;
  --gap-md: 16px;
  --gap-lg: 24px;
  --gap-xl: 32px;
  --radius-control: 8px;
  --radius-container: 12px;
}

@theme inline {
  --color-canvas: var(--surface-canvas);
  --color-card: var(--surface-card);
  --color-fg-primary: var(--text-primary);
  --color-fg-secondary: var(--text-secondary);
  --color-brand-primary: var(--action-primary-bg);
}
```

---

## 5. Roteador de Próximos Passos (*Next-Step Router*)

- [ ] **Caminho A (Recomendado — `04-figma-engineering`):** Materializar os objetos OOUX, wireflows e Design Tokens validados em frames, Variable Collections e componentes com Auto Layout no Figma ou Código React/Tailwind.
- [ ] **Caminho B (Auditoria Direta — `05-craft-and-accessibility`):** Caso a interface ou protótipo já esteja implementado no projeto, avançar direto para a auditoria de contraste WCAG 2.2 / APCA, heurísticas visuais e refinamento de craft.
