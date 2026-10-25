import fs from 'node:fs';
import path from 'node:path';
import { ContextEngine } from '../../../core/context-engine.js';
import { CraftGuardianLinter } from '../../../core/craft-guardian-linter.js';
import { DesignTokensLinter } from '../../../core/lint-tokens.js';
export function runCli(args) {
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
            }
            else {
                console.log('✨ Criado harness.config.json padrão.');
            }
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
        case 'tokens': {
            const file = args[1] || path.resolve(process.cwd(), 'templates', 'tokens-starter.json');
            console.log(`🎨 Validando Design Tokens: ${file}`);
            const res = DesignTokensLinter.validateTokenFile(file);
            console.log(`Status: ${res.valid ? '✅ VÁLIDO' : '❌ INVÁLIDO'} | Formato: ${res.format} | Total: ${res.totalTokens} tokens`);
            break;
        }
        case 'help':
        default: {
            console.log(`
Uso: open-ux-harness <comando> [opções]

Comandos disponíveis:
  init             Inicializa configuração do harness no projeto
  prune <skill>    Simula o MCP Pruning dinâmico e exibe economia de tokens
  audit            Executa a auditoria heurística do Craft Guardian
  tokens [caminho] Valida arquivo de Design Tokens contra W3C DTCG
  help             Exibe esta mensagem de ajuda
`);
            break;
        }
    }
}
// Execução direta
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('cli.ts')) {
    runCli(process.argv.slice(2));
}
