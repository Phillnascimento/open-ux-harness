/**
 * Open UX Harness — Deterministic Telemetry Linter & A/B Statistical Calculator (Code as Action)
 * Dual-purpose deterministic script:
 * 1. Event Taxonomy & Guardrail Linter:
 *    - Validates that all event names follow strict `snake_case` (`^[a-z0-9]+(_[a-z0-9]+)+$`)
 *    - Verifies presence of Primary Goal Metric (HEART/GSM) and Guardrail Metrics
 * 2. A/B Experiment Statistical Calculator:
 *    - Computes Control vs. Variant conversion rates, Relative Lift (%), Z-score, two-tailed p-value
 *    - Detects Sample Ratio Mismatch (SRM) via Chi-Square goodness-of-fit test (p_srm < 0.01)
 *
 * Usage:
 *   Mode 1 (Validate Markdown Report or JSON State):
 *     node --experimental-strip-types skills/07-telemetry-and-impact/scripts/validate-telemetry-plan.ts <path-to-report-or-json>
 *   Mode 2 (Validate + Calculate A/B Statistics):
 *     node --experimental-strip-types skills/07-telemetry-and-impact/scripts/validate-telemetry-plan.ts <path> --ab <controlUsers>,<controlConv>,<variantUsers>,<variantConv>
 */

import * as fs from 'fs';
import * as path from 'path';

export interface TelemetryValidationIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  field_or_line?: string;
}

export interface ABTestStatistics {
  control_users: number;
  control_conversions: number;
  control_rate: number;
  variant_users: number;
  variant_conversions: number;
  variant_rate: number;
  relative_lift_pct: number;
  z_score: number;
  p_value: number;
  statistically_significant: boolean;
  srm_chi_square: number;
  srm_p_value: number;
  srm_detected: boolean;
  recommended_verdict: 'SHIP' | 'ITERATE_UI' | 'REFRAME_DISCOVERY' | 'INVALID_SRM_OR_DATA';
}

export interface TelemetryValidationResult {
  status: 'success' | 'warning' | 'failed' | 'SCHEMA_MISMATCH';
  target_path: string;
  confidence_score: number;
  valid_events: string[];
  invalid_events: string[];
  has_primary_metric: boolean;
  has_guardrail_metric: boolean;
  ab_statistics?: ABTestStatistics;
  validation_errors: TelemetryValidationIssue[];
}

const SNAKE_CASE_EVENT_REGEX = /^[a-z0-9]+(_[a-z0-9]+)+$/;

/**
 * Standard normal cumulative distribution function (Abramowitz & Stegun approximation)
 */
function normalCdf(x: number): number {
  const absX = Math.abs(x);
  const t = 1 / (1 + 0.2316419 * absX);
  const d = 0.3989422804014327 * Math.exp((-absX * absX) / 2);
  const prob =
    d *
    t *
    (0.31938153 +
      t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + 1.330274429 * t))));
  return x > 0 ? 1 - prob : prob;
}

/**
 * Computes two-tailed p-value from a Z-score
 */
export function zScoreToPValue(z: number): number {
  return Number((2 * (1 - normalCdf(Math.abs(z)))).toFixed(6));
}

/**
 * Calculates A/B test metrics and checks for Sample Ratio Mismatch (SRM)
 */
export function calculateABTestStatistics(
  controlUsers: number,
  controlConversions: number,
  variantUsers: number,
  variantConversions: number,
  expectedVariantSplit = 0.5
): ABTestStatistics {
  const totalUsers = controlUsers + variantUsers;
  const controlRate = controlUsers > 0 ? controlConversions / controlUsers : 0;
  const variantRate = variantUsers > 0 ? variantConversions / variantUsers : 0;
  const relativeLiftPct =
    controlRate > 0 ? Number((((variantRate - controlRate) / controlRate) * 100).toFixed(2)) : 0;

  // Pooled standard error for two-proportion Z-test
  const pooledProb =
    totalUsers > 0 ? (controlConversions + variantConversions) / totalUsers : 0;
  const standardError =
    controlUsers > 0 && variantUsers > 0
      ? Math.sqrt(pooledProb * (1 - pooledProb) * (1 / controlUsers + 1 / variantUsers))
      : 0;

  const zScore =
    standardError > 0 ? Number(((variantRate - controlRate) / standardError).toFixed(4)) : 0;
  const pValue = zScoreToPValue(zScore);
  const statisticallySignificant = pValue < 0.05;

  // Sample Ratio Mismatch (SRM) Chi-Square test (df = 1 -> Z^2 = Chi-Square)
  const expectedControl = totalUsers * (1 - expectedVariantSplit);
  const expectedVariant = totalUsers * expectedVariantSplit;
  const srmChiSquare =
    expectedControl > 0 && expectedVariant > 0
      ? Number(
          (
            Math.pow(controlUsers - expectedControl, 2) / expectedControl +
            Math.pow(variantUsers - expectedVariant, 2) / expectedVariant
          ).toFixed(4)
        )
      : 0;
  const srmPValue = zScoreToPValue(Math.sqrt(srmChiSquare));
  const srmDetected = srmPValue < 0.01;

  let recommendedVerdict: ABTestStatistics['recommended_verdict'] = 'ITERATE_UI';
  if (srmDetected) {
    recommendedVerdict = 'INVALID_SRM_OR_DATA';
  } else if (statisticallySignificant && relativeLiftPct > 0) {
    recommendedVerdict = 'SHIP';
  } else if (statisticallySignificant && relativeLiftPct < 0) {
    recommendedVerdict = 'REFRAME_DISCOVERY';
  }

  return {
    control_users: controlUsers,
    control_conversions: controlConversions,
    control_rate: Number(controlRate.toFixed(4)),
    variant_users: variantUsers,
    variant_conversions: variantConversions,
    variant_rate: Number(variantRate.toFixed(4)),
    relative_lift_pct: relativeLiftPct,
    z_score: zScore,
    p_value: pValue,
    statistically_significant: statisticallySignificant,
    srm_chi_square: srmChiSquare,
    srm_p_value: srmPValue,
    srm_detected: srmDetected,
    recommended_verdict: recommendedVerdict,
  };
}

export function validateTelemetryPlan(
  filePath: string,
  abCounts?: [number, number, number, number]
): TelemetryValidationResult {
  const resolvedPath = path.resolve(filePath);
  const issues: TelemetryValidationIssue[] = [];

  if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
    return {
      status: 'SCHEMA_MISMATCH',
      target_path: resolvedPath,
      confidence_score: 0,
      valid_events: [],
      invalid_events: [],
      has_primary_metric: false,
      has_guardrail_metric: false,
      validation_errors: [
        {
          code: 'FILE_NOT_FOUND',
          severity: 'error',
          message: `Arquivo de telemetria/impacto não encontrado: ${resolvedPath}`,
        },
      ],
    };
  }

  const rawContent = fs.readFileSync(resolvedPath, 'utf-8');
  const validEvents: string[] = [];
  const invalidEvents: string[] = [];
  let hasPrimaryMetric = false;
  let hasGuardrailMetric = false;

  // Check if JSON state or Markdown report
  if (resolvedPath.endsWith('.json')) {
    try {
      const parsed = JSON.parse(rawContent);
      const payload = parsed.payload || parsed;

      const heartMetrics = Array.isArray(payload.heart_metrics) ? payload.heart_metrics : [];
      hasPrimaryMetric = heartMetrics.some((m: { is_primary?: boolean }) => Boolean(m.is_primary));

      const guardrails = Array.isArray(payload.guardrail_metrics) ? payload.guardrail_metrics : [];
      hasGuardrailMetric = guardrails.length > 0;

      const events = Array.isArray(payload.tracking_events) ? payload.tracking_events : [];
      for (const ev of events) {
        const name = typeof ev === 'string' ? ev : ev?.event_name;
        if (typeof name === 'string') {
          if (SNAKE_CASE_EVENT_REGEX.test(name)) {
            validEvents.push(name);
          } else {
            invalidEvents.push(name);
            issues.push({
              code: 'INVALID_EVENT_TAXONOMY',
              severity: 'error',
              message: `O evento "${name}" viola a taxonomia snake_case obrigatória (^[a-z0-9]+(_[a-z0-9]+)+$).`,
            });
          }
        }
      }
    } catch (err) {
      issues.push({
        code: 'INVALID_JSON_SYNTAX',
        severity: 'error',
        message: `Erro ao fazer parse do arquivo JSON: ${(err as Error).message}`,
      });
    }
  } else {
    // Markdown report parsing
    hasPrimaryMetric = /\b(Primary|Task Success|PRIMARY_METRIC|is_primary)\b/i.test(rawContent);
    hasGuardrailMetric = /\b(Guardrail|latency_p95|rage_click|error_rate)\b/i.test(rawContent);

    // Extract first column of tracking table or backtick-enclosed candidate events
    const lines = rawContent.split(/\r?\n/);
    let inTrackingSection = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (/^##+\s+.*Tracking|Plano de Tracking/i.test(line)) {
        inTrackingSection = true;
        continue;
      }
      if (inTrackingSection && /^##+\s+/.test(line)) {
        inTrackingSection = false;
      }

      if (inTrackingSection && line.startsWith('|') && !line.includes('---')) {
        const cols = line
          .split('|')
          .map((c) => c.trim())
          .filter(Boolean);
        if (cols.length >= 2 && !/Nome do Evento|Event Name/i.test(cols[0])) {
          const candidate = cols[0].replace(/^`|`$/g, '').trim();
          if (SNAKE_CASE_EVENT_REGEX.test(candidate)) {
            validEvents.push(candidate);
          } else {
            invalidEvents.push(candidate);
            issues.push({
              code: 'INVALID_EVENT_TAXONOMY',
              severity: 'error',
              message: `O evento "${candidate}" na tabela de tracking viola o padrão snake_case (^[a-z0-9]+(_[a-z0-9]+)+$).`,
              field_or_line: `line:${i + 1}`,
            });
          }
        }
      }
    }
  }

  if (validEvents.length === 0 && invalidEvents.length === 0) {
    issues.push({
      code: 'NO_TRACKING_EVENTS_FOUND',
      severity: 'error',
      message:
        'Nenhum evento de telemetria foi encontrado. Especifique pelo menos 1 evento no padrão [objeto]_[verbo_no_passado].',
    });
  }

  if (!hasPrimaryMetric) {
    issues.push({
      code: 'MISSING_PRIMARY_METRIC',
      severity: 'error',
      message: 'Primary Goal Metric (HEART / GSM) ausente no plano de telemetria.',
    });
  }

  if (!hasGuardrailMetric) {
    issues.push({
      code: 'MISSING_GUARDRAIL_METRIC',
      severity: 'error',
      message:
        'Nenhuma Guardrail Metric (latência p95, taxa de erro ou rage clicks) foi declarada para proteger o experimento.',
    });
  }

  let abStats: ABTestStatistics | undefined;
  if (abCounts) {
    abStats = calculateABTestStatistics(abCounts[0], abCounts[1], abCounts[2], abCounts[3]);
    if (abStats.srm_detected) {
      issues.push({
        code: 'SRM_DETECTED',
        severity: 'error',
        message: `Sample Ratio Mismatch (SRM) severo detectado (p_srm = ${abStats.srm_p_value} < 0.01). O experimento é inválido devido a viés de alocação de tráfego.`,
      });
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const confidenceScore = Math.max(
    0,
    Number((1.0 - errorCount * 0.25 - warningCount * 0.05).toFixed(2))
  );

  const status: TelemetryValidationResult['status'] =
    errorCount > 0 ? 'failed' : warningCount > 0 ? 'warning' : 'success';

  return {
    status,
    target_path: resolvedPath,
    confidence_score: confidenceScore,
    valid_events: Array.from(new Set(validEvents)),
    invalid_events: Array.from(new Set(invalidEvents)),
    has_primary_metric: hasPrimaryMetric,
    has_guardrail_metric: hasGuardrailMetric,
    ab_statistics: abStats,
    validation_errors: issues,
  };
}

// CLI Runner
const isMainModule =
  typeof require !== 'undefined' && require.main === module
    ? true
    : process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isMainModule) {
  const args = process.argv.slice(2);
  const targetFile = args[0];

  if (!targetFile) {
    console.error(
      JSON.stringify(
        {
          status: 'SCHEMA_MISMATCH',
          message:
            'Uso: node --experimental-strip-types skills/07-telemetry-and-impact/scripts/validate-telemetry-plan.ts <arquivo.md|json> [--ab cUsers,cConv,vUsers,vConv]',
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  let abTuple: [number, number, number, number] | undefined;
  const abFlagIndex = args.indexOf('--ab');
  if (abFlagIndex !== -1 && args[abFlagIndex + 1]) {
    const parts = args[abFlagIndex + 1].split(',').map((n) => Number(n.trim()));
    if (parts.length === 4 && parts.every((n) => !Number.isNaN(n) && n >= 0)) {
      abTuple = [parts[0], parts[1], parts[2], parts[3]];
    }
  }

  const result = validateTelemetryPlan(targetFile, abTuple);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === 'failed' || result.status === 'SCHEMA_MISMATCH' ? 1 : 0);
}
