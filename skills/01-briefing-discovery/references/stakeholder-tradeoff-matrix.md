# Protocolo de Mediação de Conflitos & Matriz de Trade-offs

Divergências entre áreas são a norma, não a exceção, em projetos digitais:
- **PM vs. Designer:** O PM quer adicionar 5 campos obrigatórios para captação de leads; o Designer sabe que isso aumenta a fricção e o abandono.
- **PM vs. Tech Lead:** O PM quer entregar em 2 semanas; o Tech Lead aponta que a arquitetura legada exige no mínimo 4 semanas.
- **Designer vs. Engenharia:** O Designer propõe animações e micro-interações complexas; a Engenharia alerta sobre aumento de bundle size e impacto em dispositivos modestos.

Este guia orienta o **UX Strategic Framer Pro** a arbitrar, desarmar impasses e registrar formalmente os compromissos assumidos.

---

## ⚖️ Os 3 Protocolos de Arbitragem

### Protocolo 1: Fricção de UX vs. Captura de Dados de Negócio
Quando áreas de Negócios/Marketing solicitarem mais etapas ou campos do que o necessário:
1. **Calcular a Taxa Marginal de Abandono:** Apresentar a heurística clássica de formulários: cada campo adicional reduz a conversão móvel entre 3% e 7%.
2. **Propor "Progressive Profiling" (Perfil Progressivo):** 
   - *Solução de Compromisso:* Capturar apenas os 2 campos vitais (ex: E-mail e Nome) no primeiro contato. Capturar o restante (telefone, cargo, empresa) de forma contextual e assíncrona em interações posteriores.
3. **Documentar a Decisão:** Se o PM insistir nos campos extras, registrar no Documento de Validação como *Risco Assumido de Negócio*.

---

### Protocolo 2: Escopo vs. Prazo de Engenharia (Matriz MoSCoW Rápida)
Se a equipe de desenvolvimento sinalizar inviabilidade de prazo para a data limite de lançamento:
* **Must Have (Iniciativa Crítica):** O fluxo principal estritamente necessário para o usuário cumprir a tarefa (ex.: pagar o boleto).
* **Should Have (Importante, mas postergável):** Atalhos convenientes (ex.: pagamento 1-clique).
* **Could Have (Desejável):** Micro-animações e temas personalizados.
* **Won't Have (Fora do Escopo v1):** Recursos que serão transferidos para o backlog da v2.

---

### Protocolo 3: Quem Desempata? (Hierarquia da Matriz RACI)
Se o impasse persistir:
1. O **Accountable (A)** tem a palavra final institucional de negócio.
2. O **Tech Lead (C)** tem poder de veto absoluto sobre segurança e estabilidade de infraestrutura.
3. O **UX Designer (R)** é o guardião inegociável da acessibilidade (WCAG 2.2 AA) e da integridade da experiência do usuário. Se a proposta violar acessibilidade legal, o designer deve registrar veto técnico formal.
