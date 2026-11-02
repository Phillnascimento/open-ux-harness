import test from 'node:test';
import assert from 'node:assert';
import { RealityGate } from './reality-gate.js';
import { GuardrailsEngine } from './guardrails.js';
import { ContextEngine } from './context-engine.js';
import { UXGraphEngine } from './ux-graph-engine.js';
test('Graph Integration — 1. RealityGate com Alto Raio de Impacto (Blast Radius > 5) exige contra-prova downstream', () => {
    const gate = new RealityGate();
    // Input válido com craft aprovado e screenshots nos 3 viewports
    const baseInput = {
        craftPassed: true,
        claimedStates: ['default', 'empty', 'loading', 'error'],
        evidence: [
            { kind: 'screenshot', viewport: 'desktop', path: 'shots/desk.png' },
            { kind: 'screenshot', viewport: 'tablet', path: 'shots/tab.png' },
            { kind: 'screenshot', viewport: 'mobile', path: 'shots/mob.png' }
        ],
        findings: [],
        blastRadiusCount: 8 // Alto impacto (> 5)
    };
    // Sem evidência de auditoria downstream -> HOLD
    const holdRes = gate.evaluate(baseInput);
    assert.strictEqual(holdRes.verdict, 'HOLD');
    assert.ok(holdRes.missingEvidence.includes('downstream-impact-evidence'));
    assert.ok(holdRes.reasons.some(r => r.includes('Alto Raio de Impacto')));
    // Com evidência de auditoria downstream -> PASS
    const passInput = {
        ...baseInput,
        evidence: [
            ...baseInput.evidence,
            { kind: 'audit-report', path: 'harness-out/UX_GRAPH_REPORT.md' }
        ]
    };
    const passRes = gate.evaluate(passInput);
    assert.strictEqual(passRes.verdict, 'PASS');
});
test('Graph Integration — 2. GuardrailsEngine eleva ações com Blast Radius > 5 para ASK (Design Gate)', () => {
    const guard = new GuardrailsEngine(true, true);
    // Ação com blast radius baixo (2 nós) -> ALLOW
    const allowRes = guard.evaluateAction('modify_component', { blastRadiusCount: 2 });
    assert.strictEqual(allowRes.level, 'ALLOW');
    assert.strictEqual(allowRes.requiresPromptToUser, false);
    // Ação com blast radius alto (8 nós) -> ASK
    const askRes = guard.evaluateAction('modify_component', { blastRadiusCount: 8 });
    assert.strictEqual(askRes.level, 'ASK');
    assert.strictEqual(askRes.requiresPromptToUser, true);
    assert.ok(askRes.reason.includes('Alto Raio de Impacto'));
});
test('Graph Integration — 3. ContextEngine monta micro-contexto cirúrgico via assembleSubGraphContext', () => {
    const engine = new ContextEngine(process.cwd());
    const graph = new UXGraphEngine();
    // Popula grafo com 10 nós
    graph.addNode({ id: 'token:color.primary', type: 'token', label: 'Primary' });
    graph.addNode({ id: 'comp:Button', type: 'component', label: 'Button' });
    graph.addNode({ id: 'screen:Checkout', type: 'screen', label: 'Checkout' });
    // 7 nós distantes
    for (let i = 1; i <= 7; i++) {
        graph.addNode({ id: `distant:node_${i}`, type: 'component', label: `Distant ${i}` });
    }
    graph.addEdge({ source: 'comp:Button', target: 'token:color.primary', type: 'uses_token', provenance: 'EXTRACTED', confidence: 1.0 });
    graph.addEdge({ source: 'screen:Checkout', target: 'comp:Button', type: 'composes_component', provenance: 'EXTRACTED', confidence: 1.0 });
    const contextRes = engine.assembleSubGraphContext(graph, 'comp:Button', 1);
    assert.strictEqual(contextRes.targetId, 'comp:Button');
    assert.strictEqual(contextRes.subGraphNodesCount, 3); // Button + Token + Screen
    assert.ok(contextRes.estimatedTokenReductionPercentage >= 60); // 7 de 10 nós podados
    assert.ok(contextRes.contextPromptBlock.includes('GRAPH_AWARE_MICRO_CONTEXT'));
    assert.ok(contextRes.contextPromptBlock.includes('Token: Primary'));
    assert.ok(contextRes.contextPromptBlock.includes('Tela: Checkout'));
});
