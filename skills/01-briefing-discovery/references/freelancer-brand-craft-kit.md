# Kit de Extração de Brand Identity, Craft & Linguagem Visual (Guia do Freelancer)

Em clientes de pequeno e médio porte ou projetos freelances, o cliente raramente entrega um Design System formal. 

Frequentemente o cliente entrega apenas:
- O link do site atual no ar (muitas vezes feito em WordPress, Webflow ou legado).
- Um arquivo de logo em PNG/SVG.
- Um perfil no Instagram ou LinkedIn.
- Nenhuma documentação escrita de tom de voz ou estilo visual.

Se o designer ou o harness não extraírem essas fundações no início, as próximas fases (telas, tokens e componentes) inventarão estilos desconexos, criando um "monstro de Frankenstein" visual.

Este kit fornece 4 métodos objetivos para extrair o DNA visual do cliente rapidamente.

---

## 🎨 1. Extração Rápida de Cores (Paleta 60-30-10)

Peça ou extraia 4 papéis essenciais de cor do cliente:

| Papel do Token | O que representa | Como identificar se o cliente não tiver | Exemplo Típico |
| :--- | :--- | :--- | :--- |
| **Primary (Brand)** | Cor de maior destaque da marca e CTAs principais | Cor dominante do logo ou botão principal do site atual | `#2563EB` (Azul) |
| **Secondary (Apoio)** | Cor de suporte para badges, links secundários e ícones | Cor secundária da marca ou tom neutro escuro | `#475569` (Slate) |
| **Surface (Fundos)** | Fundo de cartões, modais e páginas | Quase sempre `#FFFFFF` (claro) ou `#0F172A` (escuro) | `#FFFFFF` |
| **Text Primary** | Texto principal para leitura fluida | Quase sempre um tom muito escuro com contraste $\ge 7:1$ | `#0F172A` |

> **Dica Rápida para o Freelancer:** Se o cliente fornecer uma URL (ex.: `cliente.com.br`), inspecione o CSS ou pergunte: *"Qual é a cor exata do seu botão principal hoje?"*.

---

## ✍️ 2. Matriz dos 4 Eixos de Tom de Voz (Brand Voice)

Para calibrar o copywriting do produto, posicione a marca do cliente nos 4 eixos universais:

```
Formal [ 1 --- 2 --- 3 --- 4 --- 5 ] Casual / Descontraído
Sério  [ 1 --- 2 --- 3 --- 4 --- 5 ] Bem-humorado / Empático
Técnico [ 1 --- 2 --- 3 --- 4 --- 5 ] Acessível / Leigo
Corporativo [ 1 --- 2 --- 3 --- 4 --- 5 ] Ousado / Disruptivo
```

* **Regra de Anti-Patterns:** Sempre pergunte ao cliente se há palavras ou abordagens proibidas (ex.: *"Nunca use gírias"*, *"Nunca trate o cliente por 'você', use 'senhor(a)'"*, etc.).

---

## 📐 3. Mapeamento de Craft Existente (Prevenção de Inconsistência)

Antes de desenhar telas, observe o que o produto atual do cliente já tem para manter harmonia:

1. **Raio de Borda (Corner Radius):**
   * *Sharp (0px a 2px):* Estilo sóbrio, financeiro institucional, brutalista.
   * *Equilibrado (6px a 8px):* Padrão moderno SaaS (Tailwind `rounded-lg`).
   * *Pill / Muito Arredondado (16px a 9999px):* Estilo jovem, B2C, fintech moderna.
2. **Biblioteca de Ícones:**
   * Qual pacote o cliente já usa? (Lucide Icons, Heroicons, Material Icons, Feather). Evite misturar ícones de traço fino com ícones cheios na mesma tela.
3. **Tipografia:**
   * O cliente usa fonte de sistema (Inter, Roboto, SF Pro) ou fonte com serifa/display (Playfair, Montserrat)?

---

## 🚨 4. Paletas de Emergência por Setor (Quando o Cliente Não Tem Nada)

Se o cliente for uma startup em fase embrionária sem nenhuma identidade visual definida, o harness sugere uma base sólida para validação imediata:

* **Fintech / B2B SaaS:** Primária: `#2563EB` (Azul Confiança) | Texto: `#0F172A` | Fundo: `#F8FAFC`.
* **Saúde / Bem-estar:** Primária: `#0D9488` (Teal Equilíbrio) | Texto: `#134E4A` | Fundo: `#F0FDFA`.
* **E-commerce / Varejo:** Primária: `#EA580C` (Laranja Ação/Urgência) | Texto: `#1C1917` | Fundo: `#FAFAF9`.
* **Educação / Criatividade:** Primária: `#7C3AED` (Violeta Inovação) | Texto: `#1E1B4B` | Fundo: `#FAF5FF`.
