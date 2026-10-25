import fs from 'node:fs';
import path from 'node:path';
import { ConfigLoader, HarnessConfig, PresetConfig } from './config-loader.js';

export interface MCPServerDefinition {
  name: string;
  transport: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  capabilities: string[];
  usedBySkills: string[];
  filteringStrategy: string;
}

export interface MCPRegistry {
  servers: Record<string, MCPServerDefinition>;
}

export interface PrunedContextResult {
  activeSkill: string;
  activeServers: Record<string, MCPServerDefinition>;
  prunedServers: string[];
  tokenSavingsEstimatePercentage: number;
  staticCacheablePromptBlock: string;
}

export class ContextEngine {
  private baseDir: string;
  private registry: MCPRegistry;
  private config: HarnessConfig;
  private preset: PresetConfig;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir;
    const loader = new ConfigLoader(baseDir);
    const resolved = loader.getResolvedConfiguration();
    this.config = resolved.config;
    this.preset = resolved.preset;

    const registryPath = path.resolve(baseDir, 'mcp-registry', 'servers.json');
    if (!fs.existsSync(registryPath)) {
      throw new Error(`MCP Registry file not found at: ${registryPath}`);
    }
    this.registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8')) as MCPRegistry;
  }

  /**
   * Executa o MCP Pruning Dinâmico para uma skill específica.
   * Apenas os servidores que a skill precisa e que estão autorizados no preset ativo são mantidos no contexto.
   */
  public pruneForSkill(skillName: string): PrunedContextResult {
    const activeServers: Record<string, MCPServerDefinition> = {};
    const prunedServers: string[] = [];

    const allowedInPreset = new Set(this.preset.mcpServers);

    for (const [serverId, serverDef] of Object.entries(this.registry.servers)) {
      const isAllowedByPreset = allowedInPreset.has(serverId);
      const isNeededBySkill = serverDef.usedBySkills.includes(skillName);

      if (isAllowedByPreset && isNeededBySkill) {
        activeServers[serverId] = serverDef;
      } else {
        prunedServers.push(serverId);
      }
    }

    const totalAvailable = Object.keys(this.registry.servers).length;
    const activeCount = Object.keys(activeServers).length;
    const savings = totalAvailable > 0 
      ? Math.round(((totalAvailable - activeCount) / totalAvailable) * 100) 
      : 0;

    const staticCacheablePromptBlock = this.generateCacheableSystemPrompt(skillName);

    return {
      activeSkill: skillName,
      activeServers,
      prunedServers,
      tokenSavingsEstimatePercentage: savings,
      staticCacheablePromptBlock
    };
  }

  /**
   * Gera o bloco de prompt estático para Prompt Caching (W3C DTCG, WCAG 2.2, 8pt grid).
   * Por ser imutável e colocado no topo, pode usufruir de cache e economizar até 90% dos tokens de entrada.
   */
  private generateCacheableSystemPrompt(skillName: string): string {
    return `<!-- CACHE_CONTROL: EPHEMERAL_STATIC_SYSTEM_PROMPT -->
# OPEN UX HARNESS - CORE PROCEDURAL CONTRACT
- Mode: ${this.preset.id.toUpperCase()} (${this.preset.name})
- Target Skill: ${skillName}
- W3C DTCG Format: ${this.preset.tokens.strictDtcg ? 'Strict DTCG 2025.10' : 'Flexible JSON Tokens'}
- Quality Assurance: Craft Guardian Active (8pt Grid, WCAG 2.2 AA/AAA, 4 UI States: default, empty, loading, error).
- Zero YOLO Mode: Enabled. Breaking and destructive operations require human confirmation.
<!-- END_CACHE_CONTROL -->`;
  }
}
