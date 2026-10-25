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

const REQUIRED_VIEWPORTS: readonly Viewport[] = ['desktop', 'tablet', 'mobile'];
const REQUIRED_STATES: readonly string[] = ['default', 'empty', 'loading', 'error'];

/**
 * RealityGate — Portão de realidade determinístico para certificação pré-handoff.
 * Garante que nenhuma interface avance com aprovações fantasiosas ou sem evidência visual real.
 */
export class RealityGate {
  /**
   * Avalia as evidências e parâmetros da interface contra regras de prontidão estritas.
   * Por padrão, assume 'HOLD' caso qualquer critério falhe.
   */
  public evaluate(input: RealityGateInput): RealityGateResult {
    const reasons: string[] = [];
    const missingEvidence: string[] = [];

    // 1. Verificação de achados com severidade crítica
    const criticalFindings = (input.findings || []).filter(
      (finding) => finding.severity === 'critical'
    );
    if (criticalFindings.length > 0) {
      const messages = criticalFindings.map((f) => f.message).join('; ');
      reasons.push(
        `HOLD: Encontrada(s) ${criticalFindings.length} violação(ões) crítica(s): ${messages}`
      );
    }

    // 2. Verificação de aprovação pelo Craft Guardian
    if (!input.craftPassed) {
      reasons.push('HOLD: Craft Guardian não aprovado (craftPassed === false).');
    }

    // 3. Verificação de Evidência Visual nos 3 viewports obrigatórios (desktop, tablet, mobile)
    const providedScreenshots = (input.evidence || []).filter(
      (ev) => ev.kind === 'screenshot' && ev.viewport
    );

    for (const vp of REQUIRED_VIEWPORTS) {
      const hasViewportScreenshot = providedScreenshots.some(
        (ev) => ev.viewport === vp && typeof ev.path === 'string' && ev.path.trim().length > 0
      );
      if (!hasViewportScreenshot) {
        missingEvidence.push(`screenshot:${vp}`);
      }
    }

    if (missingEvidence.length > 0) {
      reasons.push(
        `HOLD: Evidência visual incompleta. Screenshots ausentes para viewports: ${missingEvidence.join(', ')}.`
      );
    }

    // 4. Verificação de Cobertura dos 4 Estados Obrigatórios de UI (default, empty, loading, error)
    const claimedSet = new Set(input.claimedStates || []);
    const missingStates = REQUIRED_STATES.filter((state) => !claimedSet.has(state));
    if (missingStates.length > 0) {
      reasons.push(
        `HOLD: Cobertura de estados incompleta. Estados obrigatórios ausentes: ${missingStates.join(', ')}.`
      );
    }

    // 5. Anti-Fantasy Approval (Score Perfeito Suspeito)
    // Score >= 100 sem nenhum achado é sinal de alerta se não acompanhado de contra-prova exaustiva
    const suspiciousPerfectScore = Boolean(
      input.craftScore !== undefined &&
      input.craftScore >= 100 &&
      (!input.findings || input.findings.length === 0)
    );

    if (suspiciousPerfectScore) {
      const hasAllScreenshots = REQUIRED_VIEWPORTS.every((vp) =>
        providedScreenshots.some(
          (ev) => ev.viewport === vp && typeof ev.path === 'string' && ev.path.trim().length > 0
        )
      );

      const hasAuditReport = (input.evidence || []).some(
        (ev) => ev.kind === 'audit-report' && typeof ev.path === 'string' && ev.path.trim().length > 0
      );

      const hasDesignContract = Boolean(
        input.designContractPath && input.designContractPath.trim().length > 0
      );

      const counterProofComplete = hasAllScreenshots && hasAuditReport && hasDesignContract;

      if (!counterProofComplete) {
        const missingCounterProofs: string[] = [];
        if (!hasAllScreenshots) {
          missingCounterProofs.push('screenshots nos 3 viewports (desktop, tablet, mobile)');
        }
        if (!hasAuditReport) {
          missingCounterProofs.push('relatório de auditoria (audit-report)');
          if (!missingEvidence.includes('audit-report')) {
            missingEvidence.push('audit-report');
          }
        }
        if (!hasDesignContract) {
          missingCounterProofs.push('designContractPath válido');
        }

        reasons.push(
          `HOLD: Anti-Fantasy Approval: score perfeito (>= 100) sem contra-prova completa é tratado como suspeito. Exige screenshots nos 3 viewports, relatório de auditoria e contrato de design. Ausente(s): ${missingCounterProofs.join(', ')}.`
        );
      }
    }

    // Decisão final: PASS somente se não houver razões de bloqueio e nenhuma evidência faltante
    const isPass = reasons.length === 0 && missingEvidence.length === 0;
    const verdict: GateVerdict = isPass ? 'PASS' : 'HOLD';

    if (isPass) {
      reasons.push(
        'PASS: Todos os critérios do Reality Gate atendidos: evidências visuais completas, 4 estados validados e sem impedimentos críticos.'
      );
    }

    return {
      verdict,
      reasons,
      missingEvidence,
      suspiciousPerfectScore,
    };
  }
}
