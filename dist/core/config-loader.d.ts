export type HarnessMode = 'micro' | 'sprint' | 'full';
export interface RetryPolicy {
    maxAttempts: number;
    onExhausted: 'escalate' | 'abort';
}
export interface HarnessConfig {
    name: string;
    version: string;
    profile: 'freelance' | 'enterprise' | 'default' | 'custom';
    mode?: HarnessMode;
    retryPolicy?: RetryPolicy;
    platforms: {
        target: string[];
        outputDir: string;
    };
    llmEngine: {
        defaultProvider: string;
        defaultModel: string;
        fallbackProvider?: string;
        fallbackModel?: string;
        allowLocalOllama?: boolean;
        ollamaModel?: string;
    };
    memory: {
        semanticPath: string;
        episodicPath: string;
        proceduralPath: string;
        decayDays: number;
        compressionEnabled: boolean;
    };
    governance: {
        zeroYoloMode: boolean;
        allowAutoFixMinorA11y: boolean;
        requireHumanConfirmationOnMasterTokens: boolean;
        requireHumanConfirmationOnStorybookPush: boolean;
    };
    activeSkills: string[];
    mcpProfiles?: Record<string, {
        description: string;
        enabledServers: string[];
    }>;
}
export interface PresetConfig {
    id: string;
    name: string;
    description: string;
    tokens: {
        format: string;
        strictDtcg: boolean;
        outputFiles: string[];
        linter?: string;
    };
    figma: {
        mode: string;
        useDesktopBridge: boolean;
        fallbackToCodeOnly: boolean;
    };
    handoff: {
        destination: string;
        formats: string[];
        requireStorybook: boolean;
    };
    analytics: {
        provider: string;
        requireTelemetryServer: boolean;
    };
    mcpServers: string[];
    governance: Record<string, boolean>;
    modes?: Record<HarnessMode, string[]>;
}
export declare class ConfigLoader {
    private baseDir;
    constructor(baseDir?: string);
    loadConfig(configPath?: string): HarnessConfig;
    loadPreset(presetId: string): PresetConfig;
    getResolvedConfiguration(): {
        config: HarnessConfig;
        preset: PresetConfig;
    };
}
