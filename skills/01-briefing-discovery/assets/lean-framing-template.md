# Documento de Framing Expresso (Lean UX Fast-Track)

> **Modo:** Expresso / Nível 1 (Projetos ágeis, micro-escopos ou demandas pontuais de freelancers)  
> **Tempo Estimado:** < 5 minutos  
> **Data:** [AAAA-MM-DD] | **Designer:** [Nome] | **Preset:** `freelance`

---

## 1. Visão Geral & Objetivo Rápido
- **O que estamos fazendo:** [Ex: Redesenhar o modal de confirmação de exclusão de conta]
- **Por que agora (Gatilho & Custo da Inação):** [Ex: 15% dos usuários clicam por engano sem entender a consequência, gerando 40 tickets/mês de reativação manual]
- **Meta Primária (Desired Outcome):** [Ex: Reduzir exclusões acidentais a zero]

## 2. O Usuário, Dor Central & Micro-OST
- **Quem usa:** [Usuário logado no painel de configurações]
- **Fricção a eliminar (Opportunity):** [O botão atual é muito fácil de clicar e a mensagem de aviso é genérica]
- **Solução Proposta (Solution):** [Modal com resumo de impacto de perda de dados e confirmação explícita]

## 3. Fundações Visuais Rápidas (Freelancer Brand & Craft Kit)
- **Paleta 60-30-10 (HEX Validados):**
  - *Primary (Brand/CTA):* `[#HEX]`
  - *Secondary (Apoio):* `[#HEX]`
  - *Surface (Fundo):* `[#HEX]`
  - *Text Primary:* `[#HEX]` (Contraste $\ge 4.5:1$ validado)
- **Tipografia & Eixos de Tom de Voz:**
  - *Fonte:* `[Inter / Roboto / Montserrat / Sistema]`
  - *Tom de Voz (1-5):* Formal `[X]` | Sério `[X]` | Técnico `[X]` | Corporativo `[X]`
  - *Termos Proibidos:* `[Ex: Nunca usar jargões técnicos de banco de dados com o cliente]`
- **Convenções de Craft do Sistema:**
  - *Raio de Borda:* `[Sharp 0-2px | Equilibrado 6-8px (rounded-lg) | Pill 16px+]`
  - *Biblioteca de Ícones:* `[Lucide / Heroicons / Material Icons]`
  - *Alvo de Toque Mínimo:* `44x44px`

## 4. Escopo Direto, Governança Rápida & Restrições
- **O que será entregue (In-Scope):** 
  - [x] Wireflow simples em Mermaid (Happy path e cancelamento)
  - [x] Tokens básicos W3C DTCG / Tailwind
  - [x] Componente com os 4 estados (*default, empty, loading, error*)
- **Fora do escopo (Out-of-Scope):** Alterações no backend ou fluxo de encerramento de faturamento.
- **Aprovador Final (Accountable):** `[Nome do Cliente / PM]` | **Prazo:** `[Ex: 2 dias úteis]`

---

## 5. Roteamento de Próximo Passo no Harness
Escolha como prefere continuar esta demanda expressa:
- **Caminho A (`02-information-architecture`):** Rodar a **Skill 02: Arquitetura de Informação** para validar o fluxo lógico e estados em Mermaid.js antes de gerar os tokens e UI.
- **Caminho B (`03-design-tokens` - Recomendado para UI Direta):** Pular direto para a **Skill 03: Design Tokens & UI Foundations** para gerar os tokens W3C DTCG a partir do Brand & Craft Kit mapeado acima.
