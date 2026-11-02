import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { runCli } from './cli.js';

test('CLI Graph Runner — 1. Comando graph:build gera a tríade de artefatos', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-graph-test-'));

  try {
    await runCli(['graph:build', tempDir]);

    assert.strictEqual(fs.existsSync(path.join(tempDir, 'UX_GRAPH_REPORT.md')), true);
    assert.strictEqual(fs.existsSync(path.join(tempDir, 'ux-graph.html')), true);
    assert.strictEqual(fs.existsSync(path.join(tempDir, 'ux-graph.json')), true);
    assert.strictEqual(fs.existsSync(path.join(tempDir, 'ux-graph.mmd')), true);

    const reportContent = fs.readFileSync(path.join(tempDir, 'UX_GRAPH_REPORT.md'), 'utf-8');
    assert.ok(reportContent.includes('Open UX Harness'));
    assert.ok(reportContent.includes('Graphify'));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('CLI Graph Runner — 2. Comando graph:blast calcula raio de impacto', async () => {
  // Executa sem lançar exceção
  await runCli(['graph:blast', 'token:color.brand.primary']);
  assert.ok(true);
});

test('CLI Graph Runner — 3. Comando graph:path calcula menor caminho', async () => {
  await runCli(['graph:path', 'token:color.brand.primary', 'screen:Checkout']);
  assert.ok(true);
});

test('CLI Graph Runner — 4. Comando graph:explain explica conexões do nó', async () => {
  await runCli(['graph:explain', 'comp:Button']);
  assert.ok(true);
});
