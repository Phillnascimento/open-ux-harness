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
export declare class RealityGate {
    evaluate(input: RealityGateInput): RealityGateResult;
}
