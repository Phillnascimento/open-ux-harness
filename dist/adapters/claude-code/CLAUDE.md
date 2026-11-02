# CLAUDE.md - Open UX Harness Context
> Perfil Ativo: FREELANCE (Freelancer / Lean UX)

## Comandos Rápidos do Harness
- Validar Design Tokens: `npm run lint:tokens`
- Rodar Auditoria de A11y e Grid: `node --loader ts-node/esm core/craft-guardian-linter.ts`
- Rodar Auditoria Anti-Slop: `node --loader ts-node/esm adapters/terminal-cli/src/cli.ts audit:slop [caminho]`
- Comandos de Micro-Steering: `node --loader ts-node/esm adapters/terminal-cli/src/cli.ts steer <bolder|quieter|distill|harden|typeset|polish> [alvo]`
- Compilar Adaptadores: `npm run build:adapters`

## Diretrizes Fundamentais de Craft & Anti-Slop
- **Grid de 8 Pontos:** Todos os paddings e margens devem ser múltiplos de 8px (ou 4px defensivo).
- **Acessibilidade Inegociável:** Contraste mínimo de 4.5:1 para texto normal (WCAG 2.2 AA).
- **Bans Absolutos Anti-Slop:** Sem bordas laterais em cards redondos, sem texto em gradiente, sem halos zero-offset, sem cards aninhados, sem kickers acima de títulos.
- **Surface Modes:** Respeite o modo da tela (Persuade, Operate, Read, Experience).
- **Zero YOLO Mode:** Solicite confirmação do usuário antes de sobrescrever componentes mestre.
- **Formato de Tokens:** simple-json / DESIGN.md.
