/**
 * Open UX Harness — Deterministic Skills Linter
 * Inspiração: agency-agents lint-agents.sh adaptado para o padrão agnóstico
 * Valida a integridade, conformidade estrutural e presença de todas as skills do harness.
 */

import fs from 'node:fs';
import path from 'node:path';
import { validateSkillDirectory, SkillValidationResult } from '../skills/00-skill-architect/scripts/validate-skill.js';

export interface SkillsLintReport {
  total: number;
  passed: number;
  failed: string[];
  missingActive: string[];
  errors: Record<string, string[]>;
}

/**
 * Determina se a skill é considerada "nova" no ciclo de governança do harness
 * (08-reality-gate, 09-persona-walkthrough, 00-skill-architect).
 */
export function isNewSkill(name: string): boolean {
  return (
    name === '08-reality-gate' ||
    name === '09-persona-walkthrough' ||
    name === '00-skill-architect' ||
    name === '10-ux-humanizer' ||
    name.startsWith('08-') ||
    name.startsWith('09-') ||
    name.startsWith('10-')
  );
}

/**
 * Executa o lint determinístico de todas as skills do repositório ou diretório base.
 *
 * @param baseDir Diretório raiz do repositório ou diretório contendo a pasta `skills`.
 * @param strict Quando true, qualquer aviso ou erro quebra a validação. Quando false,
 *               skills legadas com avisos históricos são toleradas, mas skills novas
 *               (08, 09, 00) devem passar com 0 erros.
 * @returns Relatório estruturado de validação de skills.
 */
export function lintAllSkills(baseDir: string, strict: boolean = false): SkillsLintReport {
  const resolvedBase = path.resolve(baseDir);

  // 1. Determina o diretório de skills
  let skillsDir = path.join(resolvedBase, 'skills');
  if (!fs.existsSync(skillsDir) && fs.existsSync(resolvedBase) && fs.statSync(resolvedBase).isDirectory()) {
    // Se o baseDir informado já for a pasta de skills ou contiver subpastas com SKILL.md
    if (path.basename(resolvedBase) === 'skills' || !fs.existsSync(path.join(resolvedBase, 'harness.config.json'))) {
      skillsDir = resolvedBase;
    }
  }

  // 2. Lê harness.config.json se disponível
  let activeSkills: string[] = [];
  const configPath = path.join(resolvedBase, 'harness.config.json');
  if (fs.existsSync(configPath)) {
    try {
      const configRaw = fs.readFileSync(configPath, 'utf-8');
      const parsedConfig = JSON.parse(configRaw);
      if (Array.isArray(parsedConfig.activeSkills)) {
        activeSkills = parsedConfig.activeSkills;
      }
    } catch {
      // Ignora falha de parse no config para permitir lint isolado
    }
  }

  // 3. Valida se as skills ativas declaradas existem
  const missingActive: string[] = [];
  for (const active of activeSkills) {
    const candidatePath = path.join(skillsDir, active);
    if (!fs.existsSync(candidatePath) || !fs.statSync(candidatePath).isDirectory()) {
      missingActive.push(active);
    }
  }

  // 4. Localiza todas as pastas de skills para validação
  let skillDirs: string[] = [];
  if (fs.existsSync(skillsDir) && fs.statSync(skillsDir).isDirectory()) {
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    skillDirs = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  }

  const failed: string[] = [];
  const errors: Record<string, string[]> = {};
  let passed = 0;

  // 5. Executa a validação de cada skill encontrada
  for (const dirName of skillDirs) {
    const skillPath = path.join(skillsDir, dirName);
    const result: SkillValidationResult = validateSkillDirectory(skillPath);

    const errorIssues = result.validation_errors.filter((i) => i.severity === 'error');
    const warningIssues = result.validation_errors.filter((i) => i.severity === 'warning');

    let isFailed = false;
    const issueMessages: string[] = [];

    if (strict) {
      if (errorIssues.length > 0 || warningIssues.length > 0) {
        isFailed = true;
        errorIssues.forEach((e) => {
          issueMessages.push(e.line ? `[${e.code}] Linha ${e.line}: ${e.message}` : `[${e.code}] ${e.message}`);
        });
        warningIssues.forEach((w) => {
          issueMessages.push(w.line ? `[AVISO:${w.code}] Linha ${w.line}: ${w.message}` : `[AVISO:${w.code}] ${w.message}`);
        });
      }
    } else {
      // Modo não-estrito: erros sempre falham
      if (errorIssues.length > 0) {
        isFailed = true;
        errorIssues.forEach((e) => {
          issueMessages.push(e.line ? `[${e.code}] Linha ${e.line}: ${e.message}` : `[${e.code}] ${e.message}`);
        });
      }
    }

    if (isFailed) {
      failed.push(dirName);
      errors[dirName] = issueMessages;
    } else {
      passed++;
    }
  }

  // Registra mensagens para skills ativas ausentes
  for (const missing of missingActive) {
    if (!errors[missing]) {
      errors[missing] = [`Diretório da skill ativa '${missing}' não encontrado em ${skillsDir}`];
    }
  }

  return {
    total: skillDirs.length,
    passed,
    failed,
    missingActive,
    errors,
  };
}

// 6. Execução direta via CLI (apenas quando chamado como script principal, não durante testes)
const isMainCliExecution = Boolean(
  typeof process !== 'undefined' &&
    process.argv[1] &&
    process.argv[1].includes('lint-skills') &&
    !process.argv[1].includes('.test.') &&
    !process.argv[1].includes('node:test')
);

if (isMainCliExecution) {
  const isStrict = process.argv.includes('--strict');
  const baseDirArg = process.argv.find((arg, index) => index >= 2 && !arg.startsWith('--'));
  const targetBase = baseDirArg ? path.resolve(baseDirArg) : process.cwd();

  // Cores ANSI
  const RESET = '\x1b[0m';
  const BOLD = '\x1b[1m';
  const GREEN = '\x1b[32m';
  const RED = '\x1b[31m';
  const YELLOW = '\x1b[33m';
  const CYAN = '\x1b[36m';
  const GRAY = '\x1b[90m';

  console.log(`\n${BOLD}${CYAN}=== Open UX Harness — Skills Linter ===${RESET}`);
  console.log(`${GRAY}Diretório Base:${RESET} ${targetBase}`);
  console.log(`${GRAY}Modo Estrito (Strict):${RESET} ${isStrict ? `${RED}Ativado${RESET}` : `${GREEN}Desativado${RESET}`}\n`);

  // Lê activeSkills para exibir lista completa conforme AC-LS1
  let activeList: string[] = [];
  const cfgPath = path.join(targetBase, 'harness.config.json');
  if (fs.existsSync(cfgPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      if (Array.isArray(cfg.activeSkills)) {
        activeList = cfg.activeSkills;
      }
    } catch {}
  }

  const report = lintAllSkills(targetBase, isStrict);

  if (activeList.length > 0) {
    console.log(`${BOLD}Skills Ativas Declaradas (${activeList.length}):${RESET}`);
    for (const skill of activeList) {
      if (report.missingActive.includes(skill)) {
        console.log(`  ${RED}✖ [AUSENTE]${RESET} ${skill}`);
      } else if (report.failed.includes(skill)) {
        console.log(`  ${RED}✖ [FALHA]${RESET}   ${skill}`);
      } else {
        console.log(`  ${GREEN}✔ [OK]${RESET}      ${skill}`);
      }
    }
    console.log('');
  }

  console.log(`${BOLD}Resumo da Validação:${RESET}`);
  console.log(`  Total de skills avaliadas : ${BOLD}${report.total}${RESET}`);
  console.log(`  Aprovadas (Passed)        : ${GREEN}${BOLD}${report.passed}${RESET}`);
  console.log(`  Reprovadas (Failed)       : ${report.failed.length > 0 ? RED : GREEN}${BOLD}${report.failed.length}${RESET}`);
  console.log(`  Ativas ausentes (Missing) : ${report.missingActive.length > 0 ? YELLOW : GREEN}${BOLD}${report.missingActive.length}${RESET}\n`);

  if (report.failed.length > 0) {
    console.log(`${BOLD}${RED}Detalhes das Falhas:${RESET}`);
    for (const failedSkill of report.failed) {
      console.log(`  ${RED}• ${failedSkill}:${RESET}`);
      (report.errors[failedSkill] || []).forEach((msg) => {
        console.log(`      - ${msg}`);
      });
    }
    console.log('');
  }

  if (report.missingActive.length > 0) {
    console.log(`${BOLD}${YELLOW}Skills Ativas Ausentes do Sistema de Arquivos:${RESET}`);
    for (const missing of report.missingActive) {
      console.log(`  ${YELLOW}• ${missing}${RESET}`);
    }
    console.log('');
  }

  // Critérios de saída:
  // Se missingActive.length > 0 ou (strict && failed.length > 0) ou houver falha nas skills novas (08, 09), sai com 1.
  const hasNewSkillFailure = report.failed.some((name) => isNewSkill(name));
  const hasFailed = report.missingActive.length > 0 || (isStrict && report.failed.length > 0) || hasNewSkillFailure;

  if (hasFailed) {
    console.error(`${RED}${BOLD}❌ Lint de Skills reprovado.${RESET}`);
    if (report.missingActive.length > 0) {
      console.error(`${YELLOW}Motivo: Existem ${report.missingActive.length} skill(s) ativa(s) ausente(s) da pasta skills/.${RESET}`);
    }
    if (hasNewSkillFailure) {
      console.error(`${RED}Motivo: Falha detectada em skill nova mandatória (08, 09, 00).${RESET}`);
    }
    if (isStrict && report.failed.length > 0) {
      console.error(`${RED}Motivo: Falha detectada sob modo estrito (--strict).${RESET}`);
    }
    process.exit(1);
  } else {
    console.log(`${GREEN}${BOLD}✔ Todas as skills válidas e aprovadas!${RESET}\n`);
    process.exit(0);
  }
}
