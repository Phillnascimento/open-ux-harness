/**
 * Open UX Harness — Testes Unitários do AntiSlopEngine
 * Valida a detecção determinística de assinaturas de slop e qualidade de código.
 */

import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { AntiSlopEngine } from './anti-slop-engine.js';
import { CraftGuardianLinter } from './craft-guardian-linter.js';
import { RealityGate } from './reality-gate.js';

describe('AntiSlopEngine — Regras Determinísticas de Craft e Anti-Slop', () => {
  test('1. Código limpo e com boas práticas retorna score 100 e passed true', () => {
    const cleanCode = `
      export function UserCard({ name, role }: { name: string; role: string }) {
        return (
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-neutral-900">{name}</h3>
            <p className="mt-2 text-base leading-relaxed text-neutral-600 max-w-prose">{role}</p>
          </div>
        );
      }
    `;

    const result = AntiSlopEngine.scan(cleanCode, 'UserCard.tsx');
    assert.strictEqual(result.passed, true);
    assert.strictEqual(result.score, 100);
    assert.strictEqual(result.findings.length, 0);
  });

  test('2. Detecção de borda lateral espessa em card arredondado (side-tab tell)', () => {
    const slopCode = `
      <div className="rounded-xl border-l-4 border-indigo-600 bg-white p-6 shadow-md">
        <h4 className="text-lg font-semibold">Notificação Importante</h4>
      </div>
    `;

    const result = AntiSlopEngine.scan(slopCode, 'Notification.tsx');
    const sideTab = result.findings.find(f => f.ruleId === 'side-tab');
    assert.ok(sideTab, 'Deve detectar a regra side-tab');
    assert.strictEqual(sideTab.priority, 'P1');
    assert.strictEqual(result.passed, false);
  });

  test('3. Detecção de texto em gradiente (gradient-text)', () => {
    const gradCode = `
      <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Construa o Futuro com IA
      </h1>
    `;

    const result = AntiSlopEngine.scan(gradCode, 'Hero.tsx');
    const gradFinding = result.findings.find(f => f.ruleId === 'gradient-text');
    assert.ok(gradFinding, 'Deve detectar texto em gradiente');
    assert.strictEqual(gradFinding.priority, 'P1');
  });

  test('4. Detecção de paleta clichê de IA (from-purple-500 to-cyan-500)', () => {
    const aiColorCode = `
      <div className="bg-gradient-to-br from-purple-500 to-cyan-500 p-8">
        <p className="text-white">Seção com gradiente de IA</p>
      </div>
    `;

    const result = AntiSlopEngine.scan(aiColorCode, 'Banner.tsx');
    const paletteFinding = result.findings.find(f => f.ruleId === 'ai-color-palette');
    assert.ok(paletteFinding, 'Deve detectar paleta clichê de IA');
  });

  test('5. Detecção de sombra zero-offset luminosa em fundo escuro (dark-glow)', () => {
    const glowCode = `
      <div className="bg-slate-950 p-6" style={{ boxShadow: '0 0 20px #8b5cf6' }}>
        <span className="text-cyan-400">Card com glow</span>
      </div>
    `;

    const result = AntiSlopEngine.scan(glowCode, 'GlowCard.tsx');
    const glowFinding = result.findings.find(f => f.ruleId === 'dark-glow');
    assert.ok(glowFinding, 'Deve detectar dark-glow');
    assert.strictEqual(glowFinding.priority, 'P1');
  });

  test('6. Detecção de kicker/eyebrow em caixa alta acima de heading', () => {
    const kickerCode = `
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Recurso Exclusivo</span>
        <h2 className="text-3xl font-bold text-neutral-900">Dashboard em Tempo Real</h2>
      </div>
    `;

    const result = AntiSlopEngine.scan(kickerCode, 'FeatureSection.tsx');
    const kickerFinding = result.findings.find(f => f.ruleId === 'kicker-above-heading');
    assert.ok(kickerFinding, 'Deve detectar kicker acima de heading');
  });

  test('7. Detecção de imagem quebrada com src vazio ou placeholder', () => {
    const brokenImgCode = `
      <div>
        <img src="#" alt="Foto de perfil" />
      </div>
    `;

    const result = AntiSlopEngine.scan(brokenImgCode, 'Avatar.tsx');
    const imgFinding = result.findings.find(f => f.ruleId === 'broken-image');
    assert.ok(imgFinding, 'Deve detectar broken-image como P0 bloqueante');
    assert.strictEqual(imgFinding.priority, 'P0');
  });

  test('8. Detecção de padding apertado (<8px) dentro de container com borda', () => {
    const crampedCode = `
      <div className="border border-neutral-300 p-1">
        <span>Texto colado na borda</span>
      </div>
    `;

    const result = AntiSlopEngine.scan(crampedCode, 'Box.tsx');
    const cramped = result.findings.find(f => f.ruleId === 'cramped-padding');
    assert.ok(cramped, 'Deve detectar cramped-padding');
  });

  test('9. Integração CraftGuardianLinter.auditSourceCode', () => {
    const linter = new CraftGuardianLinter();
    const source = `
      <div className="rounded-xl border-l-4 border-purple-500 bg-clip-text text-transparent">
        <p>Texto</p>
      </div>
    `;

    const audit = linter.auditSourceCode(source, 'TestComponent.tsx');
    assert.strictEqual(audit.passed, false);
    assert.ok(audit.issues.length >= 2);
    assert.ok(audit.slopFindings && audit.slopFindings.length >= 2);
  });

  test('10. Integração RealityGate.evaluateFromSlopResult bloqueia HOLD em caso de P1', () => {
    const gate = new RealityGate();
    const badCode = `
      <h1 className="bg-clip-text text-transparent text-4xl">Título</h1>
    `;
    const slopResult = AntiSlopEngine.scan(badCode, 'Page.tsx');
    assert.strictEqual(slopResult.passed, false);

    const gateResult = gate.evaluateFromSlopResult(slopResult);
    assert.strictEqual(gateResult.verdict, 'HOLD');
    assert.ok(gateResult.reasons.some(r => r.includes('gradient-text') || r.includes('Craft Guardian')));
  });
});
