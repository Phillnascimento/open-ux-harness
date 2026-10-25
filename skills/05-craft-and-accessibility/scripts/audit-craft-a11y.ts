/**
 * Open UX Harness — Deterministic Craft & Accessibility Auditor (Code as Action)
 * Computes mathematical WCAG 2.2 relative luminance & contrast ratio, perceptual APCA (Lc)
 * contrast estimate, interactive target sizes (WCAG 2.5.8 >= 24px / 44px mobile),
 * 4pt/8pt spatial grid compliance, and 4 UI states completeness (`default`, `loading`, `empty`, `error`).
 *
 * Usage:
 *   npx tsx skills/05-craft-and-accessibility/scripts/audit-craft-a11y.ts <path-to-audit-input.json>
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ColorPairInput {
  id: string;
  foreground: string; // Hex e.g. "#0F172A"
  background: string; // Hex e.g. "#FFFFFF"
  role?: 'body' | 'large-text' | 'headline' | 'ui-component';
}

export interface InteractiveTargetInput {
  id: string;
  width: number;
  height: number;
  platform?: 'desktop' | 'mobile';
}

export interface CraftAuditInput {
  colorPairs?: ColorPairInput[];
  targets?: InteractiveTargetInput[];
  spacings?: Array<{ id: string; value: number }>;
  statesCovered?: {
    default?: boolean;
    loading?: boolean;
    empty?: boolean;
    error?: boolean;
  };
}

export interface ValidationIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  field_or_line?: string;
}

export interface ContrastAuditEntry {
  pair_id: string;
  foreground: string;
  background: string;
  wcag_ratio: number;
  apca_lc: number;
  passed: boolean;
}

export interface CraftAuditResult {
  status: 'success' | 'warning' | 'failed' | 'SCHEMA_MISMATCH';
  gate_passed: boolean;
  wcag_level_achieved: 'AAA' | 'AA' | 'FAIL';
  confidence_score: number;
  contrast_audits: ContrastAuditEntry[];
  states_covered: {
    default: boolean;
    loading: boolean;
    empty: boolean;
    error: boolean;
  };
  spatial_grid_compliant: boolean;
  validation_errors: ValidationIssue[];
}

function parseHexToRgb(hex: string): [number, number, number] {
  const clean = hex.trim().replace(/^#/, '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return [r, g, b];
  }
  throw new Error(`Formato hexadecimal inválido: "${hex}"`);
}

/**
 * WCAG 2.x Relative Luminance
 */
export function getRelativeLuminance(hex: string): number {
  const [r8, g8, b8] = parseHexToRgb(hex);
  const toLinear = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r8) + 0.7152 * toLinear(g8) + 0.0722 * toLinear(b8);
}

/**
 * WCAG 2.x Contrast Ratio (1.0 to 21.0)
 */
export function getWcagContrastRatio(fgHex: string, bgHex: string): number {
  const l1 = getRelativeLuminance(fgHex);
  const l2 = getRelativeLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * APCA-W3 Perceptual Contrast (Lc) calculation
 */
export function getApcaLc(fgHex: string, bgHex: string): number {
  const [rF, gF, bF] = parseHexToRgb(fgHex);
  const [rB, gB, bB] = parseHexToRgb(bgHex);

  const sRgbToY = (r: number, g: number, b: number): number => {
    const tr = Math.pow(r / 255, 2.4);
    const tg = Math.pow(g / 255, 2.4);
    const tb = Math.pow(b / 255, 2.4);
    const y = 0.2126729 * tr + 0.7151522 * tg + 0.072175 * tb;
    return y < 0.022 ? y + Math.pow(0.022 - y, 1.414) : y;
  };

  const yTxt = sRgbToY(rF, gF, bF);
  const yBg = sRgbToY(rB, gB, bB);

  const sapc =
    yBg > yTxt
      ? (Math.pow(yBg, 0.56) - Math.pow(yTxt, 0.57)) * 1.14
      : (Math.pow(yBg, 0.65) - Math.pow(yTxt, 0.62)) * 1.14;

  const lc = Math.abs(sapc) < 0.1 ? 0 : sapc > 0 ? (sapc - 0.027) * 100 : (sapc + 0.027) * 100;
  return Number(Math.abs(lc).toFixed(1));
}

export function runCraftAndA11yAudit(input: CraftAuditInput): CraftAuditResult {
  const issues: ValidationIssue[] = [];
  const contrastAudits: ContrastAuditEntry[] = [];
  let allAAA = true;
  let anyContrastFail = false;

  // 1. Audit Contrast Pairs (WCAG 2.2 + APCA Lc)
  for (const pair of input.colorPairs || []) {
    const ratio = getWcagContrastRatio(pair.foreground, pair.background);
    const lc = getApcaLc(pair.foreground, pair.background);
    const role = pair.role || 'body';

    const minWcagAA = role === 'body' ? 4.5 : 3.0;
    const minWcagAAA = role === 'body' ? 7.0 : 4.5;
    const minApcaLc = role === 'body' ? 60 : 45;

    const passed = ratio >= minWcagAA && lc >= minApcaLc;
    if (!passed) {
      anyContrastFail = true;
      issues.push({
        code: 'CONTRAST_THRESHOLD_FAILED',
        severity: 'error',
        message: `Par "${pair.id}" (${pair.foreground} sobre ${pair.background}, role=${role}) reprovado: WCAG=${ratio}:1 (mín ${minWcagAA}:1), APCA Lc=${lc} (mín ${minApcaLc}).`,
        field_or_line: pair.id,
      });
    }
    if (ratio < minWcagAAA) {
      allAAA = false;
    }

    contrastAudits.push({
      pair_id: pair.id,
      foreground: pair.foreground,
      background: pair.background,
      wcag_ratio: ratio,
      apca_lc: lc,
      passed,
    });
  }

  // 2. Audit Target Sizes (WCAG 2.5.8 >= 24x24px AA, Mobile >= 44x44px)
  for (const target of input.targets || []) {
    const minSize = target.platform === 'mobile' ? 44 : 24;
    if (target.width < minSize || target.height < minSize) {
      issues.push({
        code: 'TARGET_SIZE_TOO_SMALL',
        severity: 'error',
        message: `Alvo interativo "${target.id}" mede ${target.width}x${target.height}px, abaixo do piso exigido de ${minSize}x${minSize}px (${target.platform || 'desktop'}).`,
        field_or_line: target.id,
      });
    }
  }

  // 3. Audit Spatial Rhythm (4pt / 8pt Grid)
  let spatialCompliant = true;
  for (const sp of input.spacings || []) {
    if (sp.value % 4 !== 0) {
      spatialCompliant = false;
      issues.push({
        code: 'SPATIAL_GRID_VIOLATION',
        severity: 'error',
        message: `Espaçamento "${sp.id}" possui valor mágico (${sp.value}px) fora do ritmo espacial de 4px/8px.`,
        field_or_line: sp.id,
      });
    }
  }

  // 4. Audit Required 4 UI States (Default, Loading, Empty, Error)
  const states = {
    default: Boolean(input.statesCovered?.default),
    loading: Boolean(input.statesCovered?.loading),
    empty: Boolean(input.statesCovered?.empty),
    error: Boolean(input.statesCovered?.error),
  };

  for (const [stateName, covered] of Object.entries(states)) {
    if (!covered) {
      issues.push({
        code: 'MISSING_REQUIRED_UI_STATE',
        severity: 'error',
        message: `Estado obrigatório de UI ausente: "${stateName}". O Craft Guardian exige cobertura de Default, Loading, Empty e Error.`,
        field_or_line: `statesCovered.${stateName}`,
      });
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const gatePassed = errorCount === 0;
  const confidenceScore = Math.max(0, Number((1.0 - errorCount * 0.2 - warningCount * 0.05).toFixed(2)));

  return {
    status: gatePassed ? (warningCount === 0 ? 'success' : 'warning') : 'failed',
    gate_passed: gatePassed,
    wcag_level_achieved: anyContrastFail ? 'FAIL' : allAAA ? 'AAA' : 'AA',
    confidence_score: confidenceScore,
    contrast_audits: contrastAudits,
    states_covered: states,
    spatial_grid_compliant: spatialCompliant,
    validation_errors: issues,
  };
}

if (require.main === module) {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error(
      JSON.stringify(
        {
          status: 'SCHEMA_MISMATCH',
          message: 'Uso: npx tsx audit-craft-a11y.ts <caminho-do-json-de-auditoria>',
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  try {
    const resolved = path.resolve(inputPath);
    const data = JSON.parse(fs.readFileSync(resolved, 'utf-8')) as CraftAuditInput;
    const result = runCraftAndA11yAudit(data);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.gate_passed ? 0 : 1);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify(
        {
          status: 'SCHEMA_MISMATCH',
          gate_passed: false,
          confidence_score: 0,
          validation_errors: [{ code: 'JSON_PARSE_ERROR', severity: 'error', message: msg }],
        },
        null,
        2
      )
    );
    process.exit(1);
  }
}
