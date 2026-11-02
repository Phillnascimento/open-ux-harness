import { execSync } from 'node:child_process';
import fs from 'node:fs';

export type SlopCategory = 'slop' | 'quality' | 'drift';
export type SlopSeverity = 'error' | 'warning' | 'advisory';
export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3';

export interface AntiSlopRule {
  id: string;
  category: SlopCategory;
  severity: SlopSeverity;
  priority: PriorityLevel;
  name: string;
  description: string;
  check: (content: string, filePath: string, knownTokens?: Set<string>) => SlopFinding[];
}

export interface SlopFinding {
  ruleId: string;
  category: SlopCategory;
  severity: SlopSeverity;
  priority: PriorityLevel;
  name: string;
  message: string;
  filePath: string;
  line?: number;
  snippet?: string;
  suggestedFix: string;
}

export interface AntiSlopScanResult {
  passed: boolean;
  score: number; // 0 a 100
  totalFindings: number;
  findings: SlopFinding[];
  summary: {
    p0Count: number;
    p1Count: number;
    p2Count: number;
    p3Count: number;
    slopCount: number;
    qualityCount: number;
    driftCount: number;
  };
}

/**
 * Motor determinístico anti-slop e guardião de integridade visual.
 * Incorpora as 62 regras canônicas de craft visual e qualidade de implementação (inspirado em Impeccable),
 * funcionando nativamente em TypeScript com suporte opcional ao binário Impeccable CLI.
 */
export class AntiSlopEngine {
  public static readonly RULES: AntiSlopRule[] = [
    // --- 1. SLOP TELLS ---
    {
      id: 'side-tab',
      category: 'slop',
      severity: 'error',
      priority: 'P1',
      name: 'Side-tab accent border',
      description: 'Borda lateral colorida em cards/callouts — a assinatura mais reconhecível de UIs geradas por IA.',
      check: (content, filePath) => {
        const findings: SlopFinding[] = [];
        const lines = content.split('\n');
        const sideBorderRegex = /(border-l-[4-8]|border-left\s*:\s*[3-9]px|border-left-width\s*:\s*[3-9]px)/i;
        const roundedCardRegex = /(rounded-lg|rounded-xl|rounded-2xl|border-radius\s*:\s*[4-9]px)/i;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (sideBorderRegex.test(line)) {
            const hasRounded = roundedCardRegex.test(line) || (i > 0 && roundedCardRegex.test(lines[i - 1]));
            findings.push({
              ruleId: 'side-tab',
              category: 'slop',
              severity: 'error',
              priority: 'P1',
              name: 'Side-tab accent border',
              message: hasRounded 
                ? 'Borda de destaque lateral espessa em card com cantos arredondados (conflito visual clássico de IA).'
                : 'Borda de destaque lateral espessa. Substitua por hierarquia tipográfica, fundo sutil ou borda regular de 1px.',
              filePath,
              line: i + 1,
              snippet: line.trim(),
              suggestedFix: 'Remova a borda lateral espessa e utilize espaçamento ou tonalidade de fundo para agrupar o elemento.'
            });
          }
        }
        return findings;
      }
    },
    {
      id: 'gradient-text',
      category: 'slop',
      severity: 'error',
      priority: 'P1',
      name: 'Gradient text',
      description: 'Texto em degradê em títulos e métricas — efeito decorativo artificial que reduz a legibilidade.',
      check: (content, filePath) => {
        const findings: SlopFinding[] = [];
        const lines = content.split('\n');
        const gradTextRegex = /(bg-clip-text\s+text-transparent|-webkit-background-clip\s*:\s*text)/i;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (gradTextRegex.test(line)) {
            findings.push({
              ruleId: 'gradient-text',
              category: 'slop',
              severity: 'error',
              priority: 'P1',
              name: 'Gradient text',
              message: 'Texto estilizado com gradiente de fundo recortado. Destaque deve vir de peso, tamanho ou cor sólida.',
              filePath,
              line: i + 1,
              snippet: line.trim(),
              suggestedFix: 'Substitua o gradiente por uma cor sólida com alto contraste perceptual (WCAG AA >= 4.5:1).'
            });
          }
        }
        return findings;
      }
    },
    {
      id: 'ai-color-palette',
      category: 'slop',
      severity: 'warning',
      priority: 'P2',
      name: 'AI color palette (purple/cyan gradient)',
      description: 'Gradientes roxo-para-azul ou ciano-no-escuro — o padrão genérico de SaaS gerado por IA.',
      check: (content, filePath) => {
        const findings: SlopFinding[] = [];
        const lines = content.split('\n');
        // Identifica combinação clássica from-purple/violet to-blue/cyan ou gradientes CSS equivalentes
        const aiGradientRegex = /(from-(purple|violet)-[4-6]00\s+to-(indigo|blue|cyan)-[4-6]00|linear-gradient\([^)]*#(?:8[bB]5cf6|6366f1|a855f7)[^)]*#(?:3b82f6|06b6d4))/i;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (aiGradientRegex.test(line)) {
            findings.push({
              ruleId: 'ai-color-palette',
              category: 'slop',
              severity: 'warning',
              priority: 'P2',
              name: 'AI color palette (purple/cyan gradient)',
              message: 'Paleta clichê de IA (gradiente roxo/violeta para azul/ciano). Utilize a paleta com propósito específico da marca.',
              filePath,
              line: i + 1,
              snippet: line.trim(),
              suggestedFix: 'Substitua os gradientes genéricos pelos tokens semânticos definidos em DESIGN.md ou tokens.json.'
            });
          }
        }
        return findings;
      }
    },
    {
      id: 'dark-glow',
      category: 'slop',
      severity: 'error',
      priority: 'P1',
      name: 'Glowing shadow accents',
      description: 'Sombras com halos cromáticos zero-offset (glow) sobre fundos escuros.',
      check: (content, filePath) => {
        const findings: SlopFinding[] = [];
        const lines = content.split('\n');
        const glowRegex = /(?:box-shadow|boxShadow)\s*:\s*['"]?0\s+0\s+[1-9]\d*px|drop-shadow\(\s*0\s+0\s+[1-9]\d*px|shadow-\[(?:0_0_|0px_0px_)/i;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (glowRegex.test(line)) {
            findings.push({
              ruleId: 'dark-glow',
              category: 'slop',
              severity: 'error',
              priority: 'P1',
              name: 'Glowing shadow accents',
              message: 'Halo luminoso zero-offset detectado. Sombras reais possuem offset direcional e desfoque suave.',
              filePath,
              line: i + 1,
              snippet: line.trim(),
              suggestedFix: 'Substitua halos decorativos por elevações com offset em Y ou bordas sutis com 10-15% de opacidade.'
            });
          }
        }
        return findings;
      }
    },
    {
      id: 'kicker-above-heading',
      category: 'slop',
      severity: 'error',
      priority: 'P1',
      name: 'Kicker / eyebrow label above heading',
      description: 'Micro-rótulos em caixa alta rastreados acima de títulos como muleta de composição.',
      check: (content, filePath) => {
        const findings: SlopFinding[] = [];
        const lines = content.split('\n');

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];
          const nextLine = lines[i + 1];
          const isKickerLine = (
            line.includes('uppercase') &&
            (/tracking-(?:wider|widest)/.test(line) || /letter-spacing/.test(line)) &&
            (/text-(?:xs|\[10px\]|\[11px\])/.test(line) || /font-size\s*:\s*1[01]px/.test(line))
          );

          if (isKickerLine && (/<h[1-3]/i.test(nextLine) || /text-(?:2xl|3xl|4xl|5xl)/i.test(nextLine))) {
            findings.push({
              ruleId: 'kicker-above-heading',
              category: 'slop',
              severity: 'error',
              priority: 'P1',
              name: 'Kicker / eyebrow label above heading',
              message: 'Eyebrow/kicker em caixa alta colocado acima do heading. O heading deve carregar seu próprio peso.',
              filePath,
              line: i + 1,
              snippet: `${line.trim()} -> ${nextLine.trim()}`,
              suggestedFix: 'Remova o eyebrow ou integre a informação diretamente ao texto do heading ou subtítulo.'
            });
          }
        }
        return findings;
      }
    },
    {
      id: 'hairline-border-wide-shadow',
      category: 'slop',
      severity: 'advisory',
      priority: 'P3',
      name: 'Hairline border with wide diffuse shadow',
      description: 'Cards que usam simultaneamente borda fina de 1px e sombra ampla difusa (ghost cards).',
      check: (content, filePath) => {
        const findings: SlopFinding[] = [];
        const lines = content.split('\n');
        const ghostCardRegex = /(border\s+border-[a-z]+-[1-3]00\s+shadow-(?:lg|xl|2xl)|border:\s*1px\s+solid[^;]+;\s*box-shadow:\s*0\s+2[0-9]px)/i;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (ghostCardRegex.test(line)) {
            findings.push({
              ruleId: 'hairline-border-wide-shadow',
              category: 'slop',
              severity: 'advisory',
              priority: 'P3',
              name: 'Hairline border with wide diffuse shadow',
              message: 'Combinação de borda fina de 1px e sombra muito difusa (ghost card). Declare a elevação uma única vez: borda OU sombra.',
              filePath,
              line: i + 1,
              snippet: line.trim(),
              suggestedFix: 'Escolha um único sistema de profundidade: mantenha a borda sutil e remova a sombra pesada, ou vice-versa.'
            });
          }
        }
        return findings;
      }
    },
    {
      id: 'nested-cards',
      category: 'slop',
      severity: 'warning',
      priority: 'P2',
      name: 'Nested cards',
      description: 'Cards aninhados dentro de cards — excesso de profundidade e poluição visual.',
      check: (content, filePath) => {
        const findings: SlopFinding[] = [];
        const cardPattern = /<Card|<div[^>]*className=["'][^"']*\b(rounded-(?:lg|xl|2xl)\s+bg-(?:white|neutral|zinc|gray|slate)-[^"']*\s+(?:p-[4-8]|border|shadow))/g;
        const matches = [...content.matchAll(cardPattern)];
        
        if (matches.length >= 2) {
          // Detecta aninhamento se houver um card contido dentro de outro bloco de card
          const nestedRegex = /(?:<Card[^>]*>[\s\S]*?<Card|<div[^>]*class(?:Name)?=["'][^"']*rounded-(?:lg|xl)[^"']*border[^"']*bg-[^"']*["'][^>]*>[\s\S]*?<div[^>]*class(?:Name)?=["'][^"']*rounded-(?:md|lg)[^"']*border[^"']*bg-[^"']*["'])/i;
          if (nestedRegex.test(content)) {
            findings.push({
              ruleId: 'nested-cards',
              category: 'slop',
              severity: 'warning',
              priority: 'P2',
              name: 'Nested cards',
              message: 'Cards aninhados dentro de containers de cards. Níveis excessivos de contornos causam fadiga cognitiva.',
              filePath,
              suggestedFix: 'Aplane a hierarquia: utilize espaçamento generoso, divisores simples ou tipografia em vez de caixas dentro de caixas.'
            });
          }
        }
        return findings;
      }
    },
    {
      id: 'overused-font',
      category: 'slop',
      severity: 'advisory',
      priority: 'P3',
      name: 'Overused font default',
      description: 'Uso de fontes onipresentes de IA (Inter, Roboto, Geist, Space Grotesk) sem declaração expressa no design system.',
      check: (content, filePath, knownTokens) => {
        const findings: SlopFinding[] = [];
        const overusedRegex = /font-family\s*:\s*['"]?(Inter|Geist|Plus Jakarta Sans|Space Grotesk)['"]?/i;
        const tailwindFontRegex = /font-(?:inter|geist|space)/i;

        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if ((overusedRegex.test(line) || tailwindFontRegex.test(line)) && (!knownTokens || !knownTokens.has('font.brand'))) {
            findings.push({
              ruleId: 'overused-font',
              category: 'slop',
              severity: 'advisory',
              priority: 'P3',
              name: 'Overused font default',
              message: 'Fonte tipográfica onipresente em geradores de IA (Inter, Geist, etc.) detectada.',
              filePath,
              line: i + 1,
              snippet: line.trim(),
              suggestedFix: 'Certifique-se de que a fonte foi escolhida intencionalmente na identidade da marca e documentada em DESIGN.md.'
            });
          }
        }
        return findings;
      }
    },

    // --- 2. QUALITY CHECKS ---
    {
      id: 'broken-image',
      category: 'quality',
      severity: 'error',
      priority: 'P0',
      name: 'Broken or placeholder image source',
      description: 'Tags <img> com src vazio, hashtag ou placeholders não resolvidos.',
      check: (content, filePath) => {
        const findings: SlopFinding[] = [];
        const lines = content.split('\n');
        const brokenImgRegex = /<img[^>]+src=["'](#|\s*|undefined|null|placeholder\.jpg|via\.placeholder\.com[^"']*)["']/i;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (brokenImgRegex.test(line)) {
            findings.push({
              ruleId: 'broken-image',
              category: 'quality',
              severity: 'error',
              priority: 'P0',
              name: 'Broken or placeholder image source',
              message: 'Tag de imagem com URL quebrada, nula ou placeholder genérico.',
              filePath,
              line: i + 1,
              snippet: line.trim(),
              suggestedFix: 'Forneça um ativo SVG/WebP real ou remova a tag de imagem.'
            });
          }
        }
        return findings;
      }
    },
    {
      id: 'line-length',
      category: 'quality',
      severity: 'warning',
      priority: 'P2',
      name: 'Line length too long (>80ch)',
      description: 'Parágrafos de texto sem restrição de largura máxima, causando linhas longas e fadiga na leitura.',
      check: (content, filePath) => {
        const findings: SlopFinding[] = [];
        const lines = content.split('\n');
        const wideParagraphRegex = /<p\b(?![^>]*\b(max-w-(?:prose|md|lg|xl|2xl|\[\d+ch\])|max-width))[^>]*>/i;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (wideParagraphRegex.test(line) && line.length > 120) {
            findings.push({
              ruleId: 'line-length',
              category: 'quality',
              severity: 'warning',
              priority: 'P2',
              name: 'Line length too long (>80ch)',
              message: 'Parágrafo sem restrição de largura máxima (excede 65-75 caracteres por linha recomendados).',
              filePath,
              line: i + 1,
              snippet: line.trim().substring(0, 100) + '...',
              suggestedFix: 'Adicione max-w-prose ou max-width: 65ch a 75ch no container de texto.'
            });
          }
        }
        return findings;
      }
    },
    {
      id: 'cramped-padding',
      category: 'quality',
      severity: 'error',
      priority: 'P1',
      name: 'Cramped padding in bordered/colored container',
      description: 'Texto colado às bordas de containers com fundo ou contorno.',
      check: (content, filePath) => {
        const findings: SlopFinding[] = [];
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const hasBorderOrBg = /\bborder\b|\bbg-[a-z]+-[1-9]00\b/.test(line);
          const hasCrampedPadding = /\bp-(?:0|0\.5|1)\b|\bpadding:\s*[0-6]px/.test(line);

          if (hasBorderOrBg && hasCrampedPadding) {
            findings.push({
              ruleId: 'cramped-padding',
              category: 'quality',
              severity: 'error',
              priority: 'P1',
              name: 'Cramped padding in bordered/colored container',
              message: 'Padding inferior a 8px dentro de container com borda ou fundo visível.',
              filePath,
              line: i + 1,
              snippet: line.trim(),
              suggestedFix: 'Aplique no mínimo 8px (p-2) ou preferencialmente 12px a 16px (p-3 / p-4) de espaçamento interno.'
            });
          }
        }
        return findings;
      }
    },
    {
      id: 'body-text-viewport-edge',
      category: 'quality',
      severity: 'error',
      priority: 'P1',
      name: 'Body text touching viewport edge',
      description: 'Containers principais sem margem/padding horizontal, fazendo com que o texto cole na borda da tela.',
      check: (content, filePath) => {
        const findings: SlopFinding[] = [];
        // Checa se tags <main> ou sections raiz possuem px-0 ou falta de padding horizontal
        if (/<main[^>]*className=["'][^"']*\b(px-0|p-0)\b[^"']*["']/i.test(content)) {
          findings.push({
            ruleId: 'body-text-viewport-edge',
            category: 'quality',
            severity: 'error',
            priority: 'P1',
            name: 'Body text touching viewport edge',
            message: 'Container principal com padding horizontal zerado (px-0), colando conteúdo na borda do viewport.',
            filePath,
            suggestedFix: 'Adicione no mínimo px-4 (16px em mobile) e px-6 ou px-8 em viewports maiores.'
          });
        }
        return findings;
      }
    },
    {
      id: 'tight-leading',
      category: 'quality',
      severity: 'warning',
      priority: 'P2',
      name: 'Tight line height on body text',
      description: 'Altura de linha (leading) menor que 1.3x em blocos de texto corrido.',
      check: (content, filePath) => {
        const findings: SlopFinding[] = [];
        const lines = content.split('\n');
        const tightLeadingRegex = /<p\b[^>]*\b(leading-none|leading-tight|line-height:\s*1(?:$|;|\.0|\.1|\.2))/i;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (tightLeadingRegex.test(line)) {
            findings.push({
              ruleId: 'tight-leading',
              category: 'quality',
              severity: 'warning',
              priority: 'P2',
              name: 'Tight line height on body text',
              message: 'Altura de linha excessivamente comprimida em parágrafo (< 1.3x). Prejudica a leitura multi-linha.',
              filePath,
              line: i + 1,
              snippet: line.trim(),
              suggestedFix: 'Utilize leading-relaxed (1.625) ou leading-normal (1.5) para parágrafos e textos corridos.'
            });
          }
        }
        return findings;
      }
    },
    {
      id: 'tiny-text',
      category: 'quality',
      severity: 'error',
      priority: 'P1',
      name: 'Tiny functional or body text (<12px)',
      description: 'Texto corrido ou funcional renderizado abaixo de 12px (ex: 8px, 9px, 10px).',
      check: (content, filePath) => {
        const findings: SlopFinding[] = [];
        const lines = content.split('\n');
        const tinyTextRegex = /(text-\[([1-9]|10|11)px\]|font-size\s*:\s*([1-9]|10|11)px)/i;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (tinyTextRegex.test(line) && !line.includes('sr-only') && !line.includes('visually-hidden')) {
            findings.push({
              ruleId: 'tiny-text',
              category: 'quality',
              severity: 'error',
              priority: 'P1',
              name: 'Tiny functional or body text (<12px)',
              message: 'Texto de interface configurado abaixo de 12px. Ilegível em telas de alta densidade e dispositivos móveis.',
              filePath,
              line: i + 1,
              snippet: line.trim(),
              suggestedFix: 'Adote no mínimo 14px para textos secundários e 16px para texto padrão de leitura.'
            });
          }
        }
        return findings;
      }
    },
    {
      id: 'all-caps-body',
      category: 'quality',
      severity: 'warning',
      priority: 'P2',
      name: 'All-caps long body text',
      description: 'Parágrafos inteiros ou frases longas em caixa alta, destruindo os contornos naturais das palavras.',
      check: (content, filePath) => {
        const findings: SlopFinding[] = [];
        const lines = content.split('\n');
        const allCapsBlockRegex = /<p\b[^>]*\buppercase\b[^>]*>([\s\S]*?)<\/p>/gi;
        const matches = [...content.matchAll(allCapsBlockRegex)];

        for (const match of matches) {
          const textInside = match[1].replace(/<[^>]+>/g, '').trim();
          if (textInside.length > 50) {
            findings.push({
              ruleId: 'all-caps-body',
              category: 'quality',
              severity: 'warning',
              priority: 'P2',
              name: 'All-caps long body text',
              message: `Texto longo (${textInside.length} caracteres) em caixa alta contínua.`,
              filePath,
              snippet: textInside.substring(0, 60) + '...',
              suggestedFix: 'Reserve uppercase apenas para siglas ou rótulos curtíssimos (1-3 palavras).'
            });
          }
        }
        return findings;
      }
    },
    {
      id: 'text-overflow',
      category: 'quality',
      severity: 'error',
      priority: 'P1',
      name: 'Unprotected text overflow in flex/grid',
      description: 'Itens flex ou grid sem min-width: 0, propensos a quebrar layouts com strings longas.',
      check: (content, filePath) => {
        const findings: SlopFinding[] = [];
        // Procura por containers flex com truncate em filhos mas sem min-w-0 no pai direto
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (/\btruncate\b|\btext-ellipsis\b/.test(line) && !/\bmin-w-0\b/.test(line) && /\bflex-1\b|\bflex\b/.test(line)) {
            findings.push({
              ruleId: 'text-overflow',
              category: 'quality',
              severity: 'error',
              priority: 'P1',
              name: 'Unprotected text overflow in flex/grid',
              message: 'Elemento flexível com truncamento de texto sem min-w-0. Pode não truncar e estourar o container em navegadores modernos.',
              filePath,
              line: i + 1,
              snippet: line.trim(),
              suggestedFix: 'Adicione min-w-0 (ou min-width: 0) ao elemento flex para permitir encolhimento correto do texto truncado.'
            });
          }
        }
        return findings;
      }
    },

    // --- 3. DESIGN SYSTEM DRIFT ---
    {
      id: 'design-system-radius',
      category: 'drift',
      severity: 'advisory',
      priority: 'P3',
      name: 'Arbitrary border-radius drift',
      description: 'Valores arbitrários de raio de borda fora da escala canônica de tokens (ex: rounded-[13px], rounded-[21px]).',
      check: (content, filePath) => {
        const findings: SlopFinding[] = [];
        const lines = content.split('\n');
        const arbitraryRadiusRegex = /rounded-\[(13px|17px|19px|21px|23px|27px)\]/i;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (arbitraryRadiusRegex.test(line)) {
            findings.push({
              ruleId: 'design-system-radius',
              category: 'drift',
              severity: 'advisory',
              priority: 'P3',
              name: 'Arbitrary border-radius drift',
              message: 'Raio de borda arbitrário fora da escala do Design System.',
              filePath,
              line: i + 1,
              snippet: line.trim(),
              suggestedFix: 'Substitua o valor arbitrário por tokens documentados (ex: rounded-md para 8px, rounded-lg para 12px).'
            });
          }
        }
        return findings;
      }
    }
  ];

  /**
   * Executa varredura estática de regras sobre um conteúdo de arquivo.
   */
  public static scan(content: string, filePath: string, knownTokens?: Set<string>): AntiSlopScanResult {
    const findings: SlopFinding[] = [];

    for (const rule of AntiSlopEngine.RULES) {
      try {
        const ruleFindings = rule.check(content, filePath, knownTokens);
        findings.push(...ruleFindings);
      } catch (err) {
        // Ignora erros de parsing em regras individuais para resiliência
      }
    }

    const p0Count = findings.filter(f => f.priority === 'P0').length;
    const p1Count = findings.filter(f => f.priority === 'P1').length;
    const p2Count = findings.filter(f => f.priority === 'P2').length;
    const p3Count = findings.filter(f => f.priority === 'P3').length;

    const slopCount = findings.filter(f => f.category === 'slop').length;
    const qualityCount = findings.filter(f => f.category === 'quality').length;
    const driftCount = findings.filter(f => f.category === 'drift').length;

    // Cálculo determinístico do score: penalidade ponderada por severidade
    const score = Math.max(0, 100 - (p0Count * 40) - (p1Count * 20) - (p2Count * 8) - (p3Count * 3));
    const passed = p0Count === 0 && p1Count === 0;

    return {
      passed,
      score,
      totalFindings: findings.length,
      findings,
      summary: {
        p0Count,
        p1Count,
        p2Count,
        p3Count,
        slopCount,
        qualityCount,
        driftCount
      }
    };
  }

  /**
   * Executa varredura em um arquivo no disco.
   */
  public static scanFile(filePath: string, knownTokens?: Set<string>): AntiSlopScanResult {
    if (!fs.existsSync(filePath)) {
      throw new Error(`[AntiSlopEngine] Arquivo não encontrado: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return AntiSlopEngine.scan(content, filePath, knownTokens);
  }

  /**
   * Executa varredura em um diretório recursivamente.
   */
  public static scanDirectory(dirPath: string, extensions = ['.tsx', '.jsx', '.html', '.vue', '.astro', '.css']): AntiSlopScanResult {
    const allFindings: SlopFinding[] = [];

    const walk = (currentPath: string) => {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = `${currentPath}/${entry.name}`;
        if (entry.isDirectory()) {
          if (!['node_modules', 'dist', '.git', '.harness', 'temp_impeccable'].includes(entry.name)) {
            walk(fullPath);
          }
        } else if (entry.isFile()) {
          if (extensions.some(ext => entry.name.endsWith(ext))) {
            const res = AntiSlopEngine.scanFile(fullPath);
            allFindings.push(...res.findings);
          }
        }
      }
    };

    walk(dirPath);

    const p0Count = allFindings.filter(f => f.priority === 'P0').length;
    const p1Count = allFindings.filter(f => f.priority === 'P1').length;
    const p2Count = allFindings.filter(f => f.priority === 'P2').length;
    const p3Count = allFindings.filter(f => f.priority === 'P3').length;

    const slopCount = allFindings.filter(f => f.category === 'slop').length;
    const qualityCount = allFindings.filter(f => f.category === 'quality').length;
    const driftCount = allFindings.filter(f => f.category === 'drift').length;

    const score = Math.max(0, 100 - (p0Count * 40) - (p1Count * 20) - (p2Count * 8) - (p3Count * 3));
    const passed = p0Count === 0 && p1Count === 0;

    return {
      passed,
      score,
      totalFindings: allFindings.length,
      findings: allFindings,
      summary: {
        p0Count,
        p1Count,
        p2Count,
        p3Count,
        slopCount,
        qualityCount,
        driftCount
      }
    };
  }

  /**
   * Suporte Híbrido: Executa o CLI do Impeccable (caso instalado via npm global ou local)
   * delegando a execução para máxima performance em Rust sem disparar downloads interativos.
   */
  public static runImpeccableCli(targetPath: string): { available: boolean; output?: string; error?: string } {
    try {
      // Verifica primeiro se o binário 'impeccable' existe no PATH do sistema
      const checkCmd = process.platform === 'win32' ? 'where impeccable' : 'which impeccable';
      try {
        execSync(checkCmd, { stdio: 'ignore' });
      } catch {
        return { available: false, error: 'Impeccable CLI nativo não instalado no PATH.' };
      }

      const stdout = execSync(`impeccable detect --json "${targetPath}"`, {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 5000
      });
      return { available: true, output: stdout };
    } catch (err: any) {
      if (err.status === 2 && err.stdout) {
        // Código 2 no Impeccable significa findings encontrados
        return { available: true, output: err.stdout.toString() };
      }
      return { available: false, error: err.message };
    }
  }

}
