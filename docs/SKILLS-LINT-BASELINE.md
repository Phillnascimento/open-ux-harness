# Relatório Baseline de Lint Determinístico de Skills

> **Open UX Harness** — Governança e Qualidade Estrutural de Agentes e Skills  
> **Data:** 25 de Outubro de 2026  
> **Status Geral:** 100% PASS (24/24 skills em conformidade)  
> **Mecanismo:** `core/lint-skills.ts` com validação determinística agnóstica (`skills/00-skill-architect/scripts/validate-skill.ts`)

---

## 1. Visão Geral

Este documento consolida o primeiro relatório oficial de baseline gerado pelo linter determinístico de skills (`npm run lint:skills`). O linter avalia a integridade de todas as skills contra o **Super-Padrão Agnóstico** (compatível com Anthropic Claude, OpenAI GPT/Codex, Google Gemini/ADK e xAI Grok).

### Métricas Consolidadas

| Métrica | Valor | Observação |
|---|---|---|
| **Total de Skills Avaliadas** | **24** | Todas as pastas presentes no diretório `skills/` |
| **Aprovadas (PASS)** | **24 (100%)** | 0 erros, 0 avisos em todas as skills |
| **Reprovadas (FAIL)** | **0 (0%)** | Nenhuma skill apresentou falha estrutural |
| **Skills Ativas Declaradas** | **24** | Declaradas no array `activeSkills` de `harness.config.json` |
| **Skills Ativas Ausentes** | **0** | Todas as 24 skills declaradas existem fisicamente |
| **Score Médio de Confiança** | **1.00 / 1.00** | Máximo em todas as skills avaliadas |

---

## 2. Inventário e Status por Skill

A tabela abaixo detalha cada pasta de skill inspecionada, seu orçamento de linhas, pontuação de confiança e status de governança.

| # | Identificador da Skill | Categoria | Linhas SKILL.md | Orçamento (< 500) | Avisos | Status | Score |
|---|---|---|:---:|:---:|:---:|:---:|:---:|
| 1 | `00-skill-architect` | Core Governança | 116 | Conforme | 0 | **PASS** | 1.00 |
| 2 | `01-briefing-discovery` | Ciclo UX (Fase 1) | 250 | Conforme | 0 | **PASS** | 1.00 |
| 3 | `02-information-architecture` | Ciclo UX (Fase 2) | 156 | Conforme | 0 | **PASS** | 1.00 |
| 4 | `03-design-tokens` | Ciclo UX (Fase 3) | 135 | Conforme | 0 | **PASS** | 1.00 |
| 5 | `04-figma-engineering` | Ciclo UX (Fase 4) | 135 | Conforme | 0 | **PASS** | 1.00 |
| 6 | `05-craft-and-accessibility` | Ciclo UX (Fase 5) | 146 | Conforme | 0 | **PASS** | 1.00 |
| 7 | `06-zero-drift-handoff` | Ciclo UX (Fase 6) | 162 | Conforme | 0 | **PASS** | 1.00 |
| 8 | `07-telemetry-and-impact` | Ciclo UX (Fase 7) | 172 | Conforme | 0 | **PASS** | 1.00 |
| 9 | `08-reality-gate` | Gate de Qualidade | 158 | Conforme | 0 | **PASS** | 1.00 |
| 10 | `09-persona-walkthrough` | Simulação UX | 217 | Conforme | 0 | **PASS** | 1.00 |
| 11 | `li-audit` | LinkedIn Engine | 67 | Conforme | 0 | **PASS** | 1.00 |
| 12 | `li-brand` | LinkedIn Engine | 73 | Conforme | 0 | **PASS** | 1.00 |
| 13 | `li-career` | LinkedIn Engine | 79 | Conforme | 0 | **PASS** | 1.00 |
| 14 | `li-carousel` | LinkedIn Engine | 68 | Conforme | 0 | **PASS** | 1.00 |
| 15 | `li-comment` | LinkedIn Engine | 68 | Conforme | 0 | **PASS** | 1.00 |
| 16 | `li-dm` | LinkedIn Engine | 69 | Conforme | 0 | **PASS** | 1.00 |
| 17 | `li-human` | LinkedIn Engine | 65 | Conforme | 0 | **PASS** | 1.00 |
| 18 | `li-inbox` | LinkedIn Engine | 67 | Conforme | 0 | **PASS** | 1.00 |
| 19 | `li-plan` | LinkedIn Engine | 73 | Conforme | 0 | **PASS** | 1.00 |
| 20 | `li-post` | LinkedIn Engine | 73 | Conforme | 0 | **PASS** | 1.00 |
| 21 | `li-profile` | LinkedIn Engine | 73 | Conforme | 0 | **PASS** | 1.00 |
| 22 | `li-reply` | LinkedIn Engine | 69 | Conforme | 0 | **PASS** | 1.00 |
| 23 | `li-repurpose` | LinkedIn Engine | 72 | Conforme | 0 | **PASS** | 1.00 |
| 24 | `li-voice` | LinkedIn Engine | 70 | Conforme | 0 | **PASS** | 1.00 |

---

## 3. Critérios Verificados pelo Linter

Cada skill é submetida a 5 grupos de validações determinísticas (sem uso de LLM):

1. **Topologia e Arquivos:**
   - Pasta correspondente existe no diretório `skills/`.
   - Arquivo `SKILL.md` obrigatório está presente na raiz da pasta.
   - Profundidade máxima de 1 nível em `references/` (evita aninhamento profundo).

2. **Orçamento de Linhas (Line Budget):**
   - Limite estrito de 500 linhas por `SKILL.md` (garante eficiência de KV-cache).
   - Aviso sugerido se exceder 350 linhas (todas as 24 skills estão abaixo de 250 linhas).

3. **YAML Frontmatter:**
   - `name`: obrigatório, minúsculas com hífens simples, até 64 caracteres, idêntico ao nome da pasta (`NAME_FOLDER_MISMATCH`).
   - `description`: obrigatória, até 1024 caracteres, contendo fronteira negativa explícita (`NUNCA`, `NEVER`, `NÃO use` ou `DO NOT use`) para evitar falsos positivos no roteador semântico de modelos de raciocínio.

4. **Macroestrutura XML e Ordem Canônica Anti-Lost-in-the-Middle:**
   - As 7 tags obrigatórias devem existir e estar na ordem estrita:
     1. `<role>`
     2. `<context>`
     3. `<reference_index>`
     4. `<execution_steps>`
     5. `<examples>`
     6. `<constraints>`
     7. `<output_schema>`

5. **Cláusulas de Execução Robusta em `<constraints>`:**
   - Presença obrigatória de política de Bounded Retries (máximo de 3 tentativas) com escalonamento formal para `SCHEMA_MISMATCH`.
   - Palavras-chave lógicas estruturadas em ALL-CAPS (`IF`, `THEN`, `NEVER`/`NUNCA`).

---

## 4. Reconciliação com `harness.config.json`

O linter verifica se todas as skills declaradas no array `activeSkills` do arquivo `harness.config.json` estão presentes fisicamente:

- **Declaradas:** 24
- **Presentes:** 24
- **Ausentes (`missingActive`):** 0

### Mapeamento de Modos de Execução
- **Modo Micro:** `00-skill-architect`, `05-craft-and-accessibility`, `06-zero-drift-handoff`
- **Modo Sprint:** Adiciona `01-briefing-discovery`, `02-information-architecture`, `03-design-tokens`, `08-reality-gate`
- **Modo Full:** Todas as 24 skills ativas (UX + LinkedIn)

---

## 5. Como Executar a Verificação

### Execução via NPM (Script oficial)
```powershell
npm run lint:skills
```

### Execução com Modo Estrito (Qualquer aviso ou desvio quebra)
```powershell
node --loader ts-node/esm core/lint-skills.ts --strict
```

### Execução em Suíte Completa de Testes
```powershell
npm run build ; npm test
```

---

## 6. Histórico e Manutenção

- **Baseline Inicial:** 25/10/2026 — 24 skills validadas com 100% de aprovação (Wave 2 / B4).
- **Responsável:** Subagente B4 — Deterministic Skills Linter.
