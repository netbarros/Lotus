/**
 * Telemetry & Metrics
 * Prometheus-compatible metrics para observabilidade completa
 */

import { Registry, Counter, Gauge, Histogram, Summary } from 'prom-client';
import { logger } from '../utils/logger';

export class Metrics {
  private registry: Registry;

  // Counters
  public eventsTotal: Counter;
  public decisionsTotal: Counter;
  public errorsTotal: Counter;
  public optimizationsTotal: Counter;

  // Gauges
  public activeComponents: Gauge;
  public queueSize: Gauge;
  public cacheHitRate: Gauge;
  public systemHealth: Gauge;

  // Histograms
  public decisionLatency: Histogram;
  public analysisLatency: Histogram;
  public eventProcessingTime: Histogram;

  // Summaries
  public componentQuality: Summary;
  public learningAccuracy: Summary;

  constructor() {
    this.registry = new Registry();

    // Initialize metrics
    this.eventsTotal = new Counter({
      name: 'sofia_events_total',
      help: 'Total number of events processed',
      labelNames: ['layer', 'type'],
      registers: [this.registry],
    });

    this.decisionsTotal = new Counter({
      name: 'sofia_decisions_total',
      help: 'Total number of decisions made',
      labelNames: ['component', 'demo'],
      registers: [this.registry],
    });

    this.errorsTotal = new Counter({
      name: 'sofia_errors_total',
      help: 'Total number of errors',
      labelNames: ['layer', 'type'],
      registers: [this.registry],
    });

    this.optimizationsTotal = new Counter({
      name: 'sofia_optimizations_total',
      help: 'Total number of optimizations triggered',
      labelNames: ['type', 'layer'],
      registers: [this.registry],
    });

    this.activeComponents = new Gauge({
      name: 'sofia_active_components',
      help: 'Number of active components',
      registers: [this.registry],
    });

    this.queueSize = new Gauge({
      name: 'sofia_queue_size',
      help: 'Size of processing queue',
      labelNames: ['queue'],
      registers: [this.registry],
    });

    this.cacheHitRate = new Gauge({
      name: 'sofia_cache_hit_rate',
      help: 'Cache hit rate',
      registers: [this.registry],
    });

    this.systemHealth = new Gauge({
      name: 'sofia_system_health',
      help: 'Overall system health (0-1)',
      registers: [this.registry],
    });

    this.decisionLatency = new Histogram({
      name: 'sofia_decision_latency_ms',
      help: 'Decision making latency in milliseconds',
      labelNames: ['component'],
      buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
      registers: [this.registry],
    });

    this.analysisLatency = new Histogram({
      name: 'sofia_analysis_latency_ms',
      help: 'Component analysis latency in milliseconds',
      labelNames: ['type'],
      buckets: [50, 100, 250, 500, 1000, 2500, 5000],
      registers: [this.registry],
    });

    this.eventProcessingTime = new Histogram({
      name: 'sofia_event_processing_ms',
      help: 'Event processing time in milliseconds',
      labelNames: ['event_type'],
      buckets: [1, 5, 10, 25, 50, 100, 250, 500],
      registers: [this.registry],
    });

    this.componentQuality = new Summary({
      name: 'sofia_component_quality',
      help: 'Component quality scores',
      labelNames: ['demo', 'component'],
      percentiles: [0.5, 0.9, 0.95, 0.99],
      registers: [this.registry],
    });

    this.learningAccuracy = new Summary({
      name: 'sofia_learning_accuracy',
      help: 'Learning model accuracy',
      labelNames: ['model'],
      percentiles: [0.5, 0.9, 0.95, 0.99],
      registers: [this.registry],
    });

    logger.info('📊 Metrics: Initialized Prometheus metrics');
  }

  /**
   * Get metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Get metrics as JSON
   */
  async getMetricsJSON(): Promise<any> {
    const metrics = await this.registry.getMetricsAsJSON();
    return metrics;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.registry.resetMetrics();
    logger.info('📊 Metrics: Reset all metrics');
  }
}

// Singleton instance
export const metrics = new Metrics();
