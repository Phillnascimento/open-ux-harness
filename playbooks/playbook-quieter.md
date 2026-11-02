# Playbook: Quieter — Redução de Ruído e Moderação Visual

> **Objetivo:** Acalmar interfaces sobrecarregadas, hiperestimulantes ou ruidosas, eliminando distrações e restaurando o foco na tarefa do usuário.

---

## 1. Diagnóstico do Excesso de Estímulo
Interfaces ruidosas sofrem de:
- Cores de destaque disputando atenção em 5 lugares simultâneos.
- Múltiplas caixas, bordas e sombras aninhadas em cada linha.
- Badges, ícones coloridos e pílulas luminosas competindo com os dados reais.
- Animações ou pulsos constantes que impedem a leitura calma.

---

## 2. Movimentos Cirúrgicos de Acalmamento

1. **Recuo da Cor:**
   - Reduza o uso da cor primária/saturada para estritamente **uma ação principal por viewport**.
   - Mude botões secundários para variantes `ghost`, `outline` ou `subtle`.
2. **Eliminação de Bordas Redundantes:**
   - Remova bordas de cards quando o próprio espaçamento já delimita a separação.
   - Substitua contornos coloridos por fundos neutros com opacidade suave (ex.: `bg-neutral-50 dark:bg-neutral-900`).
3. **Harmonização de Sombras:**
   - Remova sombras profundas de múltiplos elementos.
   - Mantenha sombras apenas em camadas que genuinamente flutuam sobre a interface (dropdowns, popovers, modais).
4. **Desaceleração de Movimento:**
   - Remova animações contínuas (como badges pulsando ou ícones girando sem dados ao vivo).
   - Mantenha apenas transições funcionais ao hover ou clique.
