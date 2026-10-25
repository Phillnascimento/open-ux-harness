/**
 * Open UX Harness — Testes Unitários do Deterministic Skills Linter
 * Valida os requisitos do contrato B4 (lintAllSkills, missingActive, failed, strict).
 */

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { lintAllSkills, isNewSkill } from './lint-skills.js';

const repoRoot = path.resolve(process.cwd());

/**
 * Conteúdo padrão de uma skill 100% conforme ao super-padrão agnóstico.
 */
function createValidSkillContent(skillName: string): string {
  return `---
name: ${skillName}
description: Skill de teste automatizado para validação determinística. NUNCA utilize esta skill para fluxos de produção.
---

<role>
Especialista de teste automatizado do Open UX Harness.
</role>

<context>
Ambiente de testes controlados para validação do linter de skills.
</context>

<reference_index>
- ref/sample.md
</reference_index>

<execution_steps>
1. Executar verificação determinística
2. Avaliar conformidade do arquivo
</execution_steps>

<examples>
Exemplo de entrada e saída esperada
</examples>

<constraints>
IF houver erro estrutural THEN realizar retry limitado. Máximo de 3 tentativas com escalonamento SCHEMA_MISMATCH. NEVER violar as restrições canônicas.
</constraints>

<output_schema>
{
  "type": "object",
  "properties": {
    "status": { "type": "string" }
  },
  "required": ["status"]
}
</output_schema>
`;
}

test('Validação do repositório atual executa e identifica todas as skills', () => {
  const report = lintAllSkills(repoRoot, false);

  assert.ok(report.total >= 22, `Esperado no mínimo 22 skills no repositório, encontrado: ${report.total}`);
  assert.strictEqual(report.failed.length, 0, `Nenhuma skill do repositório deve falhar: ${report.failed.join(', ')}`);
  assert.strictEqual(report.passed, report.total, 'Todas as skills avaliadas devem passar');
  assert.ok(Array.isArray(report.missingActive), 'missingActive deve ser um array');
  assert.ok(Array.isArray(report.failed), 'failed deve ser um array');
  assert.strictEqual(typeof report.errors, 'object', 'errors deve ser um Record');
});

test('Ausência de pasta de uma skill declarada em activeSkills é reportada em missingActive', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-lint-missing-'));
  try {
    const skillsDir = path.join(tempDir, 'skills');
    fs.mkdirSync(skillsDir, { recursive: true });

    // Cria uma skill real
    const existingSkill = 'mock-present-skill';
    const existingPath = path.join(skillsDir, existingSkill);
    fs.mkdirSync(existingPath, { recursive: true });
    fs.writeFileSync(path.join(existingPath, 'SKILL.md'), createValidSkillContent(existingSkill), 'utf-8');

    // Cria harness.config.json com uma existente e duas ausentes
    const missingA = 'ghost-skill-alpha';
    const missingB = 'ghost-skill-beta';
    const configData = {
      activeSkills: [existingSkill, missingA, missingB],
    };
    fs.writeFileSync(path.join(tempDir, 'harness.config.json'), JSON.stringify(configData, null, 2), 'utf-8');

    const report = lintAllSkills(tempDir, false);

    assert.strictEqual(report.missingActive.length, 2, 'Deve identificar exatamente 2 skills ausentes');
    assert.ok(report.missingActive.includes(missingA), `missingActive deve incluir ${missingA}`);
    assert.ok(report.missingActive.includes(missingB), `missingActive deve incluir ${missingB}`);
    assert.ok(!report.missingActive.includes(existingSkill), 'Skill existente não deve estar em missingActive');
    assert.strictEqual(report.passed, 1, 'A skill existente deve ser aprovada');
    assert.strictEqual(report.failed.length, 0, 'Nenhuma skill existente deve falhar');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('Diretório temporário com skill válida passa no lint', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-lint-valid-'));
  try {
    const skillsDir = path.join(tempDir, 'skills');
    const skillName = 'valid-test-skill';
    const skillFolder = path.join(skillsDir, skillName);
    fs.mkdirSync(skillFolder, { recursive: true });

    fs.writeFileSync(path.join(skillFolder, 'SKILL.md'), createValidSkillContent(skillName), 'utf-8');

    const configData = {
      activeSkills: [skillName],
    };
    fs.writeFileSync(path.join(tempDir, 'harness.config.json'), JSON.stringify(configData, null, 2), 'utf-8');

    const report = lintAllSkills(tempDir, false);

    assert.strictEqual(report.total, 1, 'Deve avaliar exatamente 1 skill');
    assert.strictEqual(report.passed, 1, 'A skill válida deve passar');
    assert.strictEqual(report.failed.length, 0, 'A lista de falhas deve estar vazia');
    assert.strictEqual(report.missingActive.length, 0, 'Nenhuma skill ativa deve estar ausente');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('Diretório com skill inválida (sem SKILL.md ou tags XML faltando) é reportado em failed', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-lint-invalid-'));
  try {
    const skillsDir = path.join(tempDir, 'skills');

    // 1. Skill sem SKILL.md
    const noFileSkill = 'invalid-no-skill-md';
    fs.mkdirSync(path.join(skillsDir, noFileSkill), { recursive: true });

    // 2. Skill com XML incompleto (faltando <constraints> e <output_schema>)
    const missingXmlSkill = 'invalid-missing-tags';
    const missingXmlFolder = path.join(skillsDir, missingXmlSkill);
    fs.mkdirSync(missingXmlFolder, { recursive: true });
    const brokenXmlContent = `---
name: ${missingXmlSkill}
description: Skill inválida faltando tags. NUNCA use em produção.
---

<role>
Papel de teste
</role>

<context>
Contexto de teste
</context>

<reference_index>
Nenhum
</reference_index>

<execution_steps>
Passo único
</execution_steps>

<examples>
Exemplo
</examples>
`;
    fs.writeFileSync(path.join(missingXmlFolder, 'SKILL.md'), brokenXmlContent, 'utf-8');

    const report = lintAllSkills(tempDir, false);

    assert.strictEqual(report.total, 2, 'Deve avaliar 2 skills');
    assert.strictEqual(report.passed, 0, 'Nenhuma skill quebrada deve passar');
    assert.strictEqual(report.failed.length, 2, 'Ambas as skills devem estar na lista failed');
    assert.ok(report.failed.includes(noFileSkill), `failed deve conter ${noFileSkill}`);
    assert.ok(report.failed.includes(missingXmlSkill), `failed deve conter ${missingXmlSkill}`);

    // Verifica que erros detalhados foram catalogados
    assert.ok(report.errors[noFileSkill], `Deve ter mensagens de erro para ${noFileSkill}`);
    assert.ok(
      report.errors[noFileSkill].some((msg) => msg.includes('SKILL_MD_MISSING') || msg.includes('SKILL.md')),
      'Deve acusar falta do arquivo SKILL.md'
    );

    assert.ok(report.errors[missingXmlSkill], `Deve ter mensagens de erro para ${missingXmlSkill}`);
    assert.ok(
      report.errors[missingXmlSkill].some((msg) => msg.includes('XML_TAG_MISSING')),
      'Deve acusar ausência de tags XML obrigatórias'
    );
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('Modo strict reprova skills com avisos estruturais e não-estrito tolera', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-lint-strict-'));
  try {
    const skillsDir = path.join(tempDir, 'skills');
    const warningSkill = 'warning-anchors-skill';
    const warningFolder = path.join(skillsDir, warningSkill);
    fs.mkdirSync(warningFolder, { recursive: true });

    // Skill que gera apenas WARNING (ex: sem âncoras ALL-CAPS como IF/THEN/NEVER no constraints, mas com 3 tentativas e SCHEMA_MISMATCH)
    const contentWithWarning = `---
name: ${warningSkill}
description: Skill de teste com aviso leve. NUNCA use fora de testes.
---

<role>
Testador com warning
</role>

<context>
Contexto de teste
</context>

<reference_index>
Nenhum
</reference_index>

<execution_steps>
Passos
</execution_steps>

<examples>
Exemplo
</examples>

<constraints>
Em caso de falha, tentar no maximo 3 tentativas com escalonamento SCHEMA_MISMATCH.
</constraints>

<output_schema>
{ "ok": true }
</output_schema>
`;
    fs.writeFileSync(path.join(warningFolder, 'SKILL.md'), contentWithWarning, 'utf-8');

    // Em modo não-estrito, avisos são tolerados
    const nonStrictReport = lintAllSkills(tempDir, false);
    assert.strictEqual(nonStrictReport.passed, 1, 'Em modo não-estrito, skill com apenas aviso deve passar');
    assert.strictEqual(nonStrictReport.failed.length, 0, 'Em modo não-estrito, não deve ir para failed');

    // Em modo estrito, qualquer aviso ou erro quebra
    const strictReport = lintAllSkills(tempDir, true);
    assert.strictEqual(strictReport.passed, 0, 'Em modo estrito, skill com aviso deve ser reprovada');
    assert.strictEqual(strictReport.failed.length, 1, 'Em modo estrito, deve constar em failed');
    assert.ok(strictReport.failed.includes(warningSkill));
    assert.ok(
      strictReport.errors[warningSkill].some((msg) => msg.includes('AVISO') || msg.includes('CONSTRAINTS_MISSING_ALL_CAPS_ANCHORS')),
      'Deve registrar aviso detalhado nos erros da skill'
    );
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('isNewSkill identifica corretamente skills novas prioritárias e legadas', () => {
  assert.strictEqual(isNewSkill('08-reality-gate'), true);
  assert.strictEqual(isNewSkill('09-persona-walkthrough'), true);
  assert.strictEqual(isNewSkill('00-skill-architect'), true);
  assert.strictEqual(isNewSkill('01-briefing-discovery'), false);
  assert.strictEqual(isNewSkill('05-craft-and-accessibility'), false);
  assert.strictEqual(isNewSkill('li-post'), false);
});
