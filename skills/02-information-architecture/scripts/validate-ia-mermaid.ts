/**
 * Open UX Harness — Deterministic IA & Mermaid Wireflow Validator (Code as Action)
 * Skill: 02-information-architecture
 *
 * Analisa arquivos Markdown (contendo blocos ```mermaid) ou o contrato JSON `.harness/memory/ia-state.json`,
 * verificando:
 * 1. Tipos de diagrama permitidos (`flowchart TD`, `flowchart LR`, `stateDiagram-v2`, `erDiagram`).
 * 2. Proibição absoluta de tags HTML (`<br>`, `<b>`, `<i>`, `<span>`, etc.) dentro de diagramas Mermaid.
 * 3. Exigência de aspas duplas em rótulos de nós que contenham parênteses `id["Texto (Info)"]`.
 * 4. Presença de nós de decisão condicional `{...}` e rotas de tratamento de erro/recuperação em wireflows.
 * 5. Integridade estrutural do contrato `ia-state.json` (quando o input for JSON).
 *
 * Usage:
 *   node --experimental-strip-types skills/02-information-architecture/scripts/validate-ia-mermaid.ts <path-to-md-or-json>
 */

import * as fs from 'fs';
import * as path from 'path';

export interface IAValidationIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  field_or_line?: string;
}

export interface IAValidationReport {
  status: 'success' | 'warning' | 'failed' | 'SCHEMA_MISMATCH';
  target_file: string;
  diagrams_analyzed: number;
  confidence_score: number;
  validation_errors: IAValidationIssue[];
}

const ALLOWED_DIAGRAM_HEADERS = [
  /^flowchart\s+(TD|LR|TB|RL)\b/,
  /^stateDiagram-v2\b/,
  /^erDiagram\b/,
];

/**
 * Validates a single Mermaid code block string.
 */
export function validateMermaidBlock(code: string, blockIdentifier: string): IAValidationIssue[] {
  const issues: IAValidationIssue[] = [];
  const lines = code.trim().split(/\r?\n/);

  if (lines.length === 0 || !lines[0].trim()) {
    issues.push({
      code: 'MERMAID_EMPTY_BLOCK',
      severity: 'error',
      message: `O bloco Mermaid '${blockIdentifier}' está vazio.`,
      field_or_line: blockIdentifier,
    });
    return issues;
  }

  const firstContentLine = lines.find((l) => l.trim().length > 0 && !l.trim().startsWith('%%'))?.trim() || '';
  const isAllowedHeader = ALLOWED_DIAGRAM_HEADERS.some((regex) => regex.test(firstContentLine));

  if (!isAllowedHeader) {
    issues.push({
      code: 'MERMAID_UNSUPPORTED_DIAGRAM_TYPE',
      severity: 'error',
      message: `Cabeçalho Mermaid inválido em '${blockIdentifier}': "${firstContentLine}". Use apenas 'flowchart TD', 'flowchart LR', 'stateDiagram-v2' ou 'erDiagram'.`,
      field_or_line: `${blockIdentifier}:L1`,
    });
  }

  const isFlowchart = /^flowchart\s+/.test(firstContentLine);
  let hasDecisionNode = false;
  let hasErrorRecoveryNode = false;

  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    const line = rawLine.trim();
    if (!line || line.startsWith('%%')) return;

    // 1. Proibição de tags HTML (<br>, <br/>, <b>, <i>, <div>, <span>)
    const htmlTagMatch = line.match(/<\/?[a-zA-Z][a-zA-Z0-9]*(\s[^>]*)?\/?>/);
    if (htmlTagMatch) {
      issues.push({
        code: 'MERMAID_HTML_TAG_FORBIDDEN',
        severity: 'error',
        message: `Tag HTML proibida (${htmlTagMatch[0]}) detectada no diagrama '${blockIdentifier}'. Use apenas texto puro entre aspas duplas.`,
        field_or_line: `${blockIdentifier}:L${lineNum}`,
      });
    }

    // 2. Exigência de aspas duplas em rótulos com parênteses dentro de colchetes ou chaves
    // Detecta padrões como id[Texto (Info)] ou id{Texto (Info)} sem aspas duplas envolvendo o rótulo
    const unquotedBracketParens = line.match(/[A-Za-z0-9_]+\[[^\]"\r\n]*\([^\]"\r\n]*\)[^\]"\r\n]*\]/);
    const unquotedBraceParens = line.match(/[A-Za-z0-9_]+\{[^}"\r\n]*\([^}"\r\n]*\)[^}"\r\n]*\}/);

    if (unquotedBracketParens || unquotedBraceParens) {
      issues.push({
        code: 'MERMAID_UNQUOTED_PARENTHESES',
        severity: 'error',
        message: `Rótulo contendo parênteses sem aspas duplas detectado em '${blockIdentifier}'. Use sempre id["Texto (Info)"] ou id{"Decisão (Info)?"}.`,
        field_or_line: `${blockIdentifier}:L${lineNum}`,
      });
    }

    // 3. Rastrear nós de decisão e estados de erro em flowcharts
    if (isFlowchart) {
      if (/[A-Za-z0-9_]+\s*\{/.test(line)) {
        hasDecisionNode = true;
      }
      if (/\b(err|erro|error|falha|fail|invalid|inválid|empty|vazio|retry|tentar)\b/i.test(line)) {
        hasErrorRecoveryNode = true;
      }
    }
  });

  if (isFlowchart) {
    if (!hasDecisionNode) {
      issues.push({
        code: 'WIREFLOW_MISSING_DECISION_NODE',
        severity: 'error',
        message: `O wireflow '${blockIdentifier}' não contém nenhum nó de decisão condicional (losango '{...}'). Todo wireflow deve modelar bifurcações reais.`,
        field_or_line: blockIdentifier,
      });
    }
    if (!hasErrorRecoveryNode) {
      issues.push({
        code: 'WIREFLOW_MISSING_ERROR_OR_EMPTY_STATE',
        severity: 'warning',
        message: `O wireflow '${blockIdentifier}' parece conter apenas o Happy Path. Inclua explícita cobertura de estados de Erro/Recuperação ou Empty State.`,
        field_or_line: blockIdentifier,
      });
    }
  }

  return issues;
}

/**
 * Validates either a Markdown file with ```mermaid blocks or an ia-state.json file.
 */
export function validateIAFile(filePath: string): IAValidationReport {
  const resolvedPath = path.resolve(filePath);
  const issues: IAValidationIssue[] = [];

  if (!fs.existsSync(resolvedPath)) {
    return {
      status: 'SCHEMA_MISMATCH',
      target_file: resolvedPath,
      diagrams_analyzed: 0,
      confidence_score: 0,
      validation_errors: [
        {
          code: 'FILE_NOT_FOUND',
          severity: 'error',
          message: `Arquivo não encontrado para validação de IA: ${resolvedPath}`,
        },
      ],
    };
  }

  const rawContent = fs.readFileSync(resolvedPath, 'utf-8');
  let diagramsAnalyzed = 0;

  if (resolvedPath.endsWith('.json')) {
    let parsed: Record<string, any>;
    try {
      parsed = JSON.parse(rawContent);
    } catch (err: any) {
      return {
        status: 'SCHEMA_MISMATCH',
        target_file: resolvedPath,
        diagrams_analyzed: 0,
        confidence_score: 0,
        validation_errors: [
          {
            code: 'INVALID_JSON_SYNTAX',
            severity: 'error',
            message: `Erro de sintaxe JSON em ia-state.json: ${err.message}`,
          },
        ],
      };
    }

    if (parsed.skill_id !== '02-information-architecture') {
      issues.push({
        code: 'INVALID_SKILL_ID',
        severity: 'error',
        message: `O campo skill_id deve ser exatamente "02-information-architecture" (recebido: "${parsed.skill_id}").`,
        field_or_line: 'skill_id',
      });
    }

    const payload = parsed.payload;
    if (!payload || typeof payload !== 'object') {
      issues.push({
        code: 'MISSING_PAYLOAD',
        severity: 'error',
        message: 'O objeto "payload" é obrigatório em ia-state.json.',
        field_or_line: 'payload',
      });
    } else {
      if (!Array.isArray(payload.objects_orca) || payload.objects_orca.length === 0) {
        issues.push({
          code: 'MISSING_OBJECTS_ORCA',
          severity: 'error',
          message: 'A lista "payload.objects_orca" deve conter pelo menos 1 objeto de domínio mapeado.',
          field_or_line: 'payload.objects_orca',
        });
      }

      if (!Array.isArray(payload.sitemap_nodes) || payload.sitemap_nodes.length === 0) {
        issues.push({
          code: 'MISSING_SITEMAP_NODES',
          severity: 'error',
          message: 'A lista "payload.sitemap_nodes" deve conter os nós navegacionais mapeados.',
          field_or_line: 'payload.sitemap_nodes',
        });
      }

      if (typeof payload.cognitive_walkthrough_passed !== 'boolean') {
        issues.push({
          code: 'MISSING_COGNITIVE_WALKTHROUGH_FLAG',
          severity: 'error',
          message: 'O booleano "payload.cognitive_walkthrough_passed" é obrigatório.',
          field_or_line: 'payload.cognitive_walkthrough_passed',
        });
      }

      if (!Array.isArray(payload.mermaid_diagrams) || payload.mermaid_diagrams.length === 0) {
        issues.push({
          code: 'MISSING_MERMAID_DIAGRAMS',
          severity: 'error',
          message: 'A lista "payload.mermaid_diagrams" deve conter pelo menos 1 diagrama Mermaid.',
          field_or_line: 'payload.mermaid_diagrams',
        });
      } else {
        for (const diag of payload.mermaid_diagrams) {
          diagramsAnalyzed++;
          const blockId = diag.diagram_id || `diagram_${diagramsAnalyzed}`;
          const blockIssues = validateMermaidBlock(diag.code || '', blockId);
          issues.push(...blockIssues);
        }
      }
    }

    if (!parsed.nextStepRouting || !parsed.nextStepRouting.pathA || !parsed.nextStepRouting.pathB) {
      issues.push({
        code: 'MISSING_NEXT_STEP_ROUTING',
        severity: 'error',
        message: 'O bloco "nextStepRouting" com "pathA" (03-design-tokens) e "pathB" (04-figma-engineering) é obrigatório.',
        field_or_line: 'nextStepRouting',
      });
    }
  } else {
    // Markdown file analysis
    const mermaidRegex = /```mermaid\r?\n([\s\S]*?)```/g;
    let match: RegExpExecArray | null;
    while ((match = mermaidRegex.exec(rawContent)) !== null) {
      diagramsAnalyzed++;
      const blockIssues = validateMermaidBlock(match[1], `mermaid_block_${diagramsAnalyzed}`);
      issues.push(...blockIssues);
    }

    if (diagramsAnalyzed === 0) {
      issues.push({
        code: 'NO_MERMAID_BLOCKS_FOUND',
        severity: 'error',
        message: 'Nenhum bloco ```mermaid foi encontrado no documento Markdown especificado.',
        field_or_line: 'document',
      });
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const confidenceScore = Math.max(0, Number((1.0 - errorCount * 0.25 - warningCount * 0.05).toFixed(2)));

  let status: IAValidationReport['status'] = 'success';
  if (errorCount > 0) {
    status = 'SCHEMA_MISMATCH';
  } else if (warningCount > 0) {
    status = 'warning';
  }

  return {
    status,
    target_file: resolvedPath,
    diagrams_analyzed: diagramsAnalyzed,
    confidence_score: confidenceScore,
    validation_errors: issues,
  };
}

// CLI execution
const isMainModule =
  typeof process !== 'undefined' &&
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(import.meta.filename || __filename);

if (isMainModule) {
  const targetArg = process.argv[2];
  if (!targetArg) {
    console.error(
      JSON.stringify(
        {
          status: 'SCHEMA_MISMATCH',
          message: 'Uso: node --experimental-strip-types validate-ia-mermaid.ts <arquivo.md | ia-state.json>',
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  const report = validateIAFile(targetArg);
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.status === 'SCHEMA_MISMATCH' || report.status === 'failed' ? 1 : 0);
}
