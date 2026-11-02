/**
 * Lista de modos válidos suportados pelo Open UX Harness.
 */
export const VALID_MODES = ['micro', 'sprint', 'full'];
/**
 * Conjunto canônico de skills para o modo 'micro'.
 * Focado no fluxo enxuto de validação, craft e handoff sem drift (3 skills).
 */
export const CANONICAL_MICRO_SKILLS = [
    '05-craft-and-accessibility',
    '08-reality-gate',
    '06-zero-drift-handoff'
];
/**
 * Conjunto canônico de skills para o modo 'sprint'.
 * Focado no fluxo padrão de desenvolvimento de feature de produto (7 skills).
 */
export const CANONICAL_SPRINT_SKILLS = [
    '01-briefing-discovery',
    '02-information-architecture',
    '03-design-tokens',
    '04-figma-engineering',
    '05-craft-and-accessibility',
    '08-reality-gate',
    '06-zero-drift-handoff'
];
/**
 * Conjunto canônico de skills para o modo 'full'.
 * Abrange todas as 24 skills ativas do ecossistema de design e social UX.
 */
export const CANONICAL_FULL_SKILLS = [
    '00-skill-architect',
    '01-briefing-discovery',
    '02-information-architecture',
    '03-design-tokens',
    '04-figma-engineering',
    '05-craft-and-accessibility',
    '06-zero-drift-handoff',
    '07-telemetry-and-impact',
    '08-reality-gate',
    '09-persona-walkthrough',
    '10-ux-humanizer',
    'li-career',
    'li-brand',
    'li-voice',
    'li-profile',
    'li-human',
    'li-plan',
    'li-repurpose',
    'li-post',
    'li-carousel',
    'li-comment',
    'li-reply',
    'li-dm',
    'li-inbox',
    'li-audit'
];
/**
 * Função auxiliar do type guard para verificar se uma string é um HarnessMode válido.
 *
 * @param mode Identificador de modo a ser verificado
 * @returns true se o modo for 'micro', 'sprint' ou 'full'
 */
export function isValidMode(mode) {
    return VALID_MODES.includes(mode);
}
/**
 * Resolve a lista de skills ativas para o modo especificado ou configurado.
 *
 * Precedência de resolução:
 * 1. Parâmetro explícito `mode`
 * 2. `config.mode`
 * 3. Fallback padrão: 'sprint'
 *
 * @param preset Configuração do preset carregado (ex.: default, freelance, enterprise)
 * @param config Configuração geral do harness
 * @param mode Modo de operação opcional ('micro' | 'sprint' | 'full')
 * @returns Array de strings com os identificadores das skills habilitadas
 * @throws Error Se o modo não for válido ('micro', 'sprint' ou 'full')
 */
export function resolveSkillsForMode(preset, config, mode) {
    // Determina o modo ativo respeitando a hierarquia: mode > config.mode > 'sprint'
    const chosenMode = mode !== undefined ? mode : (config.mode !== undefined ? config.mode : 'sprint');
    if (!isValidMode(chosenMode)) {
        throw new Error(`Modo inválido: '${chosenMode}'. Modos válidos: micro, sprint, full.`);
    }
    const targetMode = chosenMode;
    // Se o preset possuir o subconjunto configurado para este modo, retorna cópia do array
    if (preset.modes && Array.isArray(preset.modes[targetMode]) && preset.modes[targetMode].length > 0) {
        return [...preset.modes[targetMode]];
    }
    // Fallback canônico quando o preset não declara o modo
    switch (targetMode) {
        case 'micro':
            return [...CANONICAL_MICRO_SKILLS];
        case 'sprint':
            return [...CANONICAL_SPRINT_SKILLS];
        case 'full':
            return config.activeSkills && config.activeSkills.length > 0
                ? [...config.activeSkills]
                : [...CANONICAL_FULL_SKILLS];
    }
}
