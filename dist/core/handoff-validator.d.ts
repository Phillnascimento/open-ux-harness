/**
 * Open UX Harness — Validador de Envelope de Handoff Padronizado
 * Valida a conformidade de objetos de handoff em relação à interface HandoffEnvelope.
 */
export interface HandoffEnvelope {
    from: string;
    to: string;
    phase: string;
    taskId: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    timestamp: string;
    context: {
        currentState: string;
        relevantFiles: string[];
        dependencies?: string[];
        constraints?: string[];
    };
    deliverableRequest: {
        description: string;
        acceptanceCriteria: string[];
        referenceMaterials?: string[];
    };
    qualityExpectations: {
        mustPass: string[];
        evidenceRequired: string[];
        handoffToNext?: string;
    };
}
/**
 * Valida se um objeto qualquer atende estritamente à interface HandoffEnvelope.
 *
 * @param json Objeto desconhecido a ser validado
 * @returns Objeto com status valid (boolean) e lista de mensagens de erro (errors)
 */
export declare function validateHandoffEnvelope(json: unknown): {
    valid: boolean;
    errors: string[];
};
