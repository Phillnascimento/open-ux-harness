/**
 * Interface que representa uma plataforma registrada em platforms.json
 */
export interface PlatformDefinition {
    id: string;
    label: string;
    format: string;
    installKind: 'per-agent' | 'roster';
    dest: {
        user: string[];
        project: string[];
    };
}
/**
 * Catálogo de plataformas e skills disponíveis no sistema
 */
export interface AvailableCatalog {
    platforms: string[];
    skills: string[];
}
/**
 * Opções para a instalação seletiva de adaptadores e skills
 */
export interface InstallOptions {
    platform?: string;
    skills?: string[];
    dryRun?: boolean;
    baseDir?: string;
}
/**
 * Resultado da operação de instalação seletiva
 */
export interface InstallResult {
    platform: string;
    installedSkills: string[];
    targetPaths: string[];
    dryRun: boolean;
    success: boolean;
    message: string;
}
/**
 * Lê adapters/platforms.json e harness.config.json e lista plataformas e skills disponíveis
 */
export declare function listAvailable(baseDir?: string): AvailableCatalog;
/**
 * Executa a instalação seletiva de adaptadores e skills
 */
export declare function installSelective(options?: InstallOptions): InstallResult;
