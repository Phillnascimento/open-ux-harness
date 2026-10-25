# Especificação Técnica de Handoff (Zero-Drift)

**Componente:** [Ex.: `CheckoutSummaryCard`]  
**Versão do Design Token:** `v1.0.0`  
**Storybook ID:** [Ex.: `components-cards--checkout-summary`]  

---

## 1. Mapeamento de Propriedades e Props
| Propriedade (React/TypeScript) | Tipo | Valor Padrão | Token de Design Vinculado |
| :--- | :--- | :--- | :--- |
| `title` | `string` | Obrigatório | `text.primary` |
| `amount` | `number` | Obrigatório | `text.primary` |
| `variant` | `'default' \| 'highlight'` | `'default'` | `surface.base` / `surface.subtle` |
| `isLoading` | `boolean` | `false` | Dispara Skeleton Loader |

## 2. Estrutura de Layout e Auto Layout
- **Container:** `display: flex; flex-direction: column;`
- **Padding:** `p-4` (`16px` -> `spacing.scale.md`)
- **Gap entre seções:** `gap-3` (`12px`)
- **Borda e Raio:** `border border-slate-200 rounded-lg` (`borderRadius.md` -> `8px`)

## 3. Snippet de Referência Rápida (React + Tailwind)
```tsx
import React from 'react';

interface CheckoutSummaryCardProps {
  title: string;
  amount: number;
  isLoading?: boolean;
}

export const CheckoutSummaryCard: React.FC<CheckoutSummaryCardProps> = ({
  title,
  amount,
  isLoading = false,
}) => {
  if (isLoading) {
    return <div className="p-4 rounded-lg bg-slate-100 animate-pulse h-32" />;
  }

  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col gap-3">
      <h3 className="text-sm font-medium text-slate-600">{title}</h3>
      <p className="text-2xl font-bold text-slate-900">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
      </p>
    </div>
  );
};
```
