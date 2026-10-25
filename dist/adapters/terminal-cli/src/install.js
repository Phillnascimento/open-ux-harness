import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
/**
 * Localiza de forma resiliente o arquivo platforms.json
 */
function findPlatformsFile(baseDir) {
    const candidatePaths = [
        path.resolve(baseDir, 'adapters', 'platforms.json'),
        path.resolve(baseDir, 'dist', 'adapters', 'platforms.json')
    ];
    try {
        const currentDir = path.dirname(fileURLToPath(import.meta.url));
        candidatePaths.push(path.resolve(currentDir, '..', '..', 'platforms.json'));
        candidatePaths.push(path.resolve(currentDir, '..', 'platforms.json'));
        candidatePaths.push(path.resolve(currentDir, 'platforms.json'));
        candidatePaths.push(path.resolve(currentDir, '..', '..', '..', '..', 'adapters', 'platforms.json'));
        candidatePaths.push(path.resolve(currentDir, '..', '..', '..', 'adapters', 'platforms.json'));
    }
    catch {
        // Ignora quando fileURLToPath falhar
    }
    for (const candidate of candidatePaths) {
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
    throw new Error(`Não foi possível encontrar platforms.json em nenhum dos caminhos: ${candidatePaths.join(', ')}`);
}
/**
 * Localiza de forma resiliente o arquivo harness.config.json
 */
function findHarnessConfigFile(baseDir) {
    const candidatePaths = [
        path.resolve(baseDir, 'harness.config.json'),
        path.resolve(baseDir, 'dist', 'harness.config.json')
    ];
    try {
        const currentDir = path.dirname(fileURLToPath(import.meta.url));
        candidatePaths.push(path.resolve(currentDir, '..', '..', '..', '..', 'harness.config.json'));
        candidatePaths.push(path.resolve(currentDir, '..', '..', '..', 'harness.config.json'));
    }
    catch {
        // Ignora quando fileURLToPath falhar
    }
    for (const candidate of candidatePaths) {
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
    throw new Error(`Não foi possível encontrar harness.config.json em nenhum dos caminhos: ${candidatePaths.join(', ')}`);
}
/**
 * Lê adapters/platforms.json e harness.config.json e lista plataformas e skills disponíveis
 */
export function listAvailable(baseDir) {
    const dir = baseDir || process.cwd();
    const platformsFile = findPlatformsFile(dir);
    const configFile = findHarnessConfigFile(dir);
    const platformsRaw = JSON.parse(fs.readFileSync(platformsFile, 'utf-8'));
    const configRaw = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    const rawPlatforms = platformsRaw.platforms || {};
    const platforms = Array.isArray(rawPlatforms)
        ? rawPlatforms.map((p) => p.id)
        : Object.keys(rawPlatforms);
    const skills = Array.isArray(configRaw.activeSkills)
        ? configRaw.activeSkills
        : [];
    return { platforms, skills };
}
/**
 * Escreve os arquivos gerados no disco quando dryRun for false
 */
function writeInstallationFiles(platformDef, installedSkills, targetPaths, baseDir) {
    for (const targetPath of targetPaths) {
        const parentDir = path.dirname(targetPath);
        if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
        }
        const ext = path.extname(targetPath).toLowerCase();
        const basename = path.basename(targetPath);
        if (ext === '.json') {
            const jsonContent = {
                platform: platformDef.id,
                label: platformDef.label,
                format: platformDef.format,
                activeSkills: installedSkills,
                installedAt: new Date().toISOString()
            };
            fs.writeFileSync(targetPath, JSON.stringify(jsonContent, null, 2), 'utf-8');
        }
        else if (ext === '.toml') {
            const tomlContent = `# Open UX Harness - Configuração de Plataforma: ${platformDef.label}
[harness]
platform = "${platformDef.id}"
format = "${platformDef.format}"
skills = [${installedSkills.map(s => `"${s}"`).join(', ')}]
installed_at = "${new Date().toISOString()}"
`;
            fs.writeFileSync(targetPath, tomlContent, 'utf-8');
        }
        else if (ext === '.mdc') {
            const skillName = path.basename(targetPath, '.mdc');
            const mdcContent = `---
description: Regra de Skill ${skillName} para ${platformDef.label}
globs: *
---

# Skill: ${skillName}
Plataforma: ${platformDef.label} (${platformDef.id})
Formato: ${platformDef.format}
`;
            fs.writeFileSync(targetPath, mdcContent, 'utf-8');
        }
        else if (ext === '.md') {
            let skillSourceContent = null;
            for (const skill of installedSkills) {
                if (targetPath.includes(skill)) {
                    const sourceSkillMd = path.resolve(baseDir, 'skills', skill, 'SKILL.md');
                    if (fs.existsSync(sourceSkillMd)) {
                        skillSourceContent = fs.readFileSync(sourceSkillMd, 'utf-8');
                        break;
                    }
                }
            }
            if (skillSourceContent) {
                fs.writeFileSync(targetPath, skillSourceContent, 'utf-8');
            }
            else {
                const mdContent = `# Open UX Harness - ${basename}
Plataforma: ${platformDef.label} (${platformDef.id})
Skills instaladas:
${installedSkills.map(s => `- ${s}`).join('\n')}
`;
                fs.writeFileSync(targetPath, mdContent, 'utf-8');
            }
        }
        else {
            const rulesContent = `# Open UX Harness - Regras para ${platformDef.label}
# Plataforma: ${platformDef.id}
# Skills ativas: ${installedSkills.join(', ')}

1. Grid de 8 pontos obrigatório (4px defensivo).
2. WCAG 2.2 AA (contraste mínimo 4.5:1).
3. 4 estados de UI (default, empty, loading, error).
4. Zero YOLO Mode: confirmação humana para ações destrutivas.
`;
            fs.writeFileSync(targetPath, rulesContent, 'utf-8');
        }
    }
}
/**
 * Executa a instalação seletiva de adaptadores e skills
 */
export function installSelective(options = {}) {
    const baseDir = options.baseDir || process.cwd();
    const catalog = listAvailable(baseDir);
    // 1. Validação da plataforma (default: 'terminal-cli')
    const targetPlatform = options.platform || 'terminal-cli';
    if (!catalog.platforms.includes(targetPlatform)) {
        throw new Error(`Plataforma '${targetPlatform}' inválida. Plataformas válidas: ${catalog.platforms.join(', ')}`);
    }
    // 2. Validação e resolução de skills
    let installedSkills;
    if (options.skills !== undefined) {
        const resolvedSkills = [];
        const invalidSkills = [];
        for (const raw of options.skills) {
            const trimmed = raw.trim();
            if (!trimmed)
                continue;
            if (catalog.skills.includes(trimmed)) {
                resolvedSkills.push(trimmed);
            }
            else {
                // Tenta encontrar por prefixo único (ex: '03' para '03-design-tokens')
                const prefixMatches = catalog.skills.filter(s => s.startsWith(`${trimmed}-`));
                if (prefixMatches.length === 1) {
                    resolvedSkills.push(prefixMatches[0]);
                }
                else {
                    invalidSkills.push(trimmed);
                }
            }
        }
        if (invalidSkills.length > 0) {
            throw new Error(`Skill(s) inválida(s): ${invalidSkills.join(', ')}. Skills válidas disponíveis: ${catalog.skills.join(', ')}`);
        }
        installedSkills = Array.from(new Set(resolvedSkills));
    }
    else {
        installedSkills = [...catalog.skills];
    }
    // 3. Resolução da definição da plataforma
    const platformsFile = findPlatformsFile(baseDir);
    const platformsRaw = JSON.parse(fs.readFileSync(platformsFile, 'utf-8'));
    const rawPlatforms = platformsRaw.platforms || {};
    const platformDef = Array.isArray(rawPlatforms)
        ? rawPlatforms.find((p) => p.id === targetPlatform)
        : rawPlatforms[targetPlatform];
    if (!platformDef) {
        throw new Error(`Definição da plataforma '${targetPlatform}' não encontrada em platforms.json.`);
    }
    // 4. Cálculo dos targetPaths baseados em dest.project
    const projectDestTemplates = platformDef.dest?.project || [];
    const rawTargetPaths = [];
    for (const template of projectDestTemplates) {
        if (template.includes('{slug}')) {
            for (const skill of installedSkills) {
                const relPath = template.replace('{slug}', skill);
                rawTargetPaths.push(path.resolve(baseDir, relPath));
            }
        }
        else {
            rawTargetPaths.push(path.resolve(baseDir, template));
        }
    }
    const targetPaths = Array.from(new Set(rawTargetPaths));
    const isDryRun = Boolean(options.dryRun);
    // 5. Execução (dry-run vs escrita real)
    if (isDryRun) {
        return {
            platform: targetPlatform,
            installedSkills,
            targetPaths,
            dryRun: true,
            success: true,
            message: `[dry-run] Instalação simulada para '${targetPlatform}'. ${installedSkills.length} skill(s) mapeada(s), ${targetPaths.length} arquivo(s) de destino calculados.`
        };
    }
    writeInstallationFiles(platformDef, installedSkills, targetPaths, baseDir);
    return {
        platform: targetPlatform,
        installedSkills,
        targetPaths,
        dryRun: false,
        success: true,
        message: `Instalação concluída com sucesso para '${targetPlatform}'. ${installedSkills.length} skill(s) instalada(s) em ${targetPaths.length} arquivo(s).`
    };
}
