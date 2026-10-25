/**
 * Open UX Harness — Core Design Contract Engine
 *
 * Módulo de validação determinística de Design Contracts e combate a "visual slop"
 * (anti-patterns genéricos de IA, falta de referências reais e ausência de especificidade de produto).
 */

export interface DesignContractCheck {
  valid: boolean;
  missingSections: string[];
  errors: string[];
}

export const REQUIRED_DESIGN_SECTIONS = [
  'Usuário e Job Principal',
  'Fluxo de Maior Frequência',
  'Objetos do Domínio',
  'Referências de Mercado',
  'Escolhas Deliberadas de Design',
  'Padrões Genéricos Proibidos',
] as const;

interface SectionMatcher {
  canonicalName: string;
  pattern: RegExp;
}

const SECTION_MATCHERS: SectionMatcher[] = [
  {
    canonicalName: 'Usuário e Job Principal',
    pattern: /^#+\s+(?:\d+[.\-\)]\s*)?usu[aá]rio\s+e\s+job(?:\s+principal)?/i,
  },
  {
    canonicalName: 'Fluxo de Maior Frequência',
    pattern: /^#+\s+(?:\d+[.\-\)]\s*)?fluxo\s+de\s+maior\s+frequ[eê]ncia/i,
  },
  {
    canonicalName: 'Objetos do Domínio',
    pattern: /^#+\s+(?:\d+[.\-\)]\s*)?objetos\s+do\s+dom[ií]nio/i,
  },
  {
    canonicalName: 'Referências de Mercado',
    pattern: /^#+\s+(?:\d+[.\-\)]\s*)?refer[eê]ncias\s+de\s+mercado/i,
  },
  {
    canonicalName: 'Escolhas Deliberadas de Design',
    pattern: /^#+\s+(?:\d+[.\-\)]\s*)?escolhas\s+deliberadas\s+de\s+design/i,
  },
  {
    canonicalName: 'Padrões Genéricos Proibidos',
    pattern: /^#+\s+(?:\d+[.\-\)]\s*)?padr[oõ]es\s+(?:gen[eé]ricos\s+)?proibidos/i,
  },
];

/**
 * Extrai o corpo textual de uma seção Markdown a partir do regex do seu título.
 * A seção é delimitada pelo próximo cabeçalho Markdown de mesmo nível ou superior.
 */
function getSectionBody(markdown: string, pattern: RegExp): string | null {
  const lines = markdown.split(/\r?\n/);
  let capturing = false;
  let sectionLevel = 2;
  const capturedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!capturing) {
      if (pattern.test(line)) {
        capturing = true;
        const headingMatch = line.match(/^(#{1,6})\s+/);
        sectionLevel = headingMatch ? headingMatch[1].length : 2;
      }
    } else {
      const headingMatch = line.match(/^(#{1,6})\s+/);
      if (headingMatch && headingMatch[1].length <= sectionLevel) {
        break;
      }
      capturedLines.push(line);
    }
  }

  return capturing ? capturedLines.join('\n') : null;
}

/**
 * Conta quantas referências foram citadas na seção de Referências de Mercado.
 * Considera itens de lista (- , * , + , 1. ) ou subseções (### ).
 */
function countMarketReferences(sectionText: string): number {
  const lines = sectionText.split(/\r?\n/);
  const bulletOrNumbered = lines.filter((l) => /^\s*(?:[-*+]|\d+[.)])\s+\S+/.test(l));
  if (bulletOrNumbered.length > 0) {
    return bulletOrNumbered.length;
  }
  const subHeadings = lines.filter((l) => /^#{3,4}\s+\S+/.test(l));
  return subHeadings.length;
}

/**
 * Extrai a lista de itens da seção de Padrões Proibidos.
 */
function extractForbiddenItems(sectionText: string): string[] {
  const lines = sectionText.split(/\r?\n/);
  const items: string[] = [];

  for (const line of lines) {
    const bulletMatch = line.match(/^\s*(?:[-*+]|\d+[.)])\s+(.+)$/);
    if (bulletMatch) {
      const rawText = bulletMatch[1].trim();
      const cleanText = rawText
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .trim();
      if (cleanText.length > 0) {
        items.push(cleanText);
      }
    }
  }

  return items;
}

/**
 * Extrai os padrões proibidos descritos no contrato Markdown.
 */
export function extractForbiddenPatterns(markdown: string): string[] {
  const forbiddenBody = getSectionBody(
    markdown,
    /^#+\s+(?:\d+[.\-\)]\s*)?padr[oõ]es\s+(?:gen[eé]ricos\s+)?proibidos/i
  );
  if (!forbiddenBody) {
    return [];
  }
  return extractForbiddenItems(forbiddenBody);
}

/**
 * Valida o conteúdo Markdown de um Design Contract contra as seções obrigatórias
 * e os limites mínimos de referências reais e padrões proibidos.
 */
export function validateDesignContract(markdown: string): DesignContractCheck {
  const missingSections: string[] = [];
  const errors: string[] = [];

  for (const matcher of SECTION_MATCHERS) {
    const body = getSectionBody(markdown, matcher.pattern);
    if (body === null) {
      missingSections.push(matcher.canonicalName);
      errors.push(`Seção obrigatória ausente: "${matcher.canonicalName}".`);
    } else {
      if (matcher.canonicalName === 'Referências de Mercado') {
        const count = countMarketReferences(body);
        if (count < 3) {
          errors.push(
            `A seção "Referências de Mercado" deve conter pelo menos 3 referências citadas (encontradas: ${count}).`
          );
        }
      } else if (matcher.canonicalName === 'Padrões Genéricos Proibidos') {
        const forbiddenList = extractForbiddenItems(body);
        if (forbiddenList.length < 3) {
          errors.push(
            `A seção "Padrões Genéricos Proibidos" deve listar pelo menos 3 padrões proibidos (encontrados: ${forbiddenList.length}).`
          );
        }
      }
    }
  }

  const valid = missingSections.length === 0 && errors.length === 0;

  return {
    valid,
    missingSections,
    errors,
  };
}

/**
 * Compara uma lista de padrões/técnicas usadas contra os padrões proibidos no Design Contract.
 * Retorna as violações detectadas via case-insensitive substring matching.
 */
export function checkAgainstContract(
  markdown: string,
  usedPatterns: string[]
): { violations: string[] } {
  const forbiddenPatterns = extractForbiddenPatterns(markdown);
  if (forbiddenPatterns.length === 0 || usedPatterns.length === 0) {
    return { violations: [] };
  }

  const violations: string[] = [];

  for (const used of usedPatterns) {
    const usedTrimmed = used.trim();
    if (!usedTrimmed) continue;
    const usedLower = usedTrimmed.toLowerCase();

    for (const forbidden of forbiddenPatterns) {
      const forbiddenLower = forbidden.toLowerCase();
      const forbiddenTitleLower = forbiddenLower.split(':')[0].trim();

      const isMatch =
        usedLower.includes(forbiddenLower) ||
        forbiddenLower.includes(usedLower) ||
        usedLower.includes(forbiddenTitleLower) ||
        forbiddenTitleLower.includes(usedLower);

      if (isMatch) {
        if (!violations.includes(forbidden)) {
          violations.push(forbidden);
        }
      }
    }
  }

  return { violations };
}
