# Catálogo Canônico de Padrões Anti-Slop para UX Writing (15 Padrões)

> **Fonte de Referência Normativa do Open UX Harness (`10-ux-humanizer`)**  
> Inspirado na taxonomia de combate a padrões sintéticos do Wikipedia AI Cleanup e adaptado para Engenharia de Interface e Product Design.

---

## Padrões de Alta Severidade (§1 a §5: Corrigir em qualquer ocorrência)

### §1. Metáforas Vazias em Hero e Cabeçalhos
* **Sintoma:** Modelos de IA tentam soar grandiosos com metáforas conceituais que não explicam o que o sistema realmente faz.
* **Exemplos de IA:**
  - *"Elevando a sinergia dos seus dados a uma nova dimensão."*
  - *"Um ecossistema holístico para empoderar suas decisões de amanhã."*
* **Correção Canônica:** Declarar o benefício prático e a função exata do módulo.
  - *"Painel central de faturamento e fluxo de caixa."*
  - *"Monitore a performance de vendas da sua equipe em tempo real."*

### §2. CTAs Prolixos, Poéticos ou Dramáticos
* **Sintoma:** Botões de ação carregados de emoção falsa e estruturas verbais longas (> 4 palavras).
* **Exemplos de IA:**
  - *"Comece sua jornada inesquecível agora"*
  - *"Desbloqueie todo o poder da inteligência"*
  - *"Dê o próximo salto rumo ao sucesso"*
* **Correção Canônica:** Verbo de ação no infinitivo ou imperativo direto (máximo de 3 palavras).
  - *"Criar conta gratuita"*
  - *"Exportar relatório"*
  - *"Iniciar teste"*

### §3. Empty States Condescendentes com Falsas Desculpas
* **Sintoma:** Telas vazias com desculpas emotivas, emojis forçados e explicações poéticas sobre a falta de dados.
* **Exemplos de IA:**
  - *"Que pena! Parece que este cantinho ainda está silencioso e solitário... Mas não se preocupe! 🚀"*
  - *"Nada por aqui ainda! Mas grandes histórias começam do zero."*
* **Correção Canônica:** Informar o estado atual de forma neutra e disponibilizar o botão para criação do primeiro item.
  - *"Nenhum projeto cadastrado."* + Botão: *"Novo projeto"*.

### §4. Mensagens de Erro Misteriosas ou Mágicas
* **Sintoma:** Erros que usam humor forçado (*"Oops!"*, *"Algo mágico deu errado"*) em momentos de frustração do usuário, omitindo causa e recuperação.
* **Exemplos de IA:**
  - *"Oops! Nossos duendes tropeçaram nos cabos. Tente novamente mais tarde."*
  - *"Algo deu errado nos bastidores. Não se preocupe, estamos cuidando disso!"*
* **Correção Canônica:** Indicar claramente o que falhou e o caminho de recuperação acionável.
  - *"Não foi possível salvar as alterações. Verifique sua conexão com a internet e tente novamente."*

### §5. O Contraste Falso "Não é X, é Y" (*Not X, but Y*)
* **Sintoma:** Construção retórica que nega algo que ninguém afirmou para fazer o produto parecer revolucionário.
* **Exemplos de IA:**
  - *"Não é apenas uma planilha; é o centro nevrálgico da sua produtividade."*
  - *"Isto não significa complexidade. Significa controle absoluto."*
* **Correção Canônica:** Afirmar o recurso diretamente.
  - *"Planilha integrada com sincronização automática de faturas."*

---

## Padrões de Média Severidade (§6 a §10: Ritmo e Concisão)

### §6. Tríades Forçadas de Benefícios
* **Sintoma:** Forçar listas de 3 adjetivos ou substantivos paralelos por puro hábito estatístico do modelo.
* **Exemplos de IA:**
  - *"Rápido, seguro e intuitivo."*
  - *"Inovação, inspiração e insights."*
* **Correção Canônica:** Destacar o diferencial concreto ou métrica mensurável.
  - *"Carregamento em menos de 100ms e criptografia de ponta a ponta."*

### §7. Ensaio Prévio e Preâmbulos (*Staged Run-ups*)
* **Sintoma:** Frases de aquecimento antes de entrar no ponto técnico em modais de onboarding e tooltips.
* **Exemplos de IA:**
  - *"Vamos mergulhar no assunto! Para começar a configurar seu perfil..."*
  - *"Honestamente? É mais simples do que parece. Veja o passo a passo:"*
* **Correção Canônica:** Iniciar diretamente na instrução operativa.
  - *"1. Selecione o seu espaço de trabalho."*

### §8. Travessões em Excesso como Conector Universal
* **Sintoma:** Conectar todas as frases secundárias com travessões duplos em vez de pontos ou vírgulas.
* **Exemplos de IA:**
  - *"Nossa plataforma — construída para times modernos — integra faturas — e relatórios — em um clique."*
* **Correção Canônica:** Separar em sentenças curtas e independentes.
  - *"Nossa plataforma integra faturas e relatórios em um clique. Feita para equipes ágeis."*

### §9. Hype Corporativo e Jargões de IA (*Buzzwords*)
* **Sintoma:** Uso recorrente de palavras vício de IA: *desvende*, *mergulhe*, *crucial*, *testamento*, *paradigma*, *divisor de águas*, *transformacional*.
* **Correção Canônica:** Substituir por vocabulário funcional, específico e sem rodeios.

### §10. Voz Passiva Desnecessária em Mensagens de Sucesso
* **Sintoma:** Ocultar o sujeito e gerar sentenças burocráticas e frias.
* **Exemplos de IA:**
  - *"A atualização das configurações foi concluída com sucesso pelo sistema."*
* **Correção Canônica:** Voz ativa e foco no objeto do usuário.
  - *"Configurações salvas."*

---

## Padrões de Polimento e Higiene (§11 a §15)

### §11. Tooltips e Textos de Ajuda Redundantes
* **Sintoma:** O tooltip apenas repete o label do botão sem acrescentar contexto.
* **Exemplo:** Botão *"Excluir"* com tooltip *"Clique aqui para excluir o item"*.
* **Correção Canônica:** Omitir o tooltip ou informar a consequência real (*"A exclusão não poderá ser desfeita"*).

### §12. Fechamentos Dramáticos em Cartões (*One-Line Closers*)
* **Sintoma:** Frase conclusiva dramática ao final de cada card ou sessão (*"Pense nisso."*, *"E essa é a verdadeira vitória."*).
* **Correção Canônica:** Encerrar o card no último fato útil ou dado métrico.

### §13. Emojis Excessivos em Interfaces B2B
* **Sintoma:** Decorar cada título e botão com emojis desnecessários (*"🚀 Iniciar", "💡 Dica", "✨ Mágico"*).
* **Correção Canônica:** Utilizar ícones SVG padronizados do Design System ou apenas o label textual.

### §14. Re-explicação Óbvia em Labels de Formulário
* **Sintoma:** Helper text que apenas parafraseia o label óbvio.
* **Exemplo:** Label *"Senha"* com helper text *"Digite sua senha no campo acima"*.
* **Correção Canônica:** Usar o helper text apenas para requisitos reais de validação (*"Mínimo de 8 caracteres e 1 número"*).

### §15. Resíduo de Chatbot em Telas de Produto
* **Sintoma:** Textos conversacionais vazados no código de tela (*"Com certeza! Aqui está a tabela que você pediu:"*).
* **Correção Canônica:** Remover todo o wrapper conversacional; manter apenas os nós de UI.
