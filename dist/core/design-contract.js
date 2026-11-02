/**
 * Open UX Harness — Core Design Contract Engine
 *
 * Módulo de validação determinística de Design Contracts e combate a "visual slop"
 * (anti-patterns genéricos de IA, falta de referências reais e ausência de especificidade de produto).
 */
export const REQUIRED_DESIGN_SECTIONS = [
    'Usuário e Job Principal',
    'Fluxo de Maior Frequência',
    'Objetos do Domínio',
    'Referências de Mercado',
    'Escolhas Deliberadas de Design',
    'Padrões Genéricos Proibidos',
];
const SECTION_MATCHERS = [
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
function getSectionBody(markdown, pattern) {
    const lines = markdown.split(/\r?\n/);
    let capturing = false;
    let sectionLevel = 2;
    const capturedLines = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!capturing) {
            if (pattern.test(line)) {
                capturing = true;
                const headingMatch = line.match(/^(#{1,6})\s+/);
                sectionLevel = headingMatch ? headingMatch[1].length : 2;
            }
        }
        else {
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
function countMarketReferences(sectionText) {
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
function extractForbiddenItems(sectionText) {
    const lines = sectionText.split(/\r?\n/);
    const items = [];
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
export function extractForbiddenPatterns(markdown) {
    const forbiddenBody = getSectionBody(markdown, /^#+\s+(?:\d+[.\-\)]\s*)?padr[oõ]es\s+(?:gen[eé]ricos\s+)?proibidos/i);
    if (!forbiddenBody) {
        return [];
    }
    return extractForbiddenItems(forbiddenBody);
}
/**
 * Valida o conteúdo Markdown de um Design Contract contra as seções obrigatórias
 * e os limites mínimos de referências reais e padrões proibidos.
 */
export function validateDesignContract(markdown) {
    const missingSections = [];
    const errors = [];
    for (const matcher of SECTION_MATCHERS) {
        const body = getSectionBody(markdown, matcher.pattern);
        if (body === null) {
            missingSections.push(matcher.canonicalName);
            errors.push(`Seção obrigatória ausente: "${matcher.canonicalName}".`);
        }
        else {
            if (matcher.canonicalName === 'Referências de Mercado') {
                const count = countMarketReferences(body);
                if (count < 3) {
                    errors.push(`A seção "Referências de Mercado" deve conter pelo menos 3 referências citadas (encontradas: ${count}).`);
                }
            }
            else if (matcher.canonicalName === 'Padrões Genéricos Proibidos') {
                const forbiddenList = extractForbiddenItems(body);
                if (forbiddenList.length < 3) {
                    errors.push(`A seção "Padrões Genéricos Proibidos" deve listar pelo menos 3 padrões proibidos (encontrados: ${forbiddenList.length}).`);
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
export function checkAgainstContract(markdown, usedPatterns) {
    const forbiddenPatterns = extractForbiddenPatterns(markdown);
    if (forbiddenPatterns.length === 0 || usedPatterns.length === 0) {
        return { violations: [] };
    }
    const violations = [];
    for (const used of usedPatterns) {
        const usedTrimmed = used.trim();
        if (!usedTrimmed)
            continue;
        const usedLower = usedTrimmed.toLowerCase();
        for (const forbidden of forbiddenPatterns) {
            const forbiddenLower = forbidden.toLowerCase();
            const forbiddenTitleLower = forbiddenLower.split(':')[0].trim();
            const isMatch = usedLower.includes(forbiddenLower) ||
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
/**
 * Extrai amostras canônicas de tom de voz (Brand Voice Samples) do Design Contract.
 * Inspirado no padrão Voice Matching do Humanizer para calibrar microcopy.
 */
export function extractVoiceSamples(markdown) {
    const pattern = /^#+\s+(?:\d+[.\-\)]\s*)?(?:amostras\s+de\s+voz|brand\s+(?:and\s+ux\s+)?voice)/i;
    const body = getSectionBody(markdown, pattern);
    if (!body)
        return [];
    const samples = [];
    const lines = body.split(/\r?\n/);
    for (const line of lines) {
        const quoteMatch = line.match(/^\s*>\s*["'“]([^"'”]+)["'”]/);
        if (quoteMatch) {
            samples.push(quoteMatch[1].trim());
        }
        else {
            const bulletMatch = line.match(/^\s*[-*]\s+["'“]([^"'”]+)["'”]/);
            if (bulletMatch) {
                samples.push(bulletMatch[1].trim());
            }
        }
    }
    return samples;
}
/**
 * Identifica o Modo de Superfície declarado no Design Contract.
 * Fallback padrão: 'operate' (foco em ferramentas e produto digital).
 */
export function extractSurfaceMode(markdown) {
    const match = markdown.match(/(?:Modo\s+de\s+Superf[ií]cie|Surface\s+Mode):\s*["'`]?(\w+)["'`]?/i);
    if (match) {
        const val = match[1].toLowerCase();
        if (['persuade', 'operate', 'read', 'experience'].includes(val)) {
            return val;
        }
    }
    return 'operate';
}
/**
 * Retorna as diretrizes normativas para o modo de superfície correspondente.
 */
export function getSurfaceModeGuidelines(mode) {
    switch (mode) {
        case 'persuade':
            return {
                mode: 'persuade',
                intent: 'O visitante decide e age. Landing pages, marketing e conversão.',
                expressiveness: 'high',
                strictBans: [
                    'telas genéricas pasteurizadas',
                    'cards idênticos repetidos em grid preguiçoso',
                    'gradientes roxo/azul padrão de IA'
                ],
                keyHeuristics: [
                    'Imagens reais e com propósito claro',
                    'Hierarquia tipográfica display forte',
                    'Ritmo dinâmico de scroll'
                ]
            };
        case 'operate':
            return {
                mode: 'operate',
                intent: 'O visitante conclui uma tarefa operacional com precisão e velocidade. Dashboards, admin, editores e ferramentas.',
                expressiveness: 'restrained',
                strictBans: [
                    'gradientes decorativos em texto e botões',
                    'cards aninhados dentro de cards',
                    'sombras difusas excessivas (ghost cards)',
                    'eyebrows/kickers decorativos acima de cada heading'
                ],
                keyHeuristics: [
                    'Alta densidade e escaneabilidade instantânea',
                    'Numerais tabulares em tabelas e métricas (tabular-nums)',
                    'Grid rigoroso de 8px e 4 estados obrigatórios',
                    'Atalhos de teclado e alvos de toque >= 24px desktop / 44px mobile'
                ]
            };
        case 'read':
            return {
                mode: 'read',
                intent: 'O visitante compreende algo em profundidade. Documentação, artigos, guias e changelogs.',
                expressiveness: 'balanced',
                strictBans: [
                    'largura de linha maior que 75ch',
                    'leading comprimido menor que 1.4x',
                    'elementos animados ou flutuantes que distraem a leitura'
                ],
                keyHeuristics: [
                    'Largura de linha de 65ch a 75ch (max-w-prose)',
                    'Espaço acima de headings maior do que abaixo (heading rhythm)',
                    'Conforto visual e alto contraste WCAG AA'
                ]
            };
        case 'experience':
            return {
                mode: 'experience',
                intent: 'O visitante está imerso no próprio conteúdo ou artefato. Portfólios, galerias e vitrines.',
                expressiveness: 'receding',
                strictBans: [
                    'chrome decorativo pesado',
                    'barras de ferramentas desnecessárias que competem com o artefato'
                ],
                keyHeuristics: [
                    'A interface recua e deixa o conteúdo/obra liderar',
                    'Transições sutis e navegação minimalista'
                ]
            };
    }
}
/**
 * Gera um documento DESIGN.md no padrão da especificação aberta oficial (Google Labs standard),
 * com tokens em frontmatter YAML seguidos pelas seções canônicas de documentação.
 */
export function generateDesignMd(spec) {
    const yamlLines = ['---'];
    yamlLines.push(`name: "${spec.name}"`);
    yamlLines.push(`description: "${spec.description}"`);
    if (spec.surfaceMode) {
        yamlLines.push(`surfaceMode: "${spec.surfaceMode}"`);
    }
    // Colors
    yamlLines.push('colors:');
    for (const [key, val] of Object.entries(spec.colors)) {
        yamlLines.push(`  ${key}: "${val}"`);
    }
    // Typography
    if (spec.typography && Object.keys(spec.typography).length > 0) {
        yamlLines.push('typography:');
        for (const [role, conf] of Object.entries(spec.typography)) {
            yamlLines.push(`  ${role}:`);
            yamlLines.push(`    fontFamily: "${conf.fontFamily}"`);
            if (conf.fontSize)
                yamlLines.push(`    fontSize: "${conf.fontSize}"`);
            if (conf.fontWeight)
                yamlLines.push(`    fontWeight: ${conf.fontWeight}`);
            if (conf.lineHeight)
                yamlLines.push(`    lineHeight: ${conf.lineHeight}`);
        }
    }
    // Rounded
    if (spec.rounded && Object.keys(spec.rounded).length > 0) {
        yamlLines.push('rounded:');
        for (const [key, val] of Object.entries(spec.rounded)) {
            yamlLines.push(`  ${key}: "${val}"`);
        }
    }
    // Spacing
    if (spec.spacing && Object.keys(spec.spacing).length > 0) {
        yamlLines.push('spacing:');
        for (const [key, val] of Object.entries(spec.spacing)) {
            yamlLines.push(`  ${key}: "${val}"`);
        }
    }
    // Components
    if (spec.components && Object.keys(spec.components).length > 0) {
        yamlLines.push('components:');
        for (const [compName, props] of Object.entries(spec.components)) {
            yamlLines.push(`  ${compName}:`);
            for (const [propName, propVal] of Object.entries(props)) {
                yamlLines.push(`    ${propName}: "${propVal}"`);
            }
        }
    }
    yamlLines.push('---');
    yamlLines.push('');
    // 8 Canonical Sections
    const sections = [
        `# ${spec.name} — Design System`,
        '',
        '## 1. Overview',
        spec.overview || `${spec.description} Configurado para o modo de superfície **${spec.surfaceMode || 'operate'}**.`,
        '',
        '## 2. Colors',
        'Paleta canônica com contrastes acessíveis validados contra WCAG 2.2 AA / APCA.',
        ...Object.entries(spec.colors).map(([k, v]) => `- \`${k}\`: \`${v}\``),
        '',
        '## 3. Typography',
        'Hierarquia tipográfica deliberada com ritmo e escala >= 1.25x.',
        spec.typography ? Object.entries(spec.typography).map(([k, v]) => `- **${k}**: \`${v.fontFamily}\` (${v.fontSize || 'base'})`).join('\n') : '- Sans: Inter / System UI',
        '',
        '## 4. Layout',
        'Grid espacial de 8pt (múltiplos defensivos de 4px) e largura de linha restrita a 65-75ch.',
        '',
        '## 5. Elevation & Depth',
        'Elevação declarada uma única vez por componente: borda sutil de 1px OU sombra suave.',
        '',
        '## 6. Shapes',
        'Contornos e raios consistentes de acordo com a escala tokens.',
        spec.rounded ? Object.entries(spec.rounded).map(([k, v]) => `- \`${k}\`: \`${v}\``).join('\n') : '- `md`: `8px`',
        '',
        '## 7. Components',
        'Cobertura obrigatória de 4 estados: Default, Loading, Empty, Error.',
        '',
        '## 8. Do\'s and Don\'ts',
        spec.dosAndDonts ? [
            '### Do\'s:',
            ...spec.dosAndDonts.dos.map(d => `- ${d}`),
            '### Don\'ts:',
            ...spec.dosAndDonts.donts.map(d => `- ${d}`)
        ].join('\n') : [
            '### Do\'s:',
            '- Use tokens semânticos em vez de valores hex brutos.',
            '- Projete os 4 estados de UI para todo controle interativo.',
            '### Don\'ts:',
            '- Não utilize gradientes decorativos em texto ou botões operacionais.',
            '- Não aninhe cards dentro de containers de cards.'
        ].join('\n')
    ];
    return [...yamlLines, ...sections].join('\n');
}
/**
 * Faz o parsing de um documento DESIGN.md extraindo seus tokens YAML e seções textuais.
 */
export function parseDesignMd(content) {
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const spec = {
        name: 'Untitled System',
        description: '',
        colors: {},
        typography: {},
        rounded: {},
        spacing: {},
        components: {}
    };
    if (frontmatterMatch) {
        const yamlBody = frontmatterMatch[1];
        const lines = yamlBody.split(/\r?\n/);
        let currentBlock = null;
        let currentSubBlock = null;
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#'))
                continue;
            if (!line.startsWith(' ') && trimmed.includes(':')) {
                const [k, v] = trimmed.split(':').map(s => s.trim().replace(/^["']|["']$/g, ''));
                if (k === 'name')
                    spec.name = v;
                else if (k === 'description')
                    spec.description = v;
                else if (k === 'surfaceMode')
                    spec.surfaceMode = v;
                else if (['colors', 'typography', 'rounded', 'spacing', 'components'].includes(k)) {
                    currentBlock = k;
                    currentSubBlock = null;
                }
            }
            else if (line.startsWith('  ') && !line.startsWith('    ') && currentBlock) {
                const [k, v] = trimmed.split(':').map(s => s.trim().replace(/^["']|["']$/g, ''));
                if (currentBlock === 'colors') {
                    spec.colors[k] = v;
                }
                else if (currentBlock === 'rounded') {
                    spec.rounded[k] = v;
                }
                else if (currentBlock === 'spacing') {
                    spec.spacing[k] = v;
                }
                else if (currentBlock === 'typography' || currentBlock === 'components') {
                    currentSubBlock = k;
                    if (currentBlock === 'typography') {
                        spec.typography[k] = { fontFamily: '' };
                    }
                    else {
                        spec.components[k] = {};
                    }
                }
            }
            else if (line.startsWith('    ') && currentBlock && currentSubBlock) {
                const [k, v] = trimmed.split(':').map(s => s.trim().replace(/^["']|["']$/g, ''));
                if (currentBlock === 'typography' && spec.typography[currentSubBlock]) {
                    spec.typography[currentSubBlock][k] = v;
                }
                else if (currentBlock === 'components' && spec.components[currentSubBlock]) {
                    spec.components[currentSubBlock][k] = v;
                }
            }
        }
    }
    return spec;
}
