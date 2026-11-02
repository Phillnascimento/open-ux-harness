import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { AdapterCompiler } from './build-adapters.js';
test('1. platforms.json contém todas as 8 plataformas mapeadas com campos válidos', () => {
    const compiler = new AdapterCompiler();
    const platforms = compiler.getPlatforms();
    assert.strictEqual(platforms.length, 8, 'Deve conter exatamente 8 plataformas suportadas');
    const expectedIds = [
        'antigravity',
        'claude-code',
        'cursor',
        'terminal-cli',
        'gemini-cli',
        'copilot',
        'windsurf',
        'codex'
    ];
    const platformMap = new Map();
    for (const p of platforms) {
        platformMap.set(p.id, p);
    }
    for (const expectedId of expectedIds) {
        const p = platformMap.get(expectedId);
        assert.ok(p, `Plataforma ${expectedId} deve estar presente em platforms.json`);
        assert.strictEqual(typeof p.label, 'string', `${expectedId} deve ter label do tipo string`);
        assert.ok(p.label.length > 0, `${expectedId} deve ter label não vazio`);
        assert.strictEqual(typeof p.format, 'string', `${expectedId} deve ter format do tipo string`);
        assert.ok(p.format.length > 0, `${expectedId} deve ter format não vazio`);
        assert.ok(p.installKind === 'per-agent' || p.installKind === 'roster', `${expectedId} installKind deve ser 'per-agent' ou 'roster', recebido: ${p.installKind}`);
        assert.ok(p.dest, `${expectedId} deve possuir objeto dest`);
        assert.ok(Array.isArray(p.dest.user), `${expectedId} dest.user deve ser array`);
        assert.ok(Array.isArray(p.dest.project), `${expectedId} dest.project deve ser array`);
    }
});
test('2. AC-PL1: Compilação dos 4 adaptadores originais preserva funcionamento e integridade', () => {
    const compiler = new AdapterCompiler();
    compiler.compileAll(['antigravity', 'claude-code', 'cursor', 'terminal-cli']);
    const baseDist = path.resolve(process.cwd(), 'dist', 'adapters');
    // Antigravity
    const agentRulesPath = path.resolve(baseDist, 'antigravity', '.agentrules');
    assert.ok(fs.existsSync(agentRulesPath), 'dist/adapters/antigravity/.agentrules deve existir');
    const agentRules = fs.readFileSync(agentRulesPath, 'utf-8');
    assert.match(agentRules, /OPEN UX HARNESS - ANTIGRAVITY AGENT RULES/);
    assert.match(agentRules, /Craft Guardian/);
    assert.match(agentRules, /Diretrizes de Comportamento/);
    const antigravityMcpPath = path.resolve(baseDist, 'antigravity', 'mcp_config.json');
    assert.ok(fs.existsSync(antigravityMcpPath), 'dist/adapters/antigravity/mcp_config.json deve existir');
    const antigravityMcp = JSON.parse(fs.readFileSync(antigravityMcpPath, 'utf-8'));
    assert.ok(antigravityMcp.mcpServers, 'mcp_config.json deve conter chave mcpServers');
    // Claude Code
    const claudeMdPath = path.resolve(baseDist, 'claude-code', 'CLAUDE.md');
    assert.ok(fs.existsSync(claudeMdPath), 'dist/adapters/claude-code/CLAUDE.md deve existir');
    const claudeMd = fs.readFileSync(claudeMdPath, 'utf-8');
    assert.match(claudeMd, /CLAUDE\.md - Open UX Harness Context/);
    assert.match(claudeMd, /Grid de 8 Pontos/);
    assert.match(claudeMd, /Acessibilidade Inegociável/);
    const claudeMcpPath = path.resolve(baseDist, 'claude-code', '.mcp.json');
    assert.ok(fs.existsSync(claudeMcpPath), 'dist/adapters/claude-code/.mcp.json deve existir');
    const claudeMcp = JSON.parse(fs.readFileSync(claudeMcpPath, 'utf-8'));
    assert.ok(claudeMcp.mcpServers, '.mcp.json deve conter mcpServers');
    // Claude Code Plugin Manifests (Inspirado no blader/humanizer)
    const claudePluginPath = path.resolve(baseDist, 'claude-code', '.claude-plugin', 'plugin.json');
    assert.ok(fs.existsSync(claudePluginPath), 'dist/adapters/claude-code/.claude-plugin/plugin.json deve existir');
    const claudePlugin = JSON.parse(fs.readFileSync(claudePluginPath, 'utf-8'));
    assert.strictEqual(claudePlugin.name, 'open-ux-harness');
    assert.ok(Array.isArray(claudePlugin.skills));
    const claudeMarketplacePath = path.resolve(baseDist, 'claude-code', '.claude-plugin', 'marketplace.json');
    assert.ok(fs.existsSync(claudeMarketplacePath), 'dist/adapters/claude-code/.claude-plugin/marketplace.json deve existir');
    const claudeMarketplace = JSON.parse(fs.readFileSync(claudeMarketplacePath, 'utf-8'));
    assert.ok(Array.isArray(claudeMarketplace.plugins));
    // Cursor
    const cursorRulesPath = path.resolve(baseDist, 'cursor', '.cursorrules');
    assert.ok(fs.existsSync(cursorRulesPath), 'dist/adapters/cursor/.cursorrules deve existir');
    const cursorRules = fs.readFileSync(cursorRulesPath, 'utf-8');
    assert.match(cursorRules, /8-point spatial grid/);
    assert.match(cursorRules, /4-STATES/);
    // Cursor Plugin Manifest (Inspirado no blader/humanizer)
    const cursorPluginPath = path.resolve(baseDist, 'cursor', '.cursor-plugin', 'plugin.json');
    assert.ok(fs.existsSync(cursorPluginPath), 'dist/adapters/cursor/.cursor-plugin/plugin.json deve existir');
    const cursorPlugin = JSON.parse(fs.readFileSync(cursorPluginPath, 'utf-8'));
    assert.strictEqual(cursorPlugin.name, 'open-ux-harness');
    // Terminal CLI
    const terminalCliPath = path.resolve(baseDist, 'terminal-cli', 'harness-runtime.json');
    assert.ok(fs.existsSync(terminalCliPath), 'dist/adapters/terminal-cli/harness-runtime.json deve existir');
    const cliRuntime = JSON.parse(fs.readFileSync(terminalCliPath, 'utf-8'));
    assert.ok(cliRuntime.profile, 'harness-runtime.json deve ter campo profile');
    assert.ok(Array.isArray(cliRuntime.activeSkills), 'harness-runtime.json deve ter activeSkills array');
});
test('3. AC-PL2: Compilação dos 4 novos adaptadores gera seus artefatos nativos correspondentes', () => {
    const compiler = new AdapterCompiler();
    compiler.compileAll(['gemini-cli', 'copilot', 'windsurf', 'codex']);
    const baseDist = path.resolve(process.cwd(), 'dist', 'adapters');
    // 1. Gemini CLI: GEMINI.md com regras de conduta, MCP e Craft Guardian
    const geminiPath = path.resolve(baseDist, 'gemini-cli', 'GEMINI.md');
    assert.ok(fs.existsSync(geminiPath), 'dist/adapters/gemini-cli/GEMINI.md deve existir');
    const geminiContent = fs.readFileSync(geminiPath, 'utf-8');
    assert.match(geminiContent, /GEMINI\.md - Open UX Harness Context/);
    assert.match(geminiContent, /Craft Guardian/);
    assert.match(geminiContent, /Integração MCP/);
    assert.match(geminiContent, /Grid de 8 Pontos/);
    // 2. Copilot: copilot-instructions.md com diretrizes do preset ativo
    const copilotPath = path.resolve(baseDist, 'copilot', 'copilot-instructions.md');
    assert.ok(fs.existsSync(copilotPath), 'dist/adapters/copilot/copilot-instructions.md deve existir');
    const copilotContent = fs.readFileSync(copilotPath, 'utf-8');
    assert.match(copilotContent, /GitHub Copilot Custom Instructions/);
    assert.match(copilotContent, /Diretrizes do Preset Ativo/);
    assert.match(copilotContent, /WCAG 2\.2 AA/);
    // 3. Windsurf: .windsurfrules com regras de design e guardrails
    const windsurfPath = path.resolve(baseDist, 'windsurf', '.windsurfrules');
    assert.ok(fs.existsSync(windsurfPath), 'dist/adapters/windsurf/.windsurfrules deve existir');
    const windsurfContent = fs.readFileSync(windsurfPath, 'utf-8');
    assert.match(windsurfContent, /\.windsurfrules - Open UX Harness/);
    assert.match(windsurfContent, /Core Design Rules/);
    assert.match(windsurfContent, /Guardrails/);
    assert.match(windsurfContent, /ZERO YOLO MODE/);
    // 4. Codex: harness.toml com configuração de instruções e linter
    const codexPath = path.resolve(baseDist, 'codex', 'harness.toml');
    assert.ok(fs.existsSync(codexPath), 'dist/adapters/codex/harness.toml deve existir');
    const codexContent = fs.readFileSync(codexPath, 'utf-8');
    assert.match(codexContent, /\[project\]/);
    assert.match(codexContent, /\[design_system\]/);
    assert.match(codexContent, /\[governance\]/);
    assert.match(codexContent, /\[linter\]/);
    assert.match(codexContent, /\[mcp\]/);
});
test('4. AC-PL3: AdapterCompiler.compileAll compila todas as 8 plataformas simultaneamente', () => {
    const compiler = new AdapterCompiler();
    compiler.compileAll();
    const baseDist = path.resolve(process.cwd(), 'dist', 'adapters');
    const expectedOutputs = [
        path.resolve(baseDist, 'antigravity', '.agentrules'),
        path.resolve(baseDist, 'antigravity', 'mcp_config.json'),
        path.resolve(baseDist, 'claude-code', 'CLAUDE.md'),
        path.resolve(baseDist, 'claude-code', '.mcp.json'),
        path.resolve(baseDist, 'cursor', '.cursorrules'),
        path.resolve(baseDist, 'terminal-cli', 'harness-runtime.json'),
        path.resolve(baseDist, 'gemini-cli', 'GEMINI.md'),
        path.resolve(baseDist, 'copilot', 'copilot-instructions.md'),
        path.resolve(baseDist, 'windsurf', '.windsurfrules'),
        path.resolve(baseDist, 'codex', 'harness.toml')
    ];
    for (const filePath of expectedOutputs) {
        assert.ok(fs.existsSync(filePath), `Arquivo esperado deve existir após compileAll: ${filePath}`);
        const stat = fs.statSync(filePath);
        assert.ok(stat.size > 0, `Arquivo gerado não deve estar vazio: ${filePath}`);
    }
});
test('5. Métodos auxiliares getPlatforms, getPlatform e compilação pontual', () => {
    const compiler = new AdapterCompiler();
    const gemini = compiler.getPlatform('gemini-cli');
    assert.ok(gemini, 'Plataforma gemini-cli deve ser encontrada por getPlatform');
    assert.strictEqual(gemini.id, 'gemini-cli');
    assert.strictEqual(gemini.format, 'gemini-md');
    assert.strictEqual(gemini.installKind, 'per-agent');
    const windsurf = compiler.getPlatform('windsurf');
    assert.ok(windsurf, 'Plataforma windsurf deve ser encontrada por getPlatform');
    assert.strictEqual(windsurf.format, 'windsurf-rules');
    assert.strictEqual(windsurf.installKind, 'roster');
    const unknown = compiler.getPlatform('inexistente');
    assert.strictEqual(unknown, undefined, 'Plataforma inexistente deve retornar undefined');
});
