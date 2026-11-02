/**
 * Open UX Harness — Testes Unitários de Surface Modes e DESIGN.md
 * Valida a extração de Surface Modes e a geração/parsing do formato oficial DESIGN.md.
 */

import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import {
  extractSurfaceMode,
  getSurfaceModeGuidelines,
  generateDesignMd,
  parseDesignMd,
  DesignMdSpec
} from './design-contract.js';

describe('Design Contract — Surface Modes e Especificação DESIGN.md', () => {
  test('1. Extração correta de Modo de Superfície do contrato Markdown', () => {
    const markdownPersuade = `
      # Contrato de Design
      - Modo de Superfície: persuade
      - Usuário: Comprador B2C
    `;
    assert.strictEqual(extractSurfaceMode(markdownPersuade), 'persuade');

    const markdownOperate = `
      # Contrato de Design
      - Surface Mode: operate
    `;
    assert.strictEqual(extractSurfaceMode(markdownOperate), 'operate');

    const markdownDefault = `
      # Contrato de Design sem modo explícito
    `;
    assert.strictEqual(extractSurfaceMode(markdownDefault), 'operate');
  });

  test('2. Diretrizes normativas por Modo de Superfície', () => {
    const persuadeGuide = getSurfaceModeGuidelines('persuade');
    assert.strictEqual(persuadeGuide.expressiveness, 'high');
    assert.ok(persuadeGuide.strictBans.length > 0);

    const operateGuide = getSurfaceModeGuidelines('operate');
    assert.strictEqual(operateGuide.expressiveness, 'restrained');
    assert.ok(operateGuide.keyHeuristics.some(h => h.includes('Numerais tabulares') || h.includes('8px')));

    const readGuide = getSurfaceModeGuidelines('read');
    assert.strictEqual(readGuide.expressiveness, 'balanced');
    assert.ok(readGuide.keyHeuristics.some(h => h.includes('65ch')));
  });

  test('3. Geração de documento DESIGN.md com tokens YAML e 8 seções canônicas', () => {
    const spec: DesignMdSpec = {
      name: 'OpenDesign',
      description: 'Design system enterprise para aplicações analíticas',
      surfaceMode: 'operate',
      colors: {
        primary: '#4f46e5',
        neutralBg: '#f8fafc',
        neutralText: '#0f172a'
      },
      typography: {
        body: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          lineHeight: '1.5'
        }
      },
      rounded: {
        sm: '4px',
        md: '8px'
      },
      spacing: {
        sm: '8px',
        md: '16px'
      },
      components: {
        buttonPrimary: {
          backgroundColor: '{colors.primary}',
          textColor: '#ffffff',
          rounded: '{rounded.md}'
        }
      }
    };

    const doc = generateDesignMd(spec);
    assert.ok(doc.startsWith('---'));
    assert.ok(doc.includes('name: "OpenDesign"'));
    assert.ok(doc.includes('surfaceMode: "operate"'));
    assert.ok(doc.includes('primary: "#4f46e5"'));
    assert.ok(doc.includes('## 1. Overview'));
    assert.ok(doc.includes('## 2. Colors'));
    assert.ok(doc.includes('## 3. Typography'));
    assert.ok(doc.includes('## 4. Layout'));
    assert.ok(doc.includes('## 5. Elevation & Depth'));
    assert.ok(doc.includes('## 6. Shapes'));
    assert.ok(doc.includes('## 7. Components'));
    assert.ok(doc.includes('## 8. Do\'s and Don\'ts'));
  });

  test('4. Parsing bidirecional de DESIGN.md extrai tokens e metadados', () => {
    const rawDoc = `---
name: "AcmeUi"
description: "Sistema de UI da Acme"
surfaceMode: "persuade"
colors:
  brand: "#ff5500"
  surface: "#ffffff"
rounded:
  default: "6px"
---

# AcmeUi — Design System
## 1. Overview
Documentação do sistema.
`;

    const parsed = parseDesignMd(rawDoc);
    assert.strictEqual(parsed.name, 'AcmeUi');
    assert.strictEqual(parsed.description, 'Sistema de UI da Acme');
    assert.strictEqual(parsed.surfaceMode, 'persuade');
    assert.strictEqual(parsed.colors['brand'], '#ff5500');
    assert.strictEqual(parsed.colors['surface'], '#ffffff');
    assert.strictEqual(parsed.rounded!['default'], '6px');
  });
});
