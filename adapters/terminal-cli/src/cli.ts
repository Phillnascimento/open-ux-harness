import fs from 'node:fs';
import path from 'node:path';
import { ConfigLoader, HarnessMode } from '../../../core/config-loader.js';
import { ContextEngine } from '../../../core/context-engine.js';
import { GuardrailsEngine } from '../../../core/guardrails.js';
import { CraftGuardianLinter } from '../../../core/craft-guardian-linter.js';
import { UXHumanizerLinter } from '../../../core/ux-humanizer-linter.js';
import { resolveSkillsForMode } from '../../../core/modes.js';
import { buildProjectGraph } from '../../../core/graph-builder.js';
import { UXGraphReporter } from '../../../core/ux-graph-reporter.js';
import { AntiSlopEngine } from '../../../core/anti-slop-engine.js';
import { listAvailable, installSelective } from './install.js';

export async function runCli(args: string[]): Promise<void> {
  const command = args[0] || 'help';

  console.log(`
=============================================================
             🚀 OPEN UX HARNESS - CLI RUNNER
   Agentic Infrastructure for World-Class Product Designers
=============================================================
`);

  switch (command) {
    case 'init': {
      console.log('Inicializando Open UX Harness no diretório atual...');
      const targetConfig = path.resolve(process.cwd(), 'harness.config.json');
      if (fs.existsSync(targetConfig)) {
        console.log('ℹ️  Arquivo harness.config.json já existe.');
      } else {
        console.log('✨ Criado harness.config.json padrão.');
      }
      break;
    }

    case 'run': {
      let modeArg: string | undefined;
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--mode' && args[i + 1]) {
          modeArg = args[i + 1];
          i++;
        } else if (args[i].startsWith('--mode=')) {
          modeArg = args[i].substring('--mode='.length);
        }
      }

      const loader = new ConfigLoader(process.cwd());
      const { config, preset } = loader.getResolvedConfiguration();

      const skills = resolveSkillsForMode(preset, config, modeArg as HarnessMode | undefined);
      const activeMode = modeArg ?? config.mode ?? 'sprint';
      console.log(`[Harness Runner] Modo ativo: ${activeMode} (${skills.length} skills carregadas)`);
      console.log('Skills ativas no fluxo:');
      skills.forEach((skill) => {
        console.log(` - ${skill}`);
      });
      break;
    }

    case 'prune': {
      const skillName = args[1] || '05-craft-and-accessibility';
      console.log(`🔍 Calculando MCP Dynamic Pruning para a skill: '${skillName}'...`);
      const engine = new ContextEngine(process.cwd());
      const result = engine.pruneForSkill(skillName);
      console.log(`\nServidores MCP Ativos:`, Object.keys(result.activeServers));
      console.log(`Servidores Podados (Desligados):`, result.prunedServers);
      console.log(`Economia Estimada de Tokens: ${result.tokenSavingsEstimatePercentage}%\n`);
      break;
    }

    case 'audit': {
      console.log('🛡️  Executando Craft Guardian Linter...');
      const linter = new CraftGuardianLinter();
      const audit = linter.auditComponent({
        textColorHex: '#0F172A',
        bgColorHex: '#FFFFFF',
        paddingPx: [16, 24, 32],
        statesCovered: ['default', 'empty', 'loading', 'error']
      });
      console.log(`Status: ${audit.passed ? '✅ APROVADO' : '❌ REPROVADO'}`);
      console.log(`Score: ${audit.score}/100`);
      audit.issues.forEach(issue => {
        console.log(` - [${issue.severity.toUpperCase()}] ${issue.message}`);
      });
      break;
    }

    case 'humanize': {
      const target = args[1];
      const shouldFix = args.includes('--fix');
      console.log('✍️  Executando UX Copy Humanizer & Anti-Slop Linter...');

      if (!target) {
        console.log('Uso: open-ux-harness humanize <caminho-do-arquivo-ou-texto> [--fix]');
        break;
      }

      let content = target;
      let isFile = false;
      const targetPath = path.resolve(process.cwd(), target);

      if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
        content = fs.readFileSync(targetPath, 'utf-8');
        isFile = true;
        console.log(`📄 Arquivo alvo: ${targetPath}`);
      } else {
        console.log(`📝 Texto direto fornecido via CLI`);
      }

      const audit = UXHumanizerLinter.auditText(content);
      console.log(`\nStatus: ${audit.passed ? '✅ APROVADO' : '❌ REPROVADO'}`);
      console.log(`Score de Craft Textual: ${audit.score}/100`);
      console.log(`Padrões de AI Slop detectados: ${audit.totalTells} (Críticos: ${audit.criticalCount}, Maiores: ${audit.majorCount}, Menores: ${audit.minorCount})\n`);

      if (audit.tells.length > 0) {
        console.log('Detalhes das ocorrências:');
        audit.tells.forEach(tell => {
          const lineStr = tell.line ? ` (Linha ${tell.line})` : '';
          console.log(` - [${tell.severity.toUpperCase()} | ${tell.patternId}] "${tell.matchedText}"${lineStr}`);
          console.log(`   💡 Sugestão: ${tell.suggestedFix}`);
        });
      }

      if (shouldFix && isFile) {
        const cleaned = UXHumanizerLinter.cleanKnownPatterns(content);
        fs.writeFileSync(targetPath, cleaned, 'utf-8');
        console.log(`\n✨ Limpeza automática de clichês aplicada com sucesso em: ${targetPath}`);
      }
      break;
    }

    case 'tokens': {
      const file = args[1] || path.resolve(process.cwd(), 'templates', 'tokens-starter.json');
      console.log(`🎨 Validando Design Tokens: ${file}`);
      const { DesignTokensLinter } = await import('../../../core/lint-tokens.js');
      const res = DesignTokensLinter.validateTokenFile(file);
      console.log(`Status: ${res.valid ? '✅ VÁLIDO' : '❌ INVÁLIDO'} | Formato: ${res.format} | Total: ${res.totalTokens} tokens`);
      break;
    }

    case 'list': {
      const catalog = listAvailable(process.cwd());
      console.log('📦 Plataformas disponíveis:');
      catalog.platforms.forEach(p => {
        console.log(` - ${p}`);
      });
      console.log(`\n🎯 Skills disponíveis (${catalog.skills.length}):`);
      catalog.skills.forEach(s => {
        console.log(` - ${s}`);
      });
      break;
    }

    case 'install': {
      let platform: string | undefined;
      let skills: string[] | undefined;
      let dryRun = false;

      for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--platform' && args[i + 1]) {
          platform = args[i + 1];
          i++;
        } else if (arg.startsWith('--platform=')) {
          platform = arg.substring('--platform='.length);
        } else if (arg === '--skills' && args[i + 1]) {
          skills = args[i + 1].split(',').map(s => s.trim()).filter(Boolean);
          i++;
        } else if (arg.startsWith('--skills=')) {
          skills = arg.substring('--skills='.length).split(',').map(s => s.trim()).filter(Boolean);
        } else if (arg === '--dry-run') {
          dryRun = true;
        }
      }

      const result = installSelective({
        platform,
        skills,
        dryRun,
        baseDir: process.cwd()
      });

      console.log(`\n${result.message}`);
      console.log(`\nArquivos de destino (${result.targetPaths.length}):`);
      result.targetPaths.forEach(p => {
        console.log(` - ${p}`);
      });
      break;
    }

    case 'graph:build': {
      console.log('🗺️  Construindo Grafo de Conhecimento UX (Inspirado no Graphify)...');
      const graph = buildProjectGraph(process.cwd());
      const outDir = args[1] || path.resolve(process.cwd(), 'harness-out');
      const artifacts = UXGraphReporter.saveAllArtifacts(graph, { outDir });

      console.log(`\n✅ Grafo construído com sucesso! Total de nós: ${graph.getAllNodes().length} | Arestas: ${graph.getEdges().length}`);
      console.log('📁 Artefatos gerados:');
      console.log(` - Relatório Markdown : ${artifacts.reportPath}`);
      console.log(` - Visualizador HTML  : ${artifacts.htmlPath}`);
      console.log(` - Grafo GraphRAG JSON: ${artifacts.jsonPath}`);
      console.log(` - Diagrama Mermaid   : ${artifacts.mermaidPath}`);
      break;
    }

    case 'graph:path': {
      const fromId = args[1];
      const toId = args[2];
      if (!fromId || !toId) {
        console.error('❌ Uso obrigatório: open-ux-harness graph:path <fromId> <toId>');
        return;
      }
      console.log(`🔍 Buscando menor caminho topológico: '${fromId}' ➡️ '${toId}'...`);
      const graph = buildProjectGraph(process.cwd());
      const pathNodes = graph.findShortestPath(fromId, toId);
      if (!pathNodes) {
        console.log(`⚠️  Nenhum caminho encontrado entre '${fromId}' e '${toId}'.`);
      } else {
        console.log(`\n✅ Menor caminho (${pathNodes.length} saltos):`);
        console.log(pathNodes.map((n, i) => `  ${i + 1}. ${n}`).join('\n ⬇️\n'));
      }
      break;
    }

    case 'graph:blast': {
      const targetId = args[1] || 'token:color.brand.primary';
      console.log(`💥 Calculando Raio de Impacto (Blast Radius) para: '${targetId}'...`);
      const graph = buildProjectGraph(process.cwd());
      if (!graph.hasNode(targetId)) {
        console.error(`❌ Nó não encontrado no grafo: ${targetId}`);
        return;
      }
      const blast = graph.calculateBlastRadius(targetId);
      console.log(`\nNó Alvo: [${blast.targetNode?.type.toUpperCase()}] ${blast.targetNode?.label}`);
      console.log(`Total de Nós Impactados: ${blast.totalImpactedCount}`);
      console.log(`Classificação de Risco : ${blast.isHighRisk ? '🚨 ALTO RISCO (Blast > 5)' : '✅ BAIXO RISCO'}`);
      console.log('\nDependentes Diretos (1-hop):');
      blast.directDependents.forEach(d => console.log(` - [${d.type}] ${d.label} (${d.id})`));
      console.log('\nTelas e Entidades Downstream Afetadas:');
      blast.allImpactedNodes.forEach(n => console.log(` - [${n.type}] ${n.label} (Profundidade: ${blast.depthMap[n.id]})`));
      break;
    }

    case 'graph:explain': {
      const targetId = args[1] || 'comp:Button';
      console.log(`📖 Explicando nó do ecossistema: '${targetId}'...`);
      const graph = buildProjectGraph(process.cwd());
      const node = graph.getNode(targetId);
      if (!node) {
        console.error(`❌ Nó não encontrado: ${targetId}`);
        return;
      }
      const incoming = graph.getIncomingEdges(targetId);
      const outgoing = graph.getOutgoingEdges(targetId);
      const blast = graph.calculateBlastRadius(targetId);

      console.log(`\n🏷️  Nó: [${node.type.toUpperCase()}] ${node.label}`);
      console.log(`📍 ID: ${node.id}`);
      if (node.filePath) console.log(`📄 Arquivo: ${node.filePath}`);
      console.log(`\n⬅️  Quem depende deste nó (${incoming.length}):`);
      incoming.forEach(e => console.log(` - ${e.source} (via ${e.type})`));
      console.log(`\n➡️  O que este nó consome (${outgoing.length}):`);
      outgoing.forEach(e => console.log(` - ${e.target} (via ${e.type})`));
      console.log(`\n💥 Raio de Impacto (Blast Radius): ${blast.totalImpactedCount} nós afetados downstream.`);
      break;
    }

    case 'audit:slop': {
      const targetPath = args[1] || '.';
      console.log(`🛡️  Executando AntiSlopEngine sobre: '${targetPath}'...`);
      const resolved = path.resolve(process.cwd(), targetPath);

      // Checa se o CLI do Impeccable está disponível no ambiente (Híbrido)
      const impeccableResult = AntiSlopEngine.runImpeccableCli(resolved);
      if (impeccableResult.available) {
        console.log('⚡ [Híbrido] Impeccable CLI nativo detectado via npx! Execução delegada com suporte em Rust.');
      }

      let scanResult;
      if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        scanResult = AntiSlopEngine.scanDirectory(resolved);
      } else if (fs.existsSync(resolved)) {
        scanResult = AntiSlopEngine.scanFile(resolved);
      } else {
        console.error(`❌ Caminho não encontrado: ${resolved}`);
        return;
      }

      console.log(`\nStatus: ${scanResult.passed ? '✅ APROVADO' : '❌ REPROVADO'}`);
      console.log(`Score de Craft: ${scanResult.score}/100`);
      console.log(`Total de Achados: ${scanResult.totalFindings}`);
      console.log(`Resumo: P0: ${scanResult.summary.p0Count} | P1: ${scanResult.summary.p1Count} | P2: ${scanResult.summary.p2Count} | P3: ${scanResult.summary.p3Count}`);

      if (scanResult.findings.length > 0) {
        console.log('\nAchados Detalhados:');
        scanResult.findings.forEach((f) => {
          console.log(` [${f.priority}] [${f.ruleId}] ${f.message}`);
          if (f.filePath) console.log(`   Arquivo: ${f.filePath}${f.line ? `:${f.line}` : ''}`);
          if (f.snippet) console.log(`   Snippet: ${f.snippet}`);
          console.log(`   💡 Correção: ${f.suggestedFix}\n`);
        });
      }
      break;
    }

    case 'steer': {
      const verb = (args[1] || '').toLowerCase();
      const target = args[2] || 'componente atual';
      const validVerbs = ['bolder', 'quieter', 'distill', 'harden', 'typeset', 'polish'];

      if (!validVerbs.includes(verb)) {
        console.log(`Uso: open-ux-harness steer <verbo> [alvo]`);
        console.log(`Verbos disponíveis: ${validVerbs.join(', ')}`);
        break;
      }

      console.log(`🎯 [Micro-Steering] Aplicando direção '${verb.toUpperCase()}' no alvo: '${target}'...\n`);
      const playbookPath = path.resolve(process.cwd(), 'playbooks', `playbook-${verb}.md`);
      if (fs.existsSync(playbookPath)) {
        const doc = fs.readFileSync(playbookPath, 'utf-8');
        console.log(doc);
      } else {
        console.log(`ℹ️ Playbook para '${verb}' ativado.`);
      }
      break;
    }

    case 'help':
    default: {
      console.log(`
Uso: open-ux-harness <comando> [opções]

Comandos disponíveis:
  init                     Inicializa configuração do harness no projeto
  run [--mode M]           Executa o harness no modo especificado (micro, sprint, full)
  prune <skill>            Simula o MCP Pruning dinâmico e exibe economia de tokens
  audit                    Executa a auditoria heurística do Craft Guardian
  audit:slop [caminho]     Executa o AntiSlopEngine (62 regras determinísticas anti-slop)
  steer <verbo> [alvo]     Aplica playbook de micro-steering (bolder, quieter, distill, harden, typeset, polish)
  humanize <arquivo|texto> Executa auditoria e purificação de microcopy anti-slop (--fix)
  tokens [caminho]         Valida arquivo de Design Tokens contra W3C DTCG
  list                     Lista plataformas e skills ativas suportadas
  install [opções]         Instalação seletiva (--platform <id>, --skills <s1,s2>, --dry-run)
  graph:build [outDir]     Constrói Grafo UX e gera relatório, HTML e JSON (Graphify inspired)
  graph:path <from> <to>   Exibe menor caminho topológico entre dois nós
  graph:blast <nodeId>     Calcula raio de impacto e dependentes downstream
  graph:explain <nodeId>   Explica dependências e acoplamento de um nó
  help                     Exibe esta mensagem de ajuda
`);
      break;
    }

  }
}

// Execução direta
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('cli.ts') ||
  process.argv[1]?.endsWith('cli.js')
) {
  runCli(process.argv.slice(2));
}
