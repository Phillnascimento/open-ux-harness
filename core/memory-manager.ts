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

export interface SavepointInfo {
  label: string;
  timestamp: string;
  path: string;
}

export class MemoryManager {
  private baseDir: string;
  private memoryDir: string;
  private semanticDir: string;
  private episodicDir: string;
  private proceduralDir: string;
  private savepointsDir: string;
  private lastTimestamp: number = 0;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = path.resolve(baseDir);
    this.memoryDir = path.resolve(this.baseDir, 'memory');
    this.semanticDir = path.resolve(this.memoryDir, 'semantic');
    this.episodicDir = path.resolve(this.memoryDir, 'episodic');
    this.proceduralDir = path.resolve(this.memoryDir, 'procedural');
    this.savepointsDir = path.resolve(this.baseDir, '.harness', 'savepoints');

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
   * Normaliza o label do savepoint removendo caracteres especiais, acentos e espaços.
   */
  public normalizeLabel(label: string): string {
    if (!label || typeof label !== 'string') {
      return 'savepoint';
    }
    const clean = label
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9_-]+/g, '-') // substitui caracteres especiais por hífen
      .replace(/-+/g, '-') // colapsa múltiplos hífens
      .replace(/^-+|-+$/g, ''); // apara hífens no início e no final
    return clean || 'savepoint';
  }

  /**
   * Gera um timestamp numérico estritamente crescente para evitar colisões em testes velozes.
   */
  private getUniqueTimestamp(): number {
    let now = Date.now();
    if (now <= this.lastTimestamp) {
      now = this.lastTimestamp + 1;
    }
    this.lastTimestamp = now;
    return now;
  }

  /**
   * Cria uma cópia integral do diretório memory/ em .harness/savepoints/<label>-<timestamp>/.
   * Normaliza o label e retorna o caminho absoluto do savepoint criado.
   */
  public createSavepoint(label: string): string {
    const normalized = this.normalizeLabel(label);
    const tsNumber = this.getUniqueTimestamp();
    const isoTimestamp = new Date(tsNumber).toISOString();
    const folderName = `${normalized}-${tsNumber}`;

    if (!fs.existsSync(this.savepointsDir)) {
      fs.mkdirSync(this.savepointsDir, { recursive: true });
    }

    const savepointPath = path.resolve(this.savepointsDir, folderName);
    fs.mkdirSync(savepointPath, { recursive: true });

    // Copia integralmente o conteúdo da memória para o diretório de savepoint
    if (fs.existsSync(this.memoryDir)) {
      fs.cpSync(this.memoryDir, savepointPath, { recursive: true });
    }

    // Registra metadados do savepoint para fidelidade de listagem
    const metaPath = path.resolve(savepointPath, '.savepoint.json');
    const metadata = {
      label: normalized,
      originalLabel: label,
      timestamp: isoTimestamp,
      timestampEpoch: tsNumber
    };
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');

    return savepointPath;
  }

  /**
   * Lista todos os savepoints existentes ordenados por data decrescente (mais recente primeiro).
   */
  public listSavepoints(): SavepointInfo[] {
    if (!fs.existsSync(this.savepointsDir)) {
      return [];
    }

    const entries = fs.readdirSync(this.savepointsDir, { withFileTypes: true });
    const savepoints: SavepointInfo[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const dirPath = path.resolve(this.savepointsDir, entry.name);
      const metaPath = path.resolve(dirPath, '.savepoint.json');

      if (fs.existsSync(metaPath)) {
        try {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
          if (meta && typeof meta.label === 'string' && typeof meta.timestamp === 'string') {
            savepoints.push({
              label: meta.label,
              timestamp: meta.timestamp,
              path: dirPath
            });
            continue;
          }
        } catch {
          // Em caso de falha de parsing, recorre à dedução via nome do diretório
        }
      }

      // Fallback: extrai do nome da pasta <label>-<timestamp>
      const lastDash = entry.name.lastIndexOf('-');
      if (lastDash > 0) {
        const folderLabel = entry.name.substring(0, lastDash);
        const rawTs = entry.name.substring(lastDash + 1);
        let timestamp: string;

        if (/^\d+$/.test(rawTs)) {
          timestamp = new Date(Number(rawTs)).toISOString();
        } else {
          try {
            const stat = fs.statSync(dirPath);
            timestamp = stat.mtime.toISOString();
          } catch {
            timestamp = new Date().toISOString();
          }
        }

        savepoints.push({
          label: folderLabel,
          timestamp,
          path: dirPath
        });
      } else {
        let timestamp: string;
        try {
          const stat = fs.statSync(dirPath);
          timestamp = stat.mtime.toISOString();
        } catch {
          timestamp = new Date().toISOString();
        }

        savepoints.push({
          label: entry.name,
          timestamp,
          path: dirPath
        });
      }
    }

    // Ordenação decrescente por data (mais recente primeiro)
    savepoints.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

    return savepoints;
  }

  /**
   * Localiza o savepoint mais recente correspondente ao label informado e restaura
   * o conteúdo para o diretório memory/, criando previamente um savepoint de segurança.
   */
  public rollback(label: string): boolean {
    const savepoints = this.listSavepoints();
    const normalized = this.normalizeLabel(label);

    // Localiza o savepoint mais recente correspondente ao label informado
    const target = savepoints.find(
      sp => sp.label === label || sp.label === normalized || this.normalizeLabel(sp.label) === normalized
    );

    if (!target) {
      throw new Error(`Savepoint com label '${label}' não encontrado.`);
    }

    // Garantia Não-Destrutiva: cria automaticamente savepoint de segurança do estado atual
    this.createSavepoint('pre-rollback');

    // Limpa o diretório memory/ atual para restauração fiel
    if (fs.existsSync(this.memoryDir)) {
      fs.rmSync(this.memoryDir, { recursive: true, force: true });
    }
    fs.mkdirSync(this.memoryDir, { recursive: true });

    // Restaura o conteúdo do savepoint para o diretório memory/
    fs.cpSync(target.path, this.memoryDir, {
      recursive: true,
      filter: (src) => !path.basename(src).startsWith('.savepoint')
    });

    // Assegura a integridade das pastas base da memória
    this.ensureDirsExist();

    return true;
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
