import { MemoryManager } from './memory-manager.js';
import { RetryPolicy } from './config-loader.js';
import { GateVerdict } from './reality-gate.js';

export interface AttemptRecord {
  taskId: string;
  attempt: number;
  verdict: GateVerdict;
  feedback?: string;
  timestamp: string;
}

export type RetryDecision =
  | { action: 'proceed' }
  | { action: 'retry'; nextAttempt: number; feedback: string }
  | { action: 'escalate'; reason: string; attempts: number }
  | { action: 'abort'; reason: string; attempts: number };

/**
 * Controlador de ciclo de tentativas (Retry Policy) para o loop Dev-QA.
 * Gerencia histórico de tentativas por tarefa e determina se o fluxo deve
 * prosseguir, tentar novamente, escalar para intervenção humana ou abortar.
 */
export class RetryController {
  private policy: RetryPolicy;
  private memory?: MemoryManager;
  private history: Map<string, AttemptRecord[]> = new Map();

  constructor(policy: RetryPolicy, memory?: MemoryManager) {
    this.policy = policy;
    this.memory = memory;
  }

  /**
   * Registra uma tentativa de validação e decide a próxima ação do harness.
   */
  public recordAttempt(rec: AttemptRecord): RetryDecision {
    // 1. Armazena a tentativa no histórico da tarefa
    const records = this.history.get(rec.taskId) || [];
    records.push({ ...rec });
    this.history.set(rec.taskId, records);

    // 2. Integração opcional com a memória episódica
    if (this.memory && typeof this.memory.appendEpisodicLog === 'function') {
      this.memory.appendEpisodicLog({
        timestamp: rec.timestamp || new Date().toISOString(),
        featureName: rec.taskId,
        problemStatement: rec.feedback || 'QA attempt',
        decisionSummary: `Veredito: ${rec.verdict}`,
        learnedLessons: [rec.feedback || '']
      });
    }

    // 3. Se aprovado no gate, prossegue com o fluxo
    if (rec.verdict === 'PASS') {
      return { action: 'proceed' };
    }

    // 4. Se reprovado (HOLD), avalia se o limite de tentativas foi atingido
    if (rec.attempt < this.policy.maxAttempts) {
      return {
        action: 'retry',
        nextAttempt: rec.attempt + 1,
        feedback: rec.feedback || 'HOLD: Ajustes necessários conforme apontado no gate.'
      };
    }

    // 5. Limite esgotado: escalonar ou abortar conforme a política configurada
    if (this.policy.onExhausted === 'escalate') {
      return {
        action: 'escalate',
        reason: `Limite de ${this.policy.maxAttempts} tentativas atingido para tarefa ${rec.taskId}. Requer intervenção humana.`,
        attempts: rec.attempt
      };
    }

    return {
      action: 'abort',
      reason: `Limite de ${this.policy.maxAttempts} tentativas atingido para tarefa ${rec.taskId}. Abortando execução.`,
      attempts: rec.attempt
    };
  }

  /**
   * Retorna cópia do histórico de tentativas de uma tarefa específica.
   */
  public getHistory(taskId: string): AttemptRecord[] {
    const records = this.history.get(taskId);
    return records ? records.map(r => ({ ...r })) : [];
  }

  /**
   * Limpa o histórico de tentativas de uma tarefa específica.
   */
  public reset(taskId: string): void {
    this.history.delete(taskId);
  }
}
