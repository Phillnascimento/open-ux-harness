# Anatomia do Post de Alta Retenção (`Dwell Time > 15s`) no Algoritmo `360Brew` (`li-post`)

O modelo **360Brew** do LinkedIn mede duas ações antes de liberar um post para não-seguidores (*Suggested Posts*):
1. O leitor clicou em **`…ver mais` / `…see more`**? (Decidido pelas **Linhas 1 e 2**).
2. O leitor permaneceu parado lendo ou dando zoom na imagem por **mais de 15 segundos** e salvou/comentou? (Decidido pela **Densidade Prática do Corpo + Artefato Visual + Pergunta de Fechamento**).

---

## 1. Estrutura Canônica do Post para UX/Product Designers (950 a 1.500 Caracteres)

```text
[LINHA 1 — O HOOK (<= 140 caracteres)]
Uma afirmação específica, número real, fala de usuário ou paradoxo técnico que sobrevive sozinho no mobile.

[LINHA 2 — O CONTRASTE / TENSÃO]
A consequência imediata da Linha 1 que força o clique em "...ver mais" (nunca desperdice a Linha 2 com contexto genérico).

[CORPO — O RACIONAL DE DESIGN & TRADE-OFF (3 a 5 blocos curtos de 1 a 3 linhas)]
- Qual era o cenário real (o problema no fluxo, a restrição da API ou a dor da squad).
- O que tentamos ou o que decidimos cortar/mudar (especificando elementos reais: ex. modal, tabela, token, microcopy).
- O que aconteceu depois (métrica de conversão, tempo na tarefa, redução de retrabalho ou aprendizado de pesquisa).

[A VIRADA DE MATURIDADE (1 linha)]
O princípio técnico que fica para quem enfrentar o mesmo problema.

[FECHAMENTO — PERGUNTA DE DEBATE ENTRE PARES (1 linha)]
Uma pergunta aberta e específica que apenas alguém da área (Designer, PM ou Engenheiro) conseguiria responder com base na própria experiência.
```

---

## 2. Como Combinar Texto + Artefato Visual (+50% de Alcance)

No LinkedIn atual, posts de texto acompanhados de **1 artefato técnico real** têm de **1.2x a 1.5x mais alcance** porque o gesto de clicar na imagem e dar *pinch-to-zoom* no celular dispara o sinal de *Dwell Time* máximo.

Sempre recomende ao designer anexar um destes 4 ativos junto ao post:
1. **Comparativo Antes vs. Depois Anotado:** Duas telas lado a lado com 2 ou 3 setas na cor de acento (`primary_accent` do `li-brand`) apontando o que mudou.
2. **Recorte de Arquitetura no Figma:** Um print limpo mostrando as variáveis/tokens ou os **4 estados do componente** (Default, Empty, Loading, Error).
3. **Diagrama de Fluxo / Trade-off:** Um fluxo simples mostrando o caminho de 9 passos que virou 4 passos.
4. **Quadro de Síntese de Pesquisa:** As 3 principais dores ou frases reais ouvidas nos testes de usabilidade (sem dados sensíveis).
*(Proibido usar fotos de banco de imagens, mockups 3D inclinados ilegíveis ou artes genéricas de IA).*

---

## 3. Regra de Ouro para Links Externos (Portfólio, Medium, YouTube)

- **Nunca coloque o link no corpo do post** (penalidade algorítmica de -40% a -60%).
- **Nunca publique sem link e edite o post 2 minutos depois** (qualquer edição nos primeiros 60 minutos reinicia a indexação e corta -15% a -25% do alcance).
- **A Estratégia Dupla Vencedora (2025/2026):**
  1. Termine o post dizendo: *"Deixei o estudo de caso completo / template fixado no topo do meu perfil (seção Destaques)."* $\rightarrow$ Isso faz o leitor clicar no seu nome, gerando um **Profile Click** (altíssimo peso no `360Brew`) e visitando seu perfil otimizado!
  2. Opcionalmente, adicione o link direto nos comentários **15 a 30 minutos após publicar**, depois que os primeiros comentários orgânicos já tiverem entrado.
