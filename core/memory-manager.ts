import fs from 'node:fs';
import path from 'node:path';

export interface EpisodicEntry {
  timestamp: string;
  featureName: string;
  problemStatement: string;
  decisionSummary: string;
  outcomeMetric?: string;
  learnedLessons: string[];
}

export class MemoryManager {
  private baseDir: string;
  private semanticDir: string;
  private episodicDir: string;
  private proceduralDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir;
    this.semanticDir = path.resolve(baseDir, 'memory', 'semantic');
    this.episodicDir = path.resolve(baseDir, 'memory', 'episodic');
    this.proceduralDir = path.resolve(baseDir, 'memory', 'procedural');

    this.ensureDirsExist();
  }

  private ensureDirsExist(): void {
    for (const dir of [this.semanticDir, this.episodicDir, this.proceduralDir]) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * Lê o contexto semântico da marca e do produto.
   */
  public getSemanticContext(): string {
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
  public appendEpisodicLog(entry: EpisodicEntry): void {
    const logPath = path.resolve(this.episodicDir, 'experiments-log.jsonl');
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(logPath, line, 'utf-8');
  }

  /**
   * Recupera os últimos aprendizados episódicos relevantes para evitar cometer os mesmos erros de design do passado.
   */
  public getRecentEpisodicLessons(limit: number = 5): EpisodicEntry[] {
    const logPath = path.resolve(this.episodicDir, 'experiments-log.jsonl');
    if (!fs.existsSync(logPath)) {
      return [];
    }

    const lines = fs.readFileSync(logPath, 'utf-8').trim().split('\n').filter(Boolean);
    const entries: EpisodicEntry[] = lines.map(line => JSON.parse(line));
    return entries.slice(-limit);
  }

  /**
   * Obtém o checklist procedural obrigatório do Craft Guardian.
   */
  public getProceduralChecklist(): string {
    const checklistPath = path.resolve(this.proceduralDir, 'craft-guardian-checklist.md');
    if (fs.existsSync(checklistPath)) {
      return fs.readFileSync(checklistPath, 'utf-8');
    }
    return '# CRAFT GUARDIAN CHECKLIST (DEFAULT)\n- 8pt Grid\n- WCAG 2.2 AA Contrast\n- 4 States Covered';
  }
}
