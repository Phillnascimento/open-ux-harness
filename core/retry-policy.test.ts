import test from 'node:test';
import assert from 'node:assert';
import { RetryController, AttemptRecord } from './retry-policy.js';
import { RetryPolicy } from './config-loader.js';
import { MemoryManager, EpisodicEntry } from './memory-manager.js';
import { GuardrailsEngine } from './guardrails.js';

test('1. Veredito PASS retorna { action: "proceed" }', () => {
  const policy: RetryPolicy = { maxAttempts: 3, onExhausted: 'escalate' };
  const controller = new RetryController(policy);

  const record: AttemptRecord = {
    taskId: 'task-button-spec',
    attempt: 1,
    verdict: 'PASS',
    feedback: 'Todos os critérios atendidos com sucesso.',
    timestamp: '2026-10-25T16:00:00.000Z'
  };

  const decision = controller.recordAttempt(record);
  assert.deepStrictEqual(decision, { action: 'proceed' });

  const history = controller.getHistory('task-button-spec');
  assert.strictEqual(history.length, 1);
  assert.strictEqual(history[0].verdict, 'PASS');
});

test('2. Veredito HOLD na tentativa 1 com maxAttempts=3 retorna retry com nextAttempt=2', () => {
  const policy: RetryPolicy = { maxAttempts: 3, onExhausted: 'escalate' };
  const controller = new RetryController(policy);

  const record: AttemptRecord = {
    taskId: 'task-modal-contrast',
    attempt: 1,
    verdict: 'HOLD',
    feedback: 'Contraste de texto insuficiente no botão primário.',
    timestamp: '2026-10-25T16:05:00.000Z'
  };

  const decision = controller.recordAttempt(record);
  assert.deepStrictEqual(decision, {
    action: 'retry',
    nextAttempt: 2,
    feedback: 'Contraste de texto insuficiente no botão primário.'
  });
});

test('3. Veredito HOLD na tentativa 2 com maxAttempts=3 retorna retry com nextAttempt=3', () => {
  const policy: RetryPolicy = { maxAttempts: 3, onExhausted: 'escalate' };
  const controller = new RetryController(policy);

  const record1: AttemptRecord = {
    taskId: 'task-input-grid',
    attempt: 1,
    verdict: 'HOLD',
    feedback: 'Padding fora da grade de 8pt (10px).',
    timestamp: '2026-10-25T16:10:00.000Z'
  };
  controller.recordAttempt(record1);

  const record2: AttemptRecord = {
    taskId: 'task-input-grid',
    attempt: 2,
    verdict: 'HOLD',
    feedback: 'Padding ainda com 12px ao invés de múltiplo de 8pt.',
    timestamp: '2026-10-25T16:15:00.000Z'
  };
  const decision = controller.recordAttempt(record2);

  assert.deepStrictEqual(decision, {
    action: 'retry',
    nextAttempt: 3,
    feedback: 'Padding ainda com 12px ao invés de múltiplo de 8pt.'
  });
});

test('4. Veredito HOLD na tentativa 3 com maxAttempts=3 e onExhausted="escalate" retorna escalate', () => {
  const policy: RetryPolicy = { maxAttempts: 3, onExhausted: 'escalate' };
  const controller = new RetryController(policy);

  const record: AttemptRecord = {
    taskId: 'task-dropdown-states',
    attempt: 3,
    verdict: 'HOLD',
    feedback: 'Estado de foco ausente no componente.',
    timestamp: '2026-10-25T16:20:00.000Z'
  };

  const decision = controller.recordAttempt(record);
  assert.strictEqual(decision.action, 'escalate');
  if (decision.action === 'escalate') {
    assert.strictEqual(decision.attempts, 3);
    assert.strictEqual(
      decision.reason,
      'Limite de 3 tentativas atingido para tarefa task-dropdown-states. Requer intervenção humana.'
    );
  }
});

test('5. Veredito HOLD na tentativa 3 com maxAttempts=3 e onExhausted="abort" retorna abort', () => {
  const policy: RetryPolicy = { maxAttempts: 3, onExhausted: 'abort' };
  const controller = new RetryController(policy);

  const record: AttemptRecord = {
    taskId: 'task-footer-tokens',
    attempt: 3,
    verdict: 'HOLD',
    feedback: 'Token não registrado no catálogo DTCG.',
    timestamp: '2026-10-25T16:25:00.000Z'
  };

  const decision = controller.recordAttempt(record);
  assert.strictEqual(decision.action, 'abort');
  if (decision.action === 'abort') {
    assert.strictEqual(decision.attempts, 3);
    assert.strictEqual(
      decision.reason,
      'Limite de 3 tentativas atingido para tarefa task-footer-tokens. Abortando execução.'
    );
  }
});

test('6. getHistory retorna todas as tentativas e reset limpa o histórico', () => {
  const policy: RetryPolicy = { maxAttempts: 3, onExhausted: 'escalate' };
  const controller = new RetryController(policy);

  const rec1: AttemptRecord = {
    taskId: 'task-history-test',
    attempt: 1,
    verdict: 'HOLD',
    feedback: 'Falha 1',
    timestamp: '2026-10-25T16:30:00.000Z'
  };
  const rec2: AttemptRecord = {
    taskId: 'task-history-test',
    attempt: 2,
    verdict: 'PASS',
    feedback: 'Corrigido',
    timestamp: '2026-10-25T16:35:00.000Z'
  };

  controller.recordAttempt(rec1);
  controller.recordAttempt(rec2);

  const history = controller.getHistory('task-history-test');
  assert.strictEqual(history.length, 2);
  assert.strictEqual(history[0].attempt, 1);
  assert.strictEqual(history[0].verdict, 'HOLD');
  assert.strictEqual(history[1].attempt, 2);
  assert.strictEqual(history[1].verdict, 'PASS');

  // Verifica se getHistory retorna cópia defensiva
  history.push({
    taskId: 'task-history-test',
    attempt: 99,
    verdict: 'HOLD',
    timestamp: '2026-10-25T16:40:00.000Z'
  });
  assert.strictEqual(controller.getHistory('task-history-test').length, 2);

  // Consulta tarefa inexistente
  assert.deepStrictEqual(controller.getHistory('tarefa-inexistente'), []);

  // Limpa com reset
  controller.reset('task-history-test');
  assert.deepStrictEqual(controller.getHistory('task-history-test'), []);
});

test('7. Injeção de MemoryManager mock chama appendEpisodicLog', () => {
  const policy: RetryPolicy = { maxAttempts: 3, onExhausted: 'escalate' };
  const episodicLogs: EpisodicEntry[] = [];

  const mockMemory = {
    appendEpisodicLog(entry: EpisodicEntry) {
      episodicLogs.push(entry);
    }
  } as unknown as MemoryManager;

  const controller = new RetryController(policy, mockMemory);

  const record: AttemptRecord = {
    taskId: 'task-a11y-card',
    attempt: 1,
    verdict: 'HOLD',
    feedback: 'Contraste abaixo de 4.5:1 no subtítulo.',
    timestamp: '2026-10-25T16:45:00.000Z'
  };

  controller.recordAttempt(record);

  assert.strictEqual(episodicLogs.length, 1);
  assert.strictEqual(episodicLogs[0].featureName, 'task-a11y-card');
  assert.strictEqual(episodicLogs[0].problemStatement, 'Contraste abaixo de 4.5:1 no subtítulo.');
  assert.strictEqual(episodicLogs[0].decisionSummary, 'Veredito: HOLD');
  assert.deepStrictEqual(episodicLogs[0].learnedLessons, ['Contraste abaixo de 4.5:1 no subtítulo.']);
  assert.strictEqual(episodicLogs[0].timestamp, '2026-10-25T16:45:00.000Z');
});

test('8. GuardrailsEngine avalia "escalate_retry_exhausted" como ASK com requiresPromptToUser=true', () => {
  const guardrails = new GuardrailsEngine(true, true);
  const result = guardrails.evaluateAction('escalate_retry_exhausted');

  assert.strictEqual(result.action, 'escalate_retry_exhausted');
  assert.strictEqual(result.level, 'ASK');
  assert.strictEqual(result.requiresPromptToUser, true);
  assert.strictEqual(result.blocked, false);
  assert.strictEqual(
    result.reason,
    'Tentativas automáticas esgotadas no loop Dev-QA. Exige mediação humana (Design Gate).'
  );
});

test('9. Feedback padrão quando feedback não é informado em HOLD', () => {
  const policy: RetryPolicy = { maxAttempts: 3, onExhausted: 'escalate' };
  const controller = new RetryController(policy);

  const decision = controller.recordAttempt({
    taskId: 'task-no-feedback',
    attempt: 1,
    verdict: 'HOLD',
    timestamp: '2026-10-25T16:50:00.000Z'
  });

  assert.deepStrictEqual(decision, {
    action: 'retry',
    nextAttempt: 2,
    feedback: 'HOLD: Ajustes necessários conforme apontado no gate.'
  });
});

test('10. Ciclo sequencial completo Dev-QA (AC-RP1)', () => {
  const policy: RetryPolicy = { maxAttempts: 3, onExhausted: 'escalate' };
  const controller = new RetryController(policy);
  const taskId = 'task-full-cycle';

  // Tentativa 1 -> retry com nextAttempt 2
  const d1 = controller.recordAttempt({
    taskId,
    attempt: 1,
    verdict: 'HOLD',
    feedback: 'Falha tentativa 1',
    timestamp: '2026-10-25T16:51:00.000Z'
  });
  assert.strictEqual(d1.action, 'retry');
  if (d1.action === 'retry') {
    assert.strictEqual(d1.nextAttempt, 2);
  }

  // Tentativa 2 -> retry com nextAttempt 3
  const d2 = controller.recordAttempt({
    taskId,
    attempt: 2,
    verdict: 'HOLD',
    feedback: 'Falha tentativa 2',
    timestamp: '2026-10-25T16:52:00.000Z'
  });
  assert.strictEqual(d2.action, 'retry');
  if (d2.action === 'retry') {
    assert.strictEqual(d2.nextAttempt, 3);
  }

  // Tentativa 3 -> limite de 3 atingido, escalate
  const d3 = controller.recordAttempt({
    taskId,
    attempt: 3,
    verdict: 'HOLD',
    feedback: 'Falha tentativa 3',
    timestamp: '2026-10-25T16:53:00.000Z'
  });
  assert.strictEqual(d3.action, 'escalate');
  if (d3.action === 'escalate') {
    assert.strictEqual(d3.attempts, 3);
    assert.strictEqual(
      d3.reason,
      'Limite de 3 tentativas atingido para tarefa task-full-cycle. Requer intervenção humana.'
    );
  }

  const history = controller.getHistory(taskId);
  assert.strictEqual(history.length, 3);
});
