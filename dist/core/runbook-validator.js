/**
 * Open UX Harness — Validador de Runbooks de Cenário
 * Garante que os runbooks declarados em runbooks/runbooks.json
 * possuam todos os metadados obrigatórios, documentos existentes no disco
 * e referenciem exclusivamente skills válidas do repositório.
 */
import fs from 'node:fs';
import path from 'node:path';
/**
 * Valida o catálogo de runbooks em runbooks/runbooks.json relativo a baseDir.
 * Verifica existência do catálogo, campos obrigatórios, slugs únicos,
 * existência do arquivo markdown de documentação e existência física de cada skill citada.
 */
export function validateRunbooks(baseDir) {
    const errors = [];
    const catalogPath = path.resolve(baseDir, 'runbooks', 'runbooks.json');
    if (!fs.existsSync(catalogPath)) {
        return {
            valid: false,
            errors: ['runbooks.json não encontrado']
        };
    }
    let catalog;
    try {
        const raw = fs.readFileSync(catalogPath, 'utf-8');
        catalog = JSON.parse(raw);
    }
    catch (err) {
        return {
            valid: false,
            errors: [`Erro ao ler ou parsear runbooks.json: ${err.message}`]
        };
    }
    if (!catalog || typeof catalog !== 'object' || !Array.isArray(catalog.runbooks)) {
        return {
            valid: false,
            errors: ['runbooks.json deve conter a propriedade "runbooks" como array']
        };
    }
    const seenSlugs = new Set();
    for (let i = 0; i < catalog.runbooks.length; i++) {
        const rb = catalog.runbooks[i];
        const indexLabel = `Runbook #${i + 1}`;
        if (!rb || typeof rb !== 'object') {
            errors.push(`${indexLabel}: item inválido no catálogo`);
            continue;
        }
        const runbookLabel = rb.slug ? `Runbook "${rb.slug}"` : indexLabel;
        // 1. Verificação de campos obrigatórios
        const requiredFields = ['slug', 'title', 'mode', 'summary', 'doc', 'roster'];
        for (const field of requiredFields) {
            if (field === 'roster') {
                if (!Array.isArray(rb.roster)) {
                    errors.push(`${runbookLabel}: campo obrigatório "${field}" ausente ou não é um array`);
                }
            }
            else {
                const val = rb[field];
                if (typeof val !== 'string' || val.trim().length === 0) {
                    errors.push(`${runbookLabel}: campo obrigatório "${field}" ausente ou vazio`);
                }
            }
        }
        // 2. Verificação de slug único
        if (typeof rb.slug === 'string' && rb.slug.trim().length > 0) {
            if (seenSlugs.has(rb.slug)) {
                errors.push(`Slug duplicado encontrado: "${rb.slug}"`);
            }
            else {
                seenSlugs.add(rb.slug);
            }
        }
        // 3. Verificação de existência do arquivo doc
        if (typeof rb.doc === 'string' && rb.doc.trim().length > 0) {
            const docPath = path.resolve(baseDir, rb.doc);
            if (!fs.existsSync(docPath)) {
                errors.push(`${runbookLabel}: arquivo de documentação "${rb.doc}" não encontrado`);
            }
        }
        // 4. Verificação dos grupos de roster e skills
        if (Array.isArray(rb.roster)) {
            if (rb.roster.length === 0) {
                errors.push(`${runbookLabel}: roster não pode ser vazio`);
            }
            for (let j = 0; j < rb.roster.length; j++) {
                const item = rb.roster[j];
                const groupLabel = item?.group ? `grupo "${item.group}"` : `grupo #${j + 1}`;
                if (!item || typeof item !== 'object') {
                    errors.push(`${runbookLabel}: item de roster inválido na posição ${j}`);
                    continue;
                }
                if (!Array.isArray(item.skills) || item.skills.length === 0) {
                    errors.push(`${runbookLabel}: ${groupLabel} deve conter uma lista "skills" não vazia`);
                    continue;
                }
                for (const skillId of item.skills) {
                    if (typeof skillId !== 'string' || skillId.trim().length === 0) {
                        errors.push(`${runbookLabel}: ${groupLabel} contém identificador de skill inválido`);
                        continue;
                    }
                    const skillDir = path.resolve(baseDir, 'skills', skillId);
                    const skillFile = path.resolve(skillDir, 'SKILL.md');
                    if (!fs.existsSync(skillDir) || !fs.existsSync(skillFile)) {
                        errors.push(`${runbookLabel}: skill inexistente "${skillId}" (skills/${skillId}/SKILL.md não encontrado)`);
                    }
                }
            }
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
