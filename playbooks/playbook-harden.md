# Playbook: Harden — Blindagem para Produção e Teste de Estresse

> **Objetivo:** Garantir que a interface seja resiliente contra entradas extremas, falhas de rede, caracteres especiais, textos longos de internacionalização (i18n) e quebras de viewport.

---

## 1. Testes de Estresse com Dados Extremos

Qualquer tela projetada apenas para "dados perfeitos de mockup" quebra no mundo real. Aplique os seguintes testes de estresse:

1. **Textos Muito Longos:**
   - Nomes com 80+ caracteres (ex.: nomes compostos ou títulos jurídicos).
   - Palavras gigantescas sem espaço (ex.: palavras em alemão ou hashes).
   - E-mails longos e descrições prolixas.
2. **Textos Muito Curtos ou Vazios:**
   - Títulos vazios, strings de 1 caractere, ausência de foto de perfil.
3. **Números Extremos:**
   - Valores na casa dos bilhões (ex.: `R$ 1.450.890.120,50`) ou números negativos com muitas casas decimais.
4. **Listas Massivas vs. Listas Vazias:**
   - 0 itens (deve exibir Empty State acolhedor com CTA).
   - 1.000 itens (deve ter paginação, virtualização ou rolagem defensiva).

---

## 2. Padrões CSS Defensivos Obrigatórios

### A. Prevenção de Estouro em Flexbox e Grid:
```css
/* Obrigatório em qualquer elemento flexível que envolva texto truncado */
.flex-item {
  min-width: 0;
  overflow: hidden;
}

/* Em grid containers */
.grid-cell {
  min-width: 0;
  min-height: 0;
}
```

### B. Truncamento e Clamp Multilinha:
```css
/* Truncamento de 1 linha com reticências */
.truncate-safe {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Limite de 2 ou 3 linhas */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Quebra forçada de strings gigantes sem espaços */
.break-word-safe {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}
```

### C. Orçamento de Espaço para Internacionalização (i18n):
- Deixe sempre **30% a 40% de folga espacial** para expansão textual (línguas como alemão ou português costumam ter textos mais longos do que o inglês).
- **Evite larguras fixas** em botões (ex.: use `px-4 py-2` em vez de `w-32`).

---

## 3. Estados Defensivos de Rede e Erro
- Para cada chamada assíncrona, defina:
  1. *Loading*: Skeleton loaders que espelham exatamente a geometria dos dados reais (evita Layout Shift - CLS).
  2. *Error*: Feedback legível informando o que falhou e um botão explícito de "Tentar novamente".
  3. *Offline*: Indicador visual calmo quando a conexão for interrompida.
