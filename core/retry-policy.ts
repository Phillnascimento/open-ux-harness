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

export class RetryController {
  private policy: RetryPolicy;
  private memory?: MemoryManager;

  constructor(policy: RetryPolicy, memory?: MemoryManager) {
    this.policy = policy;
    this.memory = memory;
  }

  public recordAttempt(rec: AttemptRecord): RetryDecision {
    throw new Error('STUB: To be implemented by subagent A3');
  }

  public getHistory(taskId: string): AttemptRecord[] {
    throw new Error('STUB: To be implemented by subagent A3');
  }

  public reset(taskId: string): void {
    throw new Error('STUB: To be implemented by subagent A3');
  }
}
