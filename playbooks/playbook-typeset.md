# Playbook: Typeset — Engenharia de Ritmo Tipográfico e Legibilidade

> **Objetivo:** Refinar a hierarquia, espaçamento, entrelinha (leading), comprimento de linha e escala tipográfica da interface.

---

## 1. Princípios de Tipografia para Engenharia de Interface

1. **Largura de Linha (Measure):**
   - Parágrafos de leitura devem conter entre **65 e 75 caracteres por linha** (`max-w-prose` ou `max-width: 68ch`).
   - Linhas mais longas que 80 caracteres fazem o olho humano perder o ponto de retorno na quebra de linha.
   - Linhas menores que 45 caracteres causam quebras frenéticas e quebram o fluxo de raciocínio.
2. **Escala e Razão de Degrau:**
   - Cada nível hierárquico deve ser diferenciado por uma razão clara ($\ge 1.25\times$).
   - Exemplo de Escala Maior (Major Third 1.25x):
     - Body: `16px` (1rem)
     - Subtitle / H3: `20px` (1.25rem)
     - Section Title / H2: `25px` (1.56rem)
     - Page Title / H1: `31px` (1.95rem)
     - Hero Display: `48px` - `64px` (3rem - 4rem)
3. **Entrelinha (Line-Height / Leading):**
   - Para texto corrido (body): `1.5` a `1.65` (`leading-relaxed`).
   - Para títulos grandes (headings): `1.1` a `1.2` (`leading-tight` ou `leading-none`). Conforme o tamanho da fonte aumenta, a entrelinha proporcional deve diminuir.
4. **Tracking (Espaçamento entre Letras):**
   - Em títulos grandes: tracking ligeiramente negativo (`-0.02em` a `-0.03em`), sem passar do piso de `-0.04em`.
   - Em texto body: tracking neutro (`0em`). Nunca use tracking negativo em texto de leitura!
   - Em pequenas legendas em caixa alta: tracking aberto (`+0.05em` a `+0.1em`).
5. **Balanceamento de Títulos e Parágrafos:**
   - Adicione `text-wrap: balance` em headings (Chrome/Edge/Safari) para evitar que a última linha fique com apenas uma palavra isolada (*widow* ou *straggler*).
   - Adicione `text-wrap: pretty` em parágrafos de corpo de texto.
