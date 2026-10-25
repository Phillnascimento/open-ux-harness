# Runbook de Cenário: Landing Page de Alta Conversão

> **Slug:** `landing-page`  
> **Modo de Operação:** `sprint` (Duração estimada: 1 semana)  
> **Perfil Recomendado:** `freelance` ou `enterprise`  
> **Classificação de Risco:** Médio (página pública de atração e aquisição de leads)

---

## 1. Visão Geral e Contexto de Negócio

Este runbook orienta a criação completa de uma landing page focada em conversão para produtos SaaS, serviços B2B ou captação de leads qualificados. O processo combina técnicas de narrativa persuasiva, wireflow orientado à escaneabilidade, fundações visuais sólidas e validação rigorosa de craft antes da entrega aos desenvolvedores.

### Objetivos do Cenário
1. Estruturar uma proposta de valor cristalina acima da dobra (above the fold) com CTA primário evidente.
2. Organizar a arquitetura de informação em blocos de leitura eficientes: Hero, Prova Social, Benefícios, Como Funciona, Depoimentos, FAQ e Footer.
3. Garantir excelente performance visual e conformidade a11y em viewports mobile (375px) e desktop (1440px).
4. Assegurar aprovação pelo **Reality Gate** e handoff limpo para frontend sem desvios de especificação.

---

## 2. Roster de Agentes e Momentos de Ativação

| Fase | Agentes / Skills | Momento de Ativação | Responsabilidade Principal |
| :--- | :--- | :--- | :--- |
| **Fase 1: Discovery & Narrative** | `01-briefing-discovery`<br>`02-information-architecture` | Dias 1 e 2 | Alinhamento da proposta de valor, dores do ICP, wireframe de blocos e fluxo de conversão |
| **Fase 2: Visual Foundation** | `03-design-tokens` | Dia 3 | Definição da escala tipográfica, cores de destaque da marca e tokens de espaçamento |
| **Fase 3: Quality & Reality Gate** | `05-craft-and-accessibility`<br>`08-reality-gate` | Dia 4 | Auditoria de acessibilidade, contraste de formulário/CTA e aprovação via Reality Gate |
| **Fase 4: Delivery & Handoff** | `06-zero-drift-handoff` | Dia 5 | Especificação técnica dos componentes responsivos, assets exportados e handoff frontend |

---

## 3. Passo a Passo de Execução

### Fase 1: Briefing de Conversão e Arquitetura de Conteúdo
1. Ativar `01-briefing-discovery`:
   - Mapear o Perfil de Cliente Ideal (ICP), principais dores e o benefício central do produto.
   - Definir meta de conversão primária (ex: preenchimento de formulário, agendamento de demo ou início de trial).
   - Analisar páginas de concorrentes diretos para identificar diferenciais competitivos.
2. Ativar `02-information-architecture`:
   - Estruturar a narrativa de seções com diagrama visual de blocos.
   - Desenhar o wireflow mermaid detalhando as interações do formulário e estados de sucesso (`submitted`, `error`, `loading`).

### Fase 2: Fundações Visuais e Design Tokens
1. Ativar `03-design-tokens`:
   - Configurar tokens de tipografia com hierarquia nítida (H1 de alto impacto, subtítulos legíveis e texto de apoio).
   - Definir cores de superfície, cor de ação primária com alto contraste e tokens de feedback para validação de campos.
   - Executar `npm run lint:tokens`.

### Fase 3: Craft Guardian e Reality Gate
1. Ativar `05-craft-and-accessibility`:
   - Conferir contraste de cores do botão principal de ação (CTA) contra o fundo do Hero section.
   - Auditar o formulário de captura: rótulos visíveis associados aos campos (`<label for="...">`), mensagens de validação e foco acessível por teclado.
   - Validar responsividade e touch targets em tela móvel (mínimo 44px).
2. Ativar `08-reality-gate`:
   - Conferir capturas em mobile e desktop nos estados padrão, formulário preenchido e feedback de envio.
   - Obter veredito **PASS** para autorizar o handoff final.

### Fase 4: Handoff Zero-Drift para Frontend
1. Ativar `06-zero-drift-handoff`:
   - Gerar documentação técnica com classes utilitárias ou CSS Modules correspondentes aos tokens.
   - Exportar ilustrações e ícones em SVG minificado.
   - Entregar especificações completas de breakpoints e regras de layout responsivo.

---

## 4. Entregáveis Esperados (Outputs)

- `briefing-narrative.md`: Alinhamento estratégico, personas e pilares de valor.
- `wireflow-structure.mermaid`: Estrutura de navegação e blocos da landing page.
- `landing-tokens.json`: Design tokens W3C DTCG aplicados à página.
- `a11y-audit-report.md`: Laudo de acessibilidade do formulário e contrastes.
- `reality-gate-verdict.json`: Certificado de aprovação do Reality Gate.
- `frontend-handoff-spec.md`: Pacote de especificações com guia de implementação frontend.
