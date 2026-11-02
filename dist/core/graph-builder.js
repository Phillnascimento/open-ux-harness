import fs from 'node:fs';
import path from 'node:path';
import { UXGraphEngine } from './ux-graph-engine.js';
export function buildProjectGraph(baseDir = process.cwd()) {
    const graph = new UXGraphEngine();
    // 1. Ingestão de Design Tokens W3C DTCG
    const tokensPath = path.resolve(baseDir, 'templates', 'tokens-starter.json');
    if (fs.existsSync(tokensPath)) {
        try {
            const dtcgJson = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
            graph.ingestTokensFromDTCG(dtcgJson, 'templates/tokens-starter.json');
        }
        catch {
            // Ignora erro de parse em arquivo ausente ou corrompido
        }
    }
    // 2. Ingestão de Contrato de Design (Design Contract)
    const contractPath = path.resolve(baseDir, 'templates', 'design-contract.md');
    if (fs.existsSync(contractPath)) {
        try {
            const content = fs.readFileSync(contractPath, 'utf-8');
            graph.ingestDesignContract(content, 'templates/design-contract.md');
        }
        catch {
            // Ignora erro
        }
    }
    // 3. Registro de Componentes do Design System (UI Core)
    const coreComponents = [
        { id: 'comp:Button', label: 'Button (Primary/Secondary/Ghost)', tokens: ['token:color.brand.primary', 'token:spacing.space-4', 'token:radius.radius-md'] },
        { id: 'comp:Card', label: 'Surface Card', tokens: ['token:elevation.shadow-md', 'token:radius.radius-lg', 'token:spacing.space-4'] },
        { id: 'comp:Header', label: 'Navigation Header', tokens: ['token:color.brand.primary', 'token:typography.heading-xl'] },
        { id: 'comp:Input', label: 'Text Input Field', tokens: ['token:color.neutral.stroke', 'token:radius.radius-md', 'token:spacing.space-4'] },
        { id: 'comp:Badge', label: 'Status Badge', tokens: ['token:color.feedback.success', 'token:radius.radius-full'] },
        { id: 'comp:Modal', label: 'Interactive Modal Dialog', tokens: ['token:elevation.shadow-xl', 'token:radius.radius-lg'] }
    ];
    for (const c of coreComponents) {
        graph.addNode({
            id: c.id,
            type: 'component',
            label: c.label,
            filePath: `core/components/${c.id.replace('comp:', '')}.tsx`
        });
        for (const t of c.tokens) {
            if (graph.hasNode(t)) {
                graph.addEdge({
                    source: c.id,
                    target: t,
                    type: 'uses_token',
                    provenance: 'EXTRACTED',
                    confidence: 1.0
                });
            }
        }
    }
    // Subcomponentes: Modal compõe Button
    if (graph.hasNode('comp:Modal') && graph.hasNode('comp:Button')) {
        graph.addEdge({
            source: 'comp:Modal',
            target: 'comp:Button',
            type: 'composes_component',
            provenance: 'EXTRACTED',
            confidence: 1.0
        });
    }
    // 4. Registro de Telas e Wireflows (Screens)
    const screens = [
        { id: 'screen:LandingPage', label: 'Landing Page Hero & Features', comps: ['comp:Header', 'comp:Button', 'comp:Card'] },
        { id: 'screen:Checkout', label: 'Checkout & Payment Flow', comps: ['comp:Header', 'comp:Button', 'comp:Input', 'comp:Card', 'comp:Badge'] },
        { id: 'screen:Dashboard', label: 'Main User Dashboard', comps: ['comp:Header', 'comp:Card', 'comp:Button', 'comp:Badge'] },
        { id: 'screen:Profile', label: 'Portfolio & Profile Page', comps: ['comp:Header', 'comp:Card', 'comp:Button'] }
    ];
    for (const s of screens) {
        graph.addNode({
            id: s.id,
            type: 'screen',
            label: s.label,
            filePath: `runbooks/scenarios/${s.id.replace('screen:', '').toLowerCase()}.md`
        });
        for (const compId of s.comps) {
            if (graph.hasNode(compId)) {
                graph.addEdge({
                    source: s.id,
                    target: compId,
                    type: 'composes_component',
                    provenance: 'EXTRACTED',
                    confidence: 1.0
                });
            }
        }
    }
    // Navegação entre telas: LandingPage -> Checkout e LandingPage -> Dashboard
    if (graph.hasNode('screen:LandingPage') && graph.hasNode('screen:Checkout')) {
        graph.addEdge({
            source: 'screen:LandingPage',
            target: 'screen:Checkout',
            type: 'navigates_to',
            provenance: 'EXTRACTED',
            confidence: 1.0
        });
    }
    if (graph.hasNode('screen:Checkout') && graph.hasNode('screen:Dashboard')) {
        graph.addEdge({
            source: 'screen:Checkout',
            target: 'screen:Dashboard',
            type: 'navigates_to',
            provenance: 'EXTRACTED',
            confidence: 1.0
        });
    }
    // Vínculo com Contrato de Design
    if (graph.hasNode('contract:design-contract') && graph.hasNode('screen:Checkout')) {
        graph.addEdge({
            source: 'screen:Checkout',
            target: 'contract:design-contract',
            type: 'satisfies_contract',
            provenance: 'EXTRACTED',
            confidence: 1.0
        });
    }
    // 5. Registro de Personas (09-persona-walkthrough)
    const personas = [
        { id: 'persona:EcomShopper', label: 'Comprador Mobile Impulsivo', screen: 'screen:Checkout' },
        { id: 'persona:Recruiter', label: 'Recrutador Técnico LinkedIn', screen: 'screen:Profile' }
    ];
    for (const p of personas) {
        graph.addNode({
            id: p.id,
            type: 'persona',
            label: p.label,
            filePath: 'skills/09-persona-walkthrough/SKILL.md'
        });
        if (graph.hasNode(p.screen)) {
            graph.addEdge({
                source: p.screen,
                target: p.id,
                type: 'impacts_persona',
                provenance: 'INFERRED',
                confidence: 0.85
            });
        }
    }
    return graph;
}
