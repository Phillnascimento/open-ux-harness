# Engenharia de Handoff Zero-Drift e Contratos de Componentes

Este guia estabelece o protocolo de engenharia de interface para eliminar o *Design Drift* (divergência visual, semântica e comportamental entre o que foi projetado no Figma e o que é renderizado em produção).

---

## 1. Princípio Soberano: Reúso sobre Reinvenção (*Reuse over Reinvention*)

Antes de especificar ou gerar qualquer linha de código de UI, você **DEVE** auditar o catálogo existente para evitar duplicação de componentes:

### Matriz de Decisão de Catálogo (`catalog_decision`)

| Decisão | Critério Técnico | Ação Obrigatória |
| :--- | :--- | :--- |
| **`REUSE`** | O componente já existe no Storybook/repositório e atende $\ge 90\%$ dos requisitos via props existentes. | Importar o componente oficial e configurar apenas suas props e tokens sem criar wrappers desnecessários. |
| **`EXTEND`** | O componente existe, mas precisa de uma nova variante semântica (ex.: `size="xl"` ou `intent="warning"`). | Propor adição retrocompatível na interface TypeScript do componente existente sem quebrar contratos atuais. |
| **`NEW_COMPONENT`** | Padrão inédito no sistema que não pode ser composto a partir de primitivos existentes. | Justificar a criação, especificar contrato de props completo, tokens W3C DTCG, história CSF 3.0 e `.figma.ts`. |

### Protocolo de Consulta ao Catálogo
1. **Modo Enterprise (Scale):** Consulte o servidor `@storybook/mcp-server` (tools `list_components`, `get_component_props`, `get_story_source`) para inspecionar a assinatura real do componente homologado.
2. **Modo Freelancer (Lean):** Inspecione os diretórios locais `src/components/ui/`, `components/` ou `package.json` (ex.: Radix UI, shadcn/ui, Headless UI, Tailwind).

---

## 2. Mapeamento Bidirecional: Figma Variants $\leftrightarrow$ TypeScript Props

Toda propriedade configurável no Figma deve possuir um equivalente tipado e determinístico em TypeScript.

### Regras de Ouro de Tipagem
- **Proibição de Booleans Conflitantes:** Evite combinações impossíveis como `isPrimary={true}` e `isDanger={true}`. Use *discriminated unions* (`variant: 'primary' | 'secondary' | 'danger'`).
- **Paridade de Nomenclatura:** O nome da Variant Property no Figma deve corresponder em `camelCase` à prop no código (`Size` $\rightarrow$ `size`, `Has Icon` $\rightarrow$ `hasIcon` ou slot `leftIcon`).
- **Extensão de Atributos Nativos:** Componentes interativos devem estender os atributos HTML nativos (`React.ButtonHTMLAttributes<HTMLButtonElement>`) e encaminhar `ref` (`React.forwardRef` ou prop `ref` no React 19).

### Tabela de Equivalência Padrão

| Figma Property Type | Figma Example | TypeScript Prop Signature | Observação de Engenharia |
| :--- | :--- | :--- | :--- |
| **Variant** | `Intent = Primary, Danger, Ghost` | `intent?: 'primary' | 'danger' | 'ghost'` | Definir valor `default` explícito (`'primary'`). |
| **Variant** | `Size = sm, md, lg` | `size?: 'sm' | 'md' | 'lg'` | Mapear diretamente para tokens de espaçamento e tipografia. |
| **Boolean** | `Loading = True/False` | `isLoading?: boolean` | Quando `true`, aplicar `aria-busy="true"` e desabilitar cliques. |
| **Instance Swap** | `Icon Left` | `leftIcon?: React.ReactNode` | Preferir slots `ReactNode` para flexibilidade de ícones SVG. |
| **Text** | `Label` | `children: React.ReactNode` | Preferir `children` em vez de prop `label` restrita a `string`. |

---

## 3. Estrutura Figma Code Connect (`.figma.ts`)

Para manter o Dev Mode do Figma sincronizado com o repositório real, gere ou atualize o arquivo `<Component>.figma.ts`:

```tsx
import figma from '@figma/code-connect/react';
import { Button } from './Button';

figma.connect(
  Button,
  'https://www.figma.com/design/FILE_KEY/Design-System?node-id=123-456',
  {
    props: {
      intent: figma.enum('Intent', {
        Primary: 'primary',
        Secondary: 'secondary',
        Danger: 'danger',
        Ghost: 'ghost',
      }),
      size: figma.enum('Size', {
        Small: 'sm',
        Medium: 'md',
        Large: 'lg',
      }),
      isLoading: figma.boolean('Loading'),
      disabled: figma.boolean('Disabled'),
      leftIcon: figma.instance('Icon Left'),
      children: figma.string('Label'),
    },
    example: ({ intent, size, isLoading, disabled, leftIcon, children }) => (
      <Button
        intent={intent}
        size={size}
        isLoading={isLoading}
        disabled={disabled}
        leftIcon={leftIcon}
      >
        {children}
      </Button>
    ),
  }
);
```

---

## 4. Documentação Viva em Storybook CSF 3.0 (`.stories.tsx`)

Todo componente novo ou estendido deve incluir histórias em **Component Story Format 3.0 (CSF 3.0)** cobrindo as variantes e testes de interação (`play` function):

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    intent: { control: 'select', options: ['primary', 'secondary', 'danger', 'ghost'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    intent: 'primary',
    size: 'md',
    children: 'Confirmar pagamento',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /confirmar pagamento/i });
    await expect(button).toBeEnabled();
    await userEvent.tab();
    await expect(button).toHaveFocus();
  },
};

export const Loading: Story = {
  args: {
    ...Primary.args,
    isLoading: true,
  },
};
```

---

## 5. Checklist de Prevenção de *Design Drift*

Antes de aprovar qualquer especificação de handoff, valide rigorosamente os 3 pilares abaixo:

1. **Zero Valores Hardcoded (Tokens Obrigatórios):**
   - **PROIBIDO** usar cores hexadecimais (`#3B82F6`), `rgb()` ou valores arbitrários no Tailwind (`bg-[#3B82F6]`, `p-[13px]`, `w-[342px]`).
   - **OBRIGATÓRIO** referenciar tokens semânticos (`bg-surface-brand-primary`, `text-content-on-brand`, `p-space-400`, `rounded-radius-md` ou variáveis CSS `var(--color-brand-primary)`).
2. **Comportamento de Layout Responsivo & Fluido:**
   - Documente o comportamento em containers flexíveis (`flex-1`, `min-w-0`, `grid-cols-1 md:grid-cols-12`).
   - Especifique pontos de quebra (*breakpoints*) e regras de *wrapping* ou empilhamento mobile-first.
3. **Resiliência a Textos Longos e Internacionalização (i18n):**
   - Teste expansão de +40% no comprimento de strings (ex.: tradução do inglês para alemão ou português).
   - Defina explicitamente se o texto deve truncar com reticências (`truncate` + `title` / tooltip acessível) ou quebrar em múltiplas linhas (`line-clamp-2`, `break-words`) sem romper o alinhamento de ícones adjacentes.
