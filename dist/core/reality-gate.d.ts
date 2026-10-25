export type GateVerdict = 'PASS' | 'HOLD';
export type Viewport = 'desktop' | 'tablet' | 'mobile';
export interface EvidenceItem {
    kind: 'screenshot' | 'test-result' | 'file' | 'audit-report';
    viewport?: Viewport;
    path: string;
}
export interface GateFinding {
    severity: 'critical' | 'major' | 'minor';
    message: string;
}
export interface RealityGateInput {
    craftPassed: boolean;
    craftScore?: number;
    claimedStates: string[];
    evidence: EvidenceItem[];
    findings: GateFinding[];
    designContractPath?: string;
}
export interface RealityGateResult {
    verdict: GateVerdict;
    reasons: string[];
    missingEvidence: string[];
    suspiciousPerfectScore: boolean;
}
/**
 * RealityGate — Portão de realidade determinístico para certificação pré-handoff.
 * Garante que nenhuma interface avance com aprovações fantasiosas ou sem evidência visual real.
 */
export declare class RealityGate {
    /**
     * Avalia as evidências e parâmetros da interface contra regras de prontidão estritas.
     * Por padrão, assume 'HOLD' caso qualquer critério falhe.
     */
    evaluate(input: RealityGateInput): RealityGateResult;
}
