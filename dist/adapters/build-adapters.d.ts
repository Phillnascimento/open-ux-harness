/**
 * Definição do contrato de uma plataforma em platforms.json
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
export interface PlatformsConfig {
    _note?: string;
    platforms: Record<string, PlatformDefinition>;
}
/**
 * Compilador universal que lê as skills, memórias e MCPs agnósticos
 * e gera as configurações nativas para plataformas suportadas definidas em platforms.json:
 * 1. Google Antigravity (.agentrules, mcp_config.json)
 * 2. Claude Code (CLAUDE.md, .mcp.json)
 * 3. Cursor (.cursorrules)
 * 4. Terminal CLI (harness-runtime.json)
 * 5. Gemini CLI (GEMINI.md)
 * 6. GitHub Copilot (copilot-instructions.md)
 * 7. Windsurf (.windsurfrules)
 * 8. Codex (harness.toml)
 */
export declare class AdapterCompiler {
    private baseDir;
    private outputDir;
    private platformsData;
    constructor(baseDir?: string);
    /**
     * Carrega a fonte única de verdade adapters/platforms.json
     */
    loadPlatforms(): PlatformsConfig;
    /**
     * Retorna a lista de todas as plataformas registradas
     */
    getPlatforms(): PlatformDefinition[];
    /**
     * Retorna a definição de uma plataforma pelo ID
     */
    getPlatform(id: string): PlatformDefinition | undefined;
    /**
     * Compila os adaptadores para todas as plataformas configuradas ou para alvos específicos
     */
    compileAll(targets?: string[]): void;
    /**
     * Despacha a compilação para o compilador específico de cada plataforma
     */
    compilePlatform(id: string, config: any, preset: any): void;
    compileAntigravity(config: any, preset: any): void;
    compileClaudeCode(config: any, preset: any): void;
    compileCursor(config: any, preset: any): void;
    compileTerminalCli(config: any, preset: any): void;
    compileGeminiCli(config: any, preset: any): void;
    compileCopilot(config: any, preset: any): void;
    compileWindsurf(config: any, preset: any): void;
    compileCodex(config: any, preset: any): void;
}
