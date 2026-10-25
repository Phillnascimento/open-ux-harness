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
export declare function validateHandoffEnvelope(json: unknown): {
    valid: boolean;
    errors: string[];
};
