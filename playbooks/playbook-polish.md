# Playbook: Polish — O Pente Fino e Acabamento Final Antes da Entrega

> **Objetivo:** Aplicar os micro-detalhes de refinamento artesanal que transformam uma interface de "gerada por máquina" em um produto digital polido por designers seniores.

---

## 1. O Checklist do Pente Fino (Final Polish Pass)

Execute esta revisão imediatamente antes de submeter o código ao Reality Gate:

### A. Superfícies Nativas do Navegador:
- [ ] **Seleção de Texto (`::selection`):** Customizada com a cor da marca e contraste nítido:
  ```css
  ::selection {
    background-color: var(--color-brand-primary-light, #e0e7ff);
    color: var(--color-brand-primary-dark, #3730a3);
  }
  ```
- [ ] **Cursor de Texto (`caret-color`):** Alinhado com a cor primária de destaque:
  ```css
  input, textarea {
    caret-color: var(--color-brand-primary, #4f46e5);
  }
  ```
- [ ] **Scrollbars Suaves:**
  ```css
  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
  ```
- [ ] **Numerais Tabulares (`tabular-nums`):**
  - Aplicado a qualquer tabela financeira, relógio, contador ou coluna numérica para que os dígitos compartilhem a mesma largura e não "dancem" na tela:
  ```css
  .tabular-numbers {
    font-variant-numeric: tabular-nums;
  }
  ```

### B. Micro-Interações e Feedback de Toque:
- [ ] **Estados de Foco Visíveis (`:focus-visible`):** Garantir que a navegação por tecla Tab exiba um anel de foco evidente com offset:
  ```css
  :focus-visible {
    outline: 2px solid var(--color-focus-ring, #4f46e5);
    outline-offset: 2px;
  }
  ```
- [ ] **Cursor Pointer nos Controles Certos:**
  - Botões, links e toggles usam `cursor: pointer`.
  - Estados desabilitados usam `cursor: not-allowed` e opacidade reduzida (`opacity: 0.6`).
- [ ] **Área de Toque Defensiva (Touch Targets):**
  - Mínimo de **44x44px** em mobile e **24x24px** em desktop para todos os botões e ícones clicáveis.

### C. Alinhamentos Ópticos:
- [ ] Ícones ao lado de texto alinhados com o centro da altura-x (`align-middle` ou flex com `items-center`).
- [ ] Badges com padding vertical ligeiramente menor que o horizontal (ex.: `px-2 py-0.5`).
- [ ] Sombras com cor matizada derivada do ambiente (evitar preto puro opaco `#000000` em fundos coloridos).
