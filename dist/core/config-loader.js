import fs from 'node:fs';
import path from 'node:path';
export class ConfigLoader {
    baseDir;
    constructor(baseDir = process.cwd()) {
        this.baseDir = baseDir;
    }
    loadConfig(configPath) {
        const resolvedPath = configPath
            ? path.resolve(this.baseDir, configPath)
            : path.resolve(this.baseDir, 'harness.config.json');
        if (!fs.existsSync(resolvedPath)) {
            throw new Error(`Harness config file not found at: ${resolvedPath}`);
        }
        const content = fs.readFileSync(resolvedPath, 'utf-8');
        return JSON.parse(content);
    }
    loadPreset(presetId) {
        const presetPath = path.resolve(this.baseDir, 'presets', `${presetId}.json`);
        if (!fs.existsSync(presetPath)) {
            throw new Error(`Preset '${presetId}' not found at: ${presetPath}`);
        }
        const content = fs.readFileSync(presetPath, 'utf-8');
        return JSON.parse(content);
    }
    getResolvedConfiguration() {
        const config = this.loadConfig();
        const preset = this.loadPreset(config.profile);
        return { config, preset };
    }
}
