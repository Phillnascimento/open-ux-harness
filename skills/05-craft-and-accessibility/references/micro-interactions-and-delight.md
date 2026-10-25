# Engenharia de Micro-Interações e Deleite Funcional (`micro-interactions-and-delight.md`)

> **Propósito:** Diretrizes técnicas do **Craft Guardian** para projetar micro-interações significativas, coreografar transições de estado na faixa de 150–250ms, respeitar preferências de movimento reduzido (`prefers-reduced-motion`) e calibrar momentos de celebração comedida com alto valor percebido.

---

## Quando Carregar (Just-In-Time)

Carregue este documento sob demanda (**estritamente 1 arquivo por vez**) nas seguintes situações:
- **Na Fase 2 (Auditoria de Craft e Estados de UI):** Ao avaliar transições cinéticas de botões, inputs, tooltips, toasts, acordeões e modais contra a latência perceptiva humana.
- **Na Fase 4 (Especificação para Handoff com `06-zero-drift-handoff`):** Ao exportar especificações de curvas de aceleração (*easing*), durações de animação em tokens CSS e cláusulas de acessibilidade de movimento.
- **Não carregar:** Em análises estáticas de contraste de cores, revisões exclusivas de JSON schema ou na fase de extração inicial de requisitos de produto.

---

## 1. Princípios de Micro-Interações com Propósito

Micro-interações no Open UX Harness são ferramentas de clareza cognitiva, nunca adereços cosméticos gratuitos (*anti-slop*).

### 1.1. Critérios de Relevância Funcional
Toda micro-interação deve atender a pelo menos um destes três objetivos funcionais:
1. **Confirmação de Causalidade:** Dar resposta sensorial imediata (< 100ms) de que a intenção do usuário foi captada pelo sistema (ex.: depressão física de um botão ao clique).
2. **Orientação Espacial e Continuidade de Estado:** Mostrar de onde veio um elemento e para onde ele foi (ex.: modal expandindo a partir do gatilho ou item sendo removido com colapso de altura).
3. **Mitigação de Ansiedade de Espera:** Transformar processos assíncronos lentos em etapas transparentes por meio de skeletons estruturais ou micro-barras de progresso determinísticas.

### 1.2. Proibição de Fricção Cinética (*Decorative Slop*)
- É terminantemente proibido inserir atrasos artificiais em fluxos de trabalho do usuário apenas para exibir animações vistosas.
- Interfaces de alta produtividade (tabelas operacionais, formulários financeiros, checkouts) demandam transições ágeis e econômicas; evite oscilações elásticas exageradas (*spring overshoot* excessivo) que retardem cliques subsequentes.

---

## 2. Coreografia Temporal dos Estados de Interface (150–250ms)

O limiar da percepção humana exige que respostas interativas ocorram dentro da janela de latência ideal entre 100ms e 300ms. Valores abaixo de 100ms parecem cortes secos; acima de 300ms transmitem lentidão do software.

### 2.1. Tabela Paramétrica de Transições
| Estado / Interação | Duração Canônica | Função de Easing (*Timing Function*) | Propriedades Permitidas (GPU) |
| :--- | :--- | :--- | :--- |
| **Hover / Pointer Enter** | 150ms | `cubic-bezier(0.16, 1, 0.3, 1)` (*ease-out* rápido) | `background-color`, `border-color`, `box-shadow` |
| **Press / Active** | 80ms – 100ms | `cubic-bezier(0.4, 0, 1, 1)` (*ease-in* imediato) | `transform: scale(0.98)` |
| **Focus-Visible** | 150ms | `ease-out` | `outline-color`, `box-shadow` |
| **Pointer Leave / Dismiss** | 200ms – 250ms | `cubic-bezier(0.7, 0, 0.84, 0)` (*ease-in-out* suave) | `opacity`, `transform` |
| **Modal / Dialog Entrance**| 200ms – 250ms | `cubic-bezier(0.16, 1, 0.3, 1)` | `opacity`, `transform: translateY(0)` |
| **Collapse / Removal** | 200ms | `cubic-bezier(0.4, 0, 0.2, 1)` | `max-height`, `opacity` |

### 2.2. Aceleração por Hardware e Desempenho
- **Permitido:** Animar estritamente propriedades compostas na GPU (`transform`, `opacity`).
- **Proibido no Gate:** Animar propriedades de fluxo que disparam recálculo de layout (*reflow*) e repintura (*repaint*), tais como `width`, `height`, `top`, `left`, `margin` ou `padding`.

---

## 3. Respeito Incondicional a `prefers-reduced-motion`

Usuários com distúrbios vestibulares, labirintite ou cinetose podem sofrer tonturas, náuseas e enxaquecas quando confrontados com deslocamentos espaciais e paralaxe (WCAG 2.2 SC 2.3.3).

### 3.1. Regra de Degradação Graciosa
Ao detectar a media query `prefers-reduced-motion: reduce`:
1. Remova imediatamente qualquer deslocamento espacial (`translateX`, `translateY`), rotação ou escala agressiva.
2. Preserve a confirmação do feedback por meio de transições sutis e rápidas de `opacity` ($\le 150\text{ms}$) ou mudança de cor estática imediata.
3. Nunca suprima o feedback por completo: o usuário com sensibilidade vestibular ainda precisa saber se o botão foi clicado ou se o modal abriu.

### 3.2. Snippet Normativo para Tokens e CSS
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Fallback semântico para feedback essencial */
  .interactive-feedback {
    transition: opacity 150ms ease !important;
  }
}
```

---

## 4. Momentos de Celebração Comedidos (*Measured Delight*)

O deleite genuíno nasce da precisão, da confiabilidade e do respeito ao tempo do usuário, e não de efeitos pirotécnicos invasivos.

### 4.1. Quando Aplicar Celebração
- **Permitido:** Momentos culminantes de grande esforço ou relevância pessoal/financeira do usuário (ex.: quitação de um financiamento, conclusão de compra após jornada complexa, emissão de relatório anual de sustentabilidade).
- **Proibido:** Ações ordinárias e de alta repetição cotidiana (ex.: salvar rascunho de e-mail, adicionar produto avulso ao carrinho, preencher campo obrigatório de formulário).

### 4.2. Diretrizes de Execução Sofisticada
1. **Dimensão Contida:** A animação de celebração deve se restringir ao container local da ação (ex.: animação do ícone de confirmação dentro do próprio card ou botão de sucesso), nunca tomando a tela inteira com explosões descontroladas de partículas.
2. **Sem Bloqueio de Interface (*Non-blocking*):** A celebração jamais deve impedir que o usuário visualize seu recibo, baixe um PDF ou continue navegando imediatamente. Não exija clique extra de *"fechar confete"*.
3. **Feedback Háptico Sutis (Mobile):** Em dispositivos touch, combine um pulso de vibração leve de sucesso (`HapticFeedbackType.SUCCESS`) no momento exato da transição visual, sem disparar vibrações prolongadas.
