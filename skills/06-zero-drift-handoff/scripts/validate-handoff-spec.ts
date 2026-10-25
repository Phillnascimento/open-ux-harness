/**
 * Open UX Harness — Deterministic Zero-Drift Handoff Spec Validator (Code as Action)
 * Audits a Markdown/TSX handoff specification to guarantee:
 * 1. Explicit Catalog Reuse Decision (REUSE | EXTEND | NEW_COMPONENT)
 * 2. Zero hardcoded HEX colors (#RRGGBB) or arbitrary Tailwind magic pixel values (e.g., w-[123px], bg-[#fff])
 * 3. Gherkin behavioral scenarios (Given / When / Then) covering critical UI states:
 *    default, loading, error, disabled, empty, focus (focus-visible)
 *
 * Usage:
 *   node --experimental-strip-types skills/06-zero-drift-handoff/scripts/validate-handoff-spec.ts <path-to-handoff-spec.md>
 */

import * as fs from 'fs';
import * as path from 'path';

export interface HandoffValidationIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  field_or_line?: string;
}

export interface HandoffValidationResult {
  status: 'success' | 'warning' | 'failed' | 'SCHEMA_MISMATCH';
  spec_path: string;
  confidence_score: number;
  catalog_decisions_found: string[];
  gherkin_states_covered: string[];
  missing_critical_states: string[];
  zero_hardcoded_values: boolean;
  hardcoded_violations_count: number;
  validation_errors: HandoffValidationIssue[];
}

const CRITICAL_UI_STATES: Array<{ id: string; pattern: RegExp }> = [
  { id: 'default', pattern: /\bdefault\b/i },
  { id: 'loading', pattern: /\b(loading|skeleton|isLoading|aria-busy)\b/i },
  { id: 'error', pattern: /\b(error|validation|hasError|aria-invalid)\b/i },
  { id: 'disabled', pattern: /\b(disabled|aria-disabled)\b/i },
  { id: 'empty', pattern: /\b(empty|zero[\s-]data|overflow|truncate)\b/i },
  { id: 'focus', pattern: /\b(focus|focus-visible)\b/i },
];

const OPTIONAL_UI_STATES: Array<{ id: string; pattern: RegExp }> = [
  { id: 'hover', pattern: /\bhover\b/i },
  { id: 'active', pattern: /\bactive\b/i },
];

export function validateHandoffSpec(specFilePath: string): HandoffValidationResult {
  const resolvedPath = path.resolve(specFilePath);
  const issues: HandoffValidationIssue[] = [];

  if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
    return {
      status: 'SCHEMA_MISMATCH',
      spec_path: resolvedPath,
      confidence_score: 0,
      catalog_decisions_found: [],
      gherkin_states_covered: [],
      missing_critical_states: CRITICAL_UI_STATES.map((s) => s.id),
      zero_hardcoded_values: false,
      hardcoded_violations_count: 0,
      validation_errors: [
        {
          code: 'SPEC_FILE_NOT_FOUND',
          severity: 'error',
          message: `Arquivo de especificação de handoff não encontrado: ${resolvedPath}`,
        },
      ],
    };
  }

  const content = fs.readFileSync(resolvedPath, 'utf-8');
  const lines = content.split(/\r?\n/);

  // 1. Check Explicit Catalog Reuse Strategy (REUSE | EXTEND | NEW_COMPONENT)
  const decisionMatches = content.match(/\b(REUSE|EXTEND|NEW_COMPONENT)\b/g) || [];
  const uniqueDecisions = Array.from(new Set(decisionMatches));

  if (uniqueDecisions.length === 0) {
    issues.push({
      code: 'MISSING_CATALOG_DECISION',
      severity: 'error',
      message:
        'A especificação deve declarar explicitamente a estratégia de catálogo: REUSE, EXTEND ou NEW_COMPONENT.',
    });
  }

  // 2. Scan for Hardcoded HEX Colors and Arbitrary Magic Pixels outside token definitions
  let hardcodedCount = 0;
  const hexColorRegex = /#[0-9A-Fa-f]{3,8}\b/g;
  const tailwindArbitraryPxRegex = /\b(?:w|h|min-w|min-h|max-w|max-h|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|top|bottom|left|right|text|rounded)-\[\d+(?:\.\d+)?(?:px|rem)\]/g;
  const tailwindArbitraryHexRegex = /\b(?:bg|text|border|ring|fill|stroke)-\[#[0-9A-Fa-f]{3,8}\]/g;

  lines.forEach((line, idx) => {
    const lineNumber = idx + 1;
    const trimmed = line.trim();

    // Ignore comments or lines explicitly illustrating forbidden patterns
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('*') ||
      /PROIBIDO|FORBIDDEN|NUNCA|NEVER/i.test(trimmed)
    ) {
      return;
    }

    const arbitraryHexMatches = trimmed.match(tailwindArbitraryHexRegex);
    if (arbitraryHexMatches) {
      hardcodedCount += arbitraryHexMatches.length;
      issues.push({
        code: 'HARDCODED_TAILWIND_HEX',
        severity: 'error',
        message: `Cor hexadecimal arbitrária detectada (${arbitraryHexMatches.join(', ')}). Substitua por um Design Token semântico.`,
        field_or_line: `line:${lineNumber}`,
      });
    } else {
      // Check raw HEX colors in code/styles (excluding URL anchors like #L10 or markdown headers)
      const hexMatches = trimmed.match(hexColorRegex);
      if (hexMatches && !trimmed.includes('http://') && !trimmed.includes('https://')) {
        hardcodedCount += hexMatches.length;
        issues.push({
          code: 'HARDCODED_HEX_COLOR',
          severity: 'error',
          message: `Valor hexadecimal hardcoded detectado (${hexMatches.join(', ')}). Use variáveis CSS var(--*) ou tokens semânticos.`,
          field_or_line: `line:${lineNumber}`,
        });
      }
    }

    const arbitraryPxMatches = trimmed.match(tailwindArbitraryPxRegex);
    if (arbitraryPxMatches) {
      hardcodedCount += arbitraryPxMatches.length;
      issues.push({
        code: 'HARDCODED_MAGIC_PIXELS',
        severity: 'error',
        message: `Valor de pixel mágico arbitrário detectado (${arbitraryPxMatches.join(', ')}). Utilize a escala de tokens de espaçamento/dimensão.`,
        field_or_line: `line:${lineNumber}`,
      });
    }
  });

  // 3. Check Gherkin Structure (Given / When / Then) & Critical UI States Coverage
  const hasGherkinKeywords =
    /\bGiven\b/i.test(content) && /\bWhen\b/i.test(content) && /\bThen\b/i.test(content);

  if (!hasGherkinKeywords) {
    issues.push({
      code: 'GHERKIN_STRUCTURE_MISSING',
      severity: 'error',
      message:
        'A especificação deve conter cenários comportamentais estruturados em Gherkin (Given / When / Then).',
    });
  }

  const coveredStates: string[] = [];
  const missingCriticalStates: string[] = [];

  for (const state of CRITICAL_UI_STATES) {
    if (state.pattern.test(content)) {
      coveredStates.push(state.id === 'focus' ? 'focus-visible' : state.id);
    } else {
      missingCriticalStates.push(state.id);
      issues.push({
        code: `MISSING_UI_STATE_${state.id.toUpperCase()}`,
        severity: 'error',
        message: `Estado crítico de UI "${state.id}" ausente na especificação comportamental Gherkin.`,
      });
    }
  }

  for (const optState of OPTIONAL_UI_STATES) {
    if (optState.pattern.test(content)) {
      coveredStates.push(optState.id);
    } else {
      issues.push({
        code: `MISSING_INTERACTIVE_STATE_${optState.id.toUpperCase()}`,
        severity: 'warning',
        message: `Recomenda-se documentar explicitamente o estado "${optState.id}" para paridade com os 8 estados de UI.`,
      });
    }
  }

  // 4. Check TypeScript Props Interface Presence
  if (!/\binterface\s+\w+Props\b|\btype\s+\w+Props\b/.test(content)) {
    issues.push({
      code: 'MISSING_TYPESCRIPT_PROPS_CONTRACT',
      severity: 'warning',
      message:
        'Contrato de propriedades TypeScript (interface <Component>Props) não identificado na especificação.',
    });
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  const confidenceScore = Math.max(
    0,
    Number((1.0 - errorCount * 0.2 - warningCount * 0.05).toFixed(2))
  );

  const status: HandoffValidationResult['status'] =
    errorCount > 0 ? 'failed' : warningCount > 0 ? 'warning' : 'success';

  return {
    status,
    spec_path: resolvedPath,
    confidence_score: confidenceScore,
    catalog_decisions_found: uniqueDecisions,
    gherkin_states_covered: coveredStates,
    missing_critical_states: missingCriticalStates,
    zero_hardcoded_values: hardcodedCount === 0,
    hardcoded_violations_count: hardcodedCount,
    validation_errors: issues,
  };
}

// CLI Runner
const isMainModule =
  typeof require !== 'undefined' && require.main === module
    ? true
    : process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isMainModule) {
  const targetSpec = process.argv[2];
  if (!targetSpec) {
    console.error(
      JSON.stringify(
        {
          status: 'SCHEMA_MISMATCH',
          message:
            'Uso: node --experimental-strip-types skills/06-zero-drift-handoff/scripts/validate-handoff-spec.ts <caminho-do-handoff-spec.md>',
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  const result = validateHandoffSpec(targetSpec);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === 'failed' || result.status === 'SCHEMA_MISMATCH' ? 1 : 0);
}
