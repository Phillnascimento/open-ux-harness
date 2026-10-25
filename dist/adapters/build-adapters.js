import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConfigLoader } from '../core/config-loader.js';
/**
 * Compilador universal que lê as skills, memórias e MCPs agnósticos
 * e gera as configurações nativas para plataformas suportadas definidas em platforms.json:
 * 1. Google Antigravity (.agentrules, mcp_config.json)
 * 2. Claude Code (CLAUDE.md, .mcp.json)
 * 3. Cursor (.cursorrules)
 * 4. Terminal CLI (harness-runtime.json)
 * 5. Gemini CLI (GEMINI.md)
 * 6. GitHub Copilot (copilot-instructions.md)
 * 7. Windsurf (.windsurfrules)
 * 8. Codex (harness.toml)
 */
export class AdapterCompiler {
    baseDir;
    outputDir;
    platformsData;
    constructor(baseDir = process.cwd()) {
        this.baseDir = baseDir;
        this.outputDir = path.resolve(baseDir, 'dist', 'adapters');
        this.platformsData = this.loadPlatforms();
    }
    /**
     * Carrega a fonte única de verdade adapters/platforms.json
     */
    loadPlatforms() {
        const candidatePaths = [
            path.resolve(this.baseDir, 'adapters', 'platforms.json'),
            path.resolve(this.baseDir, 'dist', 'adapters', 'platforms.json')
        ];
        try {
            const currentDir = path.dirname(fileURLToPath(import.meta.url));
            candidatePaths.push(path.resolve(currentDir, 'platforms.json'));
            candidatePaths.push(path.resolve(currentDir, '..', 'adapters', 'platforms.json'));
        }
        catch {
            // Ignora se não for possível resolver import.meta.url
        }
        for (const p of candidatePaths) {
            if (fs.existsSync(p)) {
                const raw = JSON.parse(fs.readFileSync(p, 'utf-8'));
                return raw;
            }
        }
        throw new Error(`[AdapterCompiler] Não foi possível encontrar platforms.json em nenhum dos caminhos: ${candidatePaths.join(', ')}`);
    }
    /**
     * Retorna a lista de todas as plataformas registradas
     */
    getPlatforms() {
        const raw = this.platformsData.platforms;
        if (Array.isArray(raw)) {
            return raw;
        }
        return Object.values(raw);
    }
    /**
     * Retorna a definição de uma plataforma pelo ID
     */
    getPlatform(id) {
        const raw = this.platformsData.platforms;
        if (Array.isArray(raw)) {
            return raw.find((p) => p.id === id);
        }
        return raw[id];
    }
    /**
     * Compila os adaptadores para todas as plataformas configuradas ou para alvos específicos
     */
    compileAll(targets) {
        console.log('[AdapterCompiler] Iniciando compilação agnóstica...');
        const loader = new ConfigLoader(this.baseDir);
        const { config, preset } = loader.getResolvedConfiguration();
        const platforms = this.getPlatforms();
        const platformIds = targets && targets.length > 0
            ? targets
            : platforms.map(p => p.id);
        for (const id of platformIds) {
            this.compilePlatform(id, config, preset);
        }
        console.log('✅ [AdapterCompiler] Todos os adaptadores foram compilados com sucesso!');
    }
    /**
     * Despacha a compilação para o compilador específico de cada plataforma
     */
    compilePlatform(id, config, preset) {
        switch (id) {
            case 'antigravity':
                this.compileAntigravity(config, preset);
                break;
            case 'claude-code':
                this.compileClaudeCode(config, preset);
                break;
            case 'cursor':
                this.compileCursor(config, preset);
                break;
            case 'terminal-cli':
                this.compileTerminalCli(config, preset);
                break;
            case 'gemini-cli':
                this.compileGeminiCli(config, preset);
                break;
            case 'copilot':
                this.compileCopilot(config, preset);
                break;
            case 'windsurf':
                this.compileWindsurf(config, preset);
                break;
            case 'codex':
                this.compileCodex(config, preset);
                break;
            default:
                console.warn(`[AdapterCompiler] Plataforma não suportada: ${id}`);
        }
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
        console.log('  -> Compilado adaptador Cursor');
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
    compileGeminiCli(config, preset) {
        const targetDir = path.resolve(this.outputDir, 'gemini-cli');
        fs.mkdirSync(targetDir, { recursive: true });
        const mcpList = preset.mcpServers && preset.mcpServers.length > 0
            ? preset.mcpServers.map((s) => `- \`${s}\``).join('\n')
            : '- Nenhum servidor configurado';
        const geminiMdContent = `# GEMINI.md - Open UX Harness Context
> Perfil Ativo: ${preset.id} (${preset.name})
> Target Quality: Craft Guardian (8pt Grid, WCAG 2.2 AA, 4 UI States)

## Diretrizes de Conduta e Design
1. **Grid de 8 Pontos:** Todos os espaçamentos, paddings e margens devem respeitar a escala de 8px (4px defensivo).
2. **Acessibilidade Inegociável (WCAG 2.2 AA):** Contraste mínimo de 4.5:1 para texto normal e 3:1 para componentes visuais.
3. **4 Estados de Interface:** Toda especificação de componente deve fornecer Default, Empty, Loading e Error (com CTA).
4. **Design Tokens:** Respeite rigorosamente o formato ${preset.tokens.format}. Não crie tokens arbitrários.
5. **Zero YOLO Mode:** Solicite confirmação humana (Design Gate) antes de alterações destrutivas ou em tokens mestre.

## Integração MCP
Servidores MCP ativos para este perfil:
${mcpList}

Utilize as ferramentas dos servidores MCP conectados para validação e consulta de tokens e componentes.
`;
        fs.writeFileSync(path.resolve(targetDir, 'GEMINI.md'), geminiMdContent, 'utf-8');
        console.log('  -> Compilado adaptador Gemini CLI');
    }
    compileCopilot(config, preset) {
        const targetDir = path.resolve(this.outputDir, 'copilot');
        fs.mkdirSync(targetDir, { recursive: true });
        const mcpServers = preset.mcpServers && preset.mcpServers.length > 0
            ? preset.mcpServers.join(', ')
            : 'nenhum';
        const copilotContent = `# GitHub Copilot Custom Instructions - Open UX Harness
> Profile: ${preset.id} (${preset.name})

## Diretrizes do Preset Ativo
- **Sistema de Design e Grid:** Adote estritamente o grid de 8 pontos (4px, 8px, 12px, 16px, 24px, 32px, 48px). Não utilize valores arbitrários.
- **Padrão de Tokens:** Formato obrigatório: ${preset.tokens.format}.
- **Acessibilidade:** Conformidade WCAG 2.2 AA (contraste mínimo de 4.5:1 para texto regular).
- **Cobertura de Estados:** Sempre implemente os 4 estados de UI (Default, Empty, Loading/Skeleton, Error).
- **Governança:** Ações destrutivas e mudanças em tokens mestres requerem confirmação humana prévia.
- **Servidores MCP Disponíveis:** ${mcpServers}.
`;
        fs.writeFileSync(path.resolve(targetDir, 'copilot-instructions.md'), copilotContent, 'utf-8');
        console.log('  -> Compilado adaptador GitHub Copilot');
    }
    compileWindsurf(config, preset) {
        const targetDir = path.resolve(this.outputDir, 'windsurf');
        fs.mkdirSync(targetDir, { recursive: true });
        const windsurfRulesContent = `# .windsurfrules - Open UX Harness
# Profile: ${preset.id} (${preset.name})
You are an expert Principal Product Designer and UI Systems Engineer operating within Open UX Harness.

## Core Design Rules:
1. SPACING: Strictly use 8-point spatial grid (4px, 8px, 12px, 16px, 24px, 32px, 48px). No arbitrary margins or paddings.
2. COLOR CONTRAST: Ensure text colors have at least 4.5:1 contrast against surface background (WCAG 2.2 AA).
3. 4-STATES: When generating any UI screen or component, ALWAYS provide:
   - Default/Happy state
   - Empty state
   - Loading/Skeleton state
   - Error state with recovery CTA
4. DESIGN TOKENS: Format ${preset.tokens.format}. Never invent ad-hoc hex codes.

## Guardrails:
1. ZERO YOLO MODE: Ask confirmation before modifying master tokens ou alterações destrutivas.
2. REALITY GATE: Valide contra referências reais e evite padrões visuais proibidos.
3. SAVEPOINTS: Em caso de discrepância visual ou falha de linter, reverta para savepoint.
`;
        fs.writeFileSync(path.resolve(targetDir, '.windsurfrules'), windsurfRulesContent, 'utf-8');
        console.log('  -> Compilado adaptador Windsurf');
    }
    compileCodex(config, preset) {
        const targetDir = path.resolve(this.outputDir, 'codex');
        fs.mkdirSync(targetDir, { recursive: true });
        const serversToml = preset.mcpServers && preset.mcpServers.length > 0
            ? preset.mcpServers.map((s) => `"${s}"`).join(', ')
            : '';
        const codexContent = `# Open UX Harness - Codex Configuration
# Generated by AdapterCompiler for profile: ${preset.id}

[project]
name = "Open UX Harness"
profile = "${preset.id}"
description = "${preset.name}"

[design_system]
grid_system = "8pt"
a11y_standard = "WCAG 2.2 AA"
contrast_ratio = 4.5
required_states = ["default", "empty", "loading", "error"]
tokens_format = "${preset.tokens.format}"

[governance]
zero_yolo_mode = true
design_gate = true
confirm_master_tokens = true

[linter]
tokens = "npm run lint:tokens"
craft = "node --loader ts-node/esm core/craft-guardian-linter.ts"

[mcp]
servers = [${serversToml}]
`;
        fs.writeFileSync(path.resolve(targetDir, 'harness.toml'), codexContent, 'utf-8');
        console.log('  -> Compilado adaptador Codex');
    }
}
// Execução direta
const isMain = process.argv[1] && (process.argv[1].endsWith('build-adapters.ts') ||
    process.argv[1].endsWith('build-adapters.js'));
if (isMain) {
    const compiler = new AdapterCompiler();
    compiler.compileAll();
}
