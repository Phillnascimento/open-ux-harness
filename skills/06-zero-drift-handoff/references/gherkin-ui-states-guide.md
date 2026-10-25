# Guia de Especificação Comportamental de UI em Gherkin (`Given / When / Then`)

Telas estáticas no Figma frequentemente omitem estados transitórios, bordas de erro e comportamentos de teclado, gerando retrabalho no desenvolvimento e bugs em produção. Toda especificação do **Open UX Harness (`06-zero-drift-handoff`)** deve traduzir a anatomia visual em critérios de aceitação determinísticos em **Gherkin** cobrindo a **Matriz Obrigatória de 8 Estados Interativos de UI**.

---

## 1. Matriz Obrigatória dos 8 Estados Interativos de UI

Nenhum componente ou fluxo interativo pode ir para implementação sem declarar explicitamente o comportamento visual, semântico (ARIA) e de tokens nos 8 estados abaixo:

| # | Estado de UI | Gatilho de Ativação | Requisitos Visuais (Tokens) & Acessibilidade (WAI-ARIA) |
| :--- | :--- | :--- | :--- |
| **1** | **`default`** | Renderização inicial em repouso com dados válidos. | Tokens de superfície e texto padrão (`surface-default`, `content-primary`), papel semântico (`role`) e `tabIndex={0}` quando interativo. |
| **2** | **`hover`** | Cursor apontador sobre o elemento (`:hover` em dispositivos com `pointer: fine`). | Transição suave (`150ms ease`), token `surface-hover`, cursor `pointer`. Nunca depender apenas de hover para revelar informação crítica em touchscreens. |
| **3** | **`focus-visible`** | Navegação via teclado (`Tab` / `Shift+Tab` / setas). | Anel de foco de alto contraste (`outline: 2px solid var(--border-focus)`, `outline-offset: 2px`) com contraste mínimo de $3:1$ contra o fundo adjacente. |
| **4** | **`active`** | Clique pressionado (`:active`, `Space` ou `Enter`). | Token `surface-active` ou leve compressão tátil (`scale-[0.98]`), feedback imediato em $< 100\text{ms}$. |
| **5** | **`loading / skeleton`** | Requisição assíncrona em andamento (`isLoading={true}`). | Preservar dimensões exatas do layout para evitar *Cumulative Layout Shift* ($\text{CLS} = 0$). Injetar `aria-busy="true"`, `aria-live="polite"`, spinner ou shimmer skeleton e bloquear múltiplos envios (*idempotency*). |
| **6** | **`disabled`** | Ação indisponível por pré-condição ou permissão (`disabled` / `aria-disabled="true"`). | Token `surface-disabled` e `content-disabled`, `pointer-events-none` ou `cursor-not-allowed`, removendo eventos de clique/submissão. |
| **7** | **`error / validation`** | Falha de validação de formulário ou erro de API/rede. | Borda e ícone de alerta (`border-danger`, `content-danger`), atributo `aria-invalid="true"` e mensagem de ajuda conectada via `aria-describedby` com instrução clara de recuperação. |
| **8** | **`empty / overflow`** | Ausência de dados (*Zero Data*) ou excesso extremo de conteúdo (*Text/List Overflow*). | **Empty:** Ilustração sutil, explicação clara e CTA primário de criação. **Overflow:** `truncate` / `line-clamp-2` com `min-w-0` em containers flex/grid ou paginação/virtualização. |

---

## 2. Sintaxe e Boas Práticas de Gherkin para UI

Estruture cada cenário comportamental usando a tríade **`Given` (Contexto Inicial)** $\rightarrow$ **`When` (Ação/Evento)** $\rightarrow$ **`Then` (Resultado Visual, Semântico e de Estado)**:

- **`Given` (Dado que):** Estado do componente, props recebidas, estado da rede ou posição do foco.
- **`When` (Quando):** Interação do usuário (clique, tecla `Tab`/`Enter`/`Escape`, digitação) ou resposta da API.
- **`Then` (Então):** Classes/tokens aplicados, atributos ARIA mutados, callbacks disparados (`onClick`, `onSubmit`) e ausência de layout shift.

---

## 3. Catálogo de Cenários Gherkin Prontos para Handoff

```gherkin
Feature: Comportamento Zero-Drift e Estados Interativos do Componente

  Scenario: [1. default & 2. hover] Renderização inicial e feedback de apontador
    Given que o componente está no estado "default" com dados válidos carregados
    When o usuário posiciona o cursor sobre a área interativa em um dispositivo desktop
    Then o background deve transicionar para o token "surface-brand-hover" em 150ms
    And o elemento deve manter o contrato de contraste WCAG AA (>= 4.5:1)

  Scenario: [3. focus-visible & 4. active] Navegação por teclado e acionamento tátil
    Given que o usuário navega pela interface utilizando a tecla "Tab"
    When o foco atinge o componente interativo ("focus-visible")
    Then o anel de foco "ring-focus-brand" com offset de 2px deve ficar visível
    When o usuário pressiona a tecla "Enter" ou "Space" (estado "active")
    Then o callback de ação principal deve ser disparado exatamente uma vez

  Scenario: [5. loading / skeleton] Prevenção de duplo clique e estabilidade de layout (CLS = 0)
    Given que o usuário acionou a submissão principal
    When a propriedade "isLoading" muda para "true" (estado "loading")
    Then o componente deve exibir o indicador de carregamento mantendo sua largura e altura originais
    And deve aplicar o atributo "aria-busy='true'" bloqueando novos cliques até a resposta da requisição

  Scenario: [6. disabled] Bloqueio semântico de interação
    Given que os pré-requisitos da ação não foram preenchidos ("disabled")
    When o usuário tenta clicar ou acionar o componente via teclado
    Then nenhum callback de ação deve ser executado
    And o componente deve exibir os tokens "surface-disabled" e "content-disabled" com "disabled" nativo ou "aria-disabled='true'"

  Scenario: [7. error / validation] Feedback acessível de erro e recuperação
    Given que a submissão retornou erro de validação ou falha de servidor (estado "error")
    When a mensagem de erro é renderizada na interface
    Then o campo deve receber o token de borda "border-status-danger" e "aria-invalid='true'"
    And a mensagem de erro deve estar vinculada via "aria-describedby" e anunciada por leitores de tela ("role='alert'")

  Scenario: [8. empty / overflow] Resiliência a estado vazio e truncamento de strings longas (i18n)
    Given que a lista de dados retorna vazia ("empty") ou um rótulo excede 140% do tamanho original ("overflow")
    When o componente calcula seu layout em viewports de 320px a 1440px
    Then no estado "empty" deve exibir o EmptyState com CTA de ação primária
    And no caso de "overflow" textual deve aplicar "truncate" ou "line-clamp-2" com "min-w-0" sem quebrar o grid ou sobrepor ícones adjacentes
```
