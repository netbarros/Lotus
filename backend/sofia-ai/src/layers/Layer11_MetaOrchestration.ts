/**
 * Layer 11 - Meta-Orchestration
 * Self-Optimization Engine
 *
 * Orquestra e otimiza todas as outras layers automaticamente
 * Usa feedback loops para melhorar decisões continuamente
 */

import { EventEmitter } from 'events';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';

interface OptimizationMetrics {
  layer: number;
  performance: number;
  efficiency: number;
  errorRate: number;
  latency: number;
  throughput: number;
  timestamp: Date;
}

interface OptimizationGoal {
  target: string;
  currentValue: number;
  targetValue: number;
  strategy: string;
  priority: 'high' | 'medium' | 'low';
}

export class Layer11_MetaOrchestration extends EventEmitter {
  private redis: Redis;
  private metrics: Map<number, OptimizationMetrics[]>;
  private goals: OptimizationGoal[];
  private optimizationInterval: NodeJS.Timeout | null = null;

  constructor(redis: Redis) {
    super();
    this.redis = redis;
    this.metrics = new Map();
    this.goals = [];

    // Initialize goals
    this.initializeGoals();
  }

  async initialize(): Promise<void> {
    logger.info('🎯 Layer 11: Meta-Orchestration initializing...');

    // Load historical metrics
    await this.loadMetrics();

    // Start optimization loop
    this.startOptimizationLoop();

    // Subscribe to all layer events
    await this.subscribeToLayers();

    logger.info('✅ Layer 11: Meta-Orchestration active - Self-optimization enabled');
  }

  /**
   * Define optimization goals
   */
  private initializeGoals(): void {
    this.goals = [
      {
        target: 'component-decision-accuracy',
        currentValue: 0.85,
        targetValue: 0.95,
        strategy: 'adaptive-learning',
        priority: 'high',
      },
      {
        target: 'layer10-latency',
        currentValue: 150,
        targetValue: 50,
        strategy: 'caching-optimization',
        priority: 'high',
      },
      {
        target: 'system-efficiency',
        currentValue: 0.72,
        targetValue: 0.9,
        strategy: 'resource-optimization',
        priority: 'medium',
      },
      {
        target: 'error-rate',
        currentValue: 0.02,
        targetValue: 0.001,
        strategy: 'auto-healing',
        priority: 'high',
      },
    ];
  }

  /**
   * Subscribe to all layer events for orchestration
   */
  private async subscribeToLayers(): Promise<void> {
    const layerChannels = [
      'mesh:layer10:decision',
      'mesh:layer09:learning',
      'mesh:layer08:state',
      'mesh:layer07:workflow',
      'mesh:layer06:service',
      'mesh:layer05:data',
      'mesh:layer04:edge',
      'mesh:layer03:security',
    ];

    for (const channel of layerChannels) {
      await this.redis.subscribe(channel);
    }

    this.redis.on('message', (channel, message) => {
      this.handleLayerEvent(channel, JSON.parse(message));
    });
  }

  /**
   * Handle events from any layer
   */
  private handleLayerEvent(channel: string, data: any): void {
    const layer = this.extractLayerNumber(channel);

    // Collect metrics
    this.collectMetric(layer, data);

    // Analyze for optimization opportunities
    this.analyzeForOptimization(layer, data);
  }

  /**
   * Collect metrics from layer events
   */
  private collectMetric(layer: number, data: any): void {
    if (!this.metrics.has(layer)) {
      this.metrics.set(layer, []);
    }

    const metrics = this.metrics.get(layer)!;

    const metric: OptimizationMetrics = {
      layer,
      performance: data.performance || 0,
      efficiency: data.efficiency || 0,
      errorRate: data.error ? 1 : 0,
      latency: data.latency || 0,
      throughput: data.throughput || 0,
      timestamp: new Date(),
    };

    metrics.push(metric);

    // Keep only last 1000 metrics per layer
    if (metrics.length > 1000) {
      metrics.shift();
    }

    // Save to Redis
    this.saveMetric(metric);
  }

  /**
   * Analyze for optimization opportunities
   */
  private analyzeForOptimization(layer: number, data: any): void {
    const metrics = this.metrics.get(layer);
    if (!metrics || metrics.length < 10) return;

    // Calculate recent performance
    const recent = metrics.slice(-10);
    const avgPerformance = recent.reduce((sum, m) => sum + m.performance, 0) / recent.length;
    const avgLatency = recent.reduce((sum, m) => sum + m.latency, 0) / recent.length;
    const errorRate = recent.filter((m) => m.errorRate > 0).length / recent.length;

    // Check against goals
    if (avgLatency > 100) {
      logger.warn(`🎯 Layer ${layer}: High latency detected (${avgLatency.toFixed(2)}ms)`);
      this.triggerOptimization('reduce-latency', layer, { avgLatency });
    }

    if (errorRate > 0.01) {
      logger.warn(`🎯 Layer ${layer}: High error rate detected (${(errorRate * 100).toFixed(2)}%)`);
      this.triggerOptimization('reduce-errors', layer, { errorRate });
    }

    if (avgPerformance < 0.8) {
      logger.warn(
        `🎯 Layer ${layer}: Low performance detected (${(avgPerformance * 100).toFixed(2)}%)`
      );
      this.triggerOptimization('improve-performance', layer, { avgPerformance });
    }
  }

  /**
   * Trigger optimization action
   */
  private async triggerOptimization(type: string, layer: number, context: any): Promise<void> {
    logger.info(`🔧 Meta-Orchestration: Triggering ${type} optimization for Layer ${layer}`);

    const optimization = {
      type,
      layer,
      context,
      timestamp: new Date(),
      actions: this.determineOptimizationActions(type, layer, context),
    };

    // Execute optimization actions
    for (const action of optimization.actions) {
      await this.executeAction(action);
    }

    // Publish optimization event
    await this.redis.publish('mesh:layer11:optimization', JSON.stringify(optimization));

    // Log optimization
    logger.info(`✅ Meta-Orchestration: ${type} optimization completed for Layer ${layer}`);
  }

  /**
   * Determine what actions to take for optimization
   */
  private determineOptimizationActions(type: string, layer: number, context: any): any[] {
    const actions: any[] = [];

    switch (type) {
      case 'reduce-latency':
        if (layer === 10) {
          actions.push({
            type: 'increase-cache',
            target: 'sofia-core',
            params: { ttl: 3600, maxSize: 1000 },
          });
          actions.push({
            type: 'enable-parallelization',
            target: 'component-analyzer',
            params: { workers: 4 },
          });
        }
        break;

      case 'reduce-errors':
        actions.push({
          type: 'enable-retry',
          target: `layer-${layer}`,
          params: { maxRetries: 3, backoff: 'exponential' },
        });
        actions.push({
          type: 'increase-health-checks',
          target: `layer-${layer}`,
          params: { interval: 10000 },
        });
        break;

      case 'improve-performance':
        actions.push({
          type: 'optimize-resources',
          target: `layer-${layer}`,
          params: { cpu: 'increase', memory: 'increase' },
        });
        actions.push({
          type: 'enable-profiling',
          target: `layer-${layer}`,
          params: { duration: 60000 },
        });
        break;
    }

    return actions;
  }

  /**
   * Execute optimization action
   */
  private async executeAction(action: any): Promise<void> {
    logger.info(`🔧 Executing action: ${action.type} on ${action.target}`);

    // Publish action to target layer/component
    await this.redis.publish(`mesh:action:${action.target}`, JSON.stringify(action));

    // Store action in Redis
    await this.redis.lpush(
      'meta:actions',
      JSON.stringify({
        ...action,
        timestamp: new Date(),
      })
    );

    // Keep only last 100 actions
    await this.redis.ltrim('meta:actions', 0, 99);
  }

  /**
   * Self-optimization loop (runs every minute)
   */
  private startOptimizationLoop(): void {
    this.optimizationInterval = setInterval(async () => {
      await this.runOptimizationCycle();
    }, 60000); // Every 1 minute

    logger.info('🔄 Meta-Orchestration: Self-optimization loop started');
  }

  /**
   * Run a complete optimization cycle
   */
  private async runOptimizationCycle(): Promise<void> {
    logger.info('🎯 Meta-Orchestration: Running optimization cycle...');

    // Analyze all layers
    for (const [layer, metrics] of this.metrics.entries()) {
      if (metrics.length === 0) continue;

      // Calculate aggregate metrics
      const recent = metrics.slice(-100); // Last 100 metrics

      const avgPerformance = recent.reduce((sum, m) => sum + m.performance, 0) / recent.length;
      const avgLatency = recent.reduce((sum, m) => sum + m.latency, 0) / recent.length;
      const avgEfficiency = recent.reduce((sum, m) => sum + m.efficiency, 0) / recent.length;
      const errorRate = recent.filter((m) => m.errorRate > 0).length / recent.length;

      // Check each goal
      for (const goal of this.goals) {
        if (goal.target.includes(`layer${layer}`)) {
          const progress = this.calculateProgress(goal, {
            performance: avgPerformance,
            latency: avgLatency,
            efficiency: avgEfficiency,
            errorRate,
          });

          if (progress < 0.8) {
            logger.warn(
              `🎯 Goal "${goal.target}" at ${(progress * 100).toFixed(1)}% - triggering optimization`
            );
            await this.triggerOptimization(goal.strategy, layer, { goal, progress });
          }
        }
      }
    }

    // Publish cycle complete event
    await this.redis.publish(
      'mesh:layer11:cycle-complete',
      JSON.stringify({
        timestamp: new Date(),
        goalsAnalyzed: this.goals.length,
        layersMonitored: this.metrics.size,
      })
    );

    logger.info('✅ Meta-Orchestration: Optimization cycle complete');
  }

  /**
   * Calculate progress towards a goal
   */
  private calculateProgress(goal: OptimizationGoal, current: any): number {
    const target = goal.targetValue;
    const currentVal = current[goal.target.split('-')[0]] || goal.currentValue;

    if (goal.target.includes('latency') || goal.target.includes('error')) {
      // Lower is better
      return Math.max(0, Math.min(1, 1 - (currentVal - target) / currentVal));
    } else {
      // Higher is better
      return Math.max(0, Math.min(1, currentVal / target));
    }
  }

  /**
   * Load historical metrics from Redis
   */
  private async loadMetrics(): Promise<void> {
    const keys = await this.redis.keys('meta:metrics:layer:*');

    for (const key of keys) {
      const data = await this.redis.lrange(key, 0, 999);
      const layer = parseInt(key.split(':')[3]);

      this.metrics.set(
        layer,
        data.map((d) => JSON.parse(d))
      );
    }

    logger.info(`📚 Loaded metrics for ${this.metrics.size} layers`);
  }

  /**
   * Save metric to Redis
   */
  private async saveMetric(metric: OptimizationMetrics): Promise<void> {
    const key = `meta:metrics:layer:${metric.layer}`;
    await this.redis.lpush(key, JSON.stringify(metric));
    await this.redis.ltrim(key, 0, 999); // Keep last 1000
  }

  /**
   * Extract layer number from channel name
   */
  private extractLayerNumber(channel: string): number {
    const match = channel.match(/layer(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Get current optimization status
   */
  async getStatus(): Promise<any> {
    return {
      goals: this.goals,
      metrics: Object.fromEntries(
        Array.from(this.metrics.entries()).map(([layer, metrics]) => [
          layer,
          {
            count: metrics.length,
            latest: metrics[metrics.length - 1],
          },
        ])
      ),
      optimizationActive: this.optimizationInterval !== null,
    };
  }

  /**
   * Shutdown
   */
  async shutdown(): Promise<void> {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
    }
    logger.info('🛑 Layer 11: Meta-Orchestration shutdown');
  }
}
