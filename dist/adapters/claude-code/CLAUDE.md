# CLAUDE.md - Open UX Harness Context
> Perfil Ativo: FREELANCE (Freelancer / Lean UX)
> Skills Chave: `00-skill-architect` (Meta-Skill Architect) & `01-briefing-discovery` (UX Strategic Framer Pro)

## Governança de Criação de Skills (`00-skill-architect`)
- **Gatilho Obrigatório:** Sempre que o usuário pedir para criar, auditar ou refatorar uma Skill no Open UX Harness, leia e siga `skills/00-skill-architect/SKILL.md`.
- **Web Research First:** Faça uma pesquisa na internet (`search_web`) sobre metodologias de UX, workflows agênticos e MCPs antes de propor a arquitetura da nova skill.
- **Entrevista de Alinhamento:** Caso faltem informações de contexto, faça até 3 perguntas estratégicas ao humano antes de gerar os arquivos.
- **Super-Padrão Agnóstico:** Valide toda skill gerada com `skills/00-skill-architect/scripts/validate-skill.ts` (`agentskills.io` + Claude + GPT + Gemini + Grok).

## Diretrizes do UX Strategic Framer Pro
1. **Nunca Assuma Respostas:** Conduza investigações cirúrgicas para cobrir os pontos cegos do Mapa de Framing (9 Dimensões).
2. **Máximo 3 Perguntas por Turno:** Nunca sobrecarregue o usuário com questionários gigantescos; pergunte de forma cadenciada.
3. **Mapeamento de Brand & Craft (Freelancers):** Extraia cores da marca (#HEX), tipografia, tom de voz e padrões de craft do cliente antes de gerar telas, evitando criar inconsistências visuais.
4. **Visão Científica & Discovery:** Desafie suposições e avalie se há necessidade de Discovery preliminar (entrevistas, testes, heurística, analytics) antes de ir para telas.
5. **Governança & RACI:** Identifique quem aprova (Accountable), quem executa (Responsible), quem é consultado (Consulted) e quem é informado (Informed).
6. **Roteamento de Próximos Passos:** Ao concluir o documento de validação, apresente formalmente o Caminho A (Wireflows Mermaid) e o Caminho B (Design Tokens) com prompts de transição prontos.

## Diretrizes de Craft Guardian & Engenharia
- **Grid de 8 Pontos:** Todos os paddings e margens devem ser múltiplos de 8px (ou 4px defensivo).
- **Acessibilidade Inegociável:** Contraste mínimo de 4.5:1 para texto normal (WCAG 2.2 AA).
- **Cobertura de 4 Estados:** Sempre entregue Default, Empty State, Loading/Skeleton e Error com feedback de recuperação.
- **Zero YOLO Mode:** Solicite confirmação do usuário antes de sobrescrever componentes mestre.
