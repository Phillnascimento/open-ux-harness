# Figma MCP & Auto Layout Engineering Guide (`04-figma-engineering`)

> **Propósito:** Playbook técnico de engenharia no Figma para agentes de IA operando no **Open UX Harness**. Define a arquitetura dual de comunicação com o Figma (`@figma/mcp-server` vs. `figma-console`), regras determinísticas de tradução entre CSS Flexbox/Grid e Figma Auto Layout, protocolos de segurança (*Savepoint Protocol*), controle de cota de API (*Variable Batching*) e filtragem de propriedades (*Server-Side Property Filtering*).

---

## 1. Arquitetura de Operação Dual: `@figma/mcp-server` vs. `figma-console`

Agentes de UX/UI atuam em dois modos complementares dependendo do perfil do projeto (`freelance` vs. `enterprise`) e da natureza da tarefa (inspeção/Code Connect vs. mutação em lote no canvas):

| Dimensão | `@figma/mcp-server` (Oficial Dev Mode MCP) | `figma-console` (WebSocket Desktop Bridge) |
| :--- | :--- | :--- |
| **Foco Primário** | Leitura semântica, extração de contexto de design e geração de Code Connect. | Escrita bidirecional no canvas, criação em lote de nós/variáveis e auditoria de biblioteca. |
| **Ferramentas Core** | `get_design_context`, `get_variable_defs`, `get_code_connect_map`, `<CodeConnectSnippet>`. | `create_auto_layout_frame`, `batch_upsert_variables`, `bind_node_variables`, `create_savepoint`. |
| **Perfil Ideal** | `freelance` (Lean) e `enterprise` (Inspeção para Handoff). | `enterprise` (Scale) e construção automatizada de Design Systems no Figma. |
| **Protocolo** | HTTP/SSE local conectado ao Figma Desktop Dev Mode. | WebSocket Bridge conectado ao plugin em execução no Figma Desktop. |

### 1.1. Uso de `@figma/mcp-server` (Dev Mode MCP)
- **`get_design_context`**: Extrai a estrutura hierárquica já limpa e pronta para tradução em código (sem ruído de vetores internos). Sempre passe o `nodeId` específico do frame ou componente (`123:456`), nunca o documento inteiro.
- **`get_variable_defs`**: Retorna a lista exata de variáveis (Design Tokens) consumidas no nó selecionado (`color/bg/surface`, `spacing/md`, `radius/sm`), permitindo pareamento 1:1 com `.harness/memory/tokens-state.json`.
- **`<CodeConnectSnippet>`**: Ao especificar componentes mestres, estruture o mapeamento declarativo `.figma.ts` / `.figma.tsx` vinculando `figma.enum()`, `figma.string()`, `figma.boolean()` e `figma.instance()` diretamente às props do componente no repositório.

### 1.2. Uso de `figma-console` (WebSocket Desktop Bridge)
- Utilizado quando o agente precisa **instanciar ou refatorar** componentes, variantes e coleções de variáveis diretamente no canvas do Figma.
- Toda operação de escrita deve ser precedida pelo **Savepoint Protocol** e executada em lotes atômicos (**Variable & Node Batching**).

---

## 2. Tradução Determinística: CSS Flexbox/Grid $\leftrightarrow$ Figma Auto Layout

É **proibido** posicionar elementos estruturais de interface com coordenadas absolutas (`layoutMode: "NONE"`). Todo container, seção, card, barra de navegação, formulário ou modal deve utilizar Auto Layout estrito:

### 2.1. Matriz de Equivalência Geométrica

| Conceito CSS / Layout | Propriedade na API do Figma | Valores Permitidos & Regra de Engenharia |
| :--- | :--- | :--- |
| `display: flex; flex-direction: row` | `layoutMode` | `"HORIZONTAL"` |
| `display: flex; flex-direction: column` | `layoutMode` | `"VERTICAL"` |
| `flex-wrap: wrap` | `layoutWrap` | `"WRAP"` (exige `layoutMode: "HORIZONTAL"`) |
| `width: 100%` / `flex: 1` | `layoutSizingHorizontal` | `"FILL"` (preenche o container pai responsivamente) |
| `width: fit-content` | `layoutSizingHorizontal` | `"HUG"` (abraça o conteúdo interno, ideal para botões/badges) |
| `width: 320px` (fixo) | `layoutSizingHorizontal` | `"FIXED"` (usar apenas em sidebars, avatares, ícones ou modais com `minWidth`/`maxWidth`) |
| `height: 100%` / `flex: 1` | `layoutSizingVertical` | `"FILL"` |
| `height: auto` / `fit-content` | `layoutSizingVertical` | `"HUG"` (padrão obrigatório para cards e containers de texto para suportar quebras de linha e i18n) |
| `gap: var(--space-md)` | `itemSpacing` | Vinculado a variável via `boundVariables.itemSpacing` (múltiplos de `4px` ou `8px`) |
| `row-gap` (quando `WRAP`) | `counterAxisSpacing` | Vinculado a variável via `boundVariables.counterAxisSpacing` |
| `padding` | `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft` | Todos os 4 lados vinculados a variáveis semânticas de espaçamento (`boundVariables.padding*`) |
| `justify-content` | `primaryAxisAlignItems` | `"MIN"` (`flex-start`), `"CENTER"`, `"MAX"` (`flex-end`), `"SPACE_BETWEEN"` |
| `align-items` | `counterAxisAlignItems` | `"MIN"`, `"CENTER"`, `"MAX"`, `"BASELINE"` |

### 2.2. Regras de Ouro de Auto Layout e Nomenclatura Semântica
1. **Proibição de Nomes Genéricos:** Nenhum nó na árvore pode se chamar `Frame 1`, `Group 42`, `Rectangle 12` ou `Vector 3`. Use nomenclatura semântica orientada a papéis de UI ou BEM/Component-First (`HeaderContainer`, `CardBody`, `ActionToolbar`, `InputFieldWrapper`).
2. **Proibição de `GROUP` para Layout:** Grupos clássicos (`type: "GROUP"`) não possuem box model, padding nem resposta a redimensionamento. Converta todo grupo estrutural em `FRAME` ou `COMPONENT` com `layoutMode: "HORIZONTAL" | "VERTICAL"`.
3. **Vínculo Obrigatório de Variáveis (`boundVariables`):** Cores (`fills`, `strokes`), espaçamentos (`itemSpacing`, `padding*`) e raios de borda (`topLeftRadius`, etc.) não devem conter valores hexadecimais ou pixels soltos sem referência em `boundVariables` apontando para os tokens definidos em `03-design-tokens`.
4. **Posicionamento Absoluto Excepcional:** Apenas badges flutuantes de notificação, botões de fechar em cantos de modal ou tooltips sobrepostos podem usar `layoutPositioning: "ABSOLUTE"`, sempre com `constraints` explícitas (`MIN`, `MAX`, `CENTER`).

---

## 3. Protocolos de Governança, Performance e Segurança

### 3.1. Savepoint Protocol (Ponto de Restauração Obrigatório)
Antes de executar qualquer mutação destrutiva, refatoração de Auto Layout em lote ou atualização de coleção de variáveis em uma biblioteca mestre:
1. Gere um checkpoint explícito registrando o `savepointId` (via histórico de versão da API REST/Console ou snapshot local em `.harness/memory/figma-savepoint-<timestamp>.json`).
2. Persista o `savepointId` dentro de `.harness/memory/figma-state.json`.
3. **Rollback Automático:** Se o script determinístico `scripts/validate-figma-spec.ts` ou a auditoria subsequente do `05-craft-and-accessibility` reprovar a mutação com erro crítico, restaure imediatamente o `savepointId` para evitar corrupção do arquivo de design.

### 3.2. Variable Batching (Prevenção de Rate Limit HTTP 429)
A API REST do Figma e o Desktop Bridge impõem limites estritos de taxa e payload por minuto:
- **NUNCA** crie ou atualize variáveis em loops unitários (`1 chamada por token`).
- **SEMPRE** agrupe todas as coleções, modos (`Light`, `Dark`, `HighContrast`), variáveis e aliases (`VARIABLE_ALIAS`) em um único payload transacional de lote (`POST /v1/files/:file_key/variables` ou `batch_upsert_variables`), respeitando lotes de no máximo **100 variáveis por transação**.

### 3.3. Server-Side Property Filtering (Proteção de KV-Cache e Janela de Contexto)
Árvores completas do Figma contêm milhares de linhas de coordenadas de curvas Bézier (`vectorPaths`, `fillGeometry`, `strokeGeometry`) que estouram a janela de contexto do LLM e degradam o raciocínio:
- Ao consultar a API ou MCP do Figma, **filtre estritamente** os campos solicitados usando parâmetros `depth` (ex.: `depth=2` ou `depth=3`), `geometry=none` e seleção explícita de propriedades:
  - Propriedades permitidas na inspeção estrutural: `id`, `name`, `type`, `layoutMode`, `layoutWrap`, `layoutSizingHorizontal`, `layoutSizingVertical`, `primaryAxisAlignItems`, `counterAxisAlignItems`, `itemSpacing`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, `fills`, `strokes`, `cornerRadius`, `boundVariables`, `componentPropertyDefinitions`, `children`.
- **NUNCA** solicite `vectorPaths` ou `fillGeometry` de ícones/ilustrações inteiras; trate ícones como instâncias atômicas (`INSTANCE`) referenciadas por nome semântico (`Icon/Check`, `Icon/AlertTriangle`).
