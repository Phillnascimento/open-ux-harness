/**
 * Open UX Harness — Testes Unitários de Design Contract
 * Cobertura de validateDesignContract e checkAgainstContract usando node:test e node:assert.
 */

import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  validateDesignContract,
  checkAgainstContract,
  extractForbiddenPatterns,
} from './design-contract.js';

const VALID_SAMPLE_CONTRACT = `# Design Contract — Plataforma de Pagamentos B2B

## 1. Usuário e Job Principal
- **Usuário-Alvo:** Gestor de Contas a Pagar em Médias Empresas.
- **Job Principal:** Conciliar pagamentos de múltiplos bancos em menos de 5 minutos.
- **Contexto de Uso:** Desktop durante fechamento contábil mensal.

## 2. Fluxo de Maior Frequência
- **Fluxo:** Upload de extrato OFX e conciliação em lote.
- **Entrada:** Botão de ação rápida no painel financeiro.
- **Passos:** Seleção de arquivo -> Pré-visualização -> Confirmação -> Recibo.

## 3. Objetos do Domínio
- **Fatura:** Entidade com status Aberta, Paga ou Cancelada.
- **Transação:** Registro bancário vinculado a uma fatura.
- **Lote:** Agrupamento de até 50 transações.

## 4. Referências de Mercado
1. **Stripe Dashboard:** Hierarquia tipográfica limpa em tabelas e badges sutis.
2. **Linear:** Transições instantâneas e forte suporte a atalhos de teclado.
3. **GitHub Settings:** Modais restritos apenas a ações destrutivas irreversíveis.

## 5. Escolhas Deliberadas de Design
### Densidade de Informação
- Alta densidade com grid de 8pt e linhas compactas de 36px.
### Tipografia
- Fonte Inter com numerais tabulares (tnum).
### Ritmo de Layout
- Linhas divisórias neutras e alinhamento rígido à esquerda.
### Modelo de Interação
- Navegação completa por teclado e filtros instantâneos.
### Tratamento de Dados e Imagens
- Gráficos sem gradientes e sem ilustrações 3D decorativas.
### Prioridades Responsivas
- Otimizado prioritariamente para desktop 1440x900.

## 6. Padrões Genéricos Proibidos
- Gradientes decorativos arbitrários sem significado semântico
- Dashboards com métricas vazias sem workflow claro
- Cards sem hierarquia visual e com sombras difusas
- Empty states genéricos com ilustrações 3D sem call-to-action direto
`;

describe('Design Contract Engine', () => {
  test('Contrato completo válido retorna valid = true e sem erros', () => {
    const result = validateDesignContract(VALID_SAMPLE_CONTRACT);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.missingSections.length, 0);
    assert.strictEqual(result.errors.length, 0);
  });

  test('Template oficial templates/design-contract.md deve ser válido', () => {
    const templatePath = path.resolve('templates/design-contract.md');
    assert.ok(fs.existsSync(templatePath), 'Arquivo templates/design-contract.md deve existir');
    const content = fs.readFileSync(templatePath, 'utf-8');
    const result = validateDesignContract(content);
    assert.strictEqual(result.valid, true, `Erros encontrados: ${result.errors.join('; ')}`);
    assert.strictEqual(result.missingSections.length, 0);
    assert.strictEqual(result.errors.length, 0);
  });

  test('Contrato faltando seção obrigatória retorna valid = false e lista em missingSections', () => {
    // Remove a seção "Objetos do Domínio"
    const brokenContract = VALID_SAMPLE_CONTRACT.replace(
      /## 3\. Objetos do Domínio[\s\S]*?(?=## 4)/,
      ''
    );
    const result = validateDesignContract(brokenContract);

    assert.strictEqual(result.valid, false);
    assert.ok(result.missingSections.includes('Objetos do Domínio'));
    assert.ok(
      result.errors.some((err) => err.includes('Objetos do Domínio')),
      'Deve registrar mensagem de erro da seção ausente'
    );
  });

  test('Contrato com menos de 3 referências de mercado reporta erro', () => {
    // Substitui as referências por apenas 2
    const fewRefsContract = VALID_SAMPLE_CONTRACT.replace(
      /## 4\. Referências de Mercado[\s\S]*?(?=## 5)/,
      `## 4. Referências de Mercado\n1. **Stripe:** Tabelas densas.\n2. **Linear:** Atalhos de teclado.\n\n`
    );
    const result = validateDesignContract(fewRefsContract);

    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((err) => err.includes('Referências de Mercado') && err.includes('3')),
      'Deve apontar erro de quantidade mínima de referências'
    );
  });

  test('Contrato com menos de 3 padrões proibidos reporta erro', () => {
    // Substitui padrões proibidos por apenas 1
    const fewForbiddenContract = VALID_SAMPLE_CONTRACT.replace(
      /## 6\. Padrões Genéricos Proibidos[\s\S]*$/,
      `## 6. Padrões Genéricos Proibidos\n- Gradientes decorativos arbitrários\n`
    );
    const result = validateDesignContract(fewForbiddenContract);

    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((err) => err.includes('Padrões Genéricos Proibidos') && err.includes('3')),
      'Deve apontar erro de quantidade mínima de padrões proibidos'
    );
  });

  test('checkAgainstContract detecta violação quando padrão proibido está em usedPatterns', () => {
    const usedPatterns = [
      'Gradientes decorativos arbitrários',
      'Grid responsivo de 8 colunas',
      'cards sem hierarquia visual',
    ];

    const result = checkAgainstContract(VALID_SAMPLE_CONTRACT, usedPatterns);

    assert.strictEqual(result.violations.length, 2);
    assert.ok(
      result.violations.some((v) =>
        v.toLowerCase().includes('gradientes decorativos arbitrários')
      )
    );
    assert.ok(
      result.violations.some((v) =>
        v.toLowerCase().includes('cards sem hierarquia visual')
      )
    );
  });

  test('checkAgainstContract retorna vazio quando nenhum padrão proibido é usado', () => {
    const cleanPatterns = [
      'Botões primários sólidos com contraste 4.5:1',
      'Tabelas estruturadas com numerais tabulares',
      'Modais de confirmação apenas para deleção permanente',
    ];

    const result = checkAgainstContract(VALID_SAMPLE_CONTRACT, cleanPatterns);

    assert.strictEqual(result.violations.length, 0);
    assert.deepStrictEqual(result.violations, []);
  });

  test('extractForbiddenPatterns extrai lista limpa de anti-patterns', () => {
    const patterns = extractForbiddenPatterns(VALID_SAMPLE_CONTRACT);
    assert.ok(patterns.length >= 4);
    assert.ok(patterns.some((p) => p.includes('Gradientes decorativos arbitrários')));
    assert.ok(patterns.some((p) => p.includes('Empty states genéricos')));
  });
});
