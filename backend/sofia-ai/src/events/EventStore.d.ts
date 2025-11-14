/**
 * Event Store - Event Sourcing Implementation
 *
 * Todos os eventos do sistema são armazenados imutavelmente
 * Permite replay, debugging, auditoria completa
 */
import { Redis } from 'ioredis';
import { EventEmitter } from 'events';
export interface SystemEvent {
    id: string;
    type: string;
    layer: number;
    aggregate: string;
    aggregateId: string;
    data: any;
    metadata: {
        timestamp: Date;
        correlationId?: string;
        causationId?: string;
        userId?: string;
        tenantId?: string;
    };
}
export declare class EventStore extends EventEmitter {
    private redis;
    private eventBuffer;
    private flushInterval;
    constructor(redis: Redis);
    initialize(): Promise<void>;
    /**
     * Append event to store
     */
    append(event: Omit<SystemEvent, 'id' | 'metadata'>): Promise<SystemEvent>;
    /**
     * Flush buffer to Redis
     */
    private flush;
    /**
     * Get events for aggregate
     */
    getAggregateEvents(aggregate: string, aggregateId: string, from?: number): Promise<SystemEvent[]>;
    /**
     * Get events by type
     */
    getEventsByType(type: string, limit?: number): Promise<SystemEvent[]>;
    /**
     * Get events by layer
     */
    getLayerEvents(layer: number, limit?: number): Promise<SystemEvent[]>;
    /**
     * Get event by ID
     */
    private getEventById;
    /**
     * Replay events
     */
    replay(aggregate: string, aggregateId: string, handler: (event: SystemEvent) => Promise<void>): Promise<void>;
    /**
     * Get event statistics
     */
    getStats(): Promise<any>;
    /**
     * Parse stream entry
     */
    private parseStreamEntry;
    /**
     * Start auto-flush
     */
    private startAutoFlush;
    /**
     * Generate event ID
     */
    private generateEventId;
    /**
     * Generate correlation ID
     */
    private generateCorrelationId;
    /**
     * Shutdown
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=EventStore.d.ts.map