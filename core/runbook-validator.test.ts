/**
 * Open UX Harness — Testes Unitários de Runbook Validator
 * Validação de integridade do catálogo de cenários, regras de roster e checagem de skills.
 */

import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { validateRunbooks, RunbookCatalog } from './runbook-validator.js';

describe('Runbook Validator Engine', () => {
  test('1. Repositório oficial com os 4 cenários deve retornar valid = true e sem erros (AC-RB1)', () => {
    const projectRoot = process.cwd();
    const result = validateRunbooks(projectRoot);

    assert.strictEqual(result.valid, true, `Esperava validação bem-sucedida, mas obteve erros: ${result.errors.join('; ')}`);
    assert.strictEqual(result.errors.length, 0);

    // Validação adicional do conteúdo do catálogo oficial
    const catalogPath = path.resolve(projectRoot, 'runbooks', 'runbooks.json');
    const catalogContent = JSON.parse(fs.readFileSync(catalogPath, 'utf-8')) as RunbookCatalog;

    assert.strictEqual(Array.isArray(catalogContent.runbooks), true);
    assert.strictEqual(catalogContent.runbooks.length, 4, 'O catálogo deve conter exatamente 4 cenários');

    const expectedSlugs = ['checkout-redesign', 'design-system-audit', 'landing-page', 'linkedin-portfolio'];
    const foundSlugs = catalogContent.runbooks.map(rb => rb.slug);
    assert.deepStrictEqual(foundSlugs.sort(), expectedSlugs.sort());
  });

  test('2. Retorna erro específico quando runbooks.json não existe no baseDir', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-harness-norb-'));
    try {
      const result = validateRunbooks(tmpDir);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.errors.length, 1);
      assert.strictEqual(result.errors[0], 'runbooks.json não encontrado');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('3. Teste negativo de skill inexistente acusa erro nomeando a skill (AC-RB2)', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-harness-missing-skill-'));
    try {
      // Cria estrutura mínima válida com uma skill inexistente
      const runbooksDir = path.join(tmpDir, 'runbooks');
      fs.mkdirSync(runbooksDir, { recursive: true });

      const docFile = path.join(runbooksDir, 'cenario-teste.md');
      fs.writeFileSync(docFile, '# Cenário de Teste', 'utf-8');

      // Cria apenas uma skill real
      const realSkillDir = path.join(tmpDir, 'skills', 'skill-real');
      fs.mkdirSync(realSkillDir, { recursive: true });
      fs.writeFileSync(path.join(realSkillDir, 'SKILL.md'), '# Skill Real', 'utf-8');

      const missingSkillName = 'skill-fantasma-inexistente';
      const catalogData = {
        runbooks: [
          {
            slug: 'cenario-teste',
            title: 'Cenário de Teste',
            mode: 'micro',
            summary: 'Resumo para teste unitário',
            doc: 'runbooks/cenario-teste.md',
            roster: [
              {
                group: 'Grupo de Teste',
                activation: 'Imediata',
                skills: ['skill-real', missingSkillName]
              }
            ]
          }
        ]
      };

      fs.writeFileSync(path.join(runbooksDir, 'runbooks.json'), JSON.stringify(catalogData, null, 2), 'utf-8');

      const result = validateRunbooks(tmpDir);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.errors.length, 1);
      assert.strictEqual(
        result.errors.some(err => err.includes(missingSkillName)),
        true,
        `O erro reportado deve conter o nome da skill inexistente: ${result.errors[0]}`
      );
      assert.strictEqual(
        result.errors.some(err => err.includes('cenario-teste')),
        true,
        'O erro deve identificar o runbook onde ocorreu a falha'
      );
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('4. Retorna erro quando o arquivo doc referenciado não existe no disco', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-harness-missing-doc-'));
    try {
      const runbooksDir = path.join(tmpDir, 'runbooks');
      fs.mkdirSync(runbooksDir, { recursive: true });

      const realSkillDir = path.join(tmpDir, 'skills', 'skill-base');
      fs.mkdirSync(realSkillDir, { recursive: true });
      fs.writeFileSync(path.join(realSkillDir, 'SKILL.md'), '# Skill Base', 'utf-8');

      const missingDocPath = 'runbooks/arquivo-que-nao-existe.md';
      const catalogData = {
        runbooks: [
          {
            slug: 'cenario-doc-ausente',
            title: 'Cenário com Doc Ausente',
            mode: 'sprint',
            summary: 'Resumo para teste de documento inexistente',
            doc: missingDocPath,
            roster: [
              {
                group: 'Grupo Base',
                activation: 'Fase 1',
                skills: ['skill-base']
              }
            ]
          }
        ]
      };

      fs.writeFileSync(path.join(runbooksDir, 'runbooks.json'), JSON.stringify(catalogData, null, 2), 'utf-8');

      const result = validateRunbooks(tmpDir);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(
        result.errors.some(err => err.includes('cenario-doc-ausente') && err.includes(missingDocPath)),
        true,
        `Esperava mensagem apontando o runbook e o doc ausente: ${result.errors.join('; ')}`
      );
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('5. Retorna erro quando há duplicidade de slug no catálogo', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-harness-duplicate-slug-'));
    try {
      const runbooksDir = path.join(tmpDir, 'runbooks');
      fs.mkdirSync(runbooksDir, { recursive: true });

      const docFile = path.join(runbooksDir, 'doc.md');
      fs.writeFileSync(docFile, '# Doc Compartilhado', 'utf-8');

      const skillDir = path.join(tmpDir, 'skills', 'skill-comum');
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '# Skill Comum', 'utf-8');

      const duplicatedSlug = 'slug-repetido';
      const catalogData = {
        runbooks: [
          {
            slug: duplicatedSlug,
            title: 'Primeiro Cenário',
            mode: 'micro',
            summary: 'Primeira entrada com o slug',
            doc: 'runbooks/doc.md',
            roster: [{ group: 'G1', activation: 'A1', skills: ['skill-comum'] }]
          },
          {
            slug: duplicatedSlug,
            title: 'Segundo Cenário Conflitante',
            mode: 'sprint',
            summary: 'Segunda entrada com o mesmo slug',
            doc: 'runbooks/doc.md',
            roster: [{ group: 'G1', activation: 'A1', skills: ['skill-comum'] }]
          }
        ]
      };

      fs.writeFileSync(path.join(runbooksDir, 'runbooks.json'), JSON.stringify(catalogData, null, 2), 'utf-8');

      const result = validateRunbooks(tmpDir);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(
        result.errors.some(err => err.includes('Slug duplicado') && err.includes(duplicatedSlug)),
        true,
        `Esperava acusar duplicidade do slug "${duplicatedSlug}": ${result.errors.join('; ')}`
      );
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('6. Retorna erro quando campos obrigatórios estão ausentes ou vazios', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-harness-missing-fields-'));
    try {
      const runbooksDir = path.join(tmpDir, 'runbooks');
      fs.mkdirSync(runbooksDir, { recursive: true });

      const catalogData = {
        runbooks: [
          {
            slug: 'incompleto',
            // title ausente
            mode: '   ', // vazio
            // summary ausente
            doc: '', // vazio
            roster: 'nao-e-array' // inválido
          }
        ]
      };

      fs.writeFileSync(path.join(runbooksDir, 'runbooks.json'), JSON.stringify(catalogData, null, 2), 'utf-8');

      const result = validateRunbooks(tmpDir);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.errors.some(e => e.includes('title')), true);
      assert.strictEqual(result.errors.some(e => e.includes('mode')), true);
      assert.strictEqual(result.errors.some(e => e.includes('summary')), true);
      assert.strictEqual(result.errors.some(e => e.includes('doc')), true);
      assert.strictEqual(result.errors.some(e => e.includes('roster')), true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('7. Retorna erro quando roster é vazio ou grupo possui lista de skills vazia', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-harness-empty-roster-'));
    try {
      const runbooksDir = path.join(tmpDir, 'runbooks');
      fs.mkdirSync(runbooksDir, { recursive: true });

      const docFile = path.join(runbooksDir, 'doc.md');
      fs.writeFileSync(docFile, '# Doc', 'utf-8');

      const catalogData = {
        runbooks: [
          {
            slug: 'roster-vazio',
            title: 'Cenário com Roster Vazio',
            mode: 'sprint',
            summary: 'Resumo',
            doc: 'runbooks/doc.md',
            roster: []
          },
          {
            slug: 'grupo-skills-vazio',
            title: 'Cenário com Grupo Sem Skills',
            mode: 'micro',
            summary: 'Resumo',
            doc: 'runbooks/doc.md',
            roster: [
              {
                group: 'Grupo Sem Skills',
                activation: 'A1',
                skills: []
              }
            ]
          }
        ]
      };

      fs.writeFileSync(path.join(runbooksDir, 'runbooks.json'), JSON.stringify(catalogData, null, 2), 'utf-8');

      const result = validateRunbooks(tmpDir);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.errors.some(e => e.includes('roster não pode ser vazio')), true);
      assert.strictEqual(result.errors.some(e => e.includes('deve conter uma lista "skills" não vazia')), true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('8. Retorna erro estruturado quando runbooks.json possui sintaxe inválida ou raiz incorreta', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-harness-invalid-json-'));
    try {
      const runbooksDir = path.join(tmpDir, 'runbooks');
      fs.mkdirSync(runbooksDir, { recursive: true });

      fs.writeFileSync(path.join(runbooksDir, 'runbooks.json'), '{ json quebrado: ', 'utf-8');
      const resultSyntax = validateRunbooks(tmpDir);
      assert.strictEqual(resultSyntax.valid, false);
      assert.strictEqual(resultSyntax.errors.some(e => e.includes('Erro ao ler ou parsear')), true);

      fs.writeFileSync(path.join(runbooksDir, 'runbooks.json'), JSON.stringify({ runbooks: 'nao-e-array' }), 'utf-8');
      const resultRoot = validateRunbooks(tmpDir);
      assert.strictEqual(resultRoot.valid, false);
      assert.strictEqual(resultRoot.errors.some(e => e.includes('deve conter a propriedade "runbooks" como array')), true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
