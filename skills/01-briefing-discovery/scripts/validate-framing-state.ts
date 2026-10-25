/**
 * Open UX Harness — Skill 01 Deterministic Framing State Validator (Code as Action)
 * Validates `.harness/memory/framing-state.json` against the 9 Mandatory Dimensions,
 * HEX Color syntax in `brandFoundations`, RACI Matrix completeness, Opportunity Solution Tree,
 * and `nextStepRouting` (Paths A & B).
 *
 * Usage:
 *   node --experimental-strip-types skills/01-briefing-discovery/scripts/validate-framing-state.ts .harness/memory/framing-state.json
 */

import * as fs from 'fs';
import * as path from 'path';

export interface FramingValidationIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  field_or_line?: string;
}

export interface FramingValidationResult {
  status: 'success' | 'warning' | 'failed' | 'SCHEMA_MISMATCH';
  file_path: string;
  confidence_score: number;
  validation_errors: FramingValidationIssue[];
}

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const NINE_MANDATORY_DIMENSIONS = [
  'businessGoals',
  'problemDefinition',
  'targetUser',
  'successMetrics',
  'brandFoundations',
  'scopeAndConstraints',
  'raciMatrix',
  'hypothesesAndRisk',
  'finalDeliverables',
] as const;

export function validateFramingStateFile(filePath: string): FramingValidationResult {
  const issues: FramingValidationIssue[] = [];
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    return {
      status: 'SCHEMA_MISMATCH',
      file_path: resolvedPath,
      confidence_score: 0,
      validation_errors: [
        {
          code: 'FILE_NOT_FOUND',
          severity: 'error',
          message: `Arquivo framing-state.json não encontrado em: ${resolvedPath}`,
          field_or_line: 'root',
        },
      ],
    };
  }

  let data: Record<string, any>;
  try {
    const raw = fs.readFileSync(resolvedPath, 'utf-8');
    data = JSON.parse(raw);
  } catch (err: any) {
    return {
      status: 'SCHEMA_MISMATCH',
      file_path: resolvedPath,
      confidence_score: 0,
      validation_errors: [
        {
          code: 'INVALID_JSON',
          severity: 'error',
          message: `Erro de sintaxe JSON em framing-state.json: ${err?.message || String(err)}`,
          field_or_line: 'root',
        },
      ],
    };
  }

  // Support both wrapped handoff contract (`data.payload`) and flat framing object
  const payload: Record<string, any> =
    data.payload && typeof data.payload === 'object' ? data.payload : data;

  // 1. Validate Top-Level Handoff Envelope Metadata
  if (data.skill_id && data.skill_id !== '01-briefing-discovery') {
    issues.push({
      code: 'SKILL_ID_MISMATCH',
      severity: 'error',
      message: `O campo skill_id deve ser "01-briefing-discovery", recebido: "${data.skill_id}".`,
      field_or_line: 'skill_id',
    });
  }

  // 2. Validate Presence of All 9 Mandatory Framing Dimensions
  for (const dimension of NINE_MANDATORY_DIMENSIONS) {
    const val = payload[dimension];
    const isEmpty =
      val === undefined ||
      val === null ||
      (typeof val === 'string' && val.trim() === '') ||
      (Array.isArray(val) && val.length === 0) ||
      (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0);

    if (isEmpty) {
      issues.push({
        code: `MISSING_DIMENSION_${dimension.toUpperCase()}`,
        severity: 'error',
        message: `Dimensão obrigatória do Mapa de Framing ausente ou vazia: "${dimension}".`,
        field_or_line: `payload.${dimension}`,
      });
    }
  }

  // 3. Validate Opportunity Solution Tree (Teresa Torres)
  const ost = payload.opportunitySolutionTree;
  if (!ost || typeof ost !== 'object') {
    issues.push({
      code: 'OST_MISSING',
      severity: 'warning',
      message:
        'A estrutura `opportunitySolutionTree` (Desired Outcome -> Opportunities -> Solutions -> Assumption Tests) está ausente.',
      field_or_line: 'payload.opportunitySolutionTree',
    });
  } else {
    if (!ost.desiredOutcome || typeof ost.desiredOutcome !== 'string') {
      issues.push({
        code: 'OST_OUTCOME_MISSING',
        severity: 'error',
        message: 'O campo `opportunitySolutionTree.desiredOutcome` é obrigatório.',
        field_or_line: 'payload.opportunitySolutionTree.desiredOutcome',
      });
    }
    if (!Array.isArray(ost.opportunities) || ost.opportunities.length === 0) {
      issues.push({
        code: 'OST_OPPORTUNITIES_EMPTY',
        severity: 'error',
        message: 'A lista `opportunitySolutionTree.opportunities` deve conter pelo menos 1 oportunidade.',
        field_or_line: 'payload.opportunitySolutionTree.opportunities',
      });
    }
  }

  // 4. Validate HEX Colors & Craft Fields in `brandFoundations`
  const brand = payload.brandFoundations;
  if (brand && typeof brand === 'object') {
    const colorFields = ['primaryColor', 'secondaryColor', 'surfaceColor', 'textColor'] as const;
    for (const colorField of colorFields) {
      const colorValue = brand[colorField];
      if (!colorValue || typeof colorValue !== 'string') {
        if (colorField === 'primaryColor' || colorField === 'textColor') {
          issues.push({
            code: `BRAND_COLOR_MISSING_${colorField.toUpperCase()}`,
            severity: 'error',
            message: `Cor obrigatória "${colorField}" ausente em brandFoundations.`,
            field_or_line: `payload.brandFoundations.${colorField}`,
          });
        }
      } else if (!HEX_COLOR_REGEX.test(colorValue.trim())) {
        issues.push({
          code: `INVALID_HEX_COLOR_${colorField.toUpperCase()}`,
          severity: 'error',
          message: `Valor HEX inválido em brandFoundations.${colorField}: "${colorValue}". Deve respeitar ^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$.`,
          field_or_line: `payload.brandFoundations.${colorField}`,
        });
      }
    }

    if (!brand.fontFamily || typeof brand.fontFamily !== 'string' || brand.fontFamily.trim() === '') {
      issues.push({
        code: 'BRAND_FONT_MISSING',
        severity: 'error',
        message: 'O campo `brandFoundations.fontFamily` é obrigatório.',
        field_or_line: 'payload.brandFoundations.fontFamily',
      });
    }
  }

  // 5. Validate RACI Governance Matrix (`responsible`, `accountable`, `consulted`, `informed`)
  const raci = payload.raciMatrix || payload.governance;
  if (!raci || typeof raci !== 'object') {
    issues.push({
      code: 'RACI_MATRIX_MISSING',
      severity: 'error',
      message: 'Matriz de governança `raciMatrix` ausente.',
      field_or_line: 'payload.raciMatrix',
    });
  } else {
    const requiredRaciRoles = ['responsible', 'accountable', 'consulted', 'informed'] as const;
    for (const role of requiredRaciRoles) {
      const val = raci[role];
      const isMissing =
        val === undefined ||
        val === null ||
        (typeof val === 'string' && val.trim() === '') ||
        (Array.isArray(val) && val.length === 0);

      if (isMissing) {
        issues.push({
          code: `RACI_ROLE_MISSING_${role.toUpperCase()}`,
          severity: 'error',
          message: `Papel obrigatório da Matriz RACI ausente ou vazio: "${role}".`,
          field_or_line: `payload.raciMatrix.${role}`,
        });
      }
    }
  }

  // 6. Validate `nextStepRouting` (Paths A & B)
  const routing = data.nextStepRouting || payload.nextStepRouting;
  if (!routing || typeof routing !== 'object') {
    issues.push({
      code: 'NEXT_STEP_ROUTING_MISSING',
      severity: 'error',
      message: 'Bloco obrigatório `nextStepRouting` ausente no contrato de handoff.',
      field_or_line: 'nextStepRouting',
    });
  } else {
    const hasPathAB = Boolean(routing.pathA && routing.pathB);
    const hasRecommendedAlt = Boolean(routing.recommendedPath && routing.alternativePath);

    if (!hasPathAB && !hasRecommendedAlt) {
      issues.push({
        code: 'NEXT_STEP_PATHS_INCOMPLETE',
        severity: 'error',
        message:
          'O bloco `nextStepRouting` deve conter as duas rotas de continuidade (`pathA` e `pathB`).',
        field_or_line: 'nextStepRouting',
      });
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const confidenceScore = Math.max(
    0,
    Number((1.0 - errorCount * 0.2 - warningCount * 0.05).toFixed(2))
  );

  let status: FramingValidationResult['status'] = 'success';
  if (errorCount > 0) {
    status = 'SCHEMA_MISMATCH';
  } else if (warningCount > 0) {
    status = 'warning';
  }

  return {
    status,
    file_path: resolvedPath,
    confidence_score: confidenceScore,
    validation_errors: issues,
  };
}

// CLI Runner
if (require.main === module) {
  const targetArg = process.argv[2] || '.harness/memory/framing-state.json';
  const result = validateFramingStateFile(targetArg);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === 'success' || result.status === 'warning' ? 0 : 1);
}
