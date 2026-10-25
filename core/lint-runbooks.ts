/**
 * Open UX Harness — Script CLI de Lint de Runbooks
 * Executa a validação de todos os runbooks declarados em runbooks/runbooks.json.
 */

import { validateRunbooks } from './runbook-validator.js';

const result = validateRunbooks(process.cwd());

if (result.valid) {
  console.log('✅ Todos os runbooks são válidos!');
  process.exit(0);
} else {
  console.error('❌ Erros encontrados na validação dos runbooks:');
  result.errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
}
