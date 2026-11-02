# Playbook: Distill — Depuração Estrutural e Remoção de Containers Supérfluos

> **Objetivo:** Reduzir a interface à sua essência estrutural, eliminando containers desnecessários, caixas dentro de caixas e linhas divisórias supérfluas.

---

## 1. O Vício do "Container por Reflexo"
Modelos de linguagem frequentemente colocam tudo dentro de `<Card>`:
- Uma lista de 5 itens vira 5 cards dentro de um card maior, que está dentro de um painel com borda.
- Isso gera um efeito de "matryoshka visual" (bonecas russas) que cansa a vista e desperdiça preciosos pixels de tela.

---

## 2. Movimentos de Destilação

1. **Achatar Hierarquias Aninhadas (Unnesting):**
   - Remova o card filho e transforme os itens em linhas limpas de tabela ou itens de lista com um simples separador horizontal `border-b border-neutral-100 dark:border-neutral-800`.
2. **Substituir Caixas por Espaço em Branco:**
   - Em vez de delimitar um bloco com `border rounded-xl p-4`, utilize espaçamento vertical generoso (`py-8` ou `space-y-6`).
   - O alinhamento rigoroso à esquerda cria margens virtuais que o cérebro humano reconhece instantaneamente como agrupamento (Princípios de Proximidade da Gestalt).
3. **Remover "Chrome" Não Funcional:**
   - Elimine ícones decorativos repetidos que não ajudam na diferenciação semântica.
   - Remova cabeçalhos repetidos e agrupe dados correlatos sob um único título claro.
