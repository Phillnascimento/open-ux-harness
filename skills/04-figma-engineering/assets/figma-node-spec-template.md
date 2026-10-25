# Especificação de Arquitetura de Nós & Auto Layout no Figma

> **Projeto / Feature:** `<Nome do Projeto ou Fluxo>`
> **Arquivo Figma (`fileKey`):** `<fileKey ou Local Spec>` | **Savepoint ID:** `<sp-YYYYMMDD-HHMM>`
> **Perfil de Execução:** `<freelance | enterprise>` | **Status da Validação:** `<PASSED | FAILED>`

---

## 1. Resumo Arquitetural e Sincronia Upstream
- **Origem da Arquitetura de Informação (`02-ia-and-wireflows`):** `<Referência aos fluxos e estados em ia-state.json>`
- **Origem dos Design Tokens (`03-design-tokens`):** `<Coleção W3C DTCG vinculada em tokens-state.json>`
- **Modo de Operação MCP:** `<@figma/mcp-server (Leitura/Code Connect) | figma-console (Escrita/Batching)>`

---

## 2. Árvore Hierárquica de Auto Layout (Zero `layoutMode: NONE`)

| Node ID / Ref | Nome Semântico da Camada | Tipo (`type`) | `layoutMode` | Sizing (`H` $\times$ `V`) | Alinhamento (`Primary` / `Counter`) | `itemSpacing` (Token) | Paddings `T/R/B/L` (Tokens) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `101:01` | `ScreenContainer` | `FRAME` | `VERTICAL` | `FILL` $\times$ `FILL` | `MIN` / `MIN` | `space.layout.lg` (`24px`) | `24 / 24 / 32 / 24` (`space.layout.lg`) |
| `101:02` | `HeaderBar` | `FRAME` | `HORIZONTAL` | `FILL` $\times$ `HUG` | `SPACE_BETWEEN` / `CENTER` | `space.inline.md` (`16px`) | `16 / 24 / 16 / 24` (`space.inset.md`) |
| `101:03` | `ContentCard` | `COMPONENT` | `VERTICAL` | `FILL` $\times$ `HUG` | `MIN` / `MIN` | `space.stack.md` (`16px`) | `24 / 24 / 24 / 24` (`space.inset.lg`) |
| `101:04` | `ActionFooter` | `FRAME` | `HORIZONTAL` | `FILL` $\times$ `HUG` | `MAX` / `CENTER` | `space.inline.sm` (`8px`) | `16 / 0 / 0 / 0` (`space.stack.md`) |

---

## 3. Mapa de Vínculo de Variáveis (`boundVariables`)

| Camada (`name`) | Propriedade Figma | Variável Vinculada (Token ID) | Valor Resolvido (`Light` / `Dark`) |
| :--- | :--- | :--- | :--- |
| `ScreenContainer` | `fills[0]` | `color.bg.canvas` | `#F8FAFC` / `#090D16` |
| `ContentCard` | `fills[0]` | `color.bg.surface` | `#FFFFFF` / `#111827` |
| `ContentCard` | `strokes[0]` | `color.border.subtle` | `#E2E8F0` / `#1F2937` |
| `ContentCard` | `cornerRadius` | `radius.card.md` | `12px` / `12px` |
| `CardTitle` | `fills[0]` | `color.text.primary` | `#0F172A` / `#F9FAFB` |
| `CardSubtitle` | `fills[0]` | `color.text.secondary` | `#475569` / `#9CA3AF` |

---

## 4. Matriz de Propriedades de Componente & Estados (`componentPropertyDefinitions`)

| Propriedade no Figma | Tipo (`VARIANT` / `BOOLEAN` / `TEXT` / `INSTANCE_SWAP`) | Valores Permitidos / Default | Prop Equivalente no Código |
| :--- | :--- | :--- | :--- |
| `State` | `VARIANT` | `Default`, `Loading`, `Empty`, `Error` | `state: 'default' \| 'loading' \| 'empty' \| 'error'` |
| `Size` | `VARIANT` | `sm`, `md` (default), `lg` | `size?: 'sm' \| 'md' \| 'lg'` |
| `ShowIcon` | `BOOLEAN` | `true` (default), `false` | `icon?: React.ReactNode` |
| `LabelText` | `TEXT` | `"Confirmar ação"` | `label: string` |

---

## 5. Especificação Declarativa Figma Code Connect (`.figma.tsx`)

```tsx
import React from 'react';
import figma from '@figma/code-connect';
import { ContentCard } from '@/components/ui/ContentCard';

figma.connect(
  ContentCard,
  'https://www.figma.com/design/<fileKey>?node-id=101-03',
  {
    props: {
      state: figma.enum('State', {
        Default: 'default',
        Loading: 'loading',
        Empty: 'empty',
        Error: 'error',
      }),
      size: figma.enum('Size', {
        sm: 'sm',
        md: 'md',
        lg: 'lg',
      }),
      title: figma.string('TitleText'),
    },
    example: (props) => (
      <ContentCard
        state={props.state}
        size={props.size}
        title={props.title}
      />
    ),
  }
);
```

---

## 6. Resultado da Validação Determinística (`validate-figma-spec.ts`)
- **Total de Nós Auditados:** `<N>`
- **Frames com `layoutMode: NONE`:** `0`
- **Camadas com Nomes Genéricos (`Frame \d+`, `Group \d+`):** `0`
- **Cobertura de `boundVariables`:** `100%`
- **Confidence Score:** `<0.00 - 1.00>`
