/**
 * Open UX Harness — Deterministic W3C DTCG 2025.10 & Spatial Grid Validator (Code as Action)
 * Skill: 03-design-tokens
 *
 * Valida arquivos de Design Tokens (`.json` no formato W3C DTCG 2025.10):
 * 1. Sintaxe estrita W3C DTCG (`$value` obrigatório em folhas, `$type` explícito ou herdado do grupo ancestral).
 * 2. Resolução completa do grafo de aliases `{group.token}` (detecta aliases quebrados e referências circulares).
 * 3. Auditoria matemática da grade espacial de 4pt/8pt em tokens de espaçamento (`spacing` / `layout.gap`).
 * 4. Alerta contra nomes de cores físicas literais (`blue`, `red`, `green`, `gray`, `slate`, etc.) dentro da camada `semantic`.
 *
 * Usage:
 *   node --experimental-strip-types skills/03-design-tokens/scripts/validate-tokens.ts <path-to-tokens.json>
 */

import * as fs from 'fs';
import * as path from 'path';

export interface TokenValidationIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  field_or_line?: string;
}

export interface TokenValidationReport {
  status: 'success' | 'warning' | 'failed' | 'SCHEMA_MISMATCH';
  target_file: string;
  total_primitive_tokens: number;
  total_semantic_tokens: number;
  aliases_resolved: boolean;
  confidence_score: number;
  validation_errors: TokenValidationIssue[];
}

interface FlattenedToken {
  path: string;
  value: unknown;
  type: string | undefined;
  description?: string;
}

const VALID_DTCG_TYPES = new Set([
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'duration',
  'cubicBezier',
  'number',
  'strokeStyle',
  'border',
  'transition',
  'shadow',
  'gradient',
  'typography',
]);

const FORBIDDEN_LITERAL_COLOR_NAMES_IN_SEMANTIC = /\b(red|blue|green|yellow|purple|pink|orange|indigo|teal|cyan|emerald|amber|rose|violet|gray|grey|slate|zinc|neutral)\b/i;

/**
 * Traverses the DTCG JSON object and collects all leaf tokens with their inherited $type.
 */
function collectTokens(
  node: Record<string, any>,
  currentPath: string[],
  inheritedType: string | undefined,
  tokensMap: Map<string, FlattenedToken>,
  issues: TokenValidationIssue[]
): void {
  const effectiveType = typeof node.$type === 'string' ? node.$type : inheritedType;

  if ('$value' in node) {
    const tokenPath = currentPath.join('.');
    if (!effectiveType) {
      issues.push({
        code: 'DTCG_MISSING_TYPE',
        severity: 'error',
        message: `O token "${tokenPath}" possui "$value", mas não define "$type" próprio nem herda de um grupo pai.`,
        field_or_line: tokenPath,
      });
    } else if (!VALID_DTCG_TYPES.has(effectiveType)) {
      issues.push({
        code: 'DTCG_INVALID_TYPE',
        severity: 'warning',
        message: `O token "${tokenPath}" usa um "$type" fora do catálogo canônico W3C DTCG 2025.10: "${effectiveType}".`,
        field_or_line: tokenPath,
      });
    }

    tokensMap.set(tokenPath, {
      path: tokenPath,
      value: node.$value,
      type: effectiveType,
      description: node.$description,
    });
    return;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;

    if (/[{}.]/.test(key)) {
      const badPath = [...currentPath, key].join('.');
      issues.push({
        code: 'DTCG_FORBIDDEN_KEY_CHARACTER',
        severity: 'error',
        message: `A chave "${key}" em "${badPath}" contém caracteres proibidos pela especificação DTCG ('{', '}' ou '.').`,
        field_or_line: badPath,
      });
    }

    if (child && typeof child === 'object' && !Array.isArray(child)) {
      collectTokens(child, [...currentPath, key], effectiveType, tokensMap, issues);
    }
  }
}

/**
 * Validates a W3C DTCG JSON file.
 */
export function validateTokensFile(filePath: string): TokenValidationReport {
  const resolvedPath = path.resolve(filePath);
  const issues: TokenValidationIssue[] = [];

  if (!fs.existsSync(resolvedPath)) {
    return {
      status: 'SCHEMA_MISMATCH',
      target_file: resolvedPath,
      total_primitive_tokens: 0,
      total_semantic_tokens: 0,
      aliases_resolved: false,
      confidence_score: 0,
      validation_errors: [
        {
          code: 'FILE_NOT_FOUND',
          severity: 'error',
          message: `Arquivo de Design Tokens não encontrado: ${resolvedPath}`,
        },
      ],
    };
  }

  let rawJson: Record<string, any>;
  try {
    rawJson = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
  } catch (err: any) {
    return {
      status: 'SCHEMA_MISMATCH',
      target_file: resolvedPath,
      total_primitive_tokens: 0,
      total_semantic_tokens: 0,
      aliases_resolved: false,
      confidence_score: 0,
      validation_errors: [
        {
          code: 'INVALID_JSON_SYNTAX',
          severity: 'error',
          message: `Erro ao fazer parse do JSON de Design Tokens: ${err.message}`,
        },
      ],
    };
  }

  const tokensMap = new Map<string, FlattenedToken>();
  collectTokens(rawJson, [], undefined, tokensMap, issues);

  if (tokensMap.size === 0) {
    issues.push({
      code: 'NO_DTCG_TOKENS_FOUND',
      severity: 'error',
      message: 'Nenhum token com a propriedade "$value" (padrão W3C DTCG) foi encontrado no arquivo.',
    });
  }

  let primitiveCount = 0;
  let semanticCount = 0;
  let allAliasesResolved = true;

  for (const [tokenPath, token] of tokensMap.entries()) {
    if (tokenPath.startsWith('primitive.')) primitiveCount++;
    if (tokenPath.startsWith('semantic.')) semanticCount++;

    // 1. Check semantic layer naming hygiene (no literal color names like semantic.color.blue)
    if (tokenPath.startsWith('semantic.')) {
      const relativeSemanticName = tokenPath.replace(/^semantic\./, '');
      if (FORBIDDEN_LITERAL_COLOR_NAMES_IN_SEMANTIC.test(relativeSemanticName)) {
        issues.push({
          code: 'SEMANTIC_LITERAL_COLOR_NAME',
          severity: 'warning',
          message: `O token semântico "${tokenPath}" utiliza nome de cor física literal. Use nomes baseados em intenção (ex.: surface.canvas, action.primary-bg, status.danger-text).`,
          field_or_line: tokenPath,
        });
      }
    }

    // 2. Check alias resolution and circular references `{a.b.c}`
    if (typeof token.value === 'string') {
      const aliasRegex = /^\{([^{}]+)\}$/;
      const match = token.value.match(aliasRegex);
      if (match) {
        const visited = new Set<string>([tokenPath]);
        let currentTarget = match[1];

        while (true) {
          if (visited.has(currentTarget)) {
            allAliasesResolved = false;
            issues.push({
              code: 'DTCG_CIRCULAR_ALIAS',
              severity: 'error',
              message: `Referência circular de alias detectada iniciando em "${tokenPath}" -> "${ Array.from(visited).join(' -> ') } -> ${currentTarget}".`,
              field_or_line: tokenPath,
            });
            break;
          }

          const targetToken = tokensMap.get(currentTarget);
          if (!targetToken) {
            allAliasesResolved = false;
            issues.push({
              code: 'DTCG_BROKEN_ALIAS',
              severity: 'error',
              message: `O token "${tokenPath}" referencia um alias inexistente: "{${currentTarget}}".`,
              field_or_line: tokenPath,
            });
            break;
          }

          visited.add(currentTarget);
          if (typeof targetToken.value === 'string') {
            const nextMatch = targetToken.value.match(aliasRegex);
            if (nextMatch) {
              currentTarget = nextMatch[1];
              continue;
            }
          }
          break;
        }
      }
    }

    // 3. Check 4pt/8pt spatial grid compliance on spacing tokens
    const isSpacingToken =
      tokenPath.includes('spacing.') ||
      tokenPath.includes('layout.gap');

    if (isSpacingToken && typeof token.value === 'string' && !token.value.startsWith('{')) {
      const pxMatch = token.value.trim().match(/^(-?\d+(?:\.\d+)?)px$/i);
      if (pxMatch) {
        const numericPx = Number(pxMatch[1]);
        if (numericPx !== 0 && numericPx !== 2 && numericPx % 4 !== 0) {
          issues.push({
            code: 'SPATIAL_GRID_VIOLATION',
            severity: 'error',
            message: `O token de espaçamento "${tokenPath}" possui valor "${token.value}", que viola a grade matemática de 4pt/8pt (deve ser múltiplo de 4px).`,
            field_or_line: tokenPath,
          });
        }
      }
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const confidenceScore = Math.max(0, Number((1.0 - errorCount * 0.25 - warningCount * 0.05).toFixed(2)));

  let status: TokenValidationReport['status'] = 'success';
  if (errorCount > 0) {
    status = 'SCHEMA_MISMATCH';
  } else if (warningCount > 0) {
    status = 'warning';
  }

  return {
    status,
    target_file: resolvedPath,
    total_primitive_tokens: primitiveCount,
    total_semantic_tokens: semanticCount,
    aliases_resolved: allAliasesResolved,
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
          message: 'Uso: node --experimental-strip-types validate-tokens.ts <caminho-do-tokens.json>',
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  const report = validateTokensFile(targetArg);
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.status === 'SCHEMA_MISMATCH' || report.status === 'failed' ? 1 : 0);
}
