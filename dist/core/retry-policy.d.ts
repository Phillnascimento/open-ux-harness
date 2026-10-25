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
export type RetryDecision = {
    action: 'proceed';
} | {
    action: 'retry';
    nextAttempt: number;
    feedback: string;
} | {
    action: 'escalate';
    reason: string;
    attempts: number;
} | {
    action: 'abort';
    reason: string;
    attempts: number;
};
/**
 * Controlador de ciclo de tentativas (Retry Policy) para o loop Dev-QA.
 * Gerencia histórico de tentativas por tarefa e determina se o fluxo deve
 * prosseguir, tentar novamente, escalar para intervenção humana ou abortar.
 */
export declare class RetryController {
    private policy;
    private memory?;
    private history;
    constructor(policy: RetryPolicy, memory?: MemoryManager);
    /**
     * Registra uma tentativa de validação e decide a próxima ação do harness.
     */
    recordAttempt(rec: AttemptRecord): RetryDecision;
    /**
     * Retorna cópia do histórico de tentativas de uma tarefa específica.
     */
    getHistory(taskId: string): AttemptRecord[];
    /**
     * Limpa o histórico de tentativas de uma tarefa específica.
     */
    reset(taskId: string): void;
}
