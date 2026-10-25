export class RetryController {
    policy;
    memory;
    constructor(policy, memory) {
        this.policy = policy;
        this.memory = memory;
    }
    recordAttempt(rec) {
        throw new Error('STUB: To be implemented by subagent A3');
    }
    getHistory(taskId) {
        throw new Error('STUB: To be implemented by subagent A3');
    }
    reset(taskId) {
        throw new Error('STUB: To be implemented by subagent A3');
    }
}
