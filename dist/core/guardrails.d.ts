export type AuthorityLevel = 'ALLOW' | 'ASK' | 'DENY';
export interface GuardrailCheckResult {
    action: string;
    level: AuthorityLevel;
    reason: string;
    requiresPromptToUser: boolean;
    blocked: boolean;
}
export declare class GuardrailsEngine {
    private zeroYoloMode;
    private strictDtcg;
    constructor(zeroYoloMode?: boolean, strictDtcg?: boolean);
    /**
     * Avalia uma ação pretendida pelo agente contra a matriz de governança.
     */
    evaluateAction(actionType: string, payload?: Record<string, any>): GuardrailCheckResult;
}
