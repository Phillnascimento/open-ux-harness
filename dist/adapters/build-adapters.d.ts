/**
 * Compilador universal que lê as skills, memórias e MCPs agnósticos
 * e gera as configurações nativas para:
 * 1. Google Antigravity (.agentrules, mcp_config.json, skills/)
 * 2. Claude Code (CLAUDE.md, .mcp.json)
 * 3. Cursor / Windsurf (.cursorrules)
 * 4. Terminal CLI (open-ux-harness CLI runner)
 */
export declare class AdapterCompiler {
    private baseDir;
    private outputDir;
    constructor(baseDir?: string);
    compileAll(): void;
    private compileAntigravity;
    private compileClaudeCode;
    private compileCursor;
    private compileTerminalCli;
}
