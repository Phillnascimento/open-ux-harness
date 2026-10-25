import fs from 'node:fs';
import path from 'node:path';
export class MemoryManager {
    baseDir;
    semanticDir;
    episodicDir;
    proceduralDir;
    constructor(baseDir = process.cwd()) {
        this.baseDir = baseDir;
        this.semanticDir = path.resolve(baseDir, 'memory', 'semantic');
        this.episodicDir = path.resolve(baseDir, 'memory', 'episodic');
        this.proceduralDir = path.resolve(baseDir, 'memory', 'procedural');
        this.ensureDirsExist();
    }
    ensureDirsExist() {
        for (const dir of [this.semanticDir, this.episodicDir, this.proceduralDir]) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
    }
    /**
     * Lê o contexto semântico da marca e do produto.
     */
    getSemanticContext() {
        const brandFile = path.resolve(this.semanticDir, 'brand-guidelines.md');
        const okrsFile = path.resolve(this.semanticDir, 'product-okrs.md');
        let context = '# SEMANTIC MEMORY\n';
        if (fs.existsSync(brandFile)) {
            context += `\n## Brand Guidelines\n${fs.readFileSync(brandFile, 'utf-8')}\n`;
        }
        if (fs.existsSync(okrsFile)) {
            context += `\n## Product OKRs\n${fs.readFileSync(okrsFile, 'utf-8')}\n`;
        }
        return context;
    }
    /**
     * Adiciona um aprendizado de experimento ou decisão à memória episódica (JSONL compactado).
     */
    appendEpisodicLog(entry) {
        const logPath = path.resolve(this.episodicDir, 'experiments-log.jsonl');
        const line = JSON.stringify(entry) + '\n';
        fs.appendFileSync(logPath, line, 'utf-8');
    }
    /**
     * Recupera os últimos aprendizados episódicos relevantes para evitar cometer os mesmos erros de design do passado.
     */
    getRecentEpisodicLessons(limit = 5) {
        const logPath = path.resolve(this.episodicDir, 'experiments-log.jsonl');
        if (!fs.existsSync(logPath)) {
            return [];
        }
        const lines = fs.readFileSync(logPath, 'utf-8').trim().split('\n').filter(Boolean);
        const entries = lines.map(line => JSON.parse(line));
        return entries.slice(-limit);
    }
    /**
     * Obtém o checklist procedural obrigatório do Craft Guardian.
     */
    getProceduralChecklist() {
        const checklistPath = path.resolve(this.proceduralDir, 'craft-guardian-checklist.md');
        if (fs.existsSync(checklistPath)) {
            return fs.readFileSync(checklistPath, 'utf-8');
        }
        return '# CRAFT GUARDIAN CHECKLIST (DEFAULT)\n- 8pt Grid\n- WCAG 2.2 AA Contrast\n- 4 States Covered';
    }
}
