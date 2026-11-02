import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { listAvailable, installSelective } from './install.js';
import { runCli } from './cli.js';
test('1. listAvailable retorna catálogo com as 8 plataformas e 25 skills', () => {
    const catalog = listAvailable();
    assert.strictEqual(catalog.platforms.length, 8, 'Deve retornar exatamente 8 plataformas suportadas');
    assert.strictEqual(catalog.skills.length, 25, 'Deve retornar exatamente as 25 skills ativas');
    const expectedPlatforms = [
        'antigravity',
        'claude-code',
        'cursor',
        'terminal-cli',
        'gemini-cli',
        'copilot',
        'windsurf',
        'codex'
    ];
    for (const expected of expectedPlatforms) {
        assert.ok(catalog.platforms.includes(expected), `Plataforma '${expected}' deve estar presente no catálogo`);
    }
    const expectedKeySkills = [
        '00-skill-architect',
        '03-design-tokens',
        '05-craft-and-accessibility',
        '08-reality-gate',
        'li-post',
        'li-audit'
    ];
    for (const expectedSkill of expectedKeySkills) {
        assert.ok(catalog.skills.includes(expectedSkill), `Skill '${expectedSkill}' deve estar presente no catálogo`);
    }
});
test('2. AC-IN1: dryRun: true calcula targetPaths sem criar arquivos no disco', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-dryrun-test-'));
    try {
        const result = installSelective({
            platform: 'cursor',
            dryRun: true,
            baseDir: tempDir
        });
        assert.strictEqual(result.dryRun, true, 'dryRun deve ser true');
        assert.strictEqual(result.success, true, 'success deve ser true');
        assert.strictEqual(result.platform, 'cursor');
        assert.ok(result.targetPaths.length > 0, 'Deve ter calculado caminhos de destino');
        // Garante que nenhum dos caminhos calculados existe no disco
        for (const targetPath of result.targetPaths) {
            assert.strictEqual(fs.existsSync(targetPath), false, `Arquivo em dry-run não deve existir no disco: ${targetPath}`);
        }
        // Garante que o diretório temporário permaneceu vazio
        const filesInTemp = fs.readdirSync(tempDir);
        assert.strictEqual(filesInTemp.length, 0, 'Nenhum arquivo ou pasta deve ser criado em dry-run');
    }
    finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
});
test('3. AC-IN2: Plataforma inválida lança erro com mensagem explicativa', () => {
    assert.throws(() => {
        installSelective({ platform: 'plataforma-inexistente-xyz' });
    }, (err) => {
        assert.ok(err instanceof Error, 'Deve lançar uma instância de Error');
        assert.match(err.message, /plataforma-inexistente-xyz/i, 'Mensagem deve mencionar a plataforma inválida informada');
        assert.match(err.message, /terminal-cli|cursor|antigravity/i, 'Mensagem deve listar as plataformas válidas disponíveis');
        return true;
    });
});
test('4. AC-IN2: Skill inválida lança erro com lista de skills válidas', () => {
    assert.throws(() => {
        installSelective({
            platform: 'terminal-cli',
            skills: ['skill-fantasma-inexistente']
        });
    }, (err) => {
        assert.ok(err instanceof Error, 'Deve lançar uma instância de Error');
        assert.match(err.message, /skill-fantasma-inexistente/i, 'Mensagem deve mencionar a skill inválida informada');
        assert.match(err.message, /00-skill-architect|05-craft-and-accessibility/i, 'Mensagem deve listar skills válidas disponíveis');
        return true;
    });
});
test('5. Instalação com subset de skills calcula corretamente installedSkills', () => {
    const chosenSkills = ['01-briefing-discovery', '03-design-tokens'];
    const result = installSelective({
        platform: 'antigravity',
        skills: chosenSkills,
        dryRun: true
    });
    assert.deepStrictEqual(result.installedSkills, chosenSkills, 'installedSkills deve conter apenas o subset selecionado');
    assert.strictEqual(result.targetPaths.length, 2, 'Antigravity per-agent deve gerar 1 caminho por skill selecionada');
    const hasBriefing = result.targetPaths.some(p => p.includes('01-briefing-discovery'));
    const hasTokens = result.targetPaths.some(p => p.includes('03-design-tokens'));
    assert.ok(hasBriefing, 'targetPaths deve incluir caminho para 01-briefing-discovery');
    assert.ok(hasTokens, 'targetPaths deve incluir caminho para 03-design-tokens');
});
test('6. Instalação com dryRun: false cria diretórios e arquivos de destino no disco', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-install-test-'));
    try {
        const result = installSelective({
            platform: 'terminal-cli',
            skills: ['05-craft-and-accessibility'],
            dryRun: false,
            baseDir: tempDir
        });
        assert.strictEqual(result.dryRun, false);
        assert.strictEqual(result.success, true);
        assert.ok(result.targetPaths.length > 0, 'Deve ter targetPaths gerados');
        for (const targetPath of result.targetPaths) {
            assert.strictEqual(fs.existsSync(targetPath), true, `Arquivo de destino deve ter sido criado no disco: ${targetPath}`);
        }
    }
    finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
});
test('7. AC-IN3: Comandos list e install acessíveis via CLI', async () => {
    // Testa comando list sem exceções
    await assert.doesNotReject(async () => {
        await runCli(['list']);
    }, 'Comando list deve executar com sucesso');
    // Testa comando install com dry-run e argumentos
    await assert.doesNotReject(async () => {
        await runCli(['install', '--platform', 'terminal-cli', '--skills', '03-design-tokens,05-craft-and-accessibility', '--dry-run']);
    }, 'Comando install deve executar com sucesso no CLI');
});
test('8. Instalação padrão sem argumentos usa terminal-cli e todas as 25 skills', () => {
    const result = installSelective({ dryRun: true });
    assert.strictEqual(result.platform, 'terminal-cli', 'Default deve ser terminal-cli');
    assert.strictEqual(result.installedSkills.length, 25, 'Deve instalar todas as 25 skills quando omitido');
    assert.strictEqual(result.dryRun, true);
    assert.strictEqual(result.success, true);
});
test('9. Suporte a prefixos de skills (ex: 03 mapeia para 03-design-tokens)', () => {
    const result = installSelective({
        platform: 'claude-code',
        skills: ['03', '05'],
        dryRun: true
    });
    assert.deepStrictEqual(result.installedSkills, ['03-design-tokens', '05-craft-and-accessibility'], 'Prefixos devem ser expandidos para as skills correspondentes');
    assert.strictEqual(result.targetPaths.length, 2);
});
