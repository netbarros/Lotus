/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🔗 LANGCHAIN SERVICE - AI ORCHESTRATION FRAMEWORK                        ║
 * ║ Sofia AI v4.0 - Complete LangChain Integration                           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * LangChain provides:
 * - AI chain orchestration
 * - Prompt management
 * - Memory management
 * - Tool integration
 * - Output parsing
 */
import type { Redis } from 'ioredis';
import type { EventStore } from '../events/EventStore.js';
/**
 * LangChain configuration
 */
export interface LangChainConfig {
    anthropicApiKey: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    enableTracing?: boolean;
    tracingEndpoint?: string;
}
/**
 * LangChain chain execution result
 */
export interface ChainResult {
    output: any;
    metadata: {
        tokensUsed: number;
        latencyMs: number;
        model: string;
        traceId?: string;
    };
}
/**
 * LangChain prompt template
 */
export interface PromptTemplate {
    template: string;
    inputVariables: string[];
    outputParser?: 'json' | 'text' | 'structured';
}
/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ LANGCHAIN SERVICE                                                        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
export declare class LangChainService {
    private config;
    private redis;
    private eventStore;
    private isInitialized;
    private chains;
    private executionCount;
    private totalLatency;
    private totalTokens;
    constructor(config: LangChainConfig, redis: Redis, eventStore: EventStore);
    /**
     * Initialize LangChain service
     */
    initialize(): Promise<void>;
    /**
     * Register a new chain
     */
    registerChain(name: string, template: PromptTemplate): void;
    /**
     * Execute a chain
     */
    executeChain(chainName: string, inputs: Record<string, any>, options?: {
        tenantId?: string;
        userId?: string;
        metadata?: Record<string, any>;
    }): Promise<ChainResult>;
    /**
     * Execute a raw prompt
     */
    private executePrompt;
    /**
     * Parse output based on parser type
     */
    private parseOutput;
    /**
     * Load chains from Redis
     */
    private loadChains;
    /**
     * Register default chains
     */
    private registerDefaultChains;
    /**
     * Get service statistics
     */
    getStatistics(): {
        executionCount: number;
        averageLatencyMs: number;
        totalTokens: number;
        chainsRegistered: number;
    };
    /**
     * Get health status
     */
    getHealth(): {
        status: 'healthy' | 'unhealthy';
        initialized: boolean;
        chainsRegistered: number;
        statistics: ReturnType<typeof this.getStatistics>;
    };
}
//# sourceMappingURL=LangChainService.d.ts.map