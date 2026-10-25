# CLAUDE.md - Open UX Harness Context
> Perfil Ativo: FREELANCE (Freelancer / Lean UX)

## Comandos Rápidos do Harness
- Validar Design Tokens: `npm run lint:tokens`
- Rodar Auditoria de A11y e Grid: `node --loader ts-node/esm core/craft-guardian-linter.ts`
- Compilar Adaptadores: `npm run build:adapters`

## Diretrizes Fundamentais
- **Grid de 8 Pontos:** Todos os paddings e margens devem ser múltiplos de 8px (ou 4px defensivo).
- **Acessibilidade Inegociável:** Contraste mínimo de 4.5:1 para texto normal (WCAG 2.2 AA).
- **Zero YOLO Mode:** Solicite confirmação do usuário antes de sobrescrever componentes mestre.
- **Formato de Tokens:** simple-json.
