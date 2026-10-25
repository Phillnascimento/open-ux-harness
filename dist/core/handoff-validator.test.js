/**
 * Open UX Harness — Testes Unitários do Validador de Envelope de Handoff
 * Testes baseados no runner nativo node:test e node:assert.
 */
import test from 'node:test';
import assert from 'node:assert';
import { validateHandoffEnvelope } from './handoff-validator.js';
const createValidEnvelope = () => ({
    from: '05-craft-and-accessibility',
    to: '06-zero-drift-handoff',
    phase: '06-zero-drift-handoff',
    taskId: 'TASK-104',
    priority: 'High',
    timestamp: '2026-10-25T16:00:00.000Z',
    context: {
        currentState: 'Auditoria de Craft e Acessibilidade aprovada com score 100/100.',
        relevantFiles: [
            '.harness/memory/craft-audit-state.json',
            'src/components/ui/Button.tsx',
        ],
        dependencies: ['tokens.json'],
        constraints: ['Proibido cores hexadecimais arbitrárias fora dos tokens'],
    },
    deliverableRequest: {
        description: 'Gerar especificação técnica de handoff com contrato TypeScript e Gherkin.',
        acceptanceCriteria: [
            'Contrato TypeScript cobrindo 100% das variantes do Figma',
            'Cenários Gherkin cobrindo os 8 estados de interface',
        ],
        referenceMaterials: ['references/zero-drift-component-contracts.md'],
    },
    qualityExpectations: {
        mustPass: [
            'Validação determinística por validate-handoff-spec.ts',
            'Zero valores mágicos ou hexadecimais soltos',
        ],
        evidenceRequired: [
            'Captura desktop (1440px)',
            'Captura mobile (375px)',
            'Relatório de auditoria WCAG AA',
        ],
        handoffToNext: '07-telemetry-and-impact',
    },
});
test('1. Envelope completo e válido retorna valid = true', () => {
    const envelope = createValidEnvelope();
    const result = validateHandoffEnvelope(envelope);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
});
test('2. Falta de campos de metadados reporta erro', () => {
    const invalid = createValidEnvelope();
    // @ts-expect-error teste com valor inválido
    delete invalid.from;
    invalid.to = '   ';
    invalid.phase = '';
    // @ts-expect-error teste com valor inválido
    invalid.taskId = 12345;
    const result = validateHandoffEnvelope(invalid);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((err) => err.includes('from')));
    assert.ok(result.errors.some((err) => err.includes('to')));
    assert.ok(result.errors.some((err) => err.includes('phase')));
    assert.ok(result.errors.some((err) => err.includes('taskId')));
});
test('3. Priority inválida reporta erro', () => {
    const invalidPriority = {
        ...createValidEnvelope(),
        priority: 'Urgent',
    };
    const result = validateHandoffEnvelope(invalidPriority);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((err) => err.includes('priority')), 'Deve reportar erro quando prioridade não for Critical, High, Medium ou Low');
    // Testar também com tipo numérico
    const numericPriority = {
        ...createValidEnvelope(),
        priority: 1,
    };
    const resultNumeric = validateHandoffEnvelope(numericPriority);
    assert.strictEqual(resultNumeric.valid, false);
    assert.ok(resultNumeric.errors.some((err) => err.includes('priority')));
});
test('4. Timestamp não-ISO reporta erro', () => {
    const invalidTimestamp = {
        ...createValidEnvelope(),
        timestamp: 'ontem-as-15h',
    };
    const result = validateHandoffEnvelope(invalidTimestamp);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((err) => err.includes('timestamp')), 'Deve reportar erro quando timestamp não for formato ISO reconhecível');
    const emptyTimestamp = {
        ...createValidEnvelope(),
        timestamp: '   ',
    };
    const resultEmpty = validateHandoffEnvelope(emptyTimestamp);
    assert.strictEqual(resultEmpty.valid, false);
    assert.ok(resultEmpty.errors.some((err) => err.includes('timestamp')));
});
test('5. acceptanceCriteria vazio ou ausente reporta erro', () => {
    const emptyCriteria = createValidEnvelope();
    emptyCriteria.deliverableRequest.acceptanceCriteria = [];
    const resultEmpty = validateHandoffEnvelope(emptyCriteria);
    assert.strictEqual(resultEmpty.valid, false);
    assert.ok(resultEmpty.errors.some((err) => err.includes('acceptanceCriteria')), 'Deve reportar erro para acceptanceCriteria vazio');
    const missingCriteria = createValidEnvelope();
    // @ts-expect-error teste com deleção
    delete missingCriteria.deliverableRequest.acceptanceCriteria;
    const resultMissing = validateHandoffEnvelope(missingCriteria);
    assert.strictEqual(resultMissing.valid, false);
    assert.ok(resultMissing.errors.some((err) => err.includes('acceptanceCriteria')));
});
test('6. relevantFiles ou evidenceRequired vazios reporta erro', () => {
    const emptyFiles = createValidEnvelope();
    emptyFiles.context.relevantFiles = [];
    const resultFiles = validateHandoffEnvelope(emptyFiles);
    assert.strictEqual(resultFiles.valid, false);
    assert.ok(resultFiles.errors.some((err) => err.includes('relevantFiles')), 'Deve reportar erro para relevantFiles vazio');
    const emptyEvidence = createValidEnvelope();
    emptyEvidence.qualityExpectations.evidenceRequired = [];
    const resultEvidence = validateHandoffEnvelope(emptyEvidence);
    assert.strictEqual(resultEvidence.valid, false);
    assert.ok(resultEvidence.errors.some((err) => err.includes('evidenceRequired')), 'Deve reportar erro para evidenceRequired vazio');
});
test('7. Entradas não-objeto ou nulas reportam erro imediato', () => {
    assert.strictEqual(validateHandoffEnvelope(null).valid, false);
    assert.strictEqual(validateHandoffEnvelope(undefined).valid, false);
    assert.strictEqual(validateHandoffEnvelope('string-invalida').valid, false);
    assert.strictEqual(validateHandoffEnvelope([1, 2, 3]).valid, false);
    assert.strictEqual(validateHandoffEnvelope(42).valid, false);
});
test('8. mustPass vazio e context.currentState ausente reportam erro', () => {
    const invalid = createValidEnvelope();
    invalid.qualityExpectations.mustPass = [];
    invalid.context.currentState = '';
    const result = validateHandoffEnvelope(invalid);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((err) => err.includes('mustPass')));
    assert.ok(result.errors.some((err) => err.includes('currentState')));
});
