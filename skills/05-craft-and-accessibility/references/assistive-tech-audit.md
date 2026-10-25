# Protocolo de Auditoria com Tecnologias Assistivas (`assistive-tech-audit.md`)

> **Propósito:** Guia normativo e procedural do **Craft Guardian** para conduzir testes com leitores de tela, inspecionar ordens de foco via teclado e validar atributos ARIA dinâmicos, garantindo conformidade com a WCAG 2.2 Níveis AA/AAA e experiência acessível fluida.

---

## Quando Carregar (Just-In-Time)

Carregue este documento sob demanda (**estritamente 1 arquivo por vez**) nas seguintes situações:
- **Na Fase 2 (Auditoria Determinística e Semântica):** Ao inspecionar componentes ricos e complexos (diálogos modais, menus dropdown, comboboxes, acordeões, abas e tabelas de dados) ou fluxos interativos de teclado.
- **Na Fase 3 (Emissão do Relatório do Craft Guardian):** Ao auditar e prescrever correções para anúncios dinâmicos (`aria-live`), sincronização de estados de widgets ou quebras de ordem de foco no DOM.
- **Não carregar:** Em análises superficiais de tokens de cores primitivas, auditorias puramente tipográficas ou na Fase 1 de coleta básica de contexto.

---

## 1. Protocolo de Teste com Leitores de Tela

A validação de acessibilidade exige a combinação de leitores de tela em múltiplos navegadores e sistemas operacionais para mitigar inconsistências de interpretação da árvore de acessibilidade (Accessibility Tree).

### 1.1. Matriz de Combinações Obrigatórias
| Sistema Operacional | Leitor de Tela | Navegador Primário | Modo de Teste |
| :--- | :--- | :--- | :--- |
| **Windows** | NVDA (NonVisual Desktop Access) | Google Chrome / Mozilla Firefox | Modo de Foco vs. Modo de Navegação (`Insert + Espaço`) |
| **macOS** | VoiceOver | Apple Safari | Rotor de Navegação (`VO + U`), Navegação por Cursores (`VO + Setas`) |
| **iOS / iPadOS** | VoiceOver | Mobile Safari | Gestos de Rotor (dois dedos), Deslizar Linear (Swipe) |
| **Android** | TalkBack | Google Chrome | Deslizar Horizontal (Swipe Right/Left), Exploração por Toque |

### 1.2. Roteiro de Inspeção Sonora
1. **Nome Acessível (`accName`):** Todo controle interativo deve anunciar seu propósito de forma unívoca, sem redundâncias (evite anunciar *"Botão Salvar Botão"*). Priorize rótulos visíveis associados ou `aria-label`/`aria-labelledby`.
2. **Papel Semântico (`role`):** Verifique se o leitor vocaliza o papel correto (`button`, `link`, `dialog`, `tab`, `checkbox`). Não use `div` clicável sem papel nem semântica nativa correspondente.
3. **Estado e Propriedades:** Valide a vocalização imediata de estados de expansão (`aria-expanded="true|false"`), seleção (`aria-selected`), marcação (`aria-checked`), obrigatoriedade (`aria-required="true"`) e indisponibilidade (`aria-disabled="true"`).

---

## 2. Fluxo de Foco com Tecla Tab & Gerenciamento de Teclado

O uso exclusivo do teclado é pré-requisito inegociável de acessibilidade motora e visual (WCAG 2.1.1, 2.1.2 e 2.4.3).

### 2.1. Sequência Lógica de Foco no DOM
- **Ordem Natural:** O foco deve seguir rigorosamente a leitura visual (`left-to-right` e `top-to-bottom` em idiomas ocidentais). A ordem no DOM deve equivaler à disposição visual gerada por CSS Grid ou Flexbox.
- **Regra de Tabindex:**
  - `tabindex="0"`: Insere um elemento estático na ordem natural de tabulação (use apenas quando necessário para containers roláveis ou widgets customizados).
  - `tabindex="-1"`: Remove da tabulação sequencial, mas permite receber foco programático via `element.focus()`.
  - **Proibição Estrita de Tabindex Positivo:** `tabindex="1"` ou superior desorganiza a cadeia de foco do navegador e é categoricamente reprovado no gate.

### 2.2. Armadilhas de Foco (*Focus Trapping*) em Diálogos e Modais
- Ao abrir uma janela modal, drawer ou side-sheet com `role="dialog"` ou `role="alertdialog"`:
  1. O foco deve ser imediatamente transferido para o primeiro elemento interativo interno ou para o container com `tabindex="-1"`.
  2. A tecla `Tab` deve circular exclusivamente entre os elementos focáveis do diálogo, sem vazar para o documento de fundo.
  3. O fundo da aplicação deve ser neutralizado via atributo `inert` ou `aria-hidden="true"`.
  4. A tecla `Escape` deve encerrar o diálogo imediatamente.
  5. Ao fechar, o foco deve ser devolvido exatamente ao elemento disparador original.

### 2.3. Padrão Roving Tabindex para Widgets Compostos
Para menus, toolbars, radio groups e listas de abas (`tablist`), aplique a técnica de foco flutuante (*roving tabindex*): apenas a aba ativa mantém `tabindex="0"`, enquanto as demais recebem `tabindex="-1"`, com navegação interna acionada pelas setas do teclado (`ArrowLeft`/`ArrowRight` ou `ArrowUp`/`ArrowDown`).

---

## 3. Landmarks ARIA & Arquitetura Semântica

Marcos de página (*Landmarks*) permitem que pessoas cegas naveguem diretamente para seções relevantes da interface sem percorrer todo o conteúdo prévio.

### 3.1. Equivalência Estrutural
| Tag HTML5 Semântica | Role ARIA Equivalente | Regra de Uso no Open UX Harness |
| :--- | :--- | :--- |
| `<header>` | `role="banner"` | Escopo de topo da aplicação; deve existir no máximo 1 no contexto de página. |
| `<nav>` | `role="navigation"` | Bloco de links estruturais; se houver mais de um, diferencie com `aria-label` (ex.: *"Principal"*, *"Rodapé"*). |
| `<main>` | `role="main"` | Conteúdo central e exclusivo da visualização; obrigatório e único por tela ativa. |
| `<aside>` | `role="complementary"` | Conteúdo relacionado de suporte, barras laterais de métricas ou dicas contextuais. |
| `<footer>` | `role="contentinfo"` | Rodapé da aplicação com notas legais, direitos e links institucionais; máximo 1 por página. |
| `<form role="search">` | `role="search"` | Formulário ou campo destinado a busca no sistema. |

### 3.2. Skip Links (Atalho para o Conteúdo Principal)
Toda interface de densidade média ou alta deve fornecer um link oculto visualmente, localizado como primeiro filho do `<body>`, que se torna visível ao receber foco (`:focus-visible`):
```html
<a href="#main-content" class="skip-link">Pular para o conteúdo principal</a>
```

---

## 4. Feedback Dinâmico com Atributos `aria-live`

Atualizações em tempo real que não recarregam a página precisam ser anunciadas de forma não intrusiva às tecnologias assistivas.

### 4.1. Modos de Polidez: `polite` vs. `assertive`
- `aria-live="polite"` / `role="status"`: O leitor de tela aguarda o encerramento da frase ou ação em curso antes de emitir a notificação. Padrão obrigatório para mensagens de sucesso, contadores de itens em filtros assíncronos, notificações de toast e paginações dinâmicas.
- `aria-live="assertive"` / `role="alert"`: Interrompe imediatamente qualquer fala em andamento. Uso estritamente restrito a emergências, perda iminente de sessão por inatividade ou erros críticos impeditivos.

### 4.2. Atributos Complementares Críticos
- `aria-atomic="true"`: Garante que todo o container da mensagem seja lido quando alterado, em vez de ler apenas palavras que sofreram mutação no nó de texto.
- `aria-busy="true"`: Sinaliza que a região está recebendo dados assíncronos e suprime leituras intermediárias fragmentadas até que o carregamento se encerre.
```html
<div role="status" aria-live="polite" aria-atomic="true" class="toast-container">
  Fatura aprovada com sucesso.
</div>
```
