# Matriz de Comparação: Modelos de Fronteira & Super-Padrão Agnóstico (`agentskills.io`)

Este documento consolida as diretrizes oficiais dos **4 Principais Fornecedores de Modelos de Fronteira** (**Anthropic Claude**, **OpenAI GPT/Codex**, **Google Gemini/ADK/Antigravity** e **xAI Grok**) com a especificação aberta **`agentskills.io`**.

Toda Skill criada ou refatorada no **Open UX Harness** deve obedecer ao **Super-Padrão Agnóstico**, que unifica o melhor de cada arquitetura para garantir máxima aderência, economia de tokens (KV-Cache) e execução determinística em qualquer IDE ou CLI.

---

## 1. Matriz Comparativa dos Fornecedores de Fronteira (2025/2026)

| Dimensão Arquitetural | Especificação `agentskills.io` (Base) | Anthropic (Claude 4.x / Claude Code) | OpenAI (GPT-5 / Codex / Agents SDK) | Google (Gemini 2.5 / ADK / Antigravity) | xAI (Grok 3 / Grok 4 Agent API) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Padrão de Descoberta** | Padrão aberto adotado por >25 plataformas (`SKILL.md`). | Criadora original do padrão `SKILL.md` + `.claude/skills/`. | Adotou `SKILL.md` nativamente no Codex CLI + `AGENTS.md` global. | Suporte nativo no **ADK** (`SkillToolset`) e Antigravity (`.agent/skills/`). | Compatível via MCP (`mcp-skillset`) e Function Calling estrito. |
| **2. Metadados & Roteamento (YAML)** | `name` ($\le 64$ chars, igual à pasta) + `description` ($\le 1024$ chars) + `compatibility` + `allowed-tools`. | Suporta `allowed-tools`, `context: fork` (subagente isolado) e injeção dinâmica `` !`cmd` ``. | Gatilhos léxicos explícitos + **Fronteira Negativa** ("Quando NÃO usar") para evitar falsos positivos. | `description` atua como *Semantic Router* no ADK. Exige escopo claro de entrada/saída. | Roteamento fortemente guiado por *Tool Definitions* com JSON Schema estrito. |
| **3. Estrutura de Diretórios** | `SKILL.md`, `scripts/`, `references/`, `assets/`. | `SKILL.md` (< 500 linhas) + arquivos de suporte a **1 nível de profundidade** em `references/`. | `SKILL.md`, `scripts/`, `references/`, `assets/` + `agents/openai.yaml`. | `SKILL.md`, `references/`, `assets/`, `scripts/` carregados por tools (`load_skill_resource`). | Foco em *Server-side Tools* e *Code Execution* via sandbox. |
| **4. Orçamento de Tokens & *Progressive Disclosure*** | Nível 1 (~100 tokens)<br>Nível 2 (< 5000 tokens)<br>Nível 3 (Sob demanda). | Limite rígido de **500 linhas** no `SKILL.md`. Arquivos extras lidos 1 por vez para preservar o KV-Cache. | Carregamento preguiçoso (*lazy loading*) estrito. Proíbe carregar múltiplos guias sem necessidade. | 3 níveis no ADK: `list_skills` (L1) $\rightarrow$ `load_skill` (L2) $\rightarrow$ `load_skill_resource` (L3). | Janela de 1M–2M tokens, porém sofre degradação se instruções não tiverem âncoras estruturais. |
| **5. Formatação do Prompt (Anti-*Lost in the Middle*)** | Tags XML (`<role>`, `<context>`, `<execution_steps>`, `<constraints>`, `<output_schema>`). | **Nativo em XML.** Claude possui *fine-tuning* específico para respeitar fronteiras de tags XML. | Prefere **Markdown Hierárquico (`#`, `##`)** combinado com blocos delimitadores XML para isolamento de dados. | Recomenda combinar **Tags XML** ou **Markdown** com **Exemplos *Few-Shot*** (`<examples>`). | Recomenda **XML/Markdown** + **ALL-CAPS** (`IF... THEN... NEVER...`) para regras lógicas críticas. |
| **6. Execução Determinística (*Code as Action*)** | Scripts em `/scripts` retornando JSON estruturado (`status`, `confidence_score`, `validation_errors`). | Prefere que a IA execute scripts prontos (`validate.py` / `.ts`) em vez de gerar código repetitivo na hora. | Forte ênfase em **Paralelismo de Tools** (*Batching*) e delegação de validações para scripts CLI. | Separação estrita entre **Skill** (conhecimento estático) e **Tool** (código determinístico). | Uso nativo de *Code Interpreter* para cálculos, *parsing* e validação de schemas. |
| **7. Tratamento de Erros & *Bounded Retries*** | Máximo de **3 tentativas** antes de escalar para o humano (`SCHEMA_MISMATCH`). | Uso de *Hooks* (`PreToolUse` / `PostToolUse`) para bloquear ações destrutivas antes de ocorrerem. | Guardrails de entrada/saída (*Tripwires*) que interrompem a execução imediatamente ao detectar violação. | *Callbacks* de validação no ADK + exigência de retorno estruturado de erro para auto-correção. | *Strict Structured Outputs* (garantia ao nível de decodificação de tokens do JSON Schema). |

---

## 2. Os 7 Pilares do Super-Padrão Agnóstico (Open UX Harness)

Para que uma Skill funcione com perfeição tanto no **Claude** quanto no **GPT**, **Gemini** e **Grok**, o `00-skill-architect` impõe as seguintes regras de engenharia:

### Pilar 1: Topologia Física Padronizada
```text
skills/<id-da-skill>/
├── SKILL.md                  # Orquestrador (< 500 linhas, < 5.000 tokens)
├── scripts/                  # [Opcional] Scripts determinísticos (Code as Action)
├── references/               # [Opcional] Documentação profunda (máx. 1 nível de subpasta)
└── assets/                   # [Opcional] Templates Markdown e JSON Schemas de contrato
```
* **Regra de Nomenclatura (`agentskills.io`):** O campo `name:` no YAML Frontmatter **DEVE ser idêntico ao nome da pasta da skill** (ex: `01-briefing-discovery`), contendo apenas letras minúsculas, números e hífens (`^[a-z0-9-]+$`), sem hífens consecutivos (`--`), com no máximo 64 caracteres.

### Pilar 2: YAML Frontmatter de 3 Dimensões
A `description` (máximo de 1024 caracteres) é o único texto lido pelos modelos no **Nível 1 (Roteamento)**. Ela deve conter obrigatoriamente:
1. **Capacidade Central:** O que a skill faz e entrega.
2. **Gatilhos Positivos (Inclusão):** Frases exatas ou intenções do usuário (`Use quando o usuário pedir...`).
3. **Fronteira Negativa (Exclusão):** Palavra explícita `NUNCA` ou `NEVER` definindo o que a skill não deve fazer e para qual skill vizinha delegar (`NUNCA use para...`).

### Pilar 3: Anatomia Híbrida XML + Markdown (Ordem Estrita)
Para neutralizar o fenômeno *Lost in the Middle*, o corpo do `SKILL.md` deve conter exatamente estas **7 tags XML de nível raiz**, nesta ordem:
1. `<role>` (Ancoragem de Primazia: Persona Sênior e postura científica)
2. `<context>` (Descoberta de ambiente + Injeção Dinâmica `` !`cat ...` `` com fallback de leitura)
3. `<reference_index>` (Índice de *Progressive Disclosure* — regra estrita de ler 1 arquivo por vez)
4. `<execution_steps>` (Fluxo de trabalho numerado em Markdown + instrução de *Parallel Tool Batching*)
5. `<examples>` (1 a 2 pares curtos de `<user_input>` e `<ideal_agent_response>` — exigência do Google Gemini)
6. `<constraints>` (Regras em **ALL-CAPS** `IF... THEN... NEVER...` para Grok + *Bounded Retries* máx. 3 tentativas com `SCHEMA_MISMATCH`)
7. `<output_schema>` (Ancoragem de Recência: Contrato JSON de Handoff + *Next-Step Router* com Caminhos A e B)

### Pilar 4: Separação Semântico vs. Determinístico (*Code as Action*)
* **Raciocínio Semântico (LLM):** Entrevistas com stakeholders, crítica de UX, síntese de dores, arquitetura de informação, avaliação subjetiva de *craft*.
* **Ação Determinística (`/scripts`):** Cálculo de contraste WCAG, validação de sintaxe W3C Design Tokens, auditoria de espaçamento no código, validação de schema JSON. Sempre que uma tarefa for matemática ou estrutural, crie um script em `/scripts/` que retorne JSON (`status`, `confidence_score`, `validation_errors`).

### Pilar 5: Dualidade de Contexto (Freelancer vs. Enterprise)
Toda skill do Open UX Harness deve se adaptar automaticamente ao `preset` ativo em `harness.config.json`:
* **Modo Freelancer / Agência (`freelance`):** Foco em agilidade (Modo Lean), coleta ou criação rápida de identidade visual (*Brand & Craft Kit*), escopo fechado anti-*scope creep* e aprovação direta com fundador/cliente.
* **Modo Enterprise / Squad (`enterprise`):** Foco em governança RACI, conformidade com Design Systems existentes, matrizes de trade-off, telemetria em escala e integração com ritos ágeis.
