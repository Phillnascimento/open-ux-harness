# Guia de Extração de Briefings Caóticos e Não Estruturados (Raw Ingestion)

Na prática de mercado, clientes e stakeholders raramente entregam briefings organizados. É comum receber:
- Transcrições automáticas de reuniões (Zoom, Google Meet, Teams, Otter.ai).
- Histórico longo de mensagens coladas do Slack ou WhatsApp.
- Rascunhos confusos com ideias dispersas e jargões internos.

Este guia orienta o **UX Strategic Framer Pro** a realizar uma extração analítica antes de iniciar a rodada de perguntas.

---

## 🔄 Algoritmo de Extração em 4 Passos

```mermaid
flowchart TD
    RawInput["1. Entrada Bruta\n(Áudio transcrito, dump de chat, anotações soltas)"] --> Parsing["2. Filtro de Ruído & Parsing Semântico\n(Descarta conversa fiada, separa fatos de opiniões)"]
    Parsing --> Mapping["3. Mapeamento no Mapa de Framing\n(Preenche silenciosamente as dimensões conhecidas)"]
    Mapping --> GapDetection["4. Detecção Cirúrgica de Pontos Cegos\n(Identifica o que faltou e formula máx. 3 perguntas)"]
```

### Passo 1: Limpeza de Ruído e Separação de Sinal
- Remova cumprimentos, conversas paralelas, debates de agenda e repetições.
- Separe declarações em duas colunas mentais:
  - **Sinal (Fatos & Requisitos):** Métricas citadas, datas limites, restrições de tecnologia, dores explícitas de usuários.
  - **Ruído / Hipótese:** Palpites estéticos ("acho que ficaria legal azul"), suposições de stakeholders sem base de dados.

### Passo 2: Pré-Preenchimento Automático do Mapa de Framing
Varra a entrada bruta buscando preencher automaticamente:
- Quem é o cliente/produto?
- Qual é o sintoma ou dor mencionada?
- Quais prazos ou ferramentas foram citados?
- Quem participou da conversa (candidatos para a matriz RACI)?

### Passo 3: Feedback Imediato de Entendimento
Antes de fazer perguntas, apresente um resumo executivo de 4 a 6 linhas para dar segurança ao usuário de que o contexto foi assimilado:
> *"Li atentamente o material compartilhado. Pude identificar com clareza que o foco é [X], o usuário principal é [Y] e a meta de entrega é [Z]."*

### Passo 4: Perguntas Estritamente Focadas no que Faltou
Nunca pergunte algo que já estava explícito na transcrição. Formule **apenas até 3 perguntas** cirúrgicas cobrindo os gaps críticos (ex: aprovação final na RACI ou custos da inação).
