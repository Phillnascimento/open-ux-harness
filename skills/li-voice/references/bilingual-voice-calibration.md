# Guia de Calibragem de Tom e Voz Bilíngue (`PT-BR` & `EN`) para UX/Product Designers

Este guia instrui a skill `li-voice` a extrair ou construir um guia de voz que preserve a autenticidade humana em dois idiomas sem cair em traduções literais ou jargões robóticos de IA.

---

## 1. Os 4 Espectros de Voz para Designers de Produto

Quando o usuário ainda não tem textos próprios para mineração (*Voice Calibration Lab*), apresente estas 4 matrizes de voz para ele escolher ou combinar:

| Espectro | Como Soa em `PT-BR` | Como Soa em `EN` (Global Tech) | Ideal Para |
| :--- | :--- | :--- | :--- |
| **1. Pragmático de Trincheira (*The Trench Builder*)** | Frases curtas alternadas com explicações de contexto. Usa *"a gente"*, *"no projeto X"*, fala de restrições reais de engenharia e prazo sem romantizar. | Estilo *Linear / Basecamp*: voz ativa, zero adjetivos vazios, foco no trade-off (*"We had 2 weeks and a legacy API. Here is what we cut."*). | Product Designers Pleno/Sênior/Staff focados em entrega, B2B e fintechs. |
| **2. Analítico & Orientado a Evidências (*The Scientist*)** | Estrutura raciocínio por hipótese $\rightarrow$ teste $\rightarrow$ dado observado $\rightarrow$ decisão. Calmo, preciso, questiona suposições sem arrogância. | Estilo *Nielsen Norman / Baymard / Stripe*: apresenta números na primeira linha, explica o mecanismo causal e mostra o antes/depois. | UX Researchers, Product Designers focados em Growth, Conversão e Experimentação. |
| **3. Arquitetural & Didático (*The Systems Educator*)** | Desmonta problemas complexos em partes claras. Excelente para explicar tokens, acessibilidade WCAG, anatomia de componentes e processos. | Estilo *Figma Blog / Design Systems Lead*: claro, estruturado, focado em governança, escala e colaboração Design-Engenharia. | Especialistas em Design Systems, DesignOps, Staff Designers e Consultores. |
| **4. Narrativo & Provocativo (*The Candid Leader*)** | Começa pela cena real (uma frase dita em reunião, um erro que custou caro) e extrai uma lição madura de produto ou liderança. | Estilo *Julie Zhuo / Lenny's Newsletter*: storytelling de primeira pessoa ancorado em tensão real de produto e gestão de stakeholders. | Design Leads, Design Managers, Consultores B2B e Fractional Designers. |

---

## 2. Regras de Localização Estilística: `PT-BR` vs. `EN`

A mesma pessoa tem registros ligeiramente diferentes quando fala português no mercado brasileiro e quando escreve em inglês para recrutadores/clientes globais:

### 2.1 Como soar autêntico em Português (`PT-BR`)
1. **Pronomes e Sujeito:** Alterne naturalmente entre `"Eu"` (quando a decisão/aprendizado foi individual) e `"A gente"` ou `"Nosso time"` (quando descrever o trabalho na squad com PM e Devs). Isso evita tanto a arrogância de fingir que fez tudo sozinho quanto a invisibilidade de esconder o próprio papel.
2. **Zero Tradução de Jargão de IA:** Nunca escreva *"Em um mundo cada vez mais digital"*, *"Mergulhar fundo"*, *"Desbloquear o potencial"*, *"No final do dia"* (tradução literal de *at the end of the day*) ou *"Fazer sentido"* repetido à exaustão.
3. **Verbos Concretos de Design:** Prefira verbos de ação real: *cortamos, redesenhamos, testamos com 6 usuários, mapeamos, reduzimos, simplificamos, negociamos com o front-end*.

### 2.2 Como soar autêntico em Inglês (`EN`)
1. **Active Voice & Verb-First:** Em inglês, a voz passiva (*"A usability test was conducted by our team"*) soa insegura e burocrática. Sempre converta para voz ativa (*"We ran 6 usability tests"* ou *"I redesigned the checkout flow"*).
2. **Elimine Falsos Cognatos e "Portuglês" Corporativo:**
   - ❌ *"I am a Pleno Product Designer"* $\rightarrow$ ✅ *"I'm a Product Designer with 4+ years building B2B SaaS"* (ou *"Mid-level Product Designer"*).
   - ❌ *"I have experience with..."* (fraco) $\rightarrow$ ✅ *"I've shipped..."* / *"I led the design of..."* / *"I architected..."*.
   - ❌ *"Assertive communication"* (em inglês, *assertive* muitas vezes soa agressivo; quando brasileiros dizem "assertivo", querem dizer certeiro/preciso) $\rightarrow$ ✅ *"Clear, high-signal communication"* ou *"Data-informed decisions"*.
   - ❌ *"Make a briefing / make a research"* $\rightarrow$ ✅ *"Run discovery / conduct user research"*.
3. **Ritmo de Frase (Cadence):** Combine uma frase curta de impacto (4–7 palavras) com uma frase de contexto (14–22 palavras) contendo uma métrica ou restrição técnica.
