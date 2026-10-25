/**
 * Controlador de ciclo de tentativas (Retry Policy) para o loop Dev-QA.
 * Gerencia histórico de tentativas por tarefa e determina se o fluxo deve
 * prosseguir, tentar novamente, escalar para intervenção humana ou abortar.
 */
export class RetryController {
    policy;
    memory;
    history = new Map();
    constructor(policy, memory) {
        this.policy = policy;
        this.memory = memory;
    }
    /**
     * Registra uma tentativa de validação e decide a próxima ação do harness.
     */
    recordAttempt(rec) {
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
    getHistory(taskId) {
        const records = this.history.get(taskId);
        return records ? records.map(r => ({ ...r })) : [];
    }
    /**
     * Limpa o histórico de tentativas de uma tarefa específica.
     */
    reset(taskId) {
        this.history.delete(taskId);
    }
}
