export class GuardrailsEngine {
    zeroYoloMode;
    strictDtcg;
    constructor(zeroYoloMode = true, strictDtcg = false) {
        this.zeroYoloMode = zeroYoloMode;
        this.strictDtcg = strictDtcg;
    }
    /**
     * Avalia uma ação pretendida pelo agente contra a matriz de governança.
     */
    evaluateAction(actionType, payload = {}) {
        // 1. Ações terminantemente negadas (DENY)
        if (actionType === 'delete_master_tokens' || actionType === 'force_overwrite_brand_identity') {
            return {
                action: actionType,
                level: 'DENY',
                reason: 'Ação destrutiva contra ativos mestres é estritamente proibida pelo Guardrail de Segurança.',
                requiresPromptToUser: false,
                blocked: true
            };
        }
        if (actionType === 'push_production_direct_without_pr') {
            return {
                action: actionType,
                level: 'DENY',
                reason: 'Deploy direto para produção sem PR/Code Review é proibido pelo princípio Zero YOLO Mode.',
                requiresPromptToUser: false,
                blocked: true
            };
        }
        // 2. Ações que demandam confirmação do Designer (ASK - Design Gate)
        if (actionType === 'modify_global_tokens' ||
            actionType === 'batch_update_master_components' ||
            actionType === 'publish_storybook_package' ||
            actionType === 'commit_design_changes') {
            return {
                action: actionType,
                level: 'ASK',
                reason: `Ação de alto impacto estrutural (${actionType}). Exige validação explícita do Designer (Design Gate).`,
                requiresPromptToUser: true,
                blocked: false
            };
        }
        // 3. Ações seguras de leitura, linter e rascunhos locais (ALLOW)
        return {
            action: actionType,
            level: 'ALLOW',
            reason: 'Operação segura de leitura, auditoria heurística ou geração de rascunho local.',
            requiresPromptToUser: false,
            blocked: false
        };
    }
}
