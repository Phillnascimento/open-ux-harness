import test from 'node:test';
import assert from 'node:assert';
import { ConfigLoader, HarnessConfig, PresetConfig } from './config-loader.js';
import {
  resolveSkillsForMode,
  isValidMode,
  CANONICAL_MICRO_SKILLS,
  CANONICAL_SPRINT_SKILLS,
  CANONICAL_FULL_SKILLS
} from './modes.js';

// Utilitário para gerar configuração mínima válida para testes
function createMockConfig(overrides?: Partial<HarnessConfig>): HarnessConfig {
  return {
    name: 'Test Project',
    version: '1.0.0',
    profile: 'freelance',
    mode: 'sprint',
    platforms: {
      target: ['terminal-cli'],
      outputDir: './dist'
    },
    llmEngine: {
      defaultProvider: 'anthropic',
      defaultModel: 'claude-3-7-sonnet'
    },
    memory: {
      semanticPath: './memory/semantic',
      episodicPath: './memory/episodic',
      proceduralPath: './memory/procedural',
      decayDays: 30,
      compressionEnabled: false
    },
    governance: {
      zeroYoloMode: true,
      allowAutoFixMinorA11y: true,
      requireHumanConfirmationOnMasterTokens: true,
      requireHumanConfirmationOnStorybookPush: false
    },
    activeSkills: [...CANONICAL_FULL_SKILLS],
    ...overrides
  };
}

// Utilitário para gerar preset com os modos padrão
function createMockPreset(overrides?: Partial<PresetConfig>): PresetConfig {
  return {
    id: 'test-preset',
    name: 'Test Preset',
    description: 'Preset mock para testes de modos',
    tokens: {
      format: 'w3c-dtcg-2025.10',
      strictDtcg: false,
      outputFiles: ['./tokens/tokens.json']
    },
    figma: {
      mode: 'rest',
      useDesktopBridge: false,
      fallbackToCodeOnly: true
    },
    handoff: {
      destination: 'code',
      formats: ['react'],
      requireStorybook: false
    },
    analytics: {
      provider: 'none',
      requireTelemetryServer: false
    },
    mcpServers: ['figma', 'a11y-scanner'],
    governance: {},
    modes: {
      micro: [...CANONICAL_MICRO_SKILLS],
      sprint: [...CANONICAL_SPRINT_SKILLS],
      full: [...CANONICAL_FULL_SKILLS]
    },
    ...overrides
  };
}

test('1. Resolução de modo "micro" retorna apenas o subconjunto enxuto (3 skills)', () => {
  const config = createMockConfig();
  const preset = createMockPreset();

  const skills = resolveSkillsForMode(preset, config, 'micro');

  assert.strictEqual(skills.length, 3, 'Modo micro deve retornar exatamente 3 skills');
  assert.deepStrictEqual(skills, [
    '05-craft-and-accessibility',
    '08-reality-gate',
    '06-zero-drift-handoff'
  ]);
});

test('2. Resolução de modo "sprint" retorna o fluxo de desenvolvimento de feature (7 skills)', () => {
  const config = createMockConfig();
  const preset = createMockPreset();

  const skills = resolveSkillsForMode(preset, config, 'sprint');

  assert.strictEqual(skills.length, 7, 'Modo sprint deve retornar exatamente 7 skills');
  assert.deepStrictEqual(skills, [
    '01-briefing-discovery',
    '02-information-architecture',
    '03-design-tokens',
    '04-figma-engineering',
    '05-craft-and-accessibility',
    '08-reality-gate',
    '06-zero-drift-handoff'
  ]);
});

test('3. Resolução de modo "full" retorna todas as skills (24 skills)', () => {
  const config = createMockConfig();
  const preset = createMockPreset();

  const skills = resolveSkillsForMode(preset, config, 'full');

  assert.strictEqual(skills.length, 24, 'Modo full deve retornar exatamente 24 skills');
  assert.deepStrictEqual(skills, config.activeSkills);
});

test('4. Respeita hierarquia: argumento "mode" sobrepõe "config.mode"', () => {
  const config = createMockConfig({ mode: 'full' });
  const preset = createMockPreset();

  // Argumento 'micro' deve sobrepor 'full' que está em config.mode
  const microSkills = resolveSkillsForMode(preset, config, 'micro');
  assert.strictEqual(microSkills.length, 3);
  assert.deepStrictEqual(microSkills, CANONICAL_MICRO_SKILLS);

  // Argumento 'sprint' deve sobrepor 'full'
  const sprintSkills = resolveSkillsForMode(preset, config, 'sprint');
  assert.strictEqual(sprintSkills.length, 7);
  assert.deepStrictEqual(sprintSkills, CANONICAL_SPRINT_SKILLS);
});

test('5. Quando "mode" for omitido, usa "config.mode" ou fallback padrão "sprint"', () => {
  const preset = createMockPreset();

  // Quando config.mode está definido e mode é omitido
  const configWithMicro = createMockConfig({ mode: 'micro' });
  const resolvedFromConfig = resolveSkillsForMode(preset, configWithMicro, undefined);
  assert.strictEqual(resolvedFromConfig.length, 3);
  assert.deepStrictEqual(resolvedFromConfig, CANONICAL_MICRO_SKILLS);

  // Quando tanto mode quanto config.mode são omitidos, fallback é 'sprint'
  const configWithoutMode = createMockConfig({ mode: undefined });
  const resolvedSprintFallback = resolveSkillsForMode(preset, configWithoutMode, undefined);
  assert.strictEqual(resolvedSprintFallback.length, 7);
  assert.deepStrictEqual(resolvedSprintFallback, CANONICAL_SPRINT_SKILLS);
});

test('6. Modo desconhecido/inválido dispara erro descritivo', () => {
  const config = createMockConfig();
  const preset = createMockPreset();

  // Modo inválido passado explicitamente como argumento
  assert.throws(
    () => {
      resolveSkillsForMode(preset, config, 'turbo' as any);
    },
    {
      name: 'Error',
      message: "Modo inválido: 'turbo'. Modos válidos: micro, sprint, full."
    }
  );

  // Modo inválido vindo de config.mode quando argumento é omitido
  const configInvalid = createMockConfig({ mode: 'ultra-speed' as any });
  assert.throws(
    () => {
      resolveSkillsForMode(preset, configInvalid, undefined);
    },
    {
      name: 'Error',
      message: "Modo inválido: 'ultra-speed'. Modos válidos: micro, sprint, full."
    }
  );
});

test('7. Presets do projeto (default, freelance, enterprise) contêm modes e satisfazem micro ⊂ sprint ⊂ full (AC-MD1)', () => {
  const loader = new ConfigLoader(process.cwd());

  const presetIds = ['default', 'freelance', 'enterprise'];

  for (const id of presetIds) {
    const preset = loader.loadPreset(id);

    assert.ok(preset.modes, `Preset '${id}' deve possuir o campo modes`);
    assert.ok(Array.isArray(preset.modes.micro), `Preset '${id}' deve possuir modes.micro`);
    assert.ok(Array.isArray(preset.modes.sprint), `Preset '${id}' deve possuir modes.sprint`);
    assert.ok(Array.isArray(preset.modes.full), `Preset '${id}' deve possuir modes.full`);

    const { micro, sprint, full } = preset.modes;

    assert.strictEqual(micro.length, 3, `Preset '${id}' micro deve ter 3 skills`);
    assert.strictEqual(sprint.length, 7, `Preset '${id}' sprint deve ter 7 skills`);
    assert.strictEqual(full.length, 24, `Preset '${id}' full deve ter 24 skills`);

    // micro ⊂ sprint: todo elemento de micro deve estar em sprint
    for (const skill of micro) {
      assert.ok(
        sprint.includes(skill),
        `Preset '${id}': skill '${skill}' de micro deve estar presente em sprint`
      );
    }
    assert.ok(micro.length < sprint.length, `micro deve ser subconjunto próprio de sprint`);

    // sprint ⊂ full: todo elemento de sprint deve estar em full
    for (const skill of sprint) {
      assert.ok(
        full.includes(skill),
        `Preset '${id}': skill '${skill}' de sprint deve estar presente em full`
      );
    }
    assert.ok(sprint.length < full.length, `sprint deve ser subconjunto próprio de full`);
  }
});

test('8. Função auxiliar isValidMode valida corretamente modos válidos e rejeita inválidos', () => {
  assert.strictEqual(isValidMode('micro'), true);
  assert.strictEqual(isValidMode('sprint'), true);
  assert.strictEqual(isValidMode('full'), true);

  assert.strictEqual(isValidMode('turbo'), false);
  assert.strictEqual(isValidMode(''), false);
  assert.strictEqual(isValidMode('MICRO'), false);
  assert.strictEqual(isValidMode('SPRINT'), false);
  assert.strictEqual(isValidMode('lean'), false);
});

test('9. Fallback canônico quando preset não define modes', () => {
  const config = createMockConfig();
  const presetWithoutModes = createMockPreset({ modes: undefined });

  const microSkills = resolveSkillsForMode(presetWithoutModes, config, 'micro');
  assert.strictEqual(microSkills.length, 3);
  assert.deepStrictEqual(microSkills, CANONICAL_MICRO_SKILLS);

  const sprintSkills = resolveSkillsForMode(presetWithoutModes, config, 'sprint');
  assert.strictEqual(sprintSkills.length, 7);
  assert.deepStrictEqual(sprintSkills, CANONICAL_SPRINT_SKILLS);

  const fullSkills = resolveSkillsForMode(presetWithoutModes, config, 'full');
  assert.strictEqual(fullSkills.length, 24);
  assert.deepStrictEqual(fullSkills, config.activeSkills);

  // micro ⊂ sprint ⊂ full no fallback canônico
  for (const s of microSkills) {
    assert.ok(sprintSkills.includes(s));
  }
  for (const s of sprintSkills) {
    assert.ok(fullSkills.includes(s));
  }
});
