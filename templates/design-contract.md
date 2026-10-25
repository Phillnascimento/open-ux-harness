# Design Contract — [Nome do Produto / Fluxo]

> Contrato de Design contra visual slop e soluções genéricas de IA.
> Estabelece o contexto do usuário, as referências de mercado, escolhas deliberadas de craft e anti-patterns terminantemente proibidos antes da fase de alta fidelidade e handoff.

---

## 1. Usuário e Job Principal
- **Usuário-Alvo:** [Perfil específico de usuário, ex.: Analista de Operações Financeiras em empresas B2B].
- **Contexto de Uso:** [Ambiente e circunstâncias, ex.: Desktop com 2 monitores durante fechamento contábil sob pressão de tempo].
- **Job Principal (JTBD):** *"Quando [situação/gatilho], eu preciso [motivação/ação chave], para que eu possa [resultado esperado sem atrito]."*
- **Critério de Sucesso do Usuário:** [Definição mensurável de tarefa concluída com êxito].

---

## 2. Fluxo de Maior Frequência
- **Nome do Fluxo:** [Ex.: Conciliação de Faturas e Aprovação de Lote].
- **Ponto de Entrada (Entrypoint):** [Ex.: Dashboard Operacional -> Card de Alertas de Divergência].
- **Passos Essenciais:**
  1. Identificação visual da pendência com filtros contextuais pré-aplicados.
  2. Comparação lado a lado dos dados de entrada vs. registro de conciliação.
  3. Ação primária em lote ou edição inline de divergência.
  4. Confirmação imediata com feedback não bloqueante (toast com desfazer).
- **Tempo Alvo de Conclusão:** [Ex.: Menos de 45 segundos por lote de 10 itens].

---

## 3. Objetos do Domínio
Entidades centrais manipuladas pelo usuário neste produto/fluxo:
- **[Objeto 1 - Ex.: Fatura]:** Atributos chave (ID, Fornecedor, Valor Total, Data de Vencimento, Status de Conciliação, Anexos). Estados: Pendente, Em Análise, Aprovada, Rejeitada, Conciliada.
- **[Objeto 2 - Ex.: Regra de Conciliação]:** Atributos chave (Nome da Regra, Critério de Match, Tolerância de Valor, Aprovador Automático). Estados: Ativa, Inativa, Em Teste.
- **[Objeto 3 - Ex.: Lote de Divergência]:** Atributos chave (Código do Lote, Quantidade de Itens, Valor Divergente, Histórico de Auditoria). Estados: Aberto, Parcialmente Resolvido, Concluído.

---

## 4. Referências de Mercado
Referências reais de produtos de mercado para orientar decisões de arquitetura e craft (mínimo 3 referências):
1. **Stripe Dashboard:**
   - *O que adotar:* Clareza cirúrgica na hierarquia tipográfica de tabelas densas, filtros compostos em popover direto e badges de status sem ruído visual.
   - *O que evitar:* Espaçamento excessivamente generoso quando o usuário opera em modo de conciliação massiva.
2. **Linear:**
   - *O que adotar:* Modelo de interação ágil guiado por atalhos de teclado (command menu `Cmd+K`), transições instantâneas de estado e ausência de modais bloqueantes desnecessários.
   - *O que evitar:* Curva de aprendizado íngreme para usuários não-técnicos sem suporte a menus convencionais.
3. **GitHub Pull Requests & Settings:**
   - *O que adotar:* Diferenciação clara de dados em visualizações comparativas (*diff split-view*), histórico linear de auditoria e confirmações de ações destrutivas em duas etapas.
   - *O que evitar:* Densidade crua sem ritmo visual em telas de onboarding ou boas-vindas.
4. **Vercel Dashboard:**
   - *O que adotar:* Microinterações funcionais, monocromia elegante com cores reservadas estritamente para semântica de status e navegação persistente em abas.
   - *O que evitar:* Redução excessiva de contraste em textos secundários abaixo do padrão WCAG 2.2 AA.

---

## 5. Escolhas Deliberadas de Design

### Densidade de Informação
- **Modo Adotado:** Alta densidade estruturada (grid de 8pt com células de tabela de 36px/40px).
- **Racional:** O operador precisa visualizar no mínimo 15 linhas de conciliação sem rolagem vertical desnecessária. Espaços em branco decorativos não agregam valor e retardam a leitura.

### Tipografia
- **Família Tipográfica:** `Inter` (Display e UI) com suporte a numerais tabulares (`font-feature-settings: "tnum"`).
- **Escala de Tipos:** Proporção Major Third (1.250). Texto base em 14px com line-height de 20px (1.42x) para leitura técnica precisa; cabeçalhos concisos sem escala gigantista.

### Ritmo de Layout
- **Cadência Estrutural:** Alinhamento horizontal estrito na linha de base de 8px; separadores de linha de 1px em cinza neutro (`rgba(0, 0, 0, 0.08)` / dark mode `rgba(255, 255, 255, 0.1)`).
- **Agrupamento:** Gestalt por proximidade e contenção sutil de borda, sem sombras difusas desnecessárias.

### Modelo de Interação
- **Atalhos e Foco:** Suporte completo a navegação por teclado (`Tab`, `Shift+Tab`, `J/K` para seleção em lista, `Enter` para inspecionar, `Escape` para fechar gavetas).
- **Modais vs. Painéis:** Preferência por painéis laterais deslizantes (Drawers/Sheets) para edição detalhada, mantendo o contexto da lista principal visível.

### Tratamento de Dados e Imagens
- **Visualização de Dados:** Foco estrito em métricas acionáveis (gráficos de linha limpos e indicadores de tendência sem preenchimento gradiente).
- **Imagens e Ilustrações:** Proibição de ilustrações genéricas corporativas em 3D ou vetor decorativo. Ícones SVG semânticos mono-linha (Lucide / Feather) em 16px ou 20px.

### Prioridades Responsivas
- **Viewport Primário:** Desktop 1440x900px e 1920x1080px (foco de 80% do tempo de uso).
- **Comportamento em Telas Menores (Tablet / Laptop 13"):** Ocultamento gracioso de colunas secundárias com priorização das colunas Identificador, Valor, Status e Ação Primária.

---

## 6. Padrões Genéricos Proibidos
Anti-patterns terminantemente proibidos na concepção de telas deste produto:
- Gradientes decorativos arbitrários sem propósito semântico ou funcional
- Dashboards com métricas vazias sem workflow claro ou ação recomendada
- Cards sem hierarquia visual e com sombras difusas exageradas
- Empty states genéricos com ilustrações tridimensionais sem atalho direto para ação
- Modais bloqueantes para confirmações triviais reversíveis
- Gráficos de pizza ou rosca multicoloridos para dados contínuos ou temporais
- Botões primários com cores discordantes do design token semântico aprovado
