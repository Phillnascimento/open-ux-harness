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
export declare class RetryController {
    private policy;
    private memory?;
    constructor(policy: RetryPolicy, memory?: MemoryManager);
    recordAttempt(rec: AttemptRecord): RetryDecision;
    getHistory(taskId: string): AttemptRecord[];
    reset(taskId: string): void;
}
