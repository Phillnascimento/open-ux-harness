import { PresetConfig, HarnessConfig, HarnessMode } from './config-loader.js';
/**
 * Lista de modos válidos suportados pelo Open UX Harness.
 */
export declare const VALID_MODES: readonly HarnessMode[];
/**
 * Conjunto canônico de skills para o modo 'micro'.
 * Focado no fluxo enxuto de validação, craft e handoff sem drift (3 skills).
 */
export declare const CANONICAL_MICRO_SKILLS: string[];
/**
 * Conjunto canônico de skills para o modo 'sprint'.
 * Focado no fluxo padrão de desenvolvimento de feature de produto (7 skills).
 */
export declare const CANONICAL_SPRINT_SKILLS: string[];
/**
 * Conjunto canônico de skills para o modo 'full'.
 * Abrange todas as 24 skills ativas do ecossistema de design e social UX.
 */
export declare const CANONICAL_FULL_SKILLS: string[];
/**
 * Função auxiliar do type guard para verificar se uma string é um HarnessMode válido.
 *
 * @param mode Identificador de modo a ser verificado
 * @returns true se o modo for 'micro', 'sprint' ou 'full'
 */
export declare function isValidMode(mode: string): mode is HarnessMode;
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
export declare function resolveSkillsForMode(preset: PresetConfig, config: HarnessConfig, mode?: HarnessMode): string[];
