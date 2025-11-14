/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 📊 LANGFUSE SERVICE - ML OBSERVABILITY & TRACING                         ║
 * ║ Sofia AI v4.0 - Complete Langfuse Integration                            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Langfuse provides:
 * - ML observability and monitoring
 * - Trace and span tracking
 * - Prompt management and versioning
 * - Metrics collection
 * - Performance analytics
 */
import type { Redis } from 'ioredis';
import type { EventStore } from '../events/EventStore.js';
/**
 * Langfuse configuration
 */
export interface LangfuseConfig {
    publicKey: string;
    secretKey: string;
    host?: string;
    enabled?: boolean;
}
/**
 * Langfuse trace
 */
export interface LangfuseTrace {
    id: string;
    name: string;
    userId?: string;
    metadata?: Record<string, any>;
    startTime: Date;
    endTime?: Date;
    spans: LangfuseSpan[];
}
/**
 * Langfuse span
 */
export interface LangfuseSpan {
    id: string;
    name: string;
    input?: any;
    output?: any;
    metadata?: Record<string, any>;
    startTime: Date;
    endTime?: Date;
    latencyMs?: number;
}
/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ LANGFUSE SERVICE                                                         ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
export declare class LangfuseService {
    private config;
    private redis;
    private eventStore;
    private isInitialized;
    private traces;
    private traceCount;
    private spanCount;
    constructor(config: LangfuseConfig, redis: Redis, eventStore: EventStore);
    /**
     * Initialize Langfuse service
     */
    initialize(): Promise<void>;
    /**
     * Start a new trace
     */
    startTrace(options: {
        name: string;
        userId?: string;
        tenantId?: string;
        metadata?: Record<string, any>;
    }): string;
    /**
     * Add a span to a trace
     */
    addSpan(traceId: string, options: {
        name: string;
        input?: any;
        output?: any;
        metadata?: Record<string, any>;
    }): string;
    /**
     * End a span
     */
    endSpan(traceId: string, spanId: string, output?: any): void;
    /**
     * End a trace
     */
    endTrace(traceId: string, options?: {
        metadata?: Record<string, any>;
        output?: any;
    }): Promise<void>;
    /**
     * Get trace by ID
     */
    getTrace(traceId: string): LangfuseTrace | undefined;
    /**
     * Get recent traces
     */
    getRecentTraces(limit?: number): LangfuseTrace[];
    /**
     * Get analytics
     */
    getAnalytics(): Promise<{
        totalTraces: number;
        totalSpans: number;
        averageSpansPerTrace: number;
        traces: LangfuseTrace[];
    }>;
    /**
     * Get service statistics
     */
    getStatistics(): {
        traceCount: number;
        spanCount: number;
        activeTraces: number;
    };
    /**
     * Get health status
     */
    getHealth(): {
        status: 'healthy' | 'unhealthy';
        initialized: boolean;
        enabled: boolean;
        statistics: ReturnType<typeof this.getStatistics>;
    };
    /**
     * Utility: Create trace and span wrapper
     */
    traceExecution<T>(options: {
        name: string;
        userId?: string;
        tenantId?: string;
        metadata?: Record<string, any>;
    }, fn: (traceId: string, addSpan: (name: string, input?: any) => string) => Promise<T>): Promise<T>;
}
//# sourceMappingURL=LangfuseService.d.ts.map