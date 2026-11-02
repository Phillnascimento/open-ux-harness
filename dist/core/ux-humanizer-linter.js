/**
 * Open UX Harness — Deterministic UX Humanizer & Anti-Slop Linter
 *
 * Motor determinístico de auditoria e purificação de microcopy para interfaces digitais.
 * Identifica e reporta os 15 padrões de "AI Slop" em textos, headers, botões e modais,
 * calculando score de craft textual e sugerindo alternativas diretas em Português do Brasil.
 */
import fs from 'node:fs';
export const UX_COPY_RULES = [
    // §1 Metáforas Vazias em Hero
    {
        id: '§1',
        name: 'Metáfora Vazia em Hero/Cabeçalho',
        severity: 'critical',
        regex: /\b(elevando\s+a\s+sinergia|ecossistema\s+hol[ií]stico|potencializando\s+o\s+amanh[aã]|revolucione\s+sua\s+experi[eê]ncia)\b/i,
        suggestedFix: 'Substitua por uma descrição factual e mensurável da função do produto.',
    },
    // §2 CTAs Prolixos ou Poéticos
    {
        id: '§2',
        name: 'CTA Prolixo ou Poético',
        severity: 'critical',
        regex: /\b(comece\s+sua\s+jornada(?:\s+inesquec[ií]vel)?|desbloqueie\s+(?:todo\s+)?o\s+poder|d[eê]\s+o\s+pr[oó]ximo\s+salto|embarque\s+nesta\s+jornada)\b/i,
        suggestedFix: 'Utilize verbo de ação direto no infinitivo com até 3 palavras (ex: "Criar conta", "Iniciar teste").',
    },
    // §3 Empty States Condescendentes
    {
        id: '§3',
        name: 'Empty State Condescendente',
        severity: 'critical',
        regex: /\b(que\s+pena!?\s+parece\s+que|cantinho\s+(?:ainda\s+)?silencioso|grandes\s+hist[oó]rias\s+come[cç]am|nada\s+por\s+aqui\s+ainda!?\s+mas\s+n[aã]o\s+se\s+preocupe)\b/i,
        suggestedFix: 'Declare o estado de forma neutra ("Nenhum item cadastrado.") acompanhado de botão de ação ("Novo item").',
    },
    // §4 Mensagens de Erro Mágicas/Misteriosas
    {
        id: '§4',
        name: 'Mensagem de Erro Misteriosa ou com Humor Forçado',
        severity: 'critical',
        regex: /\b(oops!?\s+algo\s+m[aá]gico|nossos\s+duendes\s+trope[cç]aram|algo\s+deu\s+errado\s+nos\s+bastidores|eita!?\s+algo\s+inesperado)\b/i,
        suggestedFix: 'Informe claramente o motivo do erro e o caminho de recuperação acionável.',
    },
    // §5 Contraste Falso "Não é X, é Y"
    {
        id: '§5',
        name: 'Contraste Retórico Falso (Not X, but Y)',
        severity: 'critical',
        regex: /\b(n[aã]o\s+[eé]\s+(?:apenas|s[oó]|meramente)\s+[^,;.\n]+,\s+[eé]\s+|isto\s+n[aã]o\s+significa\s+[^,;.\n]+\.\s+significa\s+)\b/i,
        suggestedFix: 'Afirme o benefício diretamente sem criar falsas dicotomias.',
    },
    // §6 Tríades Forçadas de Benefícios
    {
        id: '§6',
        name: 'Tríade Forçada de Benefícios',
        severity: 'major',
        regex: /\b(inova[cç][aã]o,\s+inspira[cç][aã]o\s+e\s+insights|r[aá]pido,\s+seguro\s+e\s+intuitivo|simples,\s+poderoso\s+e\s+elegante)\b/i,
        suggestedFix: 'Destaque o diferencial concreto ou métrica quantificada real.',
    },
    // §7 Ensaio Prévio e Preâmbulos
    {
        id: '§7',
        name: 'Preâmbulo Desnecessário (Staged Run-up)',
        severity: 'major',
        regex: /\b(vamos\s+mergulhar\s+(?:no\s+assunto|nisso)|honestamente\??\s+[eé]\s+mais\s+simples|aqui\s+est[aá]\s+o\s+detalhe\s+fundamental)\b/i,
        suggestedFix: 'Vá direto ao ponto e inicie na primeira instrução operativa.',
    },
    // §8 Travessões Excessivos
    {
        id: '§8',
        name: 'Uso Excessivo de Travessões como Conector',
        severity: 'major',
        regex: /—[^—\n]+—/g,
        suggestedFix: 'Substitua os travessões por pontos finais ou vírgulas em sentenças independentes.',
    },
    // §9 Jargões de IA (Buzzwords)
    {
        id: '§9',
        name: 'Jargão Clichê de IA (AI Buzzword)',
        severity: 'major',
        regex: /\b(desvende|mergulhe\s+nas|testamento\s+de\s+inova[cç][aã]o|divisor\s+de\s+[aá]guas|transformacional)\b/i,
        suggestedFix: 'Substitua por vocabulário funcional, específico e sem adjetivação inflada.',
    },
    // §10 Voz Passiva em Mensagens de Sucesso
    {
        id: '§10',
        name: 'Voz Passiva Burocrática em Sucesso',
        severity: 'major',
        regex: /\b(foi\s+conclu[ií]d[ao]\s+com\s+sucesso\s+pelo\s+sistema|foi\s+executad[ao]\s+com\s+sucesso\s+pelo\s+servidor)\b/i,
        suggestedFix: 'Utilize voz ativa no particípio curto (ex: "Configurações salvas.", "Arquivo enviado.").',
    },
    // §11 Tooltip Redundante
    {
        id: '§11',
        name: 'Tooltip Redundante',
        severity: 'minor',
        regex: /\b(clique\s+aqui\s+para\s+excluir|clique\s+aqui\s+para\s+salvar|pressione\s+para\s+abrir)\b/i,
        suggestedFix: 'Omitir o tooltip redundante ou informar consequência real da ação.',
    },
    // §12 One-line Closer Dramático
    {
        id: '§12',
        name: 'Fechamento Dramático de 1 Linha (One-Line Closer)',
        severity: 'minor',
        regex: /\b(pense\s+nisso\.?|let\s+that\s+sink\s+in\.?|essa\s+[eé]\s+a\s+verdadeira\s+vit[oó]ria\.?)\b/i,
        suggestedFix: 'Remova a frase dramática e encerre o conteúdo no último dado útil.',
    },
    // §13 Emoji Decorativo Excessivo
    {
        id: '§13',
        name: 'Emoji Spam em Botão/Header',
        severity: 'minor',
        regex: /[🚀✨💡🔥🎉]\s*(iniciar|salvar|começar|criar|configurar)/i,
        suggestedFix: 'Remova o emoji do texto do botão; utilize ícones SVG consistentes do Design System se necessário.',
    },
    // §14 Explicação Óbvia de Formulário
    {
        id: '§14',
        name: 'Instrução Óbvia de Campo de Formulário',
        severity: 'minor',
        regex: /\b(digite\s+se?u[a]?\s+(?:senha|e-?mail|nome)\s+(?:no\s+campo\s+acima|aqui))\b/i,
        suggestedFix: 'Remova o texto óbvio; utilize o helper text apenas para requisitos reais de validação.',
    },
    // §15 Resíduo Conversacional de Chatbot
    {
        id: '§15',
        name: 'Resíduo de Chatbot em Tela',
        severity: 'minor',
        regex: /\b(com\s+certeza!?\s+aqui\s+est[aá]|espero\s+ter\s+ajudado!?|ol[aá]!?\s+como\s+posso\s+ajudar\s+hoje)\b/i,
        suggestedFix: 'Remova o resíduo de diálogo; apresente diretamente os nós de UI.',
    },
];
export class UXHumanizerLinter {
    /**
     * Executa a auditoria heurística completa em uma string de texto, JSX ou Markdown.
     */
    static auditText(content) {
        const tells = [];
        const lines = content.split(/\r?\n/);
        for (const rule of UX_COPY_RULES) {
            lines.forEach((line, index) => {
                const matches = line.match(rule.regex);
                if (matches) {
                    const matchedText = matches[0];
                    const fix = typeof rule.suggestedFix === 'function'
                        ? rule.suggestedFix(matchedText)
                        : rule.suggestedFix;
                    tells.push({
                        patternId: rule.id,
                        patternName: rule.name,
                        severity: rule.severity,
                        matchedText,
                        suggestedFix: fix,
                        line: index + 1,
                    });
                }
            });
        }
        const criticalCount = tells.filter((t) => t.severity === 'critical').length;
        const majorCount = tells.filter((t) => t.severity === 'major').length;
        const minorCount = tells.filter((t) => t.severity === 'minor').length;
        // Cálculo determinístico de Score de Craft Textual:
        // Começa em 100: cada critical deduz 25, major deduz 10, minor deduz 5
        const penalty = criticalCount * 25 + majorCount * 10 + minorCount * 5;
        const score = Math.max(0, 100 - penalty);
        const passed = criticalCount === 0 && score >= 70;
        return {
            passed,
            score,
            totalTells: tells.length,
            criticalCount,
            majorCount,
            minorCount,
            tells,
        };
    }
    /**
     * Audita o conteúdo de um arquivo existente no sistema de arquivos.
     */
    static auditFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Arquivo não encontrado para auditoria de microcopy: ${filePath}`);
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        return UXHumanizerLinter.auditText(content);
    }
    /**
     * Aplica correções seguras e imediatas em padrões conhecidos de alta incidência.
     */
    static cleanKnownPatterns(text) {
        let cleaned = text;
        // Substituições automáticas de CTAs prolixos
        cleaned = cleaned.replace(/\bcomece\s+sua\s+jornada\s+inesquec[ií]vel\s+agora\b/gi, 'Criar conta gratuita');
        cleaned = cleaned.replace(/\bdesbloqueie\s+todo\s+o\s+poder\s+da\s+intelig[eê]ncia\b/gi, 'Acessar recursos');
        // Substituições de erros com humor forçado
        cleaned = cleaned.replace(/\boops!?\s+algo\s+m[aá]gico\s+deu\s+errado!?\b/gi, 'Não foi possível concluir a ação. Verifique a conexão e tente novamente.');
        cleaned = cleaned.replace(/\bnossos\s+duendes\s+trope[cç]aram\s+nos\s+cabos\b/gi, 'Ocorreu uma falha temporária. Tente novamente em instantes.');
        // Substituições de voz passiva
        cleaned = cleaned.replace(/\ba\s+atualiza[cç][aã]o\s+das\s+configura[cç][oõ]es\s+foi\s+conclu[ií]da\s+com\s+sucesso\s+pelo\s+sistema\b/gi, 'Configurações salvas.');
        // Remoção de emojis em botões
        cleaned = cleaned.replace(/[🚀✨💡🔥🎉]\s*(iniciar|salvar|começar|criar|configurar)/gi, '$1');
        return cleaned;
    }
}
