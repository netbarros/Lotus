/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 📝 DECISION LOGGER - Complete Decision Tracking & Analytics              ║
 * ║ Logs all Sofia AI decisions with full context and reasoning              ║
 * ║ Part of Cognitive Mesh OS - System 11                                    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { logger } from '../utils/logger.js';
import { EventStore } from '../events/EventStore.js';
import type { Redis } from 'ioredis';
import type { DirectusOrchestrator } from '../integrations/DirectusOrchestrator.js';

/**
 * Decision types Sofia AI makes
 */
export type DecisionType =
  | 'component-selection'
  | 'architecture-choice'
  | 'technology-stack'
  | 'ux-improvement'
  | 'performance-optimization'
  | 'security-enhancement'
  | 'feature-implementation'
  | 'code-generation'
  | 'resource-allocation'
  | 'scaling-strategy';

/**
 * Decision made by Sofia AI
 */
export interface Decision {
  id: string;
  type: DecisionType;
  timestamp: Date;
  context: {
    intentionId?: string;
    tenantId?: string;
    userId?: string;
    componentName?: string;
    feature?: string;
    [key: string]: any;
  };
  options: Array<{
    id: string;
    name: string;
    description: string;
    pros: string[];
    cons: string[];
    score: number;
    metrics?: Record<string, number>;
  }>;
  selected: {
    optionId: string;
    optionName: string;
    confidence: number; // 0-100
  };
  reasoning: {
    primary: string;
    factors: Array<{
      factor: string;
      weight: number;
      impact: string;
    }>;
    tradeoffs: string[];
    alternatives: string[];
  };
  analysis: {
    traditional?: { score: number; rationale: string };
    ml?: { score: number; model: string };
    ai?: { score: number; model: string };
    combined: { score: number; weights: Record<string, number> };
  };
  validation: {
    preValidation?: {
      passed: boolean;
      checks: string[];
    };
    postValidation?: {
      passed: boolean;
      actual: any;
      expected: any;
    };
  };
  feedback?: {
    userRating?: number;
    userComment?: string;
    actualOutcome?: 'success' | 'partial' | 'failed';
    metrics?: Record<string, number>;
  };
  metadata: {
    layer: string;
    correlationId?: string;
    parentDecisionId?: string;
    impactedSystems: string[];
    estimatedImpact: 'low' | 'medium' | 'high' | 'critical';
  };
}

/**
 * Suggestion for improvement
 */
export interface Suggestion {
  id: string;
  category: 'ux' | 'performance' | 'security' | 'feature' | 'refactoring' | 'documentation';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  researchData?: {
    sources: string[];
    competitorAnalysis?: any;
    bestPractices?: string[];
    benchmarks?: Record<string, number>;
  };
  status: 'pending' | 'validated' | 'approved' | 'rejected' | 'implemented';
  validation?: {
    validatedBy?: string;
    validatedAt?: Date;
    validationNotes?: string;
    approvalReason?: string;
  };
  implementation?: {
    implementedBy?: string;
    implementedAt?: Date;
    commitHash?: string;
    results?: any;
  };
  tenantId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Decision analytics
 */
export interface DecisionAnalytics {
  total: number;
  byType: Record<DecisionType, number>;
  averageConfidence: number;
  successRate: number;
  topReasons: Array<{ reason: string; count: number }>;
  timeDistribution: Record<string, number>;
  impactDistribution: Record<string, number>;
}

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ DECISION LOGGER - Complete Audit Trail                                   ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
export class DecisionLogger {
  private redis: Redis;
  private eventStore: EventStore;
  private directus: DirectusOrchestrator;

  constructor(redis: Redis, eventStore: EventStore, directus: DirectusOrchestrator) {
    this.redis = redis;
    this.eventStore = eventStore;
    this.directus = directus;
  }

  /**
   * Log a decision made by Sofia AI
   */
  async logDecision(decision: Omit<Decision, 'id' | 'timestamp'>): Promise<Decision> {
    const fullDecision: Decision = {
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...decision,
    };

    logger.info('📝 Logging decision', {
      id: fullDecision.id,
      type: fullDecision.type,
      selected: fullDecision.selected.optionName,
      confidence: fullDecision.selected.confidence,
    });

    // Store in Redis for quick access
    await this.redis.setex(
      `decision:${fullDecision.id}`,
      86400 * 30, // 30 days
      JSON.stringify(fullDecision)
    );

    // Add to sorted set for time-based queries
    await this.redis.zadd('decisions:timeline', fullDecision.timestamp.getTime(), fullDecision.id);

    // Add to type index
    await this.redis.sadd(`decisions:type:${fullDecision.type}`, fullDecision.id);

    // Store in Event Store (immutable audit log)
    await this.eventStore.append({
      id: fullDecision.id,
      type: 'decision.made',
      aggregate: 'decision',
      aggregateId: fullDecision.id,
      timestamp: fullDecision.timestamp,
      version: 1,
      data: fullDecision,
      metadata: {
        ...fullDecision.metadata,
        tenantId: fullDecision.context.tenantId,
        userId: fullDecision.context.userId,
        layer: 'decision-logger',
      },
    });

    // Store in Directus for long-term analytics
    await this.directus.create('sofia_decisions', {
      id: fullDecision.id,
      decision_type: fullDecision.type,
      context: fullDecision.context,
      options_evaluated: fullDecision.options,
      selected_option: fullDecision.selected.optionName,
      reasoning: fullDecision.reasoning.primary,
      confidence: fullDecision.selected.confidence,
      validation_score: fullDecision.analysis.combined.score,
      feedback: fullDecision.feedback,
      created_at: fullDecision.timestamp,
    });

    logger.info('✅ Decision logged successfully', { id: fullDecision.id });

    return fullDecision;
  }

  /**
   * Get decision by ID
   */
  async getDecision(decisionId: string): Promise<Decision | null> {
    // Try Redis first
    const cached = await this.redis.get(`decision:${decisionId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fallback to Directus
    const decisions = await this.directus.query('sofia_decisions', {
      filter: { id: { _eq: decisionId } },
      limit: 1,
    });

    return decisions.length > 0 ? decisions[0] : null;
  }

  /**
   * Get recent decisions
   */
  async getRecentDecisions(limit: number = 100): Promise<Decision[]> {
    // Get decision IDs from sorted set (most recent first)
    const ids = await this.redis.zrevrange('decisions:timeline', 0, limit - 1);

    // Fetch full decisions
    const decisions = await Promise.all(ids.map((id) => this.getDecision(id)));

    return decisions.filter((d): d is Decision => d !== null);
  }

  /**
   * Get decisions by type
   */
  async getDecisionsByType(type: DecisionType, limit: number = 50): Promise<Decision[]> {
    // Get decision IDs for this type
    const ids = await this.redis.smembers(`decisions:type:${type}`);

    // Fetch full decisions (limited)
    const decisions = await Promise.all(ids.slice(0, limit).map((id) => this.getDecision(id)));

    return decisions.filter((d): d is Decision => d !== null);
  }

  /**
   * Update decision with feedback
   */
  async addFeedback(decisionId: string, feedback: Decision['feedback']): Promise<void> {
    logger.info('📊 Adding feedback to decision', { decisionId });

    const decision = await this.getDecision(decisionId);
    if (!decision) {
      throw new Error(`Decision not found: ${decisionId}`);
    }

    decision.feedback = feedback;

    // Update in Redis
    await this.redis.setex(`decision:${decisionId}`, 86400 * 30, JSON.stringify(decision));

    // Update in Directus
    await this.directus.update('sofia_decisions', decisionId, {
      feedback,
    });

    // Log feedback event
    await this.eventStore.append({
      id: `decision-feedback-${Date.now()}`,
      type: 'decision.feedback.added',
      aggregate: 'decision',
      aggregateId: decisionId,
      timestamp: new Date(),
      version: 1,
      data: { decisionId, feedback },
      metadata: {
        tenantId: decision.context.tenantId,
        layer: 'decision-logger',
      },
    });

    logger.info('✅ Feedback added', { decisionId });
  }

  /**
   * Get decision analytics
   */
  async getAnalytics(timeRange?: { start: Date; end: Date }): Promise<DecisionAnalytics> {
    logger.info('📊 Generating decision analytics');

    const startTime = timeRange?.start.getTime() || 0;
    const endTime = timeRange?.end.getTime() || Date.now();

    // Get decision IDs in time range
    const ids = await this.redis.zrangebyscore('decisions:timeline', startTime, endTime);

    // Fetch decisions
    const decisions = await Promise.all(ids.map((id) => this.getDecision(id)));

    const validDecisions = decisions.filter((d): d is Decision => d !== null);

    // Calculate analytics
    const analytics: DecisionAnalytics = {
      total: validDecisions.length,
      byType: {} as Record<DecisionType, number>,
      averageConfidence: 0,
      successRate: 0,
      topReasons: [],
      timeDistribution: {},
      impactDistribution: {},
    };

    // By type
    for (const decision of validDecisions) {
      analytics.byType[decision.type] = (analytics.byType[decision.type] || 0) + 1;
    }

    // Average confidence
    if (validDecisions.length > 0) {
      analytics.averageConfidence =
        validDecisions.reduce((sum, d) => sum + d.selected.confidence, 0) / validDecisions.length;
    }

    // Success rate (based on feedback)
    const withFeedback = validDecisions.filter((d) => d.feedback?.actualOutcome);
    if (withFeedback.length > 0) {
      const successful = withFeedback.filter((d) => d.feedback?.actualOutcome === 'success');
      analytics.successRate = (successful.length / withFeedback.length) * 100;
    }

    // Top reasons
    const reasonCounts = new Map<string, number>();
    for (const decision of validDecisions) {
      const reason = decision.reasoning.primary;
      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
    }
    analytics.topReasons = Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Impact distribution
    for (const decision of validDecisions) {
      const impact = decision.metadata.estimatedImpact;
      analytics.impactDistribution[impact] = (analytics.impactDistribution[impact] || 0) + 1;
    }

    return analytics;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUGGESTIONS MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Log a suggestion for improvement
   */
  async logSuggestion(
    suggestion: Omit<Suggestion, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<Suggestion> {
    const fullSuggestion: Suggestion = {
      id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...suggestion,
    };

    logger.info('💡 Logging suggestion', {
      id: fullSuggestion.id,
      category: fullSuggestion.category,
      title: fullSuggestion.title,
      priority: fullSuggestion.priority,
    });

    // Store in Redis
    await this.redis.setex(
      `suggestion:${fullSuggestion.id}`,
      86400 * 90, // 90 days
      JSON.stringify(fullSuggestion)
    );

    // Add to category index
    await this.redis.sadd(`suggestions:category:${fullSuggestion.category}`, fullSuggestion.id);

    // Add to priority index
    await this.redis.sadd(`suggestions:priority:${fullSuggestion.priority}`, fullSuggestion.id);

    // Store in Directus
    await this.directus.create('sofia_suggestions', fullSuggestion);

    // Log event
    await this.eventStore.append({
      id: fullSuggestion.id,
      type: 'suggestion.created',
      aggregate: 'suggestion',
      aggregateId: fullSuggestion.id,
      timestamp: fullSuggestion.createdAt,
      version: 1,
      data: fullSuggestion,
      metadata: {
        tenantId: fullSuggestion.tenantId,
        layer: 'decision-logger',
      },
    });

    logger.info('✅ Suggestion logged', { id: fullSuggestion.id });

    return fullSuggestion;
  }

  /**
   * Get suggestion by ID
   */
  async getSuggestion(suggestionId: string): Promise<Suggestion | null> {
    const cached = await this.redis.get(`suggestion:${suggestionId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const suggestions = await this.directus.query('sofia_suggestions', {
      filter: { id: { _eq: suggestionId } },
      limit: 1,
    });

    return suggestions.length > 0 ? suggestions[0] : null;
  }

  /**
   * Get suggestions by category
   */
  async getSuggestionsByCategory(
    category: Suggestion['category'],
    status?: Suggestion['status']
  ): Promise<Suggestion[]> {
    const ids = await this.redis.smembers(`suggestions:category:${category}`);

    const suggestions = await Promise.all(ids.map((id) => this.getSuggestion(id)));

    let filtered = suggestions.filter((s): s is Suggestion => s !== null);

    if (status) {
      filtered = filtered.filter((s) => s.status === status);
    }

    return filtered;
  }

  /**
   * Validate a suggestion
   */
  async validateSuggestion(
    suggestionId: string,
    validation: Suggestion['validation']
  ): Promise<void> {
    logger.info('✅ Validating suggestion', { suggestionId });

    const suggestion = await this.getSuggestion(suggestionId);
    if (!suggestion) {
      throw new Error(`Suggestion not found: ${suggestionId}`);
    }

    suggestion.status = 'validated';
    suggestion.validation = validation;
    suggestion.updatedAt = new Date();

    // Update in Redis
    await this.redis.setex(`suggestion:${suggestionId}`, 86400 * 90, JSON.stringify(suggestion));

    // Update in Directus
    await this.directus.update('sofia_suggestions', suggestionId, {
      status: 'validated',
      validation,
      validated_at: new Date(),
    });

    // Log event
    await this.eventStore.append({
      id: `suggestion-validated-${Date.now()}`,
      type: 'suggestion.validated',
      aggregate: 'suggestion',
      aggregateId: suggestionId,
      timestamp: new Date(),
      version: 1,
      data: { suggestionId, validation },
      metadata: {
        tenantId: suggestion.tenantId,
        layer: 'decision-logger',
      },
    });
  }

  /**
   * Mark suggestion as implemented
   */
  async markImplemented(
    suggestionId: string,
    implementation: Suggestion['implementation']
  ): Promise<void> {
    logger.info('🚀 Marking suggestion as implemented', { suggestionId });

    const suggestion = await this.getSuggestion(suggestionId);
    if (!suggestion) {
      throw new Error(`Suggestion not found: ${suggestionId}`);
    }

    suggestion.status = 'implemented';
    suggestion.implementation = implementation;
    suggestion.updatedAt = new Date();

    // Update in Redis
    await this.redis.setex(`suggestion:${suggestionId}`, 86400 * 90, JSON.stringify(suggestion));

    // Update in Directus
    await this.directus.update('sofia_suggestions', suggestionId, {
      status: 'implemented',
      implementation,
      implemented_at: implementation.implementedAt,
    });

    // Log event
    await this.eventStore.append({
      id: `suggestion-implemented-${Date.now()}`,
      type: 'suggestion.implemented',
      aggregate: 'suggestion',
      aggregateId: suggestionId,
      timestamp: new Date(),
      version: 1,
      data: { suggestionId, implementation },
      metadata: {
        tenantId: suggestion.tenantId,
        layer: 'decision-logger',
      },
    });
  }
}
