# Padrões Normativos de Evidência Visual — Reality Gate

Este documento estabelece os padrões técnicos e normativos de coleta de evidências para certificação pré-handoff no **Open UX Harness**. Nenhuma interface pode ser declarada pronta para desenvolvimento sem a apresentação de evidências visuais reproduzíveis e auditáveis.

---

## 1. Padrões de Viewport e Resoluções Canônicas

Para garantir que a interface seja responsiva e funcional em diferentes fatores de forma, o Reality Gate exige obrigatoriamente evidências visuais capturadas nos três viewports canônicos:

| Viewport | Resolução Canônica | Piso Mínimo | Touch Target Mínimo | Tolerância de Layout |
| :--- | :--- | :--- | :--- | :--- |
| **`desktop`** | `1440 × 900 px` | `1280 × 720 px` | $\ge 24 \times 24\text{px}$ (WCAG 2.5.8) | Grid de 8pt estrito; sem quebras órfãs de tipografia |
| **`tablet`** | `768 × 1024 px` | `768 × 1024 px` | $\ge 32 \times 32\text{px}$ (Recomendado) | Colapso de sidebars; preservação de hierarquia de dados |
| **`mobile`** | `375 × 812 px` | `360 × 640 px` | $\ge 44 \times 44\text{px}$ (WCAG 2.5.5 AAA / iOS/Android) | Safe-area respeitada; zero overflow horizontal acidental |

### Diretrizes de Captura Visual:
1. **Escala 1:1 e Renderização Real:** As capturas devem representar o viewport exato do navegador ou renderizador do Figma, sem corte de áreas de conteúdo interativo.
2. **Sem Molduras Decorativas (*No Device Frames*):** Proibida a utilização de molduras de smartphones, laptops ou sombras ilustrativas artificiais. A evidência deve ser puramente a interface renderizada.
3. **Formatos Válidos:** Arquivos rasterizados `.png` (preferencial para testes de regressão visual) ou `.webp` sem perdas (lossless).

---

## 2. Cobertura Obrigatória dos 4 Estados de Interface

Toda interface submetida ao Reality Gate deve comprovar a existência e o tratamento explícito dos quatro estados canônicos de UI:

1. **Estado 1 — Default (Happy Path):**
   - Renderização completa com dados realistas (proibido o uso de *Lorem Ipsum* descontextualizado).
   - Tipografia com alinhamento tabular (`tabular-nums`) para dados financeiros, monetários e contadores.
   - Microcópia contextual e hierarquia visual evidente.

2. **Estado 2 — Empty State (Orientativo):**
   - Mensagem explicativa e amigável sobre a ausência de registros.
   - Chamada para ação primária (CTA) clara, permitindo que o usuário execute a primeira ação com facilidade.
   - Sem ilustrações sobrecarregadas que desviem da ação do usuário.

3. **Estado 3 — Loading State (Skeleton / Zero CLS):**
   - Blocos de skeleton que espelham exatamente as dimensões do conteúdo carregado, evitando *Cumulative Layout Shift* (CLS = 0).
   - Animação de pulso sutil ou transição suave.
   - Atributos de acessibilidade pertinentes (`aria-busy="true"`).

4. **Estado 4 — Error State (Acionável):**
   - Borda de destaque e indicação semântica de falha (não dependente exclusivamente de cor).
   - Mensagem de erro explicativa que orienta o usuário sobre como solucionar a falha.
   - Botão ou link de recuperação (*Retry* / tentar novamente) e marcação de acessibilidade (`role="alert"`).

---

## 3. Combate a Aprovações Fantasiosas (*Anti-Fantasy Approval*)

Modelos de linguagem frequentemente tendem à complacência, atribuindo notas 100/100 e aprovações sem atrito ("fantasy approval"). O Reality Gate aplica um filtro determinístico de desconfiança:

### Regra de Suspeição de Score Perfeito:
Se uma interface receber `craftScore >= 100` e zero apontamentos (`findings.length === 0`), ela é automaticamente classificada com a flag `suspiciousPerfectScore = true`.

Para ser aprovada com veredito **PASS**, essa avaliação exige a presença simultânea de três contra-provas:
1. **Evidência Visual Completa:** Screenshots anexados para `desktop`, `tablet` e `mobile`.
2. **Relatório Formal de Auditoria:** Pelo menos uma evidência do tipo `audit-report` apontando para o relatório detalhado do Craft Guardian.
3. **Design Contract Válido:** Caminho `designContractPath` fornecido, referenciando o contrato de especificidade de produto que delimita regras contra visual slop.

Caso qualquer uma das três contra-provas esteja ausente, o Reality Gate emite **HOLD** e bloqueia o handoff.
