import fs from 'node:fs';
import path from 'node:path';
import { ConfigLoader } from '../core/config-loader.js';
/**
 * Compilador universal que lê as skills, memórias e MCPs agnósticos
 * e gera as configurações nativas para:
 * 1. Google Antigravity (.agentrules, mcp_config.json, skills/)
 * 2. Claude Code (CLAUDE.md, .mcp.json)
 * 3. Cursor / Windsurf (.cursorrules)
 * 4. Terminal CLI (open-ux-harness CLI runner)
 */
export class AdapterCompiler {
    baseDir;
    outputDir;
    constructor(baseDir = process.cwd()) {
        this.baseDir = baseDir;
        this.outputDir = path.resolve(baseDir, 'dist', 'adapters');
    }
    compileAll() {
        console.log('[AdapterCompiler] Iniciando compilação agnóstica...');
        const loader = new ConfigLoader(this.baseDir);
        const { config, preset } = loader.getResolvedConfiguration();
        // 1. Compilar para Google Antigravity
        this.compileAntigravity(config, preset);
        // 2. Compilar para Claude Code
        this.compileClaudeCode(config, preset);
        // 3. Compilar para Cursor & Windsurf
        this.compileCursor(config, preset);
        // 4. Compilar para Terminal CLI Runner
        this.compileTerminalCli(config, preset);
        console.log('✅ [AdapterCompiler] Todos os adaptadores foram compilados com sucesso!');
    }
    compileAntigravity(config, preset) {
        const targetDir = path.resolve(this.outputDir, 'antigravity');
        fs.mkdirSync(targetDir, { recursive: true });
        // Gera .agentrules para Antigravity
        const agentRulesContent = `# OPEN UX HARNESS - ANTIGRAVITY AGENT RULES
# Profile: ${preset.id} (${preset.name})
# Target Quality: Craft Guardian (8pt Grid, WCAG 2.2 AA, 4 UI States)

## Diretrizes de Comportamento
1. Priorize reúso de componentes homologados antes de propor criações.
2. Todo token de cor ou espaçamento deve respeitar o padrão ${preset.tokens.format}.
3. Ações de alto impacto (modificar tokens mestres ou criar PRs) exigem confirmação explícita do Designer (Design Gate).
4. Em caso de discrepância visual, execute linter e reverta para savepoint.
`;
        fs.writeFileSync(path.resolve(targetDir, '.agentrules'), agentRulesContent, 'utf-8');
        // Gera mcp_config.json para Antigravity
        const registryPath = path.resolve(this.baseDir, 'mcp-registry', 'servers.json');
        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
        const antigravityMcp = { mcpServers: {} };
        for (const serverId of preset.mcpServers) {
            if (registry.servers[serverId]) {
                const s = registry.servers[serverId];
                antigravityMcp.mcpServers[serverId] = {
                    command: s.command,
                    args: s.args,
                    env: s.env || {}
                };
            }
        }
        fs.writeFileSync(path.resolve(targetDir, 'mcp_config.json'), JSON.stringify(antigravityMcp, null, 2), 'utf-8');
        console.log('  -> Compilado adaptador Antigravity');
    }
    compileClaudeCode(config, preset) {
        const targetDir = path.resolve(this.outputDir, 'claude-code');
        fs.mkdirSync(targetDir, { recursive: true });
        // Gera CLAUDE.md para Claude Code CLI
        const claudeMdContent = `# CLAUDE.md - Open UX Harness Context
> Perfil Ativo: ${preset.id.toUpperCase()} (${preset.name})

## Comandos Rápidos do Harness
- Validar Design Tokens: \`npm run lint:tokens\`
- Rodar Auditoria de A11y e Grid: \`node --loader ts-node/esm core/craft-guardian-linter.ts\`
- Compilar Adaptadores: \`npm run build:adapters\`

## Diretrizes Fundamentais
- **Grid de 8 Pontos:** Todos os paddings e margens devem ser múltiplos de 8px (ou 4px defensivo).
- **Acessibilidade Inegociável:** Contraste mínimo de 4.5:1 para texto normal (WCAG 2.2 AA).
- **Zero YOLO Mode:** Solicite confirmação do usuário antes de sobrescrever componentes mestre.
- **Formato de Tokens:** ${preset.tokens.format}.
`;
        fs.writeFileSync(path.resolve(targetDir, 'CLAUDE.md'), claudeMdContent, 'utf-8');
        // Gera .mcp.json para Claude Code
        const registryPath = path.resolve(this.baseDir, 'mcp-registry', 'servers.json');
        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
        const claudeMcp = { mcpServers: {} };
        for (const serverId of preset.mcpServers) {
            if (registry.servers[serverId]) {
                const s = registry.servers[serverId];
                claudeMcp.mcpServers[serverId] = {
                    command: s.command,
                    args: s.args,
                    env: s.env || {}
                };
            }
        }
        fs.writeFileSync(path.resolve(targetDir, '.mcp.json'), JSON.stringify(claudeMcp, null, 2), 'utf-8');
        console.log('  -> Compilado adaptador Claude Code');
    }
    compileCursor(config, preset) {
        const targetDir = path.resolve(this.outputDir, 'cursor');
        fs.mkdirSync(targetDir, { recursive: true });
        const cursorRulesContent = `# .cursorrules - Open UX Harness
# Profile: ${preset.id}
You are an expert Principal Product Designer and UI Systems Engineer operating within Open UX Harness.

## Core Rules:
1. SPACING: Strictly use 8-point spatial grid (4px, 8px, 12px, 16px, 24px, 32px, 48px). No arbitrary margins or paddings.
2. COLOR CONTRAST: Ensure text colors have at least 4.5:1 contrast against surface background (WCAG 2.2 AA).
3. 4-STATES: When generating any UI screen or component, ALWAYS provide:
   - Default/Happy state
   - Empty state
   - Loading/Skeleton state
   - Error state with recovery CTA
4. DESIGN TOKENS: Format ${preset.tokens.format}. Never invent ad-hoc hex codes.
`;
        fs.writeFileSync(path.resolve(targetDir, '.cursorrules'), cursorRulesContent, 'utf-8');
        console.log('  -> Compilado adaptador Cursor & Windsurf');
    }
    compileTerminalCli(config, preset) {
        const targetDir = path.resolve(this.outputDir, 'terminal-cli');
        fs.mkdirSync(targetDir, { recursive: true });
        const cliConfig = {
            profile: preset.id,
            defaultProvider: config.llmEngine.defaultProvider,
            defaultModel: config.llmEngine.defaultModel,
            activeSkills: config.activeSkills,
            allowedMcpServers: preset.mcpServers
        };
        fs.writeFileSync(path.resolve(targetDir, 'harness-runtime.json'), JSON.stringify(cliConfig, null, 2), 'utf-8');
        console.log('  -> Compilado adaptador Terminal CLI');
    }
}
// Execução direta
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('build-adapters.ts')) {
    const compiler = new AdapterCompiler();
    compiler.compileAll();
}
