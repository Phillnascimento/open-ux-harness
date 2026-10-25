# Guia de Métricas do Algoritmo `360Brew` e Auditoria de Conversão de Perfil (`li-audit`)

Impressões brutas são uma métrica de vaidade no LinkedIn em 2025/2026. Um post viral com meme de UX que recebe 40.000 impressões de estudantes mas **zero cliques no perfil** de Design Managers ou Tech Recruiters não gera recolocação nem clientes.

---

## 1. As 5 Métricas Determinísticas Calculadas por `analytics-parser.py`

| Métrica | Fórmula | O que Revela sobre o Algoritmo `360Brew` |
| :--- | :--- | :--- |
| **1. `360Brew Weighted Score`** | $\frac{\text{Reações}\times 1 + \text{Comentários}\times 4 + \text{Reposts}\times 5 + \text{Saves}\times 5 + \text{Cliques Perfil}\times 4}{\text{Impressões}} \times 100$ | Mede o peso real de retenção, utilidade (*Knowledge & Advice*) e autoridade que faz o post entrar em *Suggested Posts* por semanas. |
| **2. `Engagement Rate Padrão`** | $\frac{\text{Reações} + \text{Comentários} + \text{Reposts}}{\text{Impressões}} \times 100$ | Linha de base clássica (Saudável: `3.0% a 5.5%`; Excelente: `> 6.0%`). |
| **3. `Comment-to-Reaction Ratio`** | $\frac{\text{Comentários}}{\text{Reações}}$ | Indica se o post iniciou discussão real entre pares (`>= 0.15` é excelente) ou apenas cliques passivos (`< 0.05`). |
| **4. `Reach Multiple`** | $\frac{\text{Impressões}}{\text{Total de Seguidores}}$ | Acima de `1.0x` prova que o conteúdo furou a bolha de 1º grau e foi distribuído pelo *Interest Graph*. |
| **5. `Conversão de Perfil (Recruiter & Leads)`** | $\text{Aparições em Busca Semanais} + \text{Visualizações por Recrutadores/Decisores} + \text{DMs Recebidas}$ | Mede se o LinkedIn está trabalhando para o designer nos bastidores. |

---

## 2. Como Diagnosticar Problemas Comuns em Contas de Designers

1. **Alto Alcance + Zero Abordagens de Recrutadores/Clientes:**
   - *Causa:* O designer está postando conteúdo genérico para juniores (*"5 dicas de Figma"*, memes de cliente) em vez de postar **decisões de produto, trade-offs, métricas e arquitetura de sistemas** (`Pilar 1` e `Pilar 2`).
2. **Boas Ideias + Alcance Travado abaixo de 300 Impressões:**
   - *Causa A:* O Hook (Linha 1) não gera o clique em *"…ver mais"* ou falta um artefato visual (carrossel PDF ou tela anotada) para segurar o **Dwell Time > 15 segundos**.
   - *Causa B:* O designer publica e sai do LinkedIn sem responder aos comentários nos primeiros **60–90 minutos (Golden Hour)** e sem comentar nos posts dos Tiers 1, 2 e 3 antes de publicar.
3. **Muitas Visualizações de Perfil + Poucas Mensagens no Inbox:**
   - *Causa:* A seção **Destaques (Featured)** está vazia ou desatualizada, a **Headline** não deixa claro o cargo/oferta, ou o **Open to Work / Página de Serviços** está desligado. Deve-se rotear imediatamente de volta para `li-profile`.
