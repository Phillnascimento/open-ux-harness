# Guia de Reescrita Manual de Vícios Estruturais de IA (`PT-BR` & `EN`)

Enquanto o `humanize.py` remove caracteres invisíveis, travessões e palavras isoladas do `slop.json` via regex determinístico, as **estruturas de frase viciadas (*Structural Tells*)** exigem reescrita semântica. Use esta tabela sempre que o `humanize.py --report` apontar alertas na seção 4:

| Padrão Estrutural Flagado | Exemplo Viciado de IA (`PT-BR` / `EN`) | Como Reescrever com Autenticidade de Designer |
| :--- | :--- | :--- |
| **`nao-e-sobre-pt` / `not-just` / `isnt-about`** | *"Um Design System não é apenas sobre componentes no Figma, é sobre alinhar pessoas."* / *"It's not just about UI, it's about business."* | Corte a primeira metade inteira. Comece pela afirmação real e dê um exemplo concreto: *"O maior ganho do nosso Design System foi reduzir de 40 para 10 minutos o alinhamento entre design e front-end na sprint."* |
| **`mais-do-que-pt` / `not-only`** | *"Mais do que desenhar telas bonitas, precisamos entender as dores do usuário."* | Vá direto à ação: *"Antes de abrir o Figma neste projeto, entrevistamos 6 operadores que usavam a planilha antiga todos os dias."* |
| **`o-resultado-pt` / `the-result`** | *"Mudamos a hierarquia do botão principal. O resultado? 18% mais cliques."* | Junte causa e efeito sem suspense teatral: *"Quando mudamos a hierarquia do botão principal e tiramos o link secundário do topo, os cliques subiram 18%."* |
| **`Uniform sentence length`** | 5 frases seguidas com 13 a 15 palavras cada uma. | Quebre uma frase longa em uma afirmação curta de 4 palavras (*"Isso travou a entrega."*) e deixe a frase seguinte explicar o detalhe técnico com 20 palavras. |
| **`engajamento-isca-pt` / `engagement-bait`** | *"Concordam? Deixem nos comentários! 👇"* / *"Thoughts? Agree?"* | Faça uma pergunta técnica específica sobre o dilema do post: *"No time de vocês, quem bate o martelo quando o prazo da API conflita com o fluxo ideal de UX?"* |
| **`triad` (Regra de Três de IA)** | *"Trouxemos clareza, eficiência e escalabilidade para o produto."* | Substitua adjetivos abstratos em trio por 1 ou 2 fatos verificáveis: *"Cortamos 3 etapas do cadastro e limpamos 12 componentes duplicados."* |
