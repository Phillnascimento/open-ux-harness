import fs from 'node:fs';
import path from 'node:path';

export interface TokenValidationResult {
  valid: boolean;
  format: 'w3c-dtcg' | 'simple-json';
  totalTokens: number;
  errors: string[];
  warnings: string[];
}

export class DesignTokensLinter {
  public static validateTokenFile(filePath: string): TokenValidationResult {
    if (!fs.existsSync(filePath)) {
      return {
        valid: false,
        format: 'simple-json',
        totalTokens: 0,
        errors: [`Arquivo de tokens não encontrado: ${filePath}`],
        warnings: []
      };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (e: any) {
      return {
        valid: false,
        format: 'simple-json',
        totalTokens: 0,
        errors: [`JSON inválido: ${e.message}`],
        warnings: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    let isDtcg = false;
    let tokenCount = 0;

    function traverse(node: any, pathStack: string[]) {
      if (!node || typeof node !== 'object') return;

      if ('$value' in node) {
        // Formato W3C DTCG
        isDtcg = true;
        tokenCount++;
        const val = node.$value;
        const type = node.$type;

        if (!type) {
          warnings.push(`Token '${pathStack.join('.')}' possui '$value' mas não define '$type'.`);
        }

        if (type === 'dimension' && typeof val === 'string' && !val.endsWith('px') && !val.endsWith('rem') && val !== '0') {
          warnings.push(`Token de dimensão '${pathStack.join('.')}' com valor não padrão: '${val}'.`);
        }
      } else if ('value' in node) {
        // Formato legado
        tokenCount++;
      } else {
        // É um grupo/categoria
        for (const [key, child] of Object.entries(node)) {
          if (!key.startsWith('$')) {
            traverse(child, [...pathStack, key]);
          }
        }
      }
    }

    traverse(parsed, []);

    return {
      valid: errors.length === 0,
      format: isDtcg ? 'w3c-dtcg' : 'simple-json',
      totalTokens: tokenCount,
      errors,
      warnings
    };
  }
}

// Execução direta como CLI
const targetFile = process.argv[2] || path.resolve(process.cwd(), 'templates', 'tokens-starter.json');
console.log(`[DesignTokensLinter] Validando arquivo: ${targetFile}`);
const result = DesignTokensLinter.validateTokenFile(targetFile);

if (result.valid) {
  console.log(`✅ Tokens válidos! Formato detectado: ${result.format}. Total de tokens: ${result.totalTokens}`);
  if (result.warnings.length > 0) {
    console.log(`⚠️ Avisos:`);
    result.warnings.forEach(w => console.log(`  - ${w}`));
  }
} else {
  console.error(`❌ Erros encontrados nos tokens:`);
  result.errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}
