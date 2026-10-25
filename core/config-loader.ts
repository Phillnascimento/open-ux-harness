import fs from 'node:fs';
import path from 'node:path';

export interface HarnessConfig {
  name: string;
  version: string;
  profile: 'freelance' | 'enterprise' | 'default' | 'custom';
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
  mcpProfiles?: Record<string, { description: string; enabledServers: string[] }>;
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
}

export class ConfigLoader {
  private baseDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir;
  }

  public loadConfig(configPath?: string): HarnessConfig {
    const resolvedPath = configPath 
      ? path.resolve(this.baseDir, configPath)
      : path.resolve(this.baseDir, 'harness.config.json');

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Harness config file not found at: ${resolvedPath}`);
    }

    const content = fs.readFileSync(resolvedPath, 'utf-8');
    return JSON.parse(content) as HarnessConfig;
  }

  public loadPreset(presetId: string): PresetConfig {
    const presetPath = path.resolve(this.baseDir, 'presets', `${presetId}.json`);
    if (!fs.existsSync(presetPath)) {
      throw new Error(`Preset '${presetId}' not found at: ${presetPath}`);
    }

    const content = fs.readFileSync(presetPath, 'utf-8');
    return JSON.parse(content) as PresetConfig;
  }

  public getResolvedConfiguration(): { config: HarnessConfig; preset: PresetConfig } {
    const config = this.loadConfig();
    const preset = this.loadPreset(config.profile);
    return { config, preset };
  }
}
