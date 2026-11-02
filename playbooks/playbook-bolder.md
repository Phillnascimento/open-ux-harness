# Playbook: Bolder — Amplificação de Identidade e Presença Visual

> **Objetivo:** Elevar o impacto, contraste e presença visual de interfaces tímidas ou excessivamente "seguras", sem inventar novos primitivos de design system ou recorrer a decorações artificiais.

---

## 1. Princípio Fundamental: O Escopo é Soberano
- *"Tudo o resto permanece intacto"* é uma regra literal. Toque apenas no componente ou seção especificada.
- Não crie novas cores, novas fontes ou novos raios de borda que o sistema já não possua.
- Se a interface parece tímida, a solução quase nunca é "adicionar mais efeitos" (como 3D, halos ou gradientes roxos). Isso é o oposto de ousadia; é poluição.

---

## 2. Por que a Interface Parece Tímida?
Uma seção geralmente parece "apagada" porque ela não utilizou a força máxima dos elementos que o próprio sistema já define:
- Tipografia display com peso tímido (usando `text-lg font-medium` onde caberia `text-3xl font-extrabold`).
- Falta de contraste intencional entre o fundo e os elementos de primeiro plano.
- Ritmo monótono (todas as seções têm exatamente a mesma altura e espaçamento).

---

## 3. As Alavancas de Amplificação (The Moves)

1. **Amplifique o que a marca já possui:**
   - Use a cor primária mais saturada da marca no ponto de foco principal.
   - Aumente o degrau na escala tipográfica (ex.: pule de 1.25x para 1.5x ou 2x no título principal).
2. **Faça um movimento decisivo e acalme o entorno:**
   - Se todos os elementos gritarem ao mesmo tempo, a tela fica confusa e não mais marcante.
   - Faça **um único elemento dominar** com autoridade absoluta (ex.: um número gigante, uma tipografia marcante ou uma imagem nítida) e dê espaço de respiro em volta.
3. **O Teste do Esqueleto (The Skeleton Test):**
   - Remova todo o texto da seção planejada e olhe apenas para os blocos cinzas/estrutura.
   - A estrutura vazia ainda comunica claramente a importância e a hierarquia da seção?
   - Se ela só funciona quando o texto é lido, a "ousadia" está apenas no tamanho da fonte, não no design da interface.
4. **Alterne a Densidade de Scroll:**
   - Quebre o ritmo monótono: se as seções anteriores eram densas e com muitas colunas, faça a seção de destaque respirar com espaçamento amplo e alinhamento cirúrgico.
