import test from 'node:test';
import assert from 'node:assert/strict';
import { RealityGate } from './reality-gate.js';
test('RealityGate — 1. Finding critical gera HOLD', () => {
    const gate = new RealityGate();
    const input = {
        craftPassed: true,
        craftScore: 92,
        claimedStates: ['default', 'empty', 'loading', 'error'],
        evidence: [
            { kind: 'screenshot', viewport: 'desktop', path: 'evidence/desktop.png' },
            { kind: 'screenshot', viewport: 'tablet', path: 'evidence/tablet.png' },
            { kind: 'screenshot', viewport: 'mobile', path: 'evidence/mobile.png' },
        ],
        findings: [
            { severity: 'critical', message: 'Contraste de texto abaixo do mínimo legal WCAG (2.1:1)' },
        ],
        designContractPath: 'contracts/checkout.md',
    };
    const result = gate.evaluate(input);
    assert.strictEqual(result.verdict, 'HOLD');
    assert.ok(result.reasons.some((r) => r.includes('violação(ões) crítica(s)')));
    assert.strictEqual(result.suspiciousPerfectScore, false);
});
test('RealityGate — 2. craftPassed false gera HOLD', () => {
    const gate = new RealityGate();
    const input = {
        craftPassed: false,
        craftScore: 60,
        claimedStates: ['default', 'empty', 'loading', 'error'],
        evidence: [
            { kind: 'screenshot', viewport: 'desktop', path: 'evidence/desktop.png' },
            { kind: 'screenshot', viewport: 'tablet', path: 'evidence/tablet.png' },
            { kind: 'screenshot', viewport: 'mobile', path: 'evidence/mobile.png' },
        ],
        findings: [],
        designContractPath: 'contracts/checkout.md',
    };
    const result = gate.evaluate(input);
    assert.strictEqual(result.verdict, 'HOLD');
    assert.ok(result.reasons.some((r) => r.includes('Craft Guardian não aprovado')));
});
test('RealityGate — 3. Falta de screenshot mobile/tablet/desktop gera HOLD e lista em missingEvidence', () => {
    const gate = new RealityGate();
    const input = {
        craftPassed: true,
        craftScore: 95,
        claimedStates: ['default', 'empty', 'loading', 'error'],
        evidence: [
            // Apenas desktop fornecido; faltam tablet e mobile
            { kind: 'screenshot', viewport: 'desktop', path: 'evidence/desktop.png' },
        ],
        findings: [],
        designContractPath: 'contracts/checkout.md',
    };
    const result = gate.evaluate(input);
    assert.strictEqual(result.verdict, 'HOLD');
    assert.ok(result.missingEvidence.includes('screenshot:tablet'));
    assert.ok(result.missingEvidence.includes('screenshot:mobile'));
    assert.ok(!result.missingEvidence.includes('screenshot:desktop'));
    assert.ok(result.reasons.some((r) => r.includes('Evidência visual incompleta')));
});
test('RealityGate — 4. Falta de estado de interface obrigatório gera HOLD', () => {
    const gate = new RealityGate();
    const input = {
        craftPassed: true,
        craftScore: 95,
        // Faltam os estados 'empty' e 'error'
        claimedStates: ['default', 'loading'],
        evidence: [
            { kind: 'screenshot', viewport: 'desktop', path: 'evidence/desktop.png' },
            { kind: 'screenshot', viewport: 'tablet', path: 'evidence/tablet.png' },
            { kind: 'screenshot', viewport: 'mobile', path: 'evidence/mobile.png' },
        ],
        findings: [],
        designContractPath: 'contracts/checkout.md',
    };
    const result = gate.evaluate(input);
    assert.strictEqual(result.verdict, 'HOLD');
    assert.ok(result.reasons.some((r) => r.includes('Cobertura de estados incompleta')));
    assert.ok(result.reasons.some((r) => r.includes('empty') && r.includes('error')));
});
test('RealityGate — 5. Score 100 sem contra-prova completa gera HOLD (suspiciousPerfectScore = true)', () => {
    const gate = new RealityGate();
    const input = {
        craftPassed: true,
        craftScore: 100,
        claimedStates: ['default', 'empty', 'loading', 'error'],
        evidence: [
            { kind: 'screenshot', viewport: 'desktop', path: 'evidence/desktop.png' },
            { kind: 'screenshot', viewport: 'tablet', path: 'evidence/tablet.png' },
            { kind: 'screenshot', viewport: 'mobile', path: 'evidence/mobile.png' },
            // Sem audit-report
        ],
        findings: [],
        // Sem designContractPath
    };
    const result = gate.evaluate(input);
    assert.strictEqual(result.verdict, 'HOLD');
    assert.strictEqual(result.suspiciousPerfectScore, true);
    assert.ok(result.reasons.some((r) => r.includes('Anti-Fantasy Approval')));
    assert.ok(result.missingEvidence.includes('audit-report'));
});
test('RealityGate — 6. Score 100 com contra-prova completa gera PASS', () => {
    const gate = new RealityGate();
    const input = {
        craftPassed: true,
        craftScore: 100,
        claimedStates: ['default', 'empty', 'loading', 'error'],
        evidence: [
            { kind: 'screenshot', viewport: 'desktop', path: 'evidence/desktop.png' },
            { kind: 'screenshot', viewport: 'tablet', path: 'evidence/tablet.png' },
            { kind: 'screenshot', viewport: 'mobile', path: 'evidence/mobile.png' },
            { kind: 'audit-report', path: 'reports/craft-a11y-audit.md' },
        ],
        findings: [],
        designContractPath: 'contracts/checkout.md',
    };
    const result = gate.evaluate(input);
    assert.strictEqual(result.verdict, 'PASS');
    assert.strictEqual(result.suspiciousPerfectScore, true);
    assert.strictEqual(result.missingEvidence.length, 0);
    assert.ok(result.reasons.some((r) => r.includes('PASS: Todos os critérios')));
});
test('RealityGate — 7. Cenário com todos os requisitos atendidos gera PASS', () => {
    const gate = new RealityGate();
    const input = {
        craftPassed: true,
        craftScore: 94,
        claimedStates: ['default', 'empty', 'loading', 'error'],
        evidence: [
            { kind: 'screenshot', viewport: 'desktop', path: 'evidence/desktop.png' },
            { kind: 'screenshot', viewport: 'tablet', path: 'evidence/tablet.png' },
            { kind: 'screenshot', viewport: 'mobile', path: 'evidence/mobile.png' },
        ],
        findings: [
            { severity: 'minor', message: 'Aviso de alinhamento secundário em botão de ajuda' },
        ],
        designContractPath: 'contracts/checkout.md',
    };
    const result = gate.evaluate(input);
    assert.strictEqual(result.verdict, 'PASS');
    assert.strictEqual(result.suspiciousPerfectScore, false);
    assert.strictEqual(result.missingEvidence.length, 0);
    assert.ok(result.reasons[0].startsWith('PASS:'));
});
test('RealityGate — 8. Multiple failures consolida reasons e missingEvidence', () => {
    const gate = new RealityGate();
    const input = {
        craftPassed: false,
        craftScore: 50,
        claimedStates: ['default'], // Faltam empty, loading, error
        evidence: [
            // Faltam tablet e mobile
            { kind: 'screenshot', viewport: 'desktop', path: 'evidence/desktop.png' },
        ],
        findings: [
            { severity: 'critical', message: 'Botão primário sem touch target acessível' },
            { severity: 'critical', message: 'Formulário sem labels descritivas' },
        ],
    };
    const result = gate.evaluate(input);
    assert.strictEqual(result.verdict, 'HOLD');
    // Deve conter múltiplos missing evidence
    assert.ok(result.missingEvidence.includes('screenshot:tablet'));
    assert.ok(result.missingEvidence.includes('screenshot:mobile'));
    // Deve consolidar razões para: critical findings, craftPassed false, missing screenshots e missing states
    assert.ok(result.reasons.some((r) => r.includes('violação(ões) crítica(s)')));
    assert.ok(result.reasons.some((r) => r.includes('Craft Guardian não aprovado')));
    assert.ok(result.reasons.some((r) => r.includes('Evidência visual incompleta')));
    assert.ok(result.reasons.some((r) => r.includes('Cobertura de estados incompleta')));
    assert.ok(result.reasons.length >= 4);
});
test('RealityGate — 9. Findings minor e major não bloqueiam se craftPassed for true e demais requisitos válidos', () => {
    const gate = new RealityGate();
    const input = {
        craftPassed: true,
        craftScore: 88,
        claimedStates: ['default', 'empty', 'loading', 'error'],
        evidence: [
            { kind: 'screenshot', viewport: 'desktop', path: 'evidence/desktop.png' },
            { kind: 'screenshot', viewport: 'tablet', path: 'evidence/tablet.png' },
            { kind: 'screenshot', viewport: 'mobile', path: 'evidence/mobile.png' },
        ],
        findings: [
            { severity: 'major', message: 'Contraste aceitável para AA mas abaixo de AAA' },
            { severity: 'minor', message: 'Espaçamento secundário com 1px de variação' },
        ],
        designContractPath: 'contracts/checkout.md',
    };
    const result = gate.evaluate(input);
    assert.strictEqual(result.verdict, 'PASS');
    assert.strictEqual(result.missingEvidence.length, 0);
});
test('RealityGate — 10. Não marca suspiciousPerfectScore quando score for inferior a 100 ou houver findings', () => {
    const gate = new RealityGate();
    const inputWithScore99 = {
        craftPassed: true,
        craftScore: 99,
        claimedStates: ['default', 'empty', 'loading', 'error'],
        evidence: [
            { kind: 'screenshot', viewport: 'desktop', path: 'evidence/desktop.png' },
            { kind: 'screenshot', viewport: 'tablet', path: 'evidence/tablet.png' },
            { kind: 'screenshot', viewport: 'mobile', path: 'evidence/mobile.png' },
        ],
        findings: [],
    };
    const res99 = gate.evaluate(inputWithScore99);
    assert.strictEqual(res99.suspiciousPerfectScore, false);
    const inputWithScore100AndFinding = {
        craftPassed: true,
        craftScore: 100,
        claimedStates: ['default', 'empty', 'loading', 'error'],
        evidence: [
            { kind: 'screenshot', viewport: 'desktop', path: 'evidence/desktop.png' },
            { kind: 'screenshot', viewport: 'tablet', path: 'evidence/tablet.png' },
            { kind: 'screenshot', viewport: 'mobile', path: 'evidence/mobile.png' },
        ],
        findings: [{ severity: 'minor', message: 'Observação pontual' }],
    };
    const res100WithFinding = gate.evaluate(inputWithScore100AndFinding);
    assert.strictEqual(res100WithFinding.suspiciousPerfectScore, false);
});
