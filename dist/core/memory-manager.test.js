import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { MemoryManager } from './memory-manager.js';
function createTempEnvironment() {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'memory-manager-test-'));
    const cleanup = () => {
        try {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        catch {
            // Ignora falhas de cleanup em ambiente de teste
        }
    };
    return { tempDir, cleanup };
}
test('1. createSavepoint cria cópia fiel dos arquivos de memória semântica, episódica e procedural com normalização de label', () => {
    const { tempDir, cleanup } = createTempEnvironment();
    try {
        const memory = new MemoryManager(tempDir);
        // Popula memória semântica, episódica e procedural
        const brandPath = path.resolve(tempDir, 'memory', 'semantic', 'brand-guidelines.md');
        fs.writeFileSync(brandPath, '# Brand Guidelines V1\nCor primária: #0F172A', 'utf-8');
        const okrsPath = path.resolve(tempDir, 'memory', 'semantic', 'product-okrs.md');
        fs.writeFileSync(okrsPath, '# Product OKRs V1\nNPS > 70', 'utf-8');
        memory.appendEpisodicLog({
            timestamp: '2026-10-25T16:00:00.000Z',
            featureName: 'Checkout Flow',
            problemStatement: 'Dropoff elevado no step 2',
            decisionSummary: 'Simplificar formulário em 1 coluna',
            learnedLessons: ['Formulários em coluna única aumentam conversão']
        });
        const checklistPath = path.resolve(tempDir, 'memory', 'procedural', 'craft-guardian-checklist.md');
        fs.writeFileSync(checklistPath, '# Craft Checklist\n- 8pt grid\n- Contrast 4.5:1', 'utf-8');
        // Executa criação do savepoint com caracteres especiais no label
        const rawLabel = '  Sprint #1: Briefing & Discovery! (v1.0)  ';
        const savepointPath = memory.createSavepoint(rawLabel);
        // Validações do caminho e normalização
        assert.ok(path.isAbsolute(savepointPath), 'Caminho do savepoint deve ser absoluto');
        assert.ok(fs.existsSync(savepointPath), 'Diretório do savepoint deve existir no disco');
        const dirName = path.basename(savepointPath);
        const expectedPrefix = 'sprint-1-briefing-discovery-v1-0-';
        assert.ok(dirName.startsWith(expectedPrefix), `Nome do diretório "${dirName}" deve iniciar com o label normalizado "${expectedPrefix}"`);
        // Valida fidelidade integral dos arquivos copiados
        const spBrand = path.resolve(savepointPath, 'semantic', 'brand-guidelines.md');
        const spOkrs = path.resolve(savepointPath, 'semantic', 'product-okrs.md');
        const spEpisodic = path.resolve(savepointPath, 'episodic', 'experiments-log.jsonl');
        const spProcedural = path.resolve(savepointPath, 'procedural', 'craft-guardian-checklist.md');
        assert.ok(fs.existsSync(spBrand), 'Arquivo de brand guidelines deve existir no savepoint');
        assert.strictEqual(fs.readFileSync(spBrand, 'utf-8'), '# Brand Guidelines V1\nCor primária: #0F172A');
        assert.ok(fs.existsSync(spOkrs), 'Arquivo de OKRs deve existir no savepoint');
        assert.strictEqual(fs.readFileSync(spOkrs, 'utf-8'), '# Product OKRs V1\nNPS > 70');
        assert.ok(fs.existsSync(spEpisodic), 'Arquivo de log episódico deve existir no savepoint');
        const episodicContent = fs.readFileSync(spEpisodic, 'utf-8');
        assert.ok(episodicContent.includes('Checkout Flow'), 'Log episódico deve conter a entrada copiada');
        assert.ok(fs.existsSync(spProcedural), 'Arquivo procedural deve existir no savepoint');
        assert.strictEqual(fs.readFileSync(spProcedural, 'utf-8'), '# Craft Checklist\n- 8pt grid\n- Contrast 4.5:1');
    }
    finally {
        cleanup();
    }
});
test('2. listSavepoints retorna a lista ordenada de savepoints por data decrescente', () => {
    const { tempDir, cleanup } = createTempEnvironment();
    try {
        const memory = new MemoryManager(tempDir);
        // Lista inicial vazia
        assert.deepStrictEqual(memory.listSavepoints(), []);
        // Cria múltiplos savepoints sequenciais
        const sp1 = memory.createSavepoint('checkpoint-alpha');
        const sp2 = memory.createSavepoint('checkpoint-beta');
        const sp3 = memory.createSavepoint('checkpoint-gamma');
        const list = memory.listSavepoints();
        assert.strictEqual(list.length, 3, 'Deve listar exatamente os 3 savepoints criados');
        // Validação da ordem decrescente (o mais recente primeiro: sp3, sp2, sp1)
        assert.strictEqual(list[0].label, 'checkpoint-gamma');
        assert.strictEqual(list[0].path, sp3);
        assert.strictEqual(list[1].label, 'checkpoint-beta');
        assert.strictEqual(list[1].path, sp2);
        assert.strictEqual(list[2].label, 'checkpoint-alpha');
        assert.strictEqual(list[2].path, sp1);
        // Validação dos timestamps ISO e ordenação estrita
        for (const item of list) {
            assert.ok(typeof item.timestamp === 'string', 'Timestamp deve ser string');
            assert.ok(!isNaN(Date.parse(item.timestamp)), 'Timestamp deve ser uma data ISO válida');
        }
        const t0 = new Date(list[0].timestamp).getTime();
        const t1 = new Date(list[1].timestamp).getTime();
        const t2 = new Date(list[2].timestamp).getTime();
        assert.ok(t0 >= t1, 'Primeiro savepoint deve ser mais recente ou igual ao segundo');
        assert.ok(t1 >= t2, 'Segundo savepoint deve ser mais recente ou igual ao terceiro');
    }
    finally {
        cleanup();
    }
});
test('3. AC-ME1: Escrever -> savepoint -> escrever mais -> rollback restaura fielmente o estado do savepoint', () => {
    const { tempDir, cleanup } = createTempEnvironment();
    try {
        const memory = new MemoryManager(tempDir);
        // 1. Estado inicial V1
        const brandPath = path.resolve(tempDir, 'memory', 'semantic', 'brand-guidelines.md');
        fs.writeFileSync(brandPath, 'Cor original: #000000', 'utf-8');
        memory.appendEpisodicLog({
            timestamp: '2026-10-25T16:00:00.000Z',
            featureName: 'Feature 1',
            problemStatement: 'Problema 1',
            decisionSummary: 'Decisao 1',
            learnedLessons: ['Licao 1']
        });
        // 2. Cria savepoint do estado V1
        const savepointPath = memory.createSavepoint('milestone-1');
        // 3. Escreve mais (Estado V2 com mutações e arquivos adicionais)
        fs.writeFileSync(brandPath, 'Cor modificada: #FFFFFF', 'utf-8');
        memory.appendEpisodicLog({
            timestamp: '2026-10-25T16:10:00.000Z',
            featureName: 'Feature 2',
            problemStatement: 'Problema 2',
            decisionSummary: 'Decisao 2',
            learnedLessons: ['Licao 2']
        });
        const extraFile = path.resolve(tempDir, 'memory', 'semantic', 'extra-unwanted.md');
        fs.writeFileSync(extraFile, 'Este arquivo foi adicionado após o savepoint', 'utf-8');
        // Verifica que o estado atual realmente tem 2 entradas e a cor modificada
        const currentLessons = memory.getRecentEpisodicLessons(10);
        assert.strictEqual(currentLessons.length, 2);
        assert.strictEqual(fs.readFileSync(brandPath, 'utf-8'), 'Cor modificada: #FFFFFF');
        assert.ok(fs.existsSync(extraFile));
        // 4. Executa rollback para milestone-1
        const rollbackResult = memory.rollback('milestone-1');
        assert.strictEqual(rollbackResult, true, 'Rollback deve retornar true');
        // 5. Verifica restauração fiel do estado V1
        assert.strictEqual(fs.readFileSync(brandPath, 'utf-8'), 'Cor original: #000000');
        const restoredLessons = memory.getRecentEpisodicLessons(10);
        assert.strictEqual(restoredLessons.length, 1, 'Deve conter apenas a lição do savepoint V1');
        assert.strictEqual(restoredLessons[0].featureName, 'Feature 1');
        assert.strictEqual(fs.existsSync(extraFile), false, 'Arquivo criado após o savepoint não deve existir após o rollback');
    }
    finally {
        cleanup();
    }
});
test('4. AC-ME2: Rollback de label inexistente lança erro explícito sem corromper a memória atual', () => {
    const { tempDir, cleanup } = createTempEnvironment();
    try {
        const memory = new MemoryManager(tempDir);
        // Estado inicial
        const brandPath = path.resolve(tempDir, 'memory', 'semantic', 'brand-guidelines.md');
        fs.writeFileSync(brandPath, 'Conteudo intocado', 'utf-8');
        memory.createSavepoint('existente');
        // Tentativa de rollback para label inexistente
        assert.throws(() => {
            memory.rollback('inexistente-xyz');
        }, (err) => {
            assert.strictEqual(err.message, "Savepoint com label 'inexistente-xyz' não encontrado.");
            return true;
        });
        // Confirma que a memória atual permaneceu íntegra e idêntica
        assert.strictEqual(fs.readFileSync(brandPath, 'utf-8'), 'Conteudo intocado');
        // Confirma que nenhum savepoint de segurança indesejado foi criado
        const savepoints = memory.listSavepoints();
        assert.strictEqual(savepoints.length, 1, 'Deve permanecer apenas o savepoint existente original');
        assert.strictEqual(savepoints[0].label, 'existente');
    }
    finally {
        cleanup();
    }
});
test('5. rollback cria savepoint automático de segurança pre-rollback-<timestamp> antes de restaurar e não apaga o savepoint de origem', () => {
    const { tempDir, cleanup } = createTempEnvironment();
    try {
        const memory = new MemoryManager(tempDir);
        // Estado V1
        const brandPath = path.resolve(tempDir, 'memory', 'semantic', 'brand-guidelines.md');
        fs.writeFileSync(brandPath, 'Versao 1', 'utf-8');
        const v1Path = memory.createSavepoint('versao-1');
        // Estado V2
        fs.writeFileSync(brandPath, 'Versao 2 (antes de quebrar)', 'utf-8');
        // Executa rollback para versao-1
        memory.rollback('versao-1');
        // Valida que o savepoint de origem ainda existe no disco (NUNCA apagado)
        assert.ok(fs.existsSync(v1Path), 'Savepoint de origem versao-1 deve continuar existindo');
        // Valida que um savepoint pre-rollback foi criado automaticamente
        const savepoints = memory.listSavepoints();
        const preRollbackSp = savepoints.find(sp => sp.label === 'pre-rollback');
        assert.ok(preRollbackSp, 'Deve existir um savepoint com label pre-rollback');
        assert.ok(fs.existsSync(preRollbackSp.path), 'Diretório do pre-rollback deve existir no disco');
        // O savepoint pre-rollback deve conter o estado V2 preservado
        const preRollbackBrand = path.resolve(preRollbackSp.path, 'semantic', 'brand-guidelines.md');
        assert.ok(fs.existsSync(preRollbackBrand));
        assert.strictEqual(fs.readFileSync(preRollbackBrand, 'utf-8'), 'Versao 2 (antes de quebrar)', 'O savepoint de segurança deve conter o estado exatamente anterior ao rollback');
    }
    finally {
        cleanup();
    }
});
test('6. rollback restaura o savepoint mais recente quando há múltiplos savepoints com o mesmo label', () => {
    const { tempDir, cleanup } = createTempEnvironment();
    try {
        const memory = new MemoryManager(tempDir);
        const brandPath = path.resolve(tempDir, 'memory', 'semantic', 'brand-guidelines.md');
        // Iteração 1 com label 'checkpoint'
        fs.writeFileSync(brandPath, 'Versao Checkpoint A', 'utf-8');
        memory.createSavepoint('checkpoint');
        // Iteração 2 com mesmo label 'checkpoint'
        fs.writeFileSync(brandPath, 'Versao Checkpoint B (mais recente)', 'utf-8');
        memory.createSavepoint('checkpoint');
        // Iteração 3: mutação posterior
        fs.writeFileSync(brandPath, 'Versao Checkpoint C (descartavel)', 'utf-8');
        // Rollback para 'checkpoint' deve escolher a Versao B
        memory.rollback('checkpoint');
        assert.strictEqual(fs.readFileSync(brandPath, 'utf-8'), 'Versao Checkpoint B (mais recente)', 'Rollback deve restaurar a instância mais recente do label duplicado');
    }
    finally {
        cleanup();
    }
});
test('7. AC-ME4: Preserva todos os métodos existentes de MemoryManager (semântica, episódica e procedural)', () => {
    const { tempDir, cleanup } = createTempEnvironment();
    try {
        const memory = new MemoryManager(tempDir);
        // 1. Semantic Context
        const semanticBefore = memory.getSemanticContext();
        assert.ok(semanticBefore.includes('# SEMANTIC MEMORY'));
        fs.writeFileSync(path.resolve(tempDir, 'memory', 'semantic', 'brand-guidelines.md'), 'Regra de Marca: Azul e Branco');
        fs.writeFileSync(path.resolve(tempDir, 'memory', 'semantic', 'product-okrs.md'), 'OKR: Reduzir churn para 2%');
        const semanticAfter = memory.getSemanticContext();
        assert.ok(semanticAfter.includes('Regra de Marca: Azul e Branco'));
        assert.ok(semanticAfter.includes('OKR: Reduzir churn para 2%'));
        // 2. Episodic Log & Lessons
        assert.deepStrictEqual(memory.getRecentEpisodicLessons(), []);
        memory.appendEpisodicLog({
            timestamp: '2026-10-25T16:00:00.000Z',
            featureName: 'Navigation Redesign',
            problemStatement: 'Usuários não encontram sub-menus',
            decisionSummary: 'Adicionar drawer lateral acessível',
            outcomeMetric: 'Tempo de tarefa reduzido em 35%',
            learnedLessons: ['Drawers acessíveis reduzem carga cognitiva', 'A11y melhora usabilidade geral']
        });
        const lessons = memory.getRecentEpisodicLessons(5);
        assert.strictEqual(lessons.length, 1);
        assert.strictEqual(lessons[0].featureName, 'Navigation Redesign');
        assert.strictEqual(lessons[0].learnedLessons.length, 2);
        // 3. Procedural Checklist
        const defaultChecklist = memory.getProceduralChecklist();
        assert.ok(defaultChecklist.includes('8pt Grid'));
        assert.ok(defaultChecklist.includes('WCAG 2.2 AA Contrast'));
        fs.writeFileSync(path.resolve(tempDir, 'memory', 'procedural', 'craft-guardian-checklist.md'), '# Custom Checklist\n- 8pt grid\n- Contrast 7:1');
        const customChecklist = memory.getProceduralChecklist();
        assert.strictEqual(customChecklist, '# Custom Checklist\n- 8pt grid\n- Contrast 7:1');
    }
    finally {
        cleanup();
    }
});
