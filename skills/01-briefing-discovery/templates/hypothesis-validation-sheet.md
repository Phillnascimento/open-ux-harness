# Planilha de Validação de Hipóteses e Gestão de Incertezas

> *"Opiniões fortes baseadas em dados fracos são o caminho mais rápido para o fracasso de um produto."*

Esta ferramenta separa categoricamente o que a equipe **sabe de fato (evidências)** do que a equipe **acha que sabe (suposições)**.

---

## 1. Matriz de Certeza vs. Risco de Negócio

| ID | Premissa do Projeto | Tipo: Fato ou Suposição? | Evidência / Fonte dos Dados | Impacto se Estiver Errado (1-5) | Probabilidade de Estar Errado (1-5) | Nível de Risco (Impacto x Prob) | Ação Recomendada |
| :---: | :--- | :---: | :--- | :---: | :---: | :---: | :--- |
| **H1** | "Usuários abandonam o carrinho porque o frete é considerado caro." | **Suposição** | Comentário anedótico de 1 stakeholder interno. | 5 | 4 | **20 (Crítico)** | Conduzir pesquisa com quem abandonou antes de redesenhar. |
| **H2** | "O fluxo mobile tem tempo médio de preenchimento de 4 minutos." | **Fato Comprovado** | Telemetria PostHog dos últimos 30 dias. | 4 | 1 | **4 (Baixo)** | Usar como métrica de baseline para otimização. |
| **H3** | "Usuários preferem Pix em vez de cartão de crédito parcelado." | **Suposição** | Tendência geral de mercado, sem dados na nossa base. | 4 | 3 | **12 (Médio)** | Inserir Pix como teste A/B no fluxo. |
| **H4** | "A API do gateway aceita requisições de pagamento em 1-clique." | **Fato Técnico** | Documentação homologada pela Engenharia. | 5 | 1 | **5 (Baixo)** | Seguir com a especificação técnica de UI. |

---

## 2. Níveis de Classificação de Certeza

1. **Evidência Dura (Fato):** Dados analíticos de telemetria (PostHog/GA), gravações de tela de centenas de sessões reais, relatórios financeiros auditados, logs de API.
2. **Evidência Suave:** Entrevistas qualitativas com pequenos grupos de usuários, tickets de suporte agrupados por taxonomia.
3. **Suposição Qualificada:** Opinião de especialistas da área com anos de vivência no setor, mas sem testes no produto atual.
4. **Achismo / Opinião Pura:** Ideias levantadas em reuniões executivas sem qualquer contato com o comportamento real do usuário final.

---

## 3. Regra de Decisão do UX Strategic Framer Pro
- Qualquer premissa com **Nível de Risco >= 15** **PROÍBE** a ida direta para alta fidelidade.
- A recomendação mandatória será conduzir um **UX Discovery** focado para desarmar a incerteza antes do design visual.
