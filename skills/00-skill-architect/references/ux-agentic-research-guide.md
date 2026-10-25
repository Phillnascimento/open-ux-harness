# Guia de Pesquisa Web para Criação de Workflows Agênticos de UX

Este guia instrui o **Meta-Skill Architect (`00-skill-architect`)** sobre como conduzir a **Fase 1 (Pesquisa Web Obrigatória)** antes de desenhar ou refatorar qualquer Skill dentro do **Open UX Harness**.

> **REGRA DE OURO:** Nunca confie apenas no conhecimento estático pré-treinado do modelo. O ecossistema de Design Engineering, servidores MCP (Model Context Protocol), linters de código e metodologias de UX evolui continuamente. Toda nova skill deve nascer ancorada no estado da arte.

---

## 1. Os 4 Eixos de Investigação na Web

Ao receber um pedido para criar uma skill sobre o tema $X$ (ex: *"Criar skill de Teste de Usabilidade Sintético"*, *"Criar skill de Design Critique Visual"*, *"Criar skill de Auditoria de Microcopy"*), execute buscas (`search_web` e `read_url_content`) cobrindo os 4 eixos abaixo:

### Eixo 1: Metodologias & Frameworks Canônicos de UX
Busque os referenciais teóricos e práticos mais respeitados do mercado para garantir que o `<role>` e os `<execution_steps>` da skill tenham profundidade sênior:
* **Fontes de Alta Autoridade:** Nielsen Norman Group (NN/g), Baymard Institute, Laws of UX, Refactoring UI, W3C WAI (WCAG 2.2 / APCA), W3C Design Tokens Community Group (DTCG), Material Design 3, Apple Human Interface Guidelines (HIG).
* **Template de Query:**
  * `"<tema UX> framework best practices Nielsen Norman Group OR Baymard"`
  * `"<tema UX> evaluation checklist heuristics senior product designer"`

### Eixo 2: Workflows Agênticos & Engenharia de Prompt para Design
Investigue como equipes de ponta (Anthropic, OpenAI, Vercel, Figma, Linear, Stripe) estruturam agentes de IA para resolver esse problema específico:
* **O que procurar:** Padrões de decomposição de tarefas (*task decomposition*), critérios de avaliação determinísticos (*evals*), rubricas de pontuação (*grading rubrics*) e fluxos *Human-in-the-Loop*.
* **Template de Query:**
  * `"agentic workflow for <tema UX> design engineering LLM"`
  * `"AI agent skill <tema UX> system prompt rubric"`

### Eixo 3: Servidores MCP & Integrações de Ecossistema
Verifique se já existem servidores **Model Context Protocol (MCP)** abertos ou oficiais que podem fornecer contexto real para a skill (evitando que o designer precise copiar e colar dados manualmente):
* **Exemplos de MCPs no Ecossistema UX:**
  * `@figma/mcp-server` (Inspeção de variáveis, Auto Layout, Code Connect e árvore de nós)
  * `@storybook/mcp-server` (Catálogo de componentes React/Vue, props e estados)
  * `@posthog/mcp-server` (Funis, feature flags, gravações de sessão e métricas)
  * `@playwright/mcp` ou `@browserbase/mcp` (Inspeção visual do DOM renderizado, árvore de acessibilidade AOM e captura de screenshots)
* **Template de Query:**
  * `"MCP server <ferramenta ou tema> github model context protocol"`

### Eixo 4: Automação Determinística (*Code as Action* para `/scripts`)
Identifique quais partes do trabalho **não devem** ser feitas pelo LLM no "olhômetro", mas sim delegadas para um script determinístico em `/scripts/`:
* **Exemplos de Tarefas Determinísticas vs. Semânticas:**

| Domínio da Skill | O que o LLM faz (Raciocínio Semântico) | O que o `/scripts/` faz (Determinístico) |
| :--- | :--- | :--- |
| **Briefing & Discovery** | Entrevista Socrática, desafio de vieses, matriz RACI. | Validar se o JSON `framing-state.json` possui todos os 9 campos obrigatórios preenchidos. |
| **Design Tokens** | Escolher a personalidade cromática da marca e hierarquia tipográfica. | Calcular contraste WCAG AA/AAA ou APCA matematicamente e validar schema W3C DTCG (`lint-tokens.ts`). |
| **Craft & UI Polish** | Criticar equilíbrio visual, *gestalt*, clareza de microcopy e estética. | Escanear classes CSS/Tailwind em busca de hexadecimais hardcoded e ausência de estados `:focus-visible` (`craft-guardian-linter.ts`). |
| **Pesquisa & Síntese** | Agrupar citações de entrevistas em *Affinity Maps* e extrair *Jobs-to-be-Done*. | Anonimizar PII (CPF, e-mail, telefone) via Regex antes de processar transcrições e contabilizar frequência de tags. |

---

## 2. Como Sintetizar a Pesquisa antes de Entrevistar o Humano

Após realizar as buscas na web, apresente ao usuário um **Briefing de Pesquisa Agêntica** conciso (máximo de 10 a 15 linhas) contendo:
1. **Framework Metodológico Escolhido:** Quais práticas de mercado fundamentarão a skill.
2. **Divisão Cérebro vs. Músculo:** O que ficará nas instruções de raciocínio do `SKILL.md` e o que será automatizado em `/scripts/` ou apoiado por `/references/` e `/assets/`.
3. **Perguntas de Alinhamento (Máx. 3):** Questione o humano sobre as particularidades do fluxo dele (Freelancer vs. Enterprise, formato de entregável esperado e nível de autonomia desejado).
