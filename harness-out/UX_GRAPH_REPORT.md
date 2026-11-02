# 🗺️ Relatório de Grafo e Saúde Arquitetural UX: Open UX Harness Project

> Gerado automaticamente pelo **Open UX Harness (UX Knowledge Graph Engine)**  
> Inspirado na arquitetura determinística de grafos do **Graphify** (Graphify-Labs).  
> Data de geração: `2026-11-02T21:22:37.357Z` | Versão: `1.0.0`

---

## 1. Sumário Executivo do Grafo

| Métrica | Total |
| :--- | :--- |
| **Total de Nós Registrados** | `32` |
| **Total de Arestas / Relações** | `24` |
| **Design Tokens (W3C DTCG)** | `19` |
| **Componentes de Interface** | `6` |
| **Telas / Visões Mapeadas** | `4` |
| **Fluxos de Usuário (User Flows)** | `0` |
| **Contratos de Design & PRDs** | `1` |
| **Personas Vinculadas** | `2` |

### Proveniência das Conexões (Rastreabilidade Algorítmica)
- 🟢 **EXTRACTED (Confiabilidade 1.0):** `22` conexões extraídas deterministicamente de código, tokens ou AST.
- 🟡 **INFERRED (Confiabilidade 0.7 - 0.9):** `2` conexões inferidas por análise de personas ou PRD.
- 🔴 **AMBIGUOUS (Requer Validação Humana):** `0` conexões incertas sinalizadas para o Design Gate.

---

## 2. Componentes Centrais e "God Components" (Alerta de Acoplamento)

Componentes com grau de dependência desproporcional. Alterações nestes nós propagam quebras em cascata pelo sistema.

| Componente | Grau Total | Entrantes (Quem Usa) | Saintes (O que Usa) | Nível de Risco |
| :--- | :---: | :---: | :---: | :--- |
| **`Button (Primary/Secondary/Ghost)`** (`comp:Button`) | 6 | 5 | 1 | 🚨 ALTO (God Component) |
| **`Navigation Header`** (`comp:Header`) | 5 | 4 | 1 | ⚠️ MODERADO |
| **`Surface Card`** (`comp:Card`) | 4 | 4 | 0 | ⚠️ MODERADO |
| **`Status Badge`** (`comp:Badge`) | 3 | 2 | 1 | ⚠️ MODERADO |

---

## 3. Análise de Raio de Impacto (Blast Radius de Tokens Críticos)

Simulação determinística de propagação reversa: se o token mudar, quantos componentes e telas sofrerão mutação downstream?

| Token | Dependentes Diretos | Telas e Nós Downstream Impactados | Alerta Reality Gate |
| :--- | :---: | :---: | :--- |
| `color.brand.primary` | 2 componentes | 9 nós totais | 🛡️ **HOLD OBRIGATÓRIO** (Blast > 5) |
| `color.brand.secondary` | 0 componentes | 0 nós totais | ✅ PASS DIRETO |
| `color.surface.base` | 0 componentes | 0 nós totais | ✅ PASS DIRETO |
| `color.surface.subtle` | 0 componentes | 0 nós totais | ✅ PASS DIRETO |
| `color.text.primary` | 0 componentes | 0 nós totais | ✅ PASS DIRETO |
| `color.text.muted` | 0 componentes | 0 nós totais | ✅ PASS DIRETO |
| `color.feedback.success` | 1 componentes | 5 nós totais | ✅ PASS DIRETO |
| `color.feedback.error` | 0 componentes | 0 nós totais | ✅ PASS DIRETO |
| `spacing.scale.none` | 0 componentes | 0 nós totais | ✅ PASS DIRETO |
| `spacing.scale.xs` | 0 componentes | 0 nós totais | ✅ PASS DIRETO |

---

## 4. Análise de Resíduos: Nós Órfãos e Tokens Zumbis

Eliminação de inchaço de tokens e código morto no repositório.

- **Tokens Zumbis (17):** Declarados nos arquivos W3C DTCG mas nunca consumidos por nenhum componente.
  - 🧟 `color.brand.secondary` (`token:color.brand.secondary`)
  - 🧟 `color.surface.base` (`token:color.surface.base`)
  - 🧟 `color.surface.subtle` (`token:color.surface.subtle`)
  - 🧟 `color.text.primary` (`token:color.text.primary`)
  - 🧟 `color.text.muted` (`token:color.text.muted`)
  - 🧟 `color.feedback.error` (`token:color.feedback.error`)
  - 🧟 `spacing.scale.none` (`token:spacing.scale.none`)
  - 🧟 `spacing.scale.xs` (`token:spacing.scale.xs`)
  - 🧟 `spacing.scale.sm` (`token:spacing.scale.sm`)
  - 🧟 `spacing.scale.md` (`token:spacing.scale.md`)
  - _...e mais 7 tokens órfãos._

- **Componentes Órfãos (1):** Componentes criados que não compõem nenhuma tela.
  - 📦 `Interactive Modal Dialog` (`comp:Modal`)

- **Telas Isoladas (0):**
  - _Nenhuma tela isolada no fluxo de navegação._

---

## 5. Comunidades Temáticas e Subsistemas de Interface

Detecção topológica de clusters funcionais de interface:

### 🏷️ Cluster_1 (color.brand.primary) (15 nós)
- [`token`] **color.brand.primary** (`token:color.brand.primary`)
- [`component`] **Button (Primary/Secondary/Ghost)** (`comp:Button`)
- [`component`] **Navigation Header** (`comp:Header`)
- [`component`] **Interactive Modal Dialog** (`comp:Modal`)
- [`screen`] **Landing Page Hero & Features** (`screen:LandingPage`)
- [`screen`] **Checkout & Payment Flow** (`screen:Checkout`)
- [`screen`] **Main User Dashboard** (`screen:Dashboard`)
- [`screen`] **Portfolio & Profile Page** (`screen:Profile`)
- _...mais 7 nós neste subsistema._

### 🏷️ Cluster_2 (color.brand.secondary) (1 nós)
- [`token`] **color.brand.secondary** (`token:color.brand.secondary`)

### 🏷️ Cluster_3 (color.surface.base) (1 nós)
- [`token`] **color.surface.base** (`token:color.surface.base`)

### 🏷️ Cluster_4 (color.surface.subtle) (1 nós)
- [`token`] **color.surface.subtle** (`token:color.surface.subtle`)

### 🏷️ Cluster_5 (color.text.primary) (1 nós)
- [`token`] **color.text.primary** (`token:color.text.primary`)

### 🏷️ Cluster_6 (color.text.muted) (1 nós)
- [`token`] **color.text.muted** (`token:color.text.muted`)

### 🏷️ Cluster_7 (color.feedback.error) (1 nós)
- [`token`] **color.feedback.error** (`token:color.feedback.error`)

### 🏷️ Cluster_8 (spacing.scale.none) (1 nós)
- [`token`] **spacing.scale.none** (`token:spacing.scale.none`)

### 🏷️ Cluster_9 (spacing.scale.xs) (1 nós)
- [`token`] **spacing.scale.xs** (`token:spacing.scale.xs`)

### 🏷️ Cluster_10 (spacing.scale.sm) (1 nós)
- [`token`] **spacing.scale.sm** (`token:spacing.scale.sm`)

### 🏷️ Cluster_11 (spacing.scale.md) (1 nós)
- [`token`] **spacing.scale.md** (`token:spacing.scale.md`)

### 🏷️ Cluster_12 (spacing.scale.lg) (1 nós)
- [`token`] **spacing.scale.lg** (`token:spacing.scale.lg`)

### 🏷️ Cluster_13 (spacing.scale.xl) (1 nós)
- [`token`] **spacing.scale.xl** (`token:spacing.scale.xl`)

### 🏷️ Cluster_14 (spacing.scale.2xl) (1 nós)
- [`token`] **spacing.scale.2xl** (`token:spacing.scale.2xl`)

### 🏷️ Cluster_15 (borderRadius.sm) (1 nós)
- [`token`] **borderRadius.sm** (`token:borderRadius.sm`)

### 🏷️ Cluster_16 (borderRadius.md) (1 nós)
- [`token`] **borderRadius.md** (`token:borderRadius.md`)

### 🏷️ Cluster_17 (borderRadius.lg) (1 nós)
- [`token`] **borderRadius.lg** (`token:borderRadius.lg`)

### 🏷️ Cluster_18 (borderRadius.full) (1 nós)
- [`token`] **borderRadius.full** (`token:borderRadius.full`)

---

## 6. Recomendações Táticas para o Próximo Ciclo de Design

1. **Revisão de Blast Radius:** Para qualquer alteração em tokens marcados com risco alto, exija screenshots automatizados nas telas downstream antes de aprovar o PR.
2. **Higienização de Tokens:** Remova ou documente os tokens zumbis listados na seção 4 para evitar confusão no design system.
3. **Desacoplamento de God Components:** Considere quebrar componentes centrais com alto grau em subcomponentes atômicos menores.
