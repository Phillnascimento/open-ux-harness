/**
 * Open UX Harness — Deterministic Figma Tree & Auto Layout Validator (Code as Action)
 * Audits Figma node JSON specifications against strict Auto Layout rules, semantic naming,
 * and variable bindings (`boundVariables`).
 *
 * Usage:
 *   npx tsx skills/04-figma-engineering/scripts/validate-figma-spec.ts <path-to-figma-nodes.json>
 */

import * as fs from 'fs';
import * as path from 'path';

export interface FigmaNodeSpec {
  id: string;
  name: string;
  type: 'FRAME' | 'COMPONENT' | 'COMPONENT_SET' | 'INSTANCE' | 'TEXT' | 'GROUP' | 'VECTOR' | 'RECTANGLE';
  layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  layoutPositioning?: 'AUTO' | 'ABSOLUTE';
  layoutSizingHorizontal?: 'FIXED' | 'HUG' | 'FILL';
  layoutSizingVertical?: 'FIXED' | 'HUG' | 'FILL';
  itemSpacing?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  fills?: Array<{ type: string; color?: string; visible?: boolean }>;
  strokes?: Array<{ type: string; color?: string; visible?: boolean }>;
  boundVariables?: Record<string, unknown>;
  children?: FigmaNodeSpec[];
}

export interface ValidationIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  field_or_line?: string;
}

export interface FigmaSpecValidationResult {
  status: 'success' | 'warning' | 'failed' | 'SCHEMA_MISMATCH';
  nodes_audited: number;
  auto_layout_coverage: number;
  variable_binding_coverage: number;
  confidence_score: number;
  validation_errors: ValidationIssue[];
}

const GENERIC_LAYER_PATTERNS = [
  /^Frame\s*\d+$/i,
  /^Group\s*\d+$/i,
  /^Rectangle\s*\d+$/i,
  /^Vector\s*\d+$/i,
  /^Ellipse\s*\d+$/i,
  /^Component\s*\d+$/i,
  /^Instance\s*\d+$/i,
];

export function validateFigmaNodeTree(rootNodeOrArray: FigmaNodeSpec | FigmaNodeSpec[]): FigmaSpecValidationResult {
  const issues: ValidationIssue[] = [];
  const roots = Array.isArray(rootNodeOrArray) ? rootNodeOrArray : [rootNodeOrArray];

  let totalNodes = 0;
  let structuralContainers = 0;
  let validAutoLayoutContainers = 0;
  let bindablePropertiesCount = 0;
  let boundPropertiesCount = 0;

  function traverse(node: FigmaNodeSpec, nodePath: string): void {
    totalNodes++;
    const currentPath = `${nodePath}/${node.name || 'Unnamed'}[${node.id || '?'}]`;

    // 1. Check generic layer naming
    if (!node.name || GENERIC_LAYER_PATTERNS.some((regex) => regex.test(node.name.trim()))) {
      issues.push({
        code: 'GENERIC_LAYER_NAME',
        severity: 'error',
        message: `Camada com nome genérico ou vazio detectada ("${node.name}"). Use nomenclatura semântica orientada a componentes (ex: HeaderContainer, ActionToolbar).`,
        field_or_line: currentPath,
      });
    }

    // 2. Reject legacy GROUP nodes for layout
    if (node.type === 'GROUP') {
      issues.push({
        code: 'LEGACY_GROUP_FORBIDDEN',
        severity: 'error',
        message: `Nó do tipo GROUP detectado em "${node.name}". Converta para FRAME ou COMPONENT com Auto Layout ativo.`,
        field_or_line: currentPath,
      });
    }

    // 3. Enforce Auto Layout on structural containers (FRAME, COMPONENT, COMPONENT_SET)
    const isStructuralContainer =
      (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') &&
      Array.isArray(node.children) &&
      node.children.length > 0;

    if (isStructuralContainer) {
      structuralContainers++;
      if (!node.layoutMode || node.layoutMode === 'NONE') {
        issues.push({
          code: 'MISSING_AUTO_LAYOUT',
          severity: 'error',
          message: `Container estrutural "${node.name}" possui layoutMode: "${node.layoutMode || 'NONE'}". Todo container com filhos deve usar layoutMode: "HORIZONTAL" ou "VERTICAL".`,
          field_or_line: currentPath,
        });
      } else {
        validAutoLayoutContainers++;
      }
    }

    // 4. Verify boundVariables on spacing, padding, and fills
    const boundVars = node.boundVariables || {};

    if (typeof node.itemSpacing === 'number' && node.itemSpacing > 0) {
      bindablePropertiesCount++;
      if (boundVars.itemSpacing) {
        boundPropertiesCount++;
      } else {
        issues.push({
          code: 'UNBOUND_ITEM_SPACING',
          severity: 'error',
          message: `Propriedade itemSpacing (${node.itemSpacing}px) em "${node.name}" não está vinculada a uma variável em boundVariables.itemSpacing.`,
          field_or_line: currentPath,
        });
      }
    }

    const paddings: Array<'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'> = [
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
    ];
    for (const padKey of paddings) {
      const val = node[padKey];
      if (typeof val === 'number' && val > 0) {
        bindablePropertiesCount++;
        if (boundVars[padKey]) {
          boundPropertiesCount++;
        } else {
          issues.push({
            code: 'UNBOUND_PADDING_TOKEN',
            severity: 'error',
            message: `Propriedade ${padKey} (${val}px) em "${node.name}" está hardcoded sem vínculo em boundVariables.${padKey}.`,
            field_or_line: currentPath,
          });
        }
      }
    }

    if (Array.isArray(node.fills) && node.fills.some((f) => f.visible !== false)) {
      bindablePropertiesCount++;
      if (boundVars.fills) {
        boundPropertiesCount++;
      } else {
        issues.push({
          code: 'UNBOUND_COLOR_FILL',
          severity: 'error',
          message: `Preenchimento de cor (fills) em "${node.name}" não possui vínculo com token semântico em boundVariables.fills.`,
          field_or_line: currentPath,
        });
      }
    }

    // Recurse children
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child, currentPath);
      }
    }
  }

  for (const root of roots) {
    traverse(root, 'root');
  }

  const autoLayoutCoverage =
    structuralContainers === 0 ? 1.0 : Number((validAutoLayoutContainers / structuralContainers).toFixed(2));
  const variableBindingCoverage =
    bindablePropertiesCount === 0 ? 1.0 : Number((boundPropertiesCount / bindablePropertiesCount).toFixed(2));

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  const confidenceScore = Math.max(
    0,
    Number((1.0 - errorCount * 0.15 - warningCount * 0.05).toFixed(2))
  );

  return {
    status: errorCount === 0 ? (warningCount === 0 ? 'success' : 'warning') : 'failed',
    nodes_audited: totalNodes,
    auto_layout_coverage: autoLayoutCoverage,
    variable_binding_coverage: variableBindingCoverage,
    confidence_score: confidenceScore,
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
          message: 'Uso: npx tsx validate-figma-spec.ts <caminho-do-arquivo-json-de-nos-figma>',
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  try {
    const resolved = path.resolve(inputPath);
    const raw = JSON.parse(fs.readFileSync(resolved, 'utf-8'));
    const nodes = raw.nodes || raw.document || raw;
    const result = validateFigmaNodeTree(nodes);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.status === 'failed' ? 1 : 0);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify(
        {
          status: 'SCHEMA_MISMATCH',
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
