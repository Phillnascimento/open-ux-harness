# Checklist Procedural do Craft Guardian

Todo artefato visual, componente ou especificação de tela gerado pelo harness DEVE ser submetido a esta verificação determinística antes de ser apresentado ao usuário ou submetido a código:

## 1. Grid e Espaçamento (8-Point Spatial System)
- [ ] Todos os paddings e margins são múltiplos de 8px (ou sub-múltiplos defensivos de 4px para elementos compactos de formulário/ícones).
- [ ] Não existem valores arbitrários (ex.: 7px, 13px, 21px) declarados no design ou CSS.
- [ ] Alinhamento vertical e horizontal respeita as restrições de Auto Layout.

## 2. Tipografia e Escala Harmônica
- [ ] Toda tipografia referencia os tokens canônicos da escala definida (ex.: `display`, `heading-lg`, `body-md`, `caption`).
- [ ] A altura da linha (*line-height*) é proporcional ao tamanho da fonte (mínimo de 1.4x para legibilidade de parágrafos).
- [ ] O contraste textual atende estritamente a WCAG 2.2 AA (mínimo 4.5:1 para texto normal e 3.0:1 para texto grande).

## 3. Cobertura Obrigatória dos 4 Estados de Interface
- [ ] **Default / Happy Path:** Estado ideal com todos os dados preenchidos corretamente.
- [ ] **Empty State:** Interface limpa sem dados, orientando proativamente a primeira ação do usuário.
- [ ] **Loading / Skeleton:** Feedback visual de carregamento evitando saltos de layout (*Cumulative Layout Shift*).
- [ ] **Error / Degraded:** Mensagem amigável de erro contextualizada com botão de recuperação ou retry.

## 4. Acessibilidade e Semântica de Interação
- [ ] Botões e áreas de clique possuem área mínima de toque de 44x44px em interfaces móveis e 32x32px em desktop.
- [ ] Elementos interativos possuem estado visível de `:focus-visible` e `:hover`.
- [ ] Ícones informativos possuem rótulo de texto ou `aria-label` equivalente.
