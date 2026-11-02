import { AntiSlopEngine } from './anti-slop-engine.js';
export class CraftGuardianLinter {
    /**
     * Calcula a taxa de contraste (WCAG 2.1 / 2.2) entre duas cores hexadecimais (#RRGGBB).
     */
    static calculateContrastRatio(hex1, hex2) {
        const lum1 = CraftGuardianLinter.getRelativeLuminance(hex1);
        const lum2 = CraftGuardianLinter.getRelativeLuminance(hex2);
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
    }
    static getRelativeLuminance(hex) {
        const cleanHex = hex.replace('#', '');
        const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
        const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
        const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
        const sRGB = [r, g, b].map(val => {
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    }
    /**
     * Valida se um valor em pixels adere ao grid de 8 pontos (ou múltiplo de 4px defensivo).
     */
    static validateSpacing(pixelValue) {
        return pixelValue % 4 === 0;
    }
    /**
     * Executa auditoria heurística completa em uma especificação de UI em memória.
     */
    auditComponent(spec) {
        const issues = [];
        // 1. Verificação de Contraste (WCAG 2.2 AA exige >= 4.5:1 para texto normal)
        const ratio = CraftGuardianLinter.calculateContrastRatio(spec.textColorHex, spec.bgColorHex);
        if (ratio < 4.5) {
            issues.push({
                type: 'contrast',
                severity: 'error',
                priority: 'P1',
                message: `Relação de contraste insuficiente: ${ratio}:1. O padrão WCAG 2.2 AA exige no mínimo 4.5:1.`,
                suggestedFix: 'Ajuste a cor do texto para uma tonalidade mais escura ou o fundo para mais claro.'
            });
        }
        // 2. Verificação de Grid de 8px / 4px
        for (const p of spec.paddingPx) {
            if (!CraftGuardianLinter.validateSpacing(p)) {
                issues.push({
                    type: 'grid',
                    severity: 'error',
                    priority: 'P2',
                    message: `Valor de espaçamento ${p}px viola o sistema espacial de 8 pontos.`,
                    suggestedFix: `Ajuste para ${Math.round(p / 8) * 8}px ou múltiplo de 4px mais próximo.`
                });
            }
        }
        // 3. Verificação dos 4 estados obrigatórios
        const requiredStates = ['default', 'empty', 'loading', 'error'];
        const missingStates = requiredStates.filter(s => !spec.statesCovered.includes(s));
        if (missingStates.length > 0) {
            issues.push({
                type: 'state',
                severity: 'warning',
                priority: 'P1',
                message: `Estados defensivos ausentes na especificação: [${missingStates.join(', ')}].`,
                suggestedFix: 'Projete explicitamente os estados de carregamento (skeleton), vazio e erro com botão de recuperação.'
            });
        }
        const errorsCount = issues.filter(i => i.severity === 'error').length;
        const warningsCount = issues.filter(i => i.severity === 'warning').length;
        const score = Math.max(0, 100 - (errorsCount * 30) - (warningsCount * 10));
        return {
            passed: errorsCount === 0,
            score,
            issues
        };
    }
    /**
     * Executa auditoria heurística profunda diretamente no código-fonte de interface,
     * integrando o AntiSlopEngine e as 62 regras de qualidade e blindagem visual.
     */
    auditSourceCode(code, filePath, knownTokens) {
        const slopResult = AntiSlopEngine.scan(code, filePath, knownTokens);
        const issues = slopResult.findings.map(f => ({
            type: f.category,
            severity: f.severity === 'advisory' ? 'warning' : f.severity,
            priority: f.priority,
            message: `[${f.ruleId}] ${f.message}`,
            element: f.line ? `linha ${f.line}` : undefined,
            suggestedFix: f.suggestedFix
        }));
        return {
            passed: slopResult.passed,
            score: slopResult.score,
            issues,
            slopFindings: slopResult.findings
        };
    }
}
