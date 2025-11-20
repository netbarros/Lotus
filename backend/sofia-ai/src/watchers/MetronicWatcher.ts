// @ts-nocheck - Temporarily disabled for cross-workspace type issues
/**
 * Metronic Watcher
 * Monitora continuamente metronic/demos/ e reage a mudanças
 */

import chokidar from 'chokidar';
import path from 'path';
import { readFile } from 'fs/promises';
import { SofiaCore } from '../core/SofiaCore';
import { ComponentAnalyzer } from '../analyzers/ComponentAnalyzer';
import { logger } from '../utils/logger';

export class MetronicWatcher {
  private sofia: SofiaCore;
  private analyzer: ComponentAnalyzer;
  private watcher?: chokidar.FSWatcher;
  private metronicPath: string;
  private scanInProgress: boolean = false;

  constructor(sofia: SofiaCore, analyzer: ComponentAnalyzer) {
    this.sofia = sofia;
    this.analyzer = analyzer;
    this.metronicPath = process.env.METRONIC_PATH || path.join(process.cwd(), '../../metronic');
  }

  async start(): Promise<void> {
    logger.info('👁️  Metronic Watcher: Starting...');
    logger.info(`   Monitoring: ${this.metronicPath}/demos/`);

    // Scan inicial
    await this.initialScan();

    // Iniciar monitoramento contínuo
    this.watcher = chokidar.watch(`${this.metronicPath}/demos/**/*.{ts,tsx,js,jsx}`, {
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
      persistent: true,
      ignoreInitial: true, // Já fizemos scan inicial
    });

    this.watcher
      .on('add', (filePath) => this.onFileAdded(filePath))
      .on('change', (filePath) => this.onFileChanged(filePath))
      .on('unlink', (filePath) => this.onFileDeleted(filePath));

    logger.info('✅ Metronic Watcher: Active and monitoring');
  }

  /**
   * Scan inicial de todas as demos
   */
  private async initialScan(): Promise<void> {
    if (this.scanInProgress) return;

    this.scanInProgress = true;
    logger.info('🔍 Sofia: Performing initial scan of Metronic demos...');

    try {
      await this.analyzer.scanAllDemos(this.metronicPath);
      logger.info('✅ Initial scan complete');
    } catch (error) {
      logger.error('❌ Initial scan failed:', error);
    } finally {
      this.scanInProgress = false;
    }
  }

  /**
   * Quando novo arquivo é adicionado
   */
  private async onFileAdded(filePath: string): Promise<void> {
    logger.info(`📄 File added: ${path.basename(filePath)}`);

    try {
      await this.processFile(filePath, 'added');
      logger.info(`  ✅ Processed new file`);
    } catch (error) {
      logger.error(`  ❌ Error processing file:`, error);
    }
  }

  /**
   * Quando arquivo é modificado
   */
  private async onFileChanged(filePath: string): Promise<void> {
    logger.info(`📝 File changed: ${path.basename(filePath)}`);

    try {
      await this.processFile(filePath, 'changed');
      logger.info(`  ✅ Re-analyzed changed file`);
    } catch (error) {
      logger.error(`  ❌ Error processing file:`, error);
    }
  }

  /**
   * Quando arquivo é deletado
   */
  private async onFileDeleted(filePath: string): Promise<void> {
    logger.info(`🗑️  File deleted: ${path.basename(filePath)}`);

    try {
      await this.analyzer.removeFile(filePath);
      logger.info(`  ✅ Removed from catalog`);
    } catch (error) {
      logger.error(`  ❌ Error removing file:`, error);
    }
  }

  /**
   * Processa arquivo (added ou changed)
   */
  private async processFile(filePath: string, event: 'added' | 'changed'): Promise<void> {
    // Extrair info do path
    const relativePath = path.relative(this.metronicPath, filePath);
    const parts = relativePath.split(path.sep);

    if (parts[0] !== 'demos' || parts.length < 3) {
      return; // Não é um arquivo de demo
    }

    const demo = parts[1]; // demo1, demo2, etc
    const componentPath = parts.slice(2).join('/'); // src/...
    const componentName = path.basename(filePath, path.extname(filePath));

    // Ler conteúdo
    const content = await readFile(filePath, 'utf-8');

    // Enviar para analyzer
    await this.analyzer.analyzeComponent({
      name: componentName,
      demo,
      path: componentPath,
      content,
      fullPath: filePath,
    });

    // Sofia decide se deve atualizar frontend
    if (event === 'changed') {
      await this.checkIfShouldUpdate(componentName);
    }
  }

  /**
   * Verifica se deve atualizar componente no frontend
   */
  private async checkIfShouldUpdate(componentName: string): Promise<void> {
    logger.info(`🤔 Sofia: Checking if ${componentName} needs update...`);

    // Pegar todas as versões do componente
    const versions = await this.analyzer.getComponentVersions(componentName);

    if (versions.length === 0) return;

    // Sofia decide qual versão usar
    const decision = await this.sofia.decideComponent(componentName, versions);

    // Se a decisão mudou, atualizar frontend
    if (decision.selected) {
      logger.info(`  🔄 Updating frontend with ${decision.selected.demo} version`);
      await this.analyzer.updateFrontend(componentName, decision.selected);
    }
  }

  /**
   * Para o watcher
   */
  async stop(): Promise<void> {
    if (this.watcher) {
      logger.info('🛑 Metronic Watcher: Stopping...');
      await this.watcher.close();
      logger.info('  ✅ Watcher stopped');
    }
  }
}
