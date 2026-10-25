# Relatório de Auditoria de Craft & Acessibilidade

**Componente / Tela:** [Nome do Artefato]  
**Data da Avaliação:** [AAAA-MM-DD HH:MM]  
**Resultado Global:** [APROVADO | APROVADO COM RESSALVAS | REPROVADO]  

---

## 1. Grid e Espaçamento (8-Point Grid)
| Elemento | Padding / Margin | Status | Observação |
| :--- | :--- | :--- | :--- |
| Card Container | `16px` | Aprovado | Conforme escala canônica (`spacing.md`) |
| Botão Primário | `12px 24px` | Aprovado | Vertical defensivo de 12px, horizontal de 24px |
| Gap entre campos | `8px` | Aprovado | Conforme escala canônica (`spacing.sm`) |

## 2. Acessibilidade e Contraste de Cores (WCAG 2.2 AA)
| Par de Cores (Texto / Fundo) | Relação Calculada | Requisito Mínimo | Status |
| :--- | :--- | :--- | :--- |
| `#0F172A` sobre `#FFFFFF` | 16.1:1 | 4.5:1 | Aprovado (Nível AAA) |
| `#64748B` sobre `#FFFFFF` | 4.6:1 | 4.5:1 | Aprovado (Nível AA) |
| `#FFFFFF` sobre `#2563EB` | 4.8:1 | 4.5:1 | Aprovado (Nível AA) |

## 3. Cobertura dos 4 Estados de Interface
- [x] **Default / Ideal:** Renderização completa com dados preenchidos.
- [x] **Empty State:** Ilustração leve, texto de orientação e botão de ação primária.
- [x] **Loading / Skeleton:** Layout em blocos com animação suave de pulso.
- [x] **Error State:** Borda de erro, ícone de alerta e mensagem contextualizada com retry.

---

## Assinatura do Guardião
- **Craft Score:** 100/100
- **Aprovação para Handoff:** Liberada para engenharia de interface sem bloqueios.
