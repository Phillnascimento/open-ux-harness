# Craft Floor: Heurísticas e Bans Absolutos contra Visual Slop

> Este documento define a linha de base inegociável de qualidade visual para qualquer tela ou componente produzido pelo Open UX Harness.

---

## 1. Verificações Mandatórias do Resultado Renderizado (Verify)

Cada um dos itens abaixo deve ser verificado em lote no resultado final do código renderizado:

- **Contraste Perceptual:** Texto corrido (body) e placeholders devem ter $\ge 4.5:1$ (WCAG AA) ou $|L_c| \ge 60$ (APCA); texto grande $\ge 3.0:1$. Em superfícies coloridas, o texto secundário deve ser derivado do matiz de fundo ou do primeiro plano — **NUNCA cinza puro desbotado** (`#9CA3AF` sobre fundo azul/verde).
- **Profundidade e Elevação:** Sombras carregam offset direcional em Y e desfoque suave (`box-shadow: 0 4px 12px rgba(0,0,0,0.08)`). Um halo colorido com zero-offset (`box-shadow: 0 0 16px #...`) é decoração artificial de IA e deve ser eliminado.
- **Espaçamento e Ritmo:** Agrupamentos estreitos para itens relacionados, separações generosas entre seções independentes. O espaço **acima de um título deve ser sempre maior do que o espaço abaixo dele** (*heading rhythm*).
- **Hierarquia Tipográfica:** Largura de linha de parágrafo entre **65ch e 75ch** (`max-w-prose`). Títulos display com escala no mínimo 1.25x maior que o subtítulo. Limite inferior de tracking de `-0.04em` (evitar que caracteres se fundam). Em mobile, o texto de leitura e campos de formulário nunca devem ser inferiores a **16px** (evita zoom indesejado no iOS Safari).
- **Movimento e Micro-Interações:** Um momento de destaque deliberado, e não animações de fade idênticas em toda e qualquer seção. Transições suaves com desaceleração exponencial (`ease-out`), nunca com rebote brega (`bounce` ou `elastic`).
- **Superfícies Nativas do Navegador:** As superfícies não desenhadas ainda assim pertencem ao design:
  - Seleção de texto estilizada (`::selection`) com a cor da marca.
  - Cor do cursor de texto (`caret-color`).
  - Scrollbars sutis customizadas (`scrollbar-color` / `scrollbar-width: thin`).
  - Anéis de foco nítidos (`:focus-visible`) que não dependem do outline azul padrão.
  - Numerais tabulares (`tabular-nums` / `font-variant-numeric: tabular-nums`) em tabelas e números alinhados.
- **Cobertura Defensiva de Estados:**
  1. *Default / Happy Path*
  2. *Empty State (orientando a primeira ação clara)*
  3. *Loading / Skeleton (evitando layout shift CLS)*
  4. *Error State (com mensagem explicativa e botão de recuperação)*

---

## 2. Padrões Recusados e Bans Absolutos (Refuse)

Estes são vícios crônicos que geradores de IA repetem por reflexo. Devem ser barrados deterministicamente:

### Estruturas de Página Preguiçosas:
- **Grid de Cards Idênticos com Ícones Quadrados:** O template universal de IA (ícone quadrado arredondado + heading + parágrafo em 3 colunas repetidas). Varie o layout com listas assimétricas, destaques em linha ou tipografia forte.
- **Cards Aninhados dentro de Cards:** Criam ruído visual e camadas de bordas redundantes. Achate a hierarquia com espaçamento e separadores sutis.
- **Eyebrow / Kicker Acima de Todo Título:** O micro-rótulo em caixa alta rastreada (`uppercase tracking-wider`) acima de headings. O heading deve sustentar seu próprio peso; delete o kicker.
- **Numeração Artificial de Seções (`01 / 02 / 03`):** Páginas que numeram seus próprios capítulos sem que a sequência numérica carregue significado real para o usuário.
- **Modais para Tarefas Triviais:** Usar janelas modais invasivas para ações que não exigem interrupção de fluxo.

### Hábitos Visuais de Superfície:
- **Texto em Gradiente (`bg-clip-text text-transparent`):** O ênfase visual deve vir de peso, tamanho ou cor sólida legível.
- **Borda de Destaque Lateral em Cards Arredondados (`side-tab`):** Faixas grossas de cor na lateral esquerda de cards com `rounded-lg` ou `rounded-xl`.
- **Ghost Cards (Borda Fina + Sombra Muito Difusa):** Declare a elevação uma única vez: borda sutil de 1px OU sombra suave de elevação.
- **Fundos Bege/Creme por Reflexo:** Tratar off-white amarelado como padrão universal de "bom gosto". Escolha o fundo a partir de uma paleta deliberada da marca.
- **Fontes Sobreutilizadas sem Intenção:** Aplicar Inter, Geist ou Roboto como reflexo em todo projeto sem justificativa de marca.
- **Linhas de Grade e Stripes Decorativas:** `repeating-linear-gradient` ou grids quadriculados no fundo sem que a aplicação seja literalmente uma ferramenta de mapa, blueprint ou régua técnica.
