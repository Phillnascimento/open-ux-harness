# Documento de Validação de Escopo e Problem Framing (Caso Exemplo: Checkout Mobile)

> Emitido via **UX Strategic Framer Pro** do Open UX Harness  
> Data: 2026-10-10 | Status: ✅ Aprovado por Stakeholders | Perfil: Freelance / Lean

---

## 1. Resumo Executivo
Iniciativa de otimização da experiência de compra mobile focada em simplificar as etapas de seleção de endereço e pagamento, reduzindo o tempo de conclusão da tarefa e recuperando a perda de conversão observada nos últimos 45 dias no segmento de checkout responsivo.

## 2. Definição do Problema (Causa Raiz & Custo da Inação)
- **Problema:** A taxa de abandono no checkout mobile subiu 12% após a introdução de um formulário longo com dropdowns lentos e campos excessivos. O usuário móvel, frequentemente operando com uma mão só em redes instáveis, desiste da compra.
- **Custo da Inação (Cost of Inaction):** Estimado em R$ 180.000,00 por mês em receita líquida perdida diretamente atribuível à desistência na etapa de seleção de frete/pagamento.
- **Evidências:** Dados de telemetria PostHog identificando 64% de desistências especificamente no componente dropdown nativo de opções de entrega.

## 3. Objetivos e Resultados de Negócios (Business Outcomes)
- **Objetivo Estratégico:** Atingir a meta corporativa do OKR 1 (Otimização da Eficiência de Conversão).
- **Business KPIs:**
  - Recuperar no mínimo +10% de conversão final no checkout mobile.
  - Reduzir o tempo médio de checkout de 4m30s para menos de 2 minutos.
- **UX Metrics:**
  - CSAT do fluxo pós-compra >= 85 pontos.
  - Taxa de erro em campos de pagamento < 1.5%.

## 4. O Usuário
- **Persona Alvo:** Comprador mobile recorrente e novos clientes que compram pelo smartphone no trajeto de volta para casa ou pausas de trabalho.
- **Momento da Dor:** O usuário tem pressa e preenche o carrinho rapidamente, mas é bloqueado por seleções lentas de dropdown e ausência de feedback quando o cartão demora para autorizar.
- **Job-to-be-Done (JTBD):** *"Quando estou fechando uma compra no celular em movimento, quero pagar em 1 ou 2 toques sem preencher formulários repetitivos, para que eu garanta meu pedido com segurança e rapidez."*

## 5. Fundações Visuais, Brand Identity & Craft Existente
- **Cores da Marca:**
  - *Primária (Brand/CTA):* `#2563EB` (Azul 600 - Ação e Confiança)
  - *Secundária (Apoio):* `#475569` (Slate 600)
  - *Fundo (Surface):* `#FFFFFF` e `#F8FAFC`
  - *Texto Principal:* `#0F172A` (Slate 900 - Contraste 16.1:1 contra branco)
- **Tipografia:** Fonte do sistema `Inter` (sans-serif moderno, excelente legibilidade em telas pequenas).
- **Tom de Voz da Marca:** Claro, ágil e acolhedor. *Anti-pattern:* Nunca exibir mensagens genéricas de erro como "Algo deu errado". Sempre apontar a causa e ação ("Verifique o limite ou use Pix").
- **Padrões de Craft do Sistema Existente:**
  - *Raio de Borda:* `8px` (`rounded-lg` do Tailwind).
  - *Biblioteca de Ícones:* `Lucide Icons` (traço 2px consistente).
  - *Área de Toque:* Botões com altura mínima obrigatória de `44px` para toques com o polegar.

## 6. Escopo e Restrições
- **Dentro do Escopo (In-Scope):**
  - Redesenho da interface de seleção de pagamento e endereço com cartões táteis (padding 16px).
  - Implementação de pagamento 1-clique com cartão principal salvo.
  - Cobertura dos 4 estados de UI (Default, Empty, Loading, Error).
- **Fora do Escopo (Out-of-Scope):**
  - Integração de novos gateways de pagamento (manter o gateway atual).
  - Aplicativo nativo iOS/Android (foco restrito à web móvel responsiva).
- **Restrições Técnicas & Prazos:**
  - Stack Frontend: React + Tailwind CSS.
  - Prazo de entrega de handoff para a squad: 2 semanas.

## 7. Matriz RACI (Governança do Projeto)
| Stakeholder / Papel | Nome / Cargo | Categoria RACI | Responsabilidade |
| :--- | :--- | :---: | :--- |
| **UX/UI Lead Designer** | Felipe / Lead | **R** *(Responsible)* | Condução do framing, wireflows, tokens e telas |
| **Product Manager (PM)** | Mariana / GPM | **A** *(Accountable)* | Decisão final de escopo, negócio e poder de veto |
| **Tech Lead Frontend** | Carlos / TL | **C** *(Consulted)* | Validação contínua de viabilidade técnica |
| **Especialista de Atendimento (CS)** | Renata / Head CS | **C** *(Consulted)* | Fornecimento dos principais motivos de reclamação |
| **Marketing / CRM** | Diego / Growth | **I** *(Informed)* | Notificado sobre a data de virada de tela |

## 8. Recomendações e Próximos Passos (UX Discovery)
- **Diagnóstico:** As evidências no PostHog são fortes e o gateway de pagamento suporta 1-clique. Portanto, **o projeto está apto para prototipação e arquitetura de telas**.
- **Ação Rápida de Discovery Adicional:**
  - Realizar teste de usabilidade moderado rápido (30 min) com 4 usuários internos para validar a clareza do botão de 1-Clique antes do deploy em produção.

## 9. Entregáveis Finais do Projeto
1. Wireflow navegável documentado em Mermaid.js (`02-wireflow.mermaid`).
2. Design Tokens W3C DTCG validados (`03-tokens.json`).
3. Componente React + Tailwind com os 4 estados implementados (`04-component.tsx`).
4. Relatório de auditoria Craft Guardian comprovando conformidade 100/100 (`05-craft-audit.md`).
5. Relatório de validação pós-deploy com telemetria PostHog (`06-post-launch-impact.md`).

## 10. Critérios de Sucesso Pós-Deploy
- Aumento de +10% ou mais na taxa de conclusão de pagamento em até 14 dias após o deploy.
- Zero quebras de acessibilidade (WCAG 2.2 AA) reportadas por ferramentas de auditoria.

---

## 11. Roteamento de Próximos Passos no Harness

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│  🧭 ROTEAMENTO DE PRÓXIMO PASSO NO HARNESS                                                    │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                │
│  [CAMINHO A] Arquitetura de Informação & Wireflows (Skill 02) [RECOMENDADO]                   │
│  • Por que este caminho: O checkout envolve estados de erro de gateway, carrinho vazio e      │
│    seleção de endereço que devem ser validados no diagrama antes de construir a UI visual.     │
│  • Ação: Executar Skill 02 (Arquitetura de Informação).                                        │
│  • Prompt Pronto para o Chat:                                                                  │
│    "Avance para a Skill 02 e gere o wireflow Mermaid para o checkout com base no framing."     │
│                                                                                                │
│  [CAMINHO B] Formalização de Design Tokens (Skill 03)                                         │
│  • Por que este caminho: Caso prefira formalizar imediatamente as cores #2563EB, #0F172A e a  │
│    escala de espaçamentos no padrão W3C DTCG/Tailwind antes de diagramar o fluxo.             │
│  • Ação: Executar Skill 03 (Design Tokens).                                                   │
│  • Prompt Pronto para o Chat:                                                                  │
│    "Avance para a Skill 03 e formalize os tokens W3C DTCG a partir da paleta mapeada."         │
│                                                                                                │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```
