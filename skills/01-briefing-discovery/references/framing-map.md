# Guia de Referência: O Mapa de Framing de UX (9 Dimensões Vitais + COI & Opportunity Solution Tree)

O **Mapa de Framing** é o instrumento diagnóstico utilizado pelo *UX Strategic Framer Pro* para mapear as 9 dimensões vitais de qualquer iniciativa antes de desenhar telas ou escrever código, integrando a quantificação do **Cost of Inaction (COI)** e a **Opportunity Solution Tree (Teresa Torres)**.

---

## As 9 Dimensões e Banco de Perguntas Investigativas

### 1. Visão Geral e Metas de Negócio
- **O que investigar:** Qual é o gatilho estratégico que motivou essa iniciativa agora? Qual objetivo corporativo (OKR) ela suporta diretamente?
- **Perguntas Investigativas:**
  - *"O que motivou a empresa a priorizar esse projeto neste exato trimestre e qual meta corporativa ele alavanca?"*
  - *"Se esse projeto for um sucesso estrondoso para o negócio nos próximos 6 meses, o que mudou nos números da empresa?"*

### 2. Definição do Problema (Causa Raiz vs. Sintomas) & Quantificação do Custo da Inação (COI)
- **O que investigar:** O cliente está trazendo um sintoma superficial ou uma causa raiz? Qual o prejuízo contínuo de não resolver?
- **Fórmula de Quantificação do Cost of Inaction (COI):**
  $$\text{COI Mensal} = (\text{Volume de Usuários Afetados} \times \text{Taxa de Abandono/Erro} \times \text{Ticket Médio ou LTV}) + (\text{Chamados de Suporte} \times \text{Custo por Ticket})$$
- **Perguntas Investigativas:**
  - *"Como vocês sabem que esse é o problema real e não apenas o sintoma de uma fricção anterior no fluxo?"*
  - *"Qual é o custo financeiro, operacional ou de reputação para a empresa se nada for feito em relação a isso nos próximos 90 dias?"*

### 3. Perfil do Usuário e Dores Reais
- **O que investigar:** Quem é o usuário de fato (contexto de uso, dispositivos, nível de maturidade digital)? O problema afeta todos os usuários ou um nicho específico?
- **Perguntas Investigativas:**
  - *"Quem é a pessoa que mais sofre com esse atrito hoje e em qual momento exato do dia/rotina ela se depara com ele?"*
  - *"Temos evidências de feedback direto de usuários reais (tickets de suporte, gravações de tela ou entrevistas) sobre essa dor?"*

### 4. Métricas de Sucesso (Business KPIs & UX Metrics)
- **O que investigar:** Como a equipe medirá que a solução funcionou? Há métricas de negócio (conversão, receita) e métricas de UX (tempo de conclusão, satisfação, taxa de erro)?
- **Perguntas Investigativas:**
  - *"Qual é a métrica numérica principal (KPI) que dirá se a solução teve êxito após o deploy?"*
  - *"Além da conversão de negócio, qual métrica comportamental de UX (ex: tempo de tarefa, taxa de erro) queremos otimizar?"*

### 5. Escopo e Restrições
- **O que investigar:** O que está inegociavelmente fora do escopo (para evitar *scope creep*)? Quais restrições de tecnologia (APIs, legado, bibliotecas) e prazos condicionam a solução?
- **Perguntas Investigativas:**
  - *"O que nós expressamente NÃO vamos tentar resolver ou incluir nesta versão para garantir o prazo?"*
  - *"Quais são as restrições técnicas da equipe de desenvolvimento (ex: integrações de terceiros, bibliotecas legadas, prazos de entrega)?"*

### 6. Mapeamento de Stakeholders (Matriz RACI)
- **O que investigar:** Quem tem o poder final de aprovação (evitar vetos surpresa na entrega)? Quem precisa opinar tecnicamente antes de desenhar?
- **Perguntas Investigativas:**
  - *"Quem é a pessoa (ou cargo) que tem o poder final de aprovação e veto sobre a solução antes de ir para produção?"*
  - *"Quem da equipe técnica (Tech Lead / Engenharia) e de operações precisa ser consultado para validar viabilidade antes do handoff?"*

### 7. Nível de Certeza vs. Suposições (Hipóteses)
- **O que investigar:** O que a equipe sabe com dados analíticos comprovados vs. o que é "achismo" ou hipótese não testada?
- **Perguntas Investigativas:**
  - *"Dentre as certezas apresentadas pela equipe, quais foram validadas com dados concretos e quais ainda são suposições?"*
  - *"Qual é o maior risco de estarmos errados sobre o comportamento do usuário nesse fluxo?"*

### 8. Entregáveis Finais do Projeto
- **O que investigar:** O que a equipe de engenharia e stakeholders espera receber ao final do processo (fluxogramas, tokens, protótipos de alta fidelidade, documentação de handoff)?
- **Perguntas Investigativas:**
  - *"Quais são os artefatos exatos esperados ao final do projeto (ex: wireflows lógicos, protótipo navegável no Figma, tokens DTCG ou especificações de código)?"*

### 9. Fundações Visuais, Brand Identity & Craft Existente (Crítico para Freelancers)
- **O que investigar:** O cliente já possui identidade visual, site no ar ou padrões consolidados? Quais cores, tipografia, tom de voz e regras de componentes precisam ser respeitados para não criar um "Frankenstein visual"?
- **Perguntas Investigativas:**
  - *"O cliente já possui um site no ar, manual de marca ou paleta definida? Quais são as cores primárias (hex) e fontes que devemos honrar?"*
  - *"Qual é o tom de voz da marca (formal, acolhedor, técnico, descontraído) e existem termos proibidos no copy?"*
  - *"Quais convenções de craft já existem no sistema atual (ex.: botões com cantos muito arredondados ou retos, biblioteca de ícones específica, estilo de sombras) para manter a harmonia do produto?"*

---

## 🌳 Integração com a Opportunity Solution Tree (Teresa Torres)

Para evitar que o Briefing se torne apenas uma "lista de desejos de funcionalidades" (*Feature Factory*), o **UX Strategic Framer Pro** conecta as Dimensões 1, 2, 3, 4 e 7 em uma **Opportunity Solution Tree (OST)**:

1. **Desired Outcome (Dimensões 1 e 4):** A métrica de negócio ou comportamento de produto que precisa ser movida.
2. **Opportunities (Dimensões 2 e 3):** As dores, necessidades e fricções reais dos usuários que impedem o *Desired Outcome* hoje.
3. **Solutions (Dimensão 6):** As hipóteses de funcionalidades ou fluxos candidatos para resolver cada oportunidade.
4. **Assumption Tests (Dimensão 7):** Os testes rápidos de descoberta para validar suposições de alto risco ($\text{Risco} \ge 15$) antes de construir.
