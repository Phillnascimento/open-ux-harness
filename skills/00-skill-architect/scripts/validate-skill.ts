/**
 * Open UX Harness — Deterministic Skill Validator (Code as Action)
 * Validates any skill folder against the "Super-Padrão Agnóstico"
 * (agentskills.io + Anthropic Claude + OpenAI GPT/Codex + Google Gemini/ADK + xAI Grok).
 *
 * Usage:
 *   npx tsx skills/00-skill-architect/scripts/validate-skill.ts skills/<skill-folder>
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

export interface ValidationIssue {
  code: string;
  severity: 'error' | 'warning';
  message: string;
  line?: number;
}

export interface SkillValidationResult {
  status: 'passed' | 'failed';
  skill_path: string;
  skill_name: string | null;
  line_count: number;
  word_count: number;
  confidence_score: number;
  validation_errors: ValidationIssue[];
}

const REQUIRED_XML_TAGS_IN_ORDER = [
  'role',
  'context',
  'reference_index',
  'execution_steps',
  'examples',
  'constraints',
  'output_schema',
];

export function validateSkillDirectory(skillDirPath: string): SkillValidationResult {
  const issues: ValidationIssue[] = [];
  const resolvedDir = path.resolve(skillDirPath);
  const folderName = path.basename(resolvedDir);
  const skillMdPath = path.join(resolvedDir, 'SKILL.md');

  if (!fs.existsSync(resolvedDir) || !fs.statSync(resolvedDir).isDirectory()) {
    return {
      status: 'failed',
      skill_path: resolvedDir,
      skill_name: null,
      line_count: 0,
      word_count: 0,
      confidence_score: 0,
      validation_errors: [
        {
          code: 'DIR_NOT_FOUND',
          severity: 'error',
          message: `O diretório da skill não existe: ${resolvedDir}`,
        },
      ],
    };
  }

  if (!fs.existsSync(skillMdPath)) {
    return {
      status: 'failed',
      skill_path: resolvedDir,
      skill_name: null,
      line_count: 0,
      word_count: 0,
      confidence_score: 0,
      validation_errors: [
        {
          code: 'SKILL_MD_MISSING',
          severity: 'error',
          message: `Arquivo obrigatório SKILL.md não encontrado em ${resolvedDir}`,
        },
      ],
    };
  }

  const rawContent = fs.readFileSync(skillMdPath, 'utf-8');
  const lines = rawContent.split(/\r?\n/);
  const lineCount = lines.length;

  // 1. Check Line Budget (< 500 lines per agentskills.io & Anthropic/OpenAI)
  if (lineCount > 500) {
    issues.push({
      code: 'LINE_BUDGET_EXCEEDED',
      severity: 'error',
      message: `SKILL.md possui ${lineCount} linhas (limite máximo permitido: 500 linhas). Mova detalhes extensos para references/ ou assets/.`,
    });
  } else if (lineCount > 350) {
    issues.push({
      code: 'LINE_BUDGET_WARNING',
      severity: 'warning',
      message: `SKILL.md possui ${lineCount} linhas. Recomenda-se manter abaixo de 300 linhas para otimizar o KV-Cache.`,
    });
  }

  // 1.1 Check Word Budget (Word Budget Policy inspirada no blader/humanizer para mitigar Lost-in-the-Middle)
  const wordCount = rawContent.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount > 5000) {
    issues.push({
      code: 'WORD_BUDGET_EXCEEDED',
      severity: 'error',
      message: `SKILL.md possui ${wordCount} palavras (limite máximo permitido: 5.000 palavras). Mova especificações densas para references/ ou assets/.`,
    });
  } else if (wordCount > 3500) {
    issues.push({
      code: 'WORD_BUDGET_WARNING',
      severity: 'warning',
      message: `SKILL.md possui ${wordCount} palavras. Recomenda-se manter abaixo de 3.500 palavras para otimizar o KV-Cache e a janela de contexto.`,
    });
  }

  // 2. Parse YAML Frontmatter
  const frontmatterMatch = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  let extractedName: string | null = null;
  let extractedDescription = '';

  if (!frontmatterMatch) {
    issues.push({
      code: 'FRONTMATTER_MISSING',
      severity: 'error',
      message: 'YAML Frontmatter (delimitado por --- no topo do arquivo) não encontrado.',
      line: 1,
    });
  } else {
    const yamlContent = frontmatterMatch[1];

    // Extract name
    const nameMatch = yamlContent.match(/^name:\s*([^\r\n#]+)/m);
    if (!nameMatch) {
      issues.push({
        code: 'NAME_MISSING',
        severity: 'error',
        message: 'Campo obrigatório `name:` ausente no YAML Frontmatter.',
      });
    } else {
      extractedName = nameMatch[1].trim().replace(/^['"]|['"]$/g, '');
      const nameRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

      if (extractedName.length > 64) {
        issues.push({
          code: 'NAME_TOO_LONG',
          severity: 'error',
          message: `O campo name ("${extractedName}") excede 64 caracteres (${extractedName.length}).`,
        });
      }

      if (!nameRegex.test(extractedName)) {
        issues.push({
          code: 'NAME_INVALID_FORMAT',
          severity: 'error',
          message: `O campo name ("${extractedName}") deve conter apenas letras minúsculas, números e hífens simples (^[a-z0-9]+(-[a-z0-9]+)*$).`,
        });
      }

      if (extractedName !== folderName) {
        issues.push({
          code: 'NAME_FOLDER_MISMATCH',
          severity: 'error',
          message: `Violação agentskills.io: O campo name ("${extractedName}") DEVE ser idêntico ao nome da pasta ("${folderName}").`,
        });
      }
    }

    // Extract description (handles single-line or multiline > / |)
    const descMatch = yamlContent.match(
      /^description:\s*(?:[>|][-+]?\s*\r?\n((?:[ \t]+[^\r\n]+\r?\n?)+)|([^\r\n]+))/m
    );
    if (!descMatch) {
      issues.push({
        code: 'DESCRIPTION_MISSING',
        severity: 'error',
        message: 'Campo obrigatório `description:` ausente no YAML Frontmatter.',
      });
    } else {
      extractedDescription = (descMatch[1] || descMatch[2] || '')
        .replace(/\r?\n\s*/g, ' ')
        .trim();

      if (extractedDescription.length === 0) {
        issues.push({
          code: 'DESCRIPTION_EMPTY',
          severity: 'error',
          message: 'O campo `description:` não pode estar vazio.',
        });
      } else if (extractedDescription.length > 1024) {
        issues.push({
          code: 'DESCRIPTION_TOO_LONG',
          severity: 'error',
          message: `O campo description possui ${extractedDescription.length} caracteres (limite máximo: 1024).`,
        });
      }

      // Check Negative Boundary (NUNCA / NEVER / DO NOT USE)
      const hasNegativeTrigger = /\b(NUNCA|NEVER|NÃO use|DO NOT use)\b/i.test(
        extractedDescription
      );
      if (!hasNegativeTrigger) {
        issues.push({
          code: 'DESCRIPTION_MISSING_NEGATIVE_BOUNDARY',
          severity: 'error',
          message:
            'A `description` deve incluir uma Fronteira Negativa explícita ("NUNCA use para..." ou "NEVER use for...") para evitar falsos positivos no roteador semântico (OpenAI/Gemini).',
        });
      }
    }
  }

  // 3. Validate XML Macro-Structure & Strict Ordering (Anti-Lost in the Middle)
  let lastTagIndex = -1;
  for (const tag of REQUIRED_XML_TAGS_IN_ORDER) {
    const openTagRegex = new RegExp(`<${tag}(\\s|>|$)`, 'i');
    const closeTagRegex = new RegExp(`</${tag}>`, 'i');

    const openMatch = openTagRegex.exec(rawContent);
    const closeMatch = closeTagRegex.exec(rawContent);

    if (!openMatch || !closeMatch) {
      issues.push({
        code: `XML_TAG_MISSING_${tag.toUpperCase()}`,
        severity: 'error',
        message: `Bloco XML obrigatório <${tag}>...</${tag}> ausente no SKILL.md.`,
      });
    } else {
      if (openMatch.index < lastTagIndex) {
        issues.push({
          code: 'XML_TAG_ORDER_VIOLATION',
          severity: 'error',
          message: `A tag <${tag}> está fora da ordem canônica Anti-Lost-in-the-Middle. Ordem exigida: ${REQUIRED_XML_TAGS_IN_ORDER.map((t) => `<${t}>`).join(' -> ')}.`,
        });
      }
      lastTagIndex = openMatch.index;
    }
  }

  // 4. Validate Bounded Retries & ALL-CAPS Logic in <constraints>
  const constraintsMatch = rawContent.match(/<constraints>([\s\S]*?)<\/constraints>/i);
  if (constraintsMatch) {
    const constraintsBody = constraintsMatch[1];
    if (!/\b(3|THREE|TRÊS)\b/i.test(constraintsBody) || !/SCHEMA_MISMATCH/i.test(constraintsBody)) {
      issues.push({
        code: 'CONSTRAINTS_MISSING_BOUNDED_RETRIES',
        severity: 'error',
        message:
          'O bloco <constraints> deve especificar a regra de Bounded Retries (máximo de 3 tentativas) com escalonamento `SCHEMA_MISMATCH`.',
      });
    }
    if (!/\b(NEVER|NUNCA|IF|THEN)\b/.test(constraintsBody)) {
      issues.push({
        code: 'CONSTRAINTS_MISSING_ALL_CAPS_ANCHORS',
        severity: 'warning',
        message:
          'Recomenda-se usar palavras-chave lógicas em ALL-CAPS (IF, THEN, NEVER/NUNCA) dentro de <constraints> para máxima aderência em modelos Grok e Claude.',
      });
    }
  }

  // 5. Check references/ max depth (at most 1 level deep inside references/)
  const refsDir = path.join(resolvedDir, 'references');
  if (fs.existsSync(refsDir) && fs.statSync(refsDir).isDirectory()) {
    const entries = fs.readdirSync(refsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDir = path.join(refsDir, entry.name);
        const subEntries = fs.readdirSync(subDir, { withFileTypes: true });
        for (const subEntry of subEntries) {
          if (subEntry.isDirectory()) {
            issues.push({
              code: 'REFERENCES_TOO_DEEP',
              severity: 'error',
              message: `Violação de topologia em references/${entry.name}/${subEntry.name}: O diretório references/ não deve conter aninhamento profundo (> 1 nível).`,
            });
          }
        }
      }
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const confidenceScore = Math.max(
    0,
    Number((1.0 - errorCount * 0.25 - warningCount * 0.05).toFixed(2))
  );

  return {
    status: errorCount === 0 ? 'passed' : 'failed',
    skill_path: resolvedDir,
    skill_name: extractedName,
    line_count: lineCount,
    word_count: wordCount,
    confidence_score: confidenceScore,
    validation_errors: issues,
  };
}

// CLI Runner (compatible with both ESM and CommonJS)
const isDirectExecution =
  (typeof require !== 'undefined' && require.main === module) ||
  (typeof process !== 'undefined' &&
    process.argv[1] &&
    path.resolve(process.argv[1]).toLowerCase() ===
      path.resolve(fileURLToPath(import.meta.url)).toLowerCase());

if (isDirectExecution) {
  const targetArg = process.argv[2];
  if (!targetArg) {
    console.error(
      JSON.stringify(
        {
          status: 'failed',
          message: 'Uso: npx tsx validate-skill.ts <caminho-da-pasta-da-skill>',
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  const result = validateSkillDirectory(targetArg);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === 'passed' ? 0 : 1);
}
