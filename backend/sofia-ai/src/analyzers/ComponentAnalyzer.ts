import { SofiaCore } from '../core/SofiaCore';
import { logger } from '../utils/logger';
import type { ComponentInfo } from '../types';
import glob from 'fast-glob';
import { readFile } from 'fs/promises';
import path from 'path';

export class ComponentAnalyzer {
  private sofia: SofiaCore;
  private catalog: Map<string, ComponentInfo[]>;

  constructor(sofia: SofiaCore) {
    this.sofia = sofia;
    this.catalog = new Map();
  }

  async initialize(): Promise<void> {
    logger.info('📊 Component Analyzer: Initializing...');
  }

  async scanAllDemos(metronicPath: string): Promise<void> {
    const demosPath = path.join(metronicPath, 'demos');
    const files = await glob('*/src/**/*.{ts,tsx}', {
      cwd: demosPath,
      ignore: ['**/node_modules/**', '**/dist/**'],
    });

    for (const file of files) {
      const [demo, ...rest] = file.split(path.sep);
      const fullPath = path.join(demosPath, file);
      const content = await readFile(fullPath, 'utf-8');
      const name = path.basename(file, path.extname(file));

      await this.analyzeComponent({
        name,
        demo,
        path: rest.join('/'),
        content,
        fullPath,
      });
    }

    logger.info(`📊 Catalogued ${this.catalog.size} unique components`);
  }

  async analyzeComponent(info: ComponentInfo): Promise<void> {
    if (!this.catalog.has(info.name)) {
      this.catalog.set(info.name, []);
    }
    this.catalog.get(info.name)!.push(info);
  }

  async getComponentVersions(name: string): Promise<any[]> {
    return this.catalog.get(name) || [];
  }

  async removeFile(filePath: string): Promise<void> {
    for (const [name, versions] of this.catalog.entries()) {
      this.catalog.set(
        name,
        versions.filter((v) => v.fullPath !== filePath)
      );
    }
  }

  async updateFrontend(component: string, selected: any): Promise<void> {
    logger.info(`✨ Updating frontend/${component} from ${selected.demo}`);
  }
}
