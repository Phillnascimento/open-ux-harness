# Modelo de Briefing & Problem Framing de UX (Padrão UX Strategic Framer Pro)

> Documento executivo oficial de alinhamento de escopo, governança (RACI) e validação de hipóteses antes do design visual.

## 1. Resumo Executivo
[Breve parágrafo sintetizando o projeto, seu propósito e oportunidade estratégica].

## 2. Definição do Problema (Causa Raiz & Custo da Inação)
- **Declaração do Problema:** [Declaração clara da dor fundamental].
- **Custo da Inação (Cost of Inaction):** [Impacto financeiro e operacional de não agir].
- **Origem dos Dados / Evidências:** [Fontes reais de dados vs suposições].

## 3. Objetivos de Negócio & Métricas (Success Metrics)
- **Objetivo Estratégico:** [Alinhamento com OKRs corporativos].
- **Business KPIs:** [Ex.: +15% de conversão, -20% de abandono].
- **UX Metrics:** [Ex.: Time-on-task < 2min, CSAT >= 85].

## 4. O Usuário
- **Público-Alvo / Personas:** [Para quem estamos desenhando].
- **Momento da Dor (Journey Trigger):** [Contexto em que o atrito ocorre].
- **Job-to-be-Done (JTBD):** *"Quando eu [situação], quero [motivação], para que [resultado]."*

## 5. Escopo e Restrições
- **Dentro do Escopo (In-Scope):** [Lista de entregas acordadas].
- **Fora do Escopo (Out-of-Scope):** [O que não será feito].
- **Restrições Técnicas & Prazos:** [Tecnologias frontend, APIs, prazos inegociáveis].

## 6. Matriz RACI (Governança do Projeto)
| Papel | Nome / Área | Categoria RACI | Responsabilidade |
| :--- | :--- | :---: | :--- |
| **UX Lead** | [Nome] | **R** | Condução da pesquisa, fluxos e protótipos |
| **Product Manager** | [Nome] | **A** | Aprovação final de escopo e poder de veto |
| **Tech Lead** | [Nome] | **C** | Validação de viabilidade de engenharia |
| **Marketing / Growth** | [Nome] | **I** | Notificados sobre datas e releases |

## 7. Recomendações de UX Discovery
- [ ] Apto para prototipação imediata (Certeza alta, risco contido).
- [ ] Recomendação de Discovery preliminar: [Entrevistas / Heurística / Analytics / Desk Research].
  - *Justificativa com base nos riscos:* [Por que esta pesquisa é indispensável].

## 8. Entregáveis Finais do Projeto
1. Wireflows lógicos em Mermaid.js
2. Contrato de Design Tokens (W3C DTCG 2025.10 / Simple JSON)
3. Protótipo interativo com cobertura dos 4 estados de UI (Default, Empty, Loading, Error)
4. Relatório de auditoria Craft Guardian & A11y (WCAG 2.2 AA)
5. Especificação técnica de handoff com Storybook / Tailwind

## 9. Critérios de Sucesso Pós-Deploy
[Métricas numéricas que definirão o sucesso após o lançamento em produção].
