# Nudges Comportamentais Éticos e Arquitetura de Escolha (`behavioral-nudges.md`)

> **Propósito:** Matriz do **Craft Guardian** para aplicação de intervenções comportamentais éticas baseadas em ciências da decisão, otimização cognitiva de formulários, defaults inteligentes e fiscalização impeditiva contra práticas abusivas (*dark patterns*).

---

## Quando Carregar (Just-In-Time)

Carregue este documento sob demanda (**estritamente 1 arquivo por vez**) nas seguintes situações:
- **Na Fase 1 (Modelagem de Fluxo e Briefing):** Ao arquitetar fluxos de conversão, telas de checkout, jornadas de onboarding, seleção de planos e termos de consentimento/privacidade.
- **Na Fase 2 (Auditoria Heurística e Craft):** Ao auditar formulários complexos, campos interativos e elementos persuasivos contra heurísticas de economia cognitiva e padrões manipulativos.
- **Não carregar:** Em rotinas de validação puramente matemáticas de luminância APCA/WCAG ou linting determinístico de espaçamentos da grade 8pt.

---

## 1. Fundamentos Psicológicos da Decisão Ética

A arquitetura de escolha deve capacitar a autonomia do usuário, reduzindo atritos desnecessários sem recorrer a enganos cognitivos.

### 1.1. Modelo Comportamental de Fogg ($B = MAP$)
O comportamento acontece quando Motivação ($M$), Habilidade ($A$) e Gatilho ($P$ - Prompt) convergem no mesmo instante:
- **Foco Primário na Habilidade (Simplicidade):** Em produtos de alta usabilidade, aumente a probabilidade de conclusão reduzindo a fricção e o esforço mental requerido, em vez de bombardear o usuário com apelos emocionais para forçar motivação artificial.
- **Prompts Oportunos:** Apresente gatilhos de ação apenas quando o usuário tiver contexto e capacidade imediata de realizá-la (ex.: convidar para categorizar despesas imediatamente após o upload do extrato, nunca no login inicial).

### 1.2. Padrões do Nudge Ético (Thaler & Sunstein)
Qualquer empurrão comportamental (*nudge*) incorporado à interface deve obedecer a três regras basilares:
1. **Transparência Absoluta:** O direcionamento da escolha deve ser perceptível e claramente identificado; nunca disfarce recomendações como fatos neutros obrigatórios.
2. **Reversibilidade Simples (*Opt-Out em 1 Clique*):** Recusar ou desativar a recomendação deve exigir a mesma quantidade de passos (ou menos) do que aceitá-la.
3. **Alinhamento com o Interesse do Usuário:** O benefício primário do nudge deve reverter para a segurança, economia financeira ou bem-estar da pessoa que utiliza o sistema, e não apenas para metas internas de monetização predatória da empresa.

---

## 2. Redução de Esforço Cognitivo em Formulários

Formulários são os pontos de maior fricção e abandono em produtos digitais. Aplique heurísticas para diminuir a carga de trabalho da memória operacional.

### 2.1. Fracionamento e Revelação Progressiva (*Chunking*)
- Agrupe formulários longos em etapas conceituais sequenciais com no máximo **3 a 5 campos por bloco**, informando antecipadamente o tempo estimado de conclusão e a etapa corrente (ex.: *"Etapa 2 de 3: Endereço de Cobrança"*).
- Utilize revelação progressiva: exiba campos secundários ou condicionais somente após o preenchimento afirmativo do campo gatilho correspondente.

### 2.2. Validação Inline no Tempo Oportuno
- **Momento Correto:** Valide o campo no evento `blur` (quando o foco do usuário sai do input) ou com `debounce` de digitação (~600ms) quando houver verificação assíncrona (como disponibilidade de username).
- **Proibição de Erro Prematuro:** É estritamente proibido exibir mensagens de erro vermelhas enquanto o usuário ainda está no meio da digitação inicial de um campo (ex.: alertar *"E-mail inválido"* enquanto digita os três primeiros caracteres).

### 2.3. Eliminação de Redundância e Facilitação de Entrada (WCAG 3.3.7)
- Aplique o atributo `autocomplete` padronizado (ex.: `autocomplete="email"`, `autocomplete="address-line1"`).
- Atribua o `inputmode` adequado para dispositivos touch (`inputmode="numeric"` para cartões/códigos OTP, `inputmode="tel"` para telefones).
- Reutilize automaticamente informações preenchidas previamente na mesma sessão (ex.: checkbox padrão *"Endereço de entrega igual ao de cobrança"* habilitado).

---

## 3. Padrões Padrão (*Smart Defaults*)

A inércia do usuário faz com que a maioria opte pela alternativa pré-selecionada. O design deve garantir que esse padrão proteja seus interesses.

### 3.1. Diretrizes para Configurações Padrão
- **Privacidade por Padrão (*Privacy by Default*):** Permissões de rastreamento de dados analíticos ou comunicações promocionais de marketing devem vir **desmarcadas** por padrão.
- **Segurança Proativa:** Em seleções de segurança (autenticação de dois fatores, confirmação por e-mail de logins desconhecidos), a opção com maior salvaguarda deve vir ativada.
- **Recomendação com Justificativa Transparente:** Ao destacar um plano de serviço ou configuração sugerida, fundamente explicitamente o motivo da indicação em linguagem clara (ex.: *"Plano mais escolhido por autônomos por incluir emissão automática de NF-e"*).

---

## 4. Prevenção Ativa Contra Padrões Obscuros (*Dark Patterns*)

O Craft Guardian bloqueia sumariamente qualquer especificação ou implementação que adote técnicas de engano e manipulação comportamental.

### 4.1. Tipologias Proibidas e Critérios de Bloqueio
| Padrão Obscuro | Descrição da Prática Abusiva | Regra de Bloqueio no Quality Gate |
| :--- | :--- | :--- |
| **Confirmshaming** | Redigir botões de recusa com texto pejorativo ou culpabilizante para forçar aceitação (ex.: *"Não, eu odeio economizar dinheiro"*). | **REPROVAR.** Exija botões de recusa neutros e objetivos (ex.: *"Não, obrigado"*, *"Agora não"* ou *"Continuar sem desconto"*). |
| **Sneak into Basket** | Inserir itens adicionais (seguros, doações, garantia estendida) no carrinho de compras sem ação deliberada do usuário. | **REPROVAR.** Todo produto, serviço ou taxa complementar exige seleção afirmativa prévia (*opt-in* explícito desmarcado). |
| **Hidden Costs / Drip Pricing**| Revelar custos essenciais (taxas de conveniência, fretes mínimos) apenas na última etapa do checkout. | **REPROVAR.** O valor total estimado ou discriminação de taxas deve estar visível desde o primeiro resumo de preços. |
| **Roach Motel / Barreira de Cancelamento** | Criar jornada fácil para assinar (1 clique), mas impor processo burocrático, labiríntico ou via telefone para cancelar. | **REPROVAR.** O cancelamento ou downgrade deve estar disponível no mesmo canal digital e com paridade de passos em relação à adesão. |
| **Falsa Urgência e Escassez Artificial** | Exibir contadores regressivos fictícios que reiniciam ou avisos forjados de *"Apenas 1 item restante"* para induzir pânico. | **REPROVAR.** Avisos de disponibilidade e prazos devem refletir estritamente dados reais de inventário verificáveis. |
