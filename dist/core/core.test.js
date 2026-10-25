import test from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { ConfigLoader } from './config-loader.js';
import { ContextEngine } from './context-engine.js';
import { GuardrailsEngine } from './guardrails.js';
import { CraftGuardianLinter } from './craft-guardian-linter.js';
import { DesignTokensLinter } from './lint-tokens.js';
const baseDir = path.resolve(process.cwd());
test('ConfigLoader deve carregar harness.config.json e preset freelance corretamente', () => {
    const loader = new ConfigLoader(baseDir);
    const { config, preset } = loader.getResolvedConfiguration();
    assert.strictEqual(config.profile, 'freelance');
    assert.strictEqual(preset.id, 'freelance');
    assert.ok(preset.mcpServers.includes('figma'));
    assert.ok(preset.mcpServers.includes('a11y-scanner'));
});
test('ContextEngine deve realizar MCP Pruning reduzindo servidores no contexto', () => {
    const engine = new ContextEngine(baseDir);
    const result = engine.pruneForSkill('05-craft-and-accessibility');
    assert.strictEqual(result.activeSkill, '05-craft-and-accessibility');
    assert.ok(result.activeServers['a11y-scanner'], 'a11y-scanner deve estar ativo');
    assert.ok(!result.activeServers['posthog'], 'posthog deve ter sido podado (pruned)');
    assert.ok(result.tokenSavingsEstimatePercentage > 50, 'Economia de tokens deve ser superior a 50%');
});
test('GuardrailsEngine deve bloquear ações destrutivas (DENY) e solicitar aprovação para tokens mestres (ASK)', () => {
    const guard = new GuardrailsEngine(true, true);
    const denyResult = guard.evaluateAction('delete_master_tokens');
    assert.strictEqual(denyResult.level, 'DENY');
    assert.strictEqual(denyResult.blocked, true);
    const askResult = guard.evaluateAction('modify_global_tokens');
    assert.strictEqual(askResult.level, 'ASK');
    assert.strictEqual(askResult.requiresPromptToUser, true);
    const allowResult = guard.evaluateAction('read_component_spec');
    assert.strictEqual(allowResult.level, 'ALLOW');
    assert.strictEqual(allowResult.blocked, false);
});
test('CraftGuardianLinter deve calcular contraste WCAG e validar grid de 8px', () => {
    // Teste de Contraste: Slate 900 (#0F172A) sobre Branco (#FFFFFF) tem contraste > 15:1
    const ratioHigh = CraftGuardianLinter.calculateContrastRatio('#0F172A', '#FFFFFF');
    assert.ok(ratioHigh >= 7.0, `Contraste deve ser alto, obtido: ${ratioHigh}`);
    // Teste de Contraste Baixo: Cinza claro (#CBD5E1) sobre Branco (#FFFFFF) tem contraste < 2:1
    const ratioLow = CraftGuardianLinter.calculateContrastRatio('#CBD5E1', '#FFFFFF');
    assert.ok(ratioLow < 3.0, `Contraste deve ser baixo, obtido: ${ratioLow}`);
    // Teste de Grid
    assert.strictEqual(CraftGuardianLinter.validateSpacing(16), true);
    assert.strictEqual(CraftGuardianLinter.validateSpacing(12), true); // defensivo 4px
    assert.strictEqual(CraftGuardianLinter.validateSpacing(13), false); // violação
    const linter = new CraftGuardianLinter();
    const audit = linter.auditComponent({
        textColorHex: '#0F172A',
        bgColorHex: '#FFFFFF',
        paddingPx: [16, 24],
        statesCovered: ['default', 'empty', 'loading', 'error']
    });
    assert.strictEqual(audit.passed, true);
    assert.strictEqual(audit.score, 100);
});
test('DesignTokensLinter deve validar template de tokens W3C DTCG', () => {
    const tokenPath = path.resolve(baseDir, 'templates', 'tokens-starter.json');
    const res = DesignTokensLinter.validateTokenFile(tokenPath);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.format, 'w3c-dtcg');
    assert.ok(res.totalTokens > 5, 'Deve conter mais de 5 tokens');
});
