# Especificação Executiva de Handoff Zero-Drift: {{COMPONENT_OR_FLOW_NAME}}

- **Projeto / Produto:** `{{PROJECT_NAME}}`
- **Preset Operacional:** `{{PRESET_MODE}}` (`freelance` | `enterprise`)
- **Referência Figma (Node URL):** `{{FIGMA_NODE_URL}}`
- **Score de Auditoria Precedente (`05-craft-and-accessibility`):** `{{CRAFT_SCORE}}`

---

## 1. Decisão de Catálogo (Reúso sobre Reinvenção)

| Componente / Bloco | Decisão (`REUSE` \| `EXTEND` \| `NEW_COMPONENT`) | Caminho no Repositório / Storybook ID | Justificativa de Engenharia |
| :--- | :--- | :--- | :--- |
| `{{COMPONENT_NAME}}` | `{{CATALOG_DECISION}}` | `{{COMPONENT_PATH_OR_STORY_ID}}` | {{DECISION_RATIONALE}} |

- **Taxa de Reúso do Fluxo (`reuse_ratio`):** `{{REUSE_RATIO}}` (Meta recomendada $\ge 0.75$)

---

## 2. Contrato de Propriedades TypeScript (Figma $\leftrightarrow$ Code)

```tsx
import * as React from 'react';

export interface {{COMPONENT_NAME}}Props extends React.HTMLAttributes<HTMLElement> {
  /** Variante visual mapeada diretamente da propriedade 'Intent' no Figma */
  intent?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Escala dimensional vinculada aos tokens de espaçamento e tipografia */
  size?: 'sm' | 'md' | 'lg';
  /** Estado assíncrono que preserva largura/altura (CLS = 0) e ativa aria-busy */
  isLoading?: boolean;
  /** Estado de bloqueio interativo nativo e semântico */
  disabled?: boolean;
  /** Estado de erro de validação conectado a mensagem via aria-describedby */
  hasError?: boolean;
  /** Mensagem descritiva de erro exibida quando hasError={true} */
  errorMessage?: string;
  /** Slot opcional para ícone à esquerda com aria-hidden="true" */
  leftIcon?: React.ReactNode;
}
```

---

## 3. Mapeamento Estrito de Design Tokens (Zero Hardcoded Values)

> **Regra Zero-Drift:** Nenhum valor hexadecimal ou pixel arbitrário é permitido fora das variáveis semânticas abaixo.

| Elemento / Propriedade CSS | Token Semântico (W3C DTCG / CSS Var) | Classe Utilitária Tailwind Equivalente |
| :--- | :--- | :--- |
| **Background (Default)** | `var(--color-surface-brand-primary)` | `bg-surface-brand-primary` |
| **Background (Hover)** | `var(--color-surface-brand-hover)` | `hover:bg-surface-brand-hover` |
| **Background (Active)** | `var(--color-surface-brand-active)` | `active:bg-surface-brand-active` |
| **Background (Disabled)** | `var(--color-surface-disabled)` | `disabled:bg-surface-disabled` |
| **Texto / Ícone Principal** | `var(--color-content-on-brand)` | `text-content-on-brand` |
| **Anel de Foco (`focus-visible`)** | `var(--color-border-focus)` | `focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2` |
| **Borda de Erro (`error`)** | `var(--color-border-status-danger)` | `border-status-danger` |
| **Padding Interno (`size="md"`)** | `var(--space-300) var(--space-400)` | `px-space-400 py-space-300` |
| **Border Radius** | `var(--radius-md)` | `rounded-radius-md` |

---

## 4. Matriz Comportamental dos 8 Estados em Gherkin

```gherkin
Feature: Contrato Comportamental de {{COMPONENT_NAME}}

  Scenario: [1. default & 2. hover] Estado inicial em repouso e interação de cursor
    Given que o componente "{{COMPONENT_NAME}}" é renderizado no estado "default"
    When o usuário posiciona o ponteiro sobre o componente ("hover")
    Then a superfície deve utilizar o token "bg-surface-brand-hover" sem deslocamento de layout

  Scenario: [3. focus-visible & 4. active] Acessibilidade via teclado e ativação
    Given que o usuário navega com a tecla "Tab" até focar no componente ("focus-visible")
    Then o indicador "focus-visible:ring-border-focus" deve ser exibido com contraste >= 3:1
    When o usuário pressiona "Enter" ou "Space" ("active")
    Then o estado visual "active:bg-surface-brand-active" é aplicado e a ação principal é executada

  Scenario: [5. loading] Estado de carregamento assíncrono sem Layout Shift
    Given que o componente recebe a prop "isLoading={true}" ("loading")
    When a requisição está em processamento
    Then o atributo "aria-busy='true'" deve estar ativo no elemento raiz
    And um skeleton ou spinner deve ser exibido mantendo as dimensões do layout estáveis (CLS = 0)

  Scenario: [6. disabled] Estado desabilitado e prevenção de eventos
    Given que o componente recebe a prop "disabled={true}" ("disabled")
    When o usuário tenta clicar ou pressionar teclas de atalho no componente
    Then nenhum evento de clique deve ser emitido e os tokens "disabled:bg-surface-disabled" devem estar aplicados

  Scenario: [7. error] Validação e tratamento de erro acessível
    Given que a operação falha ou o dado é inválido ("error") com "hasError={true}"
    When a interface atualiza o estado de validação
    Then o componente deve aplicar "aria-invalid='true'" e a borda "border-status-danger"
    And exibir a mensagem de erro vinculada por "aria-describedby" com "role='alert'"

  Scenario: [8. empty & overflow] Estado vazio e truncamento seguro para i18n
    Given que o conteúdo é ausente ("empty") ou possui texto 40% mais longo por tradução ("overflow")
    When renderizado em viewports de 320px até 1440px
    Then no estado "empty" deve apresentar o placeholder semântico orientando o próximo passo
    And textos em "overflow" devem aplicar "truncate" e "min-w-0" preservando a integridade do container flex/grid
```

---

## 5. Implementação React + Tailwind & Story CSF 3.0

### 5.1 Componente Modular (`{{COMPONENT_NAME}}.tsx`)

```tsx
import * as React from 'react';
import { {{COMPONENT_NAME}}Props } from './{{COMPONENT_NAME}}.types';

export const {{COMPONENT_NAME}} = React.forwardRef<HTMLButtonElement, {{COMPONENT_NAME}}Props>(
  (
    {
      intent = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      hasError = false,
      errorMessage,
      leftIcon,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const errorId = React.useId();
    const isUnavailable = disabled || isLoading;

    return (
      <div className="inline-flex flex-col gap-space-100 min-w-0">
        <button
          ref={ref}
          type="button"
          disabled={isUnavailable}
          aria-busy={isLoading}
          aria-invalid={hasError}
          aria-describedby={hasError && errorMessage ? errorId : undefined}
          className={[
            'inline-flex items-center justify-center gap-space-200 font-medium transition-colors',
            'rounded-radius-md px-space-400 py-space-300 min-w-0',
            'bg-surface-brand-primary text-content-on-brand',
            'hover:bg-surface-brand-hover active:bg-surface-brand-active',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
            'disabled:bg-surface-disabled disabled:text-content-disabled disabled:cursor-not-allowed',
            hasError ? 'border border-status-danger' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        >
          {isLoading ? (
            <span className="animate-spin h-space-400 w-space-400 border-2 border-current border-t-transparent rounded-full" aria-hidden="true" />
          ) : (
            leftIcon && <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
          )}
          <span className="truncate">{children}</span>
        </button>
        {hasError && errorMessage && (
          <span id={errorId} role="alert" className="text-body-sm text-status-danger">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);

{{COMPONENT_NAME}}.displayName = '{{COMPONENT_NAME}}';
```

### 5.2 História Storybook CSF 3.0 (`{{COMPONENT_NAME}}.stories.tsx`)

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { {{COMPONENT_NAME}} } from './{{COMPONENT_NAME}}';

const meta: Meta<typeof {{COMPONENT_NAME}}> = {
  title: 'Components/{{COMPONENT_NAME}}',
  component: {{COMPONENT_NAME}},
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof {{COMPONENT_NAME}}>;

export const Default: Story = {
  args: {
    intent: 'primary',
    size: 'md',
    children: 'Continuar para revisão',
  },
};

export const LoadingState: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
};

export const ErrorState: Story = {
  args: {
    ...Default.args,
    hasError: true,
    errorMessage: 'Não foi possível validar sua sessão. Tente novamente.',
  },
};
```
