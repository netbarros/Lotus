"use strict";
/**
 * Event Store - Event Sourcing Implementation
 *
 * Todos os eventos do sistema são armazenados imutavelmente
 * Permite replay, debugging, auditoria completa
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStore = void 0;
const events_1 = require("events");
const logger_1 = require("../utils/logger");
class EventStore extends events_1.EventEmitter {
    redis;
    eventBuffer = [];
    flushInterval = null;
    constructor(redis) {
        super();
        this.redis = redis;
    }
    async initialize() {
        logger_1.logger.info('📦 Event Store: Initializing...');
        // Start auto-flush
        this.startAutoFlush();
        logger_1.logger.info('✅ Event Store: Active');
    }
    /**
     * Append event to store
     */
    async append(event) {
        const fullEvent = {
            ...event,
            id: this.generateEventId(),
            metadata: {
                timestamp: new Date(),
                correlationId: this.generateCorrelationId(),
            },
        };
        // Add to buffer
        this.eventBuffer.push(fullEvent);
        // Emit for real-time subscribers
        this.emit('event', fullEvent);
        // Flush if buffer is large
        if (this.eventBuffer.length >= 100) {
            await this.flush();
        }
        logger_1.logger.info(`📝 Event: ${fullEvent.type} (Layer ${fullEvent.layer})`);
        return fullEvent;
    }
    /**
     * Flush buffer to Redis
     */
    async flush() {
        if (this.eventBuffer.length === 0)
            return;
        const pipeline = this.redis.pipeline();
        for (const event of this.eventBuffer) {
            // Store in global stream
            pipeline.xadd('events:stream', '*', 'event', JSON.stringify(event));
            // Store in aggregate stream
            pipeline.xadd(`events:${event.aggregate}:${event.aggregateId}`, '*', 'event', JSON.stringify(event));
            // Store in layer stream
            pipeline.xadd(`events:layer:${event.layer}`, '*', 'event', JSON.stringify(event));
            // Index by type
            pipeline.sadd(`events:type:${event.type}`, event.id);
            // Index by timestamp
            const date = new Date(event.metadata.timestamp);
            const dateKey = date.toISOString().split('T')[0];
            pipeline.sadd(`events:date:${dateKey}`, event.id);
        }
        await pipeline.exec();
        logger_1.logger.info(`💾 Event Store: Flushed ${this.eventBuffer.length} events`);
        this.eventBuffer = [];
    }
    /**
     * Get events for aggregate
     */
    async getAggregateEvents(aggregate, aggregateId, from = 0) {
        const stream = `events:${aggregate}:${aggregateId}`;
        const results = await this.redis.xrange(stream, from.toString(), '+');
        return results.map(([id, fields]) => {
            const eventStr = fields[1];
            return JSON.parse(eventStr);
        });
    }
    /**
     * Get events by type
     */
    async getEventsByType(type, limit = 100) {
        const eventIds = await this.redis.smembers(`events:type:${type}`);
        const events = [];
        for (const id of eventIds.slice(0, limit)) {
            const event = await this.getEventById(id);
            if (event)
                events.push(event);
        }
        return events.sort((a, b) => b.metadata.timestamp.getTime() - a.metadata.timestamp.getTime());
    }
    /**
     * Get events by layer
     */
    async getLayerEvents(layer, limit = 100) {
        const stream = `events:layer:${layer}`;
        const results = await this.redis.xrevrange(stream, '+', '-', 'COUNT', limit);
        return results.map(([id, fields]) => {
            const eventStr = fields[1];
            const event = JSON.parse(eventStr);
            event.metadata.timestamp = new Date(event.metadata.timestamp);
            return event;
        });
    }
    /**
     * Get event by ID
     */
    async getEventById(id) {
        // Search in global stream
        const results = await this.redis.xrange('events:stream', id, id);
        if (results.length === 0)
            return null;
        const eventStr = results[0][1][1];
        const event = JSON.parse(eventStr);
        event.metadata.timestamp = new Date(event.metadata.timestamp);
        return event;
    }
    /**
     * Replay events
     */
    async replay(aggregate, aggregateId, handler) {
        logger_1.logger.info(`🔄 Replaying events for ${aggregate}:${aggregateId}`);
        const events = await this.getAggregateEvents(aggregate, aggregateId);
        for (const event of events) {
            await handler(event);
        }
        logger_1.logger.info(`✅ Replayed ${events.length} events`);
    }
    /**
     * Get event statistics
     */
    async getStats() {
        const streamInfo = await this.redis.xinfo('STREAM', 'events:stream');
        const totalEvents = streamInfo.find((item) => item === 'length');
        const firstEntry = streamInfo.find((item) => item === 'first-entry');
        const lastEntry = streamInfo.find((item) => item === 'last-entry');
        return {
            totalEvents: totalEvents ? streamInfo[streamInfo.indexOf(totalEvents) + 1] : 0,
            firstEvent: firstEntry
                ? this.parseStreamEntry(streamInfo[streamInfo.indexOf(firstEntry) + 1])
                : null,
            lastEvent: lastEntry
                ? this.parseStreamEntry(streamInfo[streamInfo.indexOf(lastEntry) + 1])
                : null,
            bufferSize: this.eventBuffer.length,
        };
    }
    /**
     * Parse stream entry
     */
    parseStreamEntry(entry) {
        if (!entry || entry.length < 2)
            return null;
        try {
            const eventStr = entry[1][1];
            return JSON.parse(eventStr);
        }
        catch {
            return null;
        }
    }
    /**
     * Start auto-flush
     */
    startAutoFlush() {
        this.flushInterval = setInterval(async () => {
            await this.flush();
        }, 10000); // Every 10 seconds
    }
    /**
     * Generate event ID
     */
    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Generate correlation ID
     */
    generateCorrelationId() {
        return `cor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Shutdown
     */
    async shutdown() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
        // Final flush
        await this.flush();
        logger_1.logger.info('🛑 Event Store: Shutdown');
    }
}
exports.EventStore = EventStore;
//# sourceMappingURL=EventStore.js.map