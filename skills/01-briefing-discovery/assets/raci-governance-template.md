# Matriz RACI de Governança para Projetos de UX/UI

A matriz RACI estabelece transparência absoluta sobre papéis e responsabilidades ao longo de todo o ciclo de vida do design, prevenindo os dois maiores riscos de governança:
1. *Vetos tardios* por stakeholders que não foram consultados.
2. *Retrabalho técnico* por falta de alinhamento com a engenharia antes do handoff.

---

## Estrutura Operacional da Matriz RACI

| Etapa do Processo de UX | UX Lead / Designer | Product Manager (PM) | Tech Lead / Engenharia | Stakeholders de Negócio / C-Level | Usuário / Clientes |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Briefing & Problem Framing** | **R** | **A** | **C** | **C** | **I** |
| **2. Pesquisa de Discovery (se aplicável)**| **R** | **A** | **I** | **I** | **C** |
| **3. Arquitetura de Informação & Wireflows** | **R** | **C** | **C** | **I** | **I** |
| **4. Definição de Design Tokens** | **R** | **I** | **A** | **I** | - |
| **5. UI Design & Componentes no Figma** | **R** | **C** | **C** | **I** | - |
| **6. Auditoria de Craft & Acessibilidade** | **R** | **I** | **C** | **I** | - |
| **7. Aprovação Final de Escopo (Design Gate)**| **C** | **A** | **A** | **I** | - |
| **8. Handoff & Implementação em Código** | **C** | **I** | **R** | **I** | - |
| **9. Análise de Telemetria Pós-Deploy** | **R** | **A** | **C** | **I** | **I** |

---

## Definições Formais e Critérios de Atribuição

### **R - Responsible (Responsável pela Execução)**
- **Quem é:** A pessoa ou papel que coloca a mão na massa para produzir o entregável.
- **Regra de Ouro:** Deve haver idealmente apenas UM responsável principal por atividade específica para evitar diluição de responsabilidade.

### **A - Accountable (Aprovador com Poder de Veto)**
- **Quem é:** A única pessoa que responde pelo resultado final perante o negócio e que possui autoridade legal/institucional para assinar a aprovação ou vetar a entrega.
- **Regra de Ouro:** **Apenas UMA pessoa pode ser Accountable por decisão.** Se duas pessoas forem Accountable, ninguém é responsável.

### **C - Consulted (Consultado Bidirecionalmente)**
- **Quem é:** Especialistas de domínio (Tech Lead, Especialista de A11y, Especialista Fiscal/Legal, Atendimento ao Cliente) cuja contribuição é mandatória antes da tomada de decisão.
- **Regra de Ouro:** Comunicação bidirecional. A opinião deles deve ser considerada seriamente, mas eles não possuem voto de veto direto (exceto veto técnico de segurança/acessibilidade).

### **I - Informed (Informado Unidirecionalmente)**
- **Quem é:** Indivíduos ou departamentos impactados pelo projeto (Marketing, Vendas, Suporte Operacional) que precisam ser mantidos a par das datas de lançamento e mudanças visuais.
- **Regra de Ouro:** Comunicação unidirecional via relatórios executivos ou notas de release. Não atrasam o cronograma com reuniões desnecessárias.
