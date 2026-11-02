/**
 * Open UX Harness — Testes Unitários do UXHumanizerLinter
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { UXHumanizerLinter } from './ux-humanizer-linter.js';

test('1. Texto limpo e direto retorna score 100 e passed true', () => {
  const cleanSnippet = `
# Painel de Vendas e Faturamento
Monitore o fluxo de caixa da sua empresa em tempo real.

<button>Criar conta gratuita</button>
<button>Exportar relatório CSV</button>

<div>Nenhum projeto cadastrado.</div>
<button>Novo projeto</button>
`;

  const result = UXHumanizerLinter.auditText(cleanSnippet);

  assert.strictEqual(result.passed, true);
  assert.strictEqual(result.score, 100);
  assert.strictEqual(result.totalTells, 0);
  assert.strictEqual(result.criticalCount, 0);
});

test('2. Detecção de CTAs prolixos e erro mágico dispara tells críticos', () => {
  const slopSnippet = `
<header>Elevando a sinergia dos seus dados a uma nova dimensão</header>
<button>Comece sua jornada inesquecível agora</button>
<p>Oops! Algo mágico deu errado com os nossos servidores!</p>
`;

  const result = UXHumanizerLinter.auditText(slopSnippet);

  assert.strictEqual(result.passed, false, 'Trecho com slop crítico deve ser reprovado');
  assert.ok(result.criticalCount >= 3, 'Deve identificar os 3 padrões críticos (§1, §2, §4)');
  assert.ok(result.score <= 35, 'Score deve ser severamente penalizado por falhas críticas');
  assert.ok(result.tells.some((t) => t.patternId === '§1'));
  assert.ok(result.tells.some((t) => t.patternId === '§2'));
  assert.ok(result.tells.some((t) => t.patternId === '§4'));
});

test('3. Detecção de buzzwords e voz passiva dispara tells major', () => {
  const buzzwordSnippet = `
Desvende todas as métricas da sua empresa.
A atualização das configurações foi concluída com sucesso pelo sistema.
`;

  const result = UXHumanizerLinter.auditText(buzzwordSnippet);

  assert.ok(result.majorCount >= 2, 'Deve identificar §9 (Buzzword) e §10 (Voz Passiva)');
  assert.ok(result.tells.some((t) => t.patternId === '§9'));
  assert.ok(result.tells.some((t) => t.patternId === '§10'));
});

test('4. cleanKnownPatterns substitui clichês conhecidos com versões purificadas', () => {
  const rawText = 'Clique para Comece sua jornada inesquecível agora. 🚀 Iniciar!';
  const cleaned = UXHumanizerLinter.cleanKnownPatterns(rawText);

  assert.ok(!cleaned.includes('jornada inesquecível'));
  assert.ok(cleaned.includes('Criar conta gratuita'));
  assert.ok(!cleaned.includes('🚀 Iniciar'));
  assert.ok(cleaned.includes('Iniciar'));
});
