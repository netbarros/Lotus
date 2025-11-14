/**
 * Sofia AI Core
 * Cérebro principal da Intelligence Synthesis Layer
 */

import { Redis } from 'ioredis';
import { CognitiveMesh } from '../mesh/CognitiveMesh';
import { logger } from '../utils/logger';
import type { ComponentDecision, AnalysisResult } from '../types';

export class SofiaCore {
  private mesh: CognitiveMesh;
  private redis: Redis;
  private decisionCache: Map<string, ComponentDecision>;
  private learningHistory: AnalysisResult[];

  constructor(mesh: CognitiveMesh) {
    this.mesh = mesh;
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: 10, // Sofia AI dedicated database
    });
    this.decisionCache = new Map();
    this.learningHistory = [];
  }

  async initialize(): Promise<void> {
    logger.info('🌸 Sofia: Initializing AI Core...');

    // Conectar ao Redis (State Management - Layer 08)
    await this.redis.ping();
    logger.info('  ✅ Connected to Redis (State Management)');

    // Carregar decisões anteriores
    await this.loadDecisions();
    logger.info('  ✅ Loaded previous decisions from memory');

    // Registrar no Cognitive Mesh
    await this.mesh.registerAgent({
      id: 'sofia-core',
      type: 'intelligence-synthesis',
      layer: 10,
      capabilities: [
        'component-analysis',
        'decision-making',
        'continuous-learning',
        'optimization',
      ],
    });
    logger.info('  ✅ Registered in Cognitive Mesh (Layer 10)');

    // Iniciar loop de aprendizado contínuo
    this.startLearningLoop();
    logger.info('  ✅ Started continuous learning loop');
  }

  /**
   * Analisa e decide qual componente usar
   * Core da inteligência de Sofia
   */
  async decideComponent(
    componentName: string,
    versions: Array<{
      demo: string;
      path: string;
      content: string;
      metadata: any;
    }>
  ): Promise<ComponentDecision> {
    logger.info(`🧠 Sofia: Analyzing ${versions.length} versions of ${componentName}`);

    // Verificar cache
    const cacheKey = this.getCacheKey(componentName, versions);
    if (this.decisionCache.has(cacheKey)) {
      logger.info('  ⚡ Using cached decision');
      return this.decisionCache.get(cacheKey)!;
    }

    // Analisar cada versão
    const analyses = await Promise.all(versions.map((v) => this.analyzeVersion(v)));

    // Calcular scores
    const scored = versions.map((v, i) => ({
      ...v,
      analysis: analyses[i],
      score: this.calculateScore(analyses[i]),
    }));

    // Ordenar por score
    scored.sort((a, b) => b.score - a.score);

    // Melhor opção
    const best = scored[0];

    // Criar decisão
    const decision: ComponentDecision = {
      component: componentName,
      selected: {
        demo: best.demo,
        path: best.path,
        score: best.score,
      },
      reason: this.generateReason(best, scored),
      alternatives: scored.slice(1, 3).map((s) => ({
        demo: s.demo,
        score: s.score,
      })),
      confidence: this.calculateConfidence(scored),
      timestamp: new Date(),
    };

    // Salvar decisão
    this.decisionCache.set(cacheKey, decision);
    await this.saveDecision(decision);

    // Publicar no mesh
    await this.mesh.publish('component-decision', decision);

    logger.info(`  ✅ Decision: ${best.demo} (score: ${best.score.toFixed(2)})`);
    logger.info(`  📊 Reason: ${decision.reason}`);

    return decision;
  }

  /**
   * Analisa qualidade de uma versão
   */
  private async analyzeVersion(version: any): Promise<AnalysisResult> {
    const content = version.content;
    const lines = content.split('\n');

    return {
      quality: this.analyzeQuality(content),
      complexity: this.analyzeComplexity(content),
      performance: this.analyzePerformance(content),
      maintainability: this.analyzeMaintainability(content),
      lines: lines.length,
      dependencies: this.extractDependencies(content),
    };
  }

  /**
   * Análise de qualidade (0-100)
   */
  private analyzeQuality(content: string): number {
    let score = 100;

    // TypeScript usage
    if (!content.includes('import')) score -= 10;
    if (content.includes(': any')) score -= 5;
    if (!content.match(/interface |type /)) score -= 5;

    // Best practices
    if (content.includes('console.log')) score -= 3;
    if (content.includes('// TODO') || content.includes('// FIXME')) score -= 2;
    if (!content.includes('export')) score -= 5;

    // React patterns
    if (content.includes('React') || content.includes('FC')) score += 5;
    if (content.match(/use(State|Effect|Callback|Memo|Ref)/)) score += 5;
    if (content.includes('Props')) score += 3;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Análise de complexidade (0-100, menor é melhor)
   */
  private analyzeComplexity(content: string): number {
    const lines = content.split('\n').length;
    const ifCount = (content.match(/\bif\b/g) || []).length;
    const loopCount = (content.match(/\b(for|while|map|filter)\b/g) || []).length;
    const functionCount = (content.match(/function |=>/g) || []).length;

    const complexityScore = ifCount * 2 + loopCount * 3 + functionCount * 1;

    // Normalizar (menor é melhor)
    const normalized = Math.max(0, 100 - (complexityScore / lines) * 100);
    return normalized;
  }

  /**
   * Análise de performance (0-100)
   */
  private analyzePerformance(content: string): number {
    let score = 80;

    // Good patterns
    if (content.includes('useMemo')) score += 5;
    if (content.includes('useCallback')) score += 5;
    if (content.includes('React.memo')) score += 5;

    // Bad patterns
    if (content.includes('useEffect(() => {') && !content.includes('[')) score -= 10;
    if ((content.match(/useState/g) || []).length > 5) score -= 5;
    if (content.includes('while (true)')) score -= 20;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Análise de manutenibilidade (0-100)
   */
  private analyzeMaintainability(content: string): number {
    const lines = content.split('\n').length;
    const hasComments = content.includes('/**') || content.includes('//');
    const hasTypes = content.match(/: \w+/g)?.length || 0;
    const avgLineLength = content.length / lines;

    let score = 70;

    if (hasComments) score += 10;
    if (hasTypes > 5) score += 10;
    if (avgLineLength < 80) score += 5;
    if (lines < 300) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Extrai dependências do código
   */
  private extractDependencies(content: string): string[] {
    const importRegex = /import .+ from ['"](.+)['"]/g;
    const deps: string[] = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      deps.push(match[1]);
    }

    return deps;
  }

  /**
   * Calcula score final ponderado
   */
  private calculateScore(analysis: AnalysisResult): number {
    const weights = {
      quality: 0.35,
      complexity: 0.2,
      performance: 0.25,
      maintainability: 0.2,
    };

    return (
      analysis.quality * weights.quality +
      analysis.complexity * weights.complexity +
      analysis.performance * weights.performance +
      analysis.maintainability * weights.maintainability
    );
  }

  /**
   * Gera razão legível para a decisão
   */
  private generateReason(best: any, all: any[]): string {
    const reasons: string[] = [];

    if (best.analysis.quality >= 90) {
      reasons.push(`Excelente qualidade (${best.analysis.quality.toFixed(1)}%)`);
    }

    if (best.analysis.performance >= 85) {
      reasons.push('Alta performance');
    }

    if (best.analysis.lines < Math.min(...all.map((a) => a.analysis.lines))) {
      reasons.push(`Mais conciso (${best.analysis.lines} linhas)`);
    }

    if (
      best.analysis.dependencies.length <
      Math.min(...all.map((a) => a.analysis.dependencies.length))
    ) {
      reasons.push(`Menos dependências (${best.analysis.dependencies.length})`);
    }

    return reasons.length > 0 ? reasons.join(', ') : 'Score geral mais alto';
  }

  /**
   * Calcula confiança na decisão
   */
  private calculateConfidence(scored: any[]): number {
    if (scored.length === 1) return 1.0;

    const best = scored[0].score;
    const second = scored[1]?.score || 0;

    const difference = best - second;
    return Math.min(1.0, 0.5 + difference / 100);
  }

  /**
   * Loop de aprendizado contínuo
   */
  private startLearningLoop(): void {
    setInterval(async () => {
      await this.learn();
    }, 60000); // A cada 1 minuto
  }

  /**
   * Aprendizado contínuo (Layer 09 - Adaptive Learning)
   */
  private async learn(): void {
    // Analisar decisões passadas
    if (this.learningHistory.length > 0) {
      logger.info('🧠 Sofia: Learning from past decisions...');

      // Aqui Sofia pode ajustar pesos, melhorar análises, etc.
      // Integração futura com Layer 09 - Adaptive Learning
    }
  }

  /**
   * Salva decisão no Redis
   */
  private async saveDecision(decision: ComponentDecision): Promise<void> {
    const key = `sofia:decision:${decision.component}`;
    await this.redis.setex(key, 86400, JSON.stringify(decision)); // 24h TTL
  }

  /**
   * Carrega decisões do Redis
   */
  private async loadDecisions(): Promise<void> {
    const keys = await this.redis.keys('sofia:decision:*');

    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        const decision = JSON.parse(data) as ComponentDecision;
        const cacheKey = `${decision.component}:${decision.selected.demo}`;
        this.decisionCache.set(cacheKey, decision);
      }
    }

    logger.info(`  📚 Loaded ${this.decisionCache.size} decisions from cache`);
  }

  /**
   * Gera chave de cache
   */
  private getCacheKey(component: string, versions: any[]): string {
    const demosList = versions
      .map((v) => v.demo)
      .sort()
      .join(',');
    return `${component}:${demosList}`;
  }

  /**
   * Shutdown gracioso
   */
  async shutdown(): Promise<void> {
    logger.info('🌸 Sofia: Shutting down AI Core...');
    await this.redis.quit();
    logger.info('  ✅ Disconnected from Redis');
  }
}
