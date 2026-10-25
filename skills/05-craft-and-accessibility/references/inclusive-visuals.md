# Diretrizes de Visuais Inclusivos e Imagens Éticas (`inclusive-visuals.md`)

> **Propósito:** Guia normativo do **Craft Guardian** para garantir representatividade autêntica em ativos visuais, mitigar vieses algorítmicos em imagens geradas por modelos de inteligência artificial e certificar a acessibilidade cromática contra discromatopsias (daltonismo).

---

## Quando Carregar (Just-In-Time)

Carregue este documento sob demanda (**estritamente 1 arquivo por vez**) nas seguintes situações:
- **Na Fase 1 (Extração e Análise de Contexto Visual):** Quando a especificação da tela ou fluxo incluir avatares de personas, ilustrações editoriais, fotografias de equipe/clientes ou geração de prompts visuais por IA.
- **Na Fase 2 (Auditoria de Craft e Acessibilidade):** Ao validar gráficos de dados, mapas de calor, badges de status, infográficos ou ilustrações complexas contra critérios de contraste e daltonismo (WCAG 1.4.1).
- **Não carregar:** Em fluxos com componentes unicamente textuais ou auditorias puramente orientadas a regras de espaçamento e tipografia tabular.

---

## 1. Princípios de Representatividade Autêntica (Anti-Tokenismo)

Interfaces visuais educam e moldam a percepção de pertencimento dos usuários. A inclusão visual deve ser tratada como requisito de craft, não como verniz decorativo.

### 1.1. Agência e Não Passividade
- Indivíduos de grupos historicamente sub-representados devem ser retratados em papéis de liderança técnica, tomada de decisão e protagonismo ativo, e não em posições meramente passivas, assistenciais ou subordinadas.
- Evite composições artificiais que agreguem caricaturas de diversidade em uma única imagem apenas para preencher cotas visuais ("tokenismo"). Prefira representações realistas e contextualizadas ao ecossistema do produto.

### 1.2. Vetores de Diversidade Genuína
- **Idade:** Equilibrar representações entre jovens adultos, profissionais seniores e idosos ativos, combatendo o etarismo em produtos corporativos e digitais.
- **Corpos e Habilidades:** Incluir pessoas com deficiências aparentes (usuários de cadeira de rodas ergonômica, aparelhos auditivos, próteses biomecânicas) e não aparentes, retratadas interagindo naturalmente com o ambiente de trabalho ou lazer.
- **Expressão Étnico-Racial e de Gênero:** Representar ampla variedade de tonalidades de pele, tipos capilares, vestimentas profissionais plurais e identidades de gênero de modo respeitoso e digno.

---

## 2. Mitigação de Viés Algorítmico em Imagens Geradas por IA

Modelos de difusão latente e geradores generativos de imagem refletem e amplificam assimetrias presentes em seus dados de treinamento na internet.

### 2.1. Padrões Viciosos de IA (*Synthetic Slop*)
- **Homogeneização Estética ("Rosto de IA"):** Modelos tendem a convergir para fisionomias simétricas hiper-padronizadas, peles acetinadas sem poros e expressões vazias. Rejeite ativos visuais que transmitam artificialidade plástica.
- **Estereotipação Ocupacional:** Prompts como *"médico"*, *"engenheiro de software"* ou *"CEO"* frequentemente geram homens brancos por padrão, enquanto prompts de atendimento ou suporte geram mulheres racializadas.
- **Eurocentrismo Arquitetônico e Cultural:** Paisagens de fundo e escritórios tendem a adotar estética genérica norte-americana ou europeia ocidental.

### 2.2. Protocolo de Engenharia de Prompts Éticos
Ao solicitar ou revisar prompts de imagem para documentação ou interfaces:
1. **Especificação Demográfica Intencional:** Defina explicitamente etnia, faixa etária e gênero de forma alternada ao longo do projeto.
2. **Direcionamento de Naturalidade:** Inclua modificadores de textura realista, como *"candid documentary photography"*, *"natural skin texture with subtle imperfections"*, *"authentic office environment in Latin America"*.
3. **Neutralidade de Papel:** Desacople gênero e raça de funções subalternas, prescrevendo prompts como *"latina principal software architect leading a design systems review"*.

---

## 3. Acessibilidade Visual para Discromatopsias (Daltonismo)

Cerca de 8% dos homens e 0,5% das mulheres vivenciam alguma forma de deficiência na visão de cores (CVD - Color Vision Deficiency). A interface nunca deve confiar unicamente na matiz de cor para sinalizar status ou diferenciar conjuntos de dados.

### 3.1. Variantes de Discromatopsia
| Tipo | Mecanismo Fisiológico | Impacto Perceptual na Interface | Cores Críticas em Conflito |
| :--- | :--- | :--- | :--- |
| **Protanopia / Protanomalia** | Ausência ou mutação dos cones L (vermelho). | Vermelho perde luminância aparente (parece cinza escuro ou marrom escuro). | Vermelho vs. Verde; Vermelho vs. Preto; Azul vs. Roxo. |
| **Deuteranopia / Deuteranomalia** | Ausência ou mutação dos cones M (verde). Forma mais comum (~6% população masculina). | Verdes e vermelhos desbotam para tons de ocre amarelado ou cinza. | Verde vs. Vermelho; Verde vs. Marrom; Ciano vs. Cinza. |
| **Tritanopia / Tritanomalia** | Ausência ou anomalia dos cones S (azul). Condição rara. | Dificuldade em distinguir tons de azul de amarelo e violeta de vermelho. | Azul vs. Verde; Amarelo vs. Rosa/Cinza; Roxo vs. Marrom. |
| **Monocromatismo / Acromatopsia** | Ausência de pigmentos cônicos funcionais. | Percepção visual exclusivamente por luminância (escala de cinza pura). | Qualquer contraste que dependa unicamente de croma/matiz. |

### 3.2. Regra de Codificação Dupla Inegociável (WCAG 1.4.1)
Toda comunicação visual de estado crítico deve aplicar no mínimo dois canais sensoriais simultâneos:
1. **Cor + Ícone Semântico Explícito:**
   - Sucesso: Verde (`#15803D`) + Ícone de Checkmark (`✓`).
   - Erro: Vermelho (`#DC2626`) + Ícone de Cruz (`✕`) ou Octógono de Parada.
   - Alerta: Âmbar (`#D97706`) + Ícone de Triângulo de Exclamação (`⚠`).
   - Informativo: Azul (`#2563EB`) + Ícone de Informação (`ℹ`).
2. **Gráficos e Visualização de Dados:**
   - Nunca diferencie linhas de gráficos apenas pela cor: aplique estilos de linha distintos (contínua, tracejada, pontilhada, traço-ponto).
   - Em gráficos de barras ou pizza, combine cores com texturas ou padrões de hachura e inclua rótulos de valores diretamente sobre os segmentos (*direct labeling*), eliminando a necessidade de decodificação por legendas externas distantes.
3. **Contraste de Luminância Adjacente:** Em gráficos onde duas categorias estão justapostas, garanta razão de luminância $\ge 3.0:1$ entre elas ou aplique uma borda neutra de separação de $1\text{px}$ com cor de alto contraste (`#FFFFFF` em tema claro ou `#0F172A` em tema escuro).
