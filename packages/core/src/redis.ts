/**
 * @magicsaas/core - Redis Client Factory
 * 
 * Centralized Redis client creation with connection pooling,
 * health checks, and error handling.
 */

import Redis, { type RedisOptions } from 'ioredis';
import { createLogger, type Logger } from './logger.js';

export interface RedisConfig {
    /** Redis connection URL or options */
    url?: string;
    /** Host (default: localhost) */
    host?: string;
    /** Port (default: 6379) */
    port?: number;
    /** Password (optional) */
    password?: string;
    /** Database index (default: 0) */
    db?: number;
    /** Key prefix for namespacing */
    keyPrefix?: string;
    /** Max retries on connection failure */
    maxRetries?: number;
    /** Logger instance */
    logger?: Logger;
}

export interface RedisClient {
    /** The underlying ioredis client */
    client: Redis;
    /** Check connection health */
    healthCheck(): Promise<boolean>;
    /** Graceful disconnect */
    disconnect(): Promise<void>;
    /** Get with optional JSON parsing */
    getJson<T>(key: string): Promise<T | null>;
    /** Set with optional TTL and JSON serialization */
    setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    /** Delete key(s) */
    del(...keys: string[]): Promise<number>;
    /** Publish to channel */
    publish(channel: string, message: unknown): Promise<number>;
}

/**
 * Creates a Redis client with enhanced functionality
 */
export function createRedisClient(config: RedisConfig = {}): RedisClient {
    const logger = config.logger || createLogger({ service: 'redis-client' });

    const options: RedisOptions = config.url
        ? { lazyConnect: true }
        : {
            host: config.host || 'localhost',
            port: config.port || 6379,
            password: config.password,
            db: config.db || 0,
            keyPrefix: config.keyPrefix,
            maxRetriesPerRequest: config.maxRetries || 3,
            lazyConnect: true,
            retryStrategy: (times) => {
                if (times > (config.maxRetries || 10)) {
                    logger.error({ times }, 'Redis max retries exceeded');
                    return null;
                }
                return Math.min(times * 100, 3000);
            },
        };

    const client = config.url ? new Redis(config.url, options) : new Redis(options);

    client.on('error', (err) => {
        logger.error({ err }, 'Redis connection error');
    });

    client.on('connect', () => {
        logger.info('Redis connected');
    });

    client.on('ready', () => {
        logger.debug('Redis ready');
    });

    return {
        client,

        async healthCheck(): Promise<boolean> {
            try {
                const pong = await client.ping();
                return pong === 'PONG';
            } catch (err) {
                logger.error({ err }, 'Redis health check failed');
                return false;
            }
        },

        async disconnect(): Promise<void> {
            await client.quit();
            logger.info('Redis disconnected');
        },

        async getJson<T>(key: string): Promise<T | null> {
            const value = await client.get(key);
            if (!value) return null;
            try {
                return JSON.parse(value) as T;
            } catch {
                logger.warn({ key }, 'Failed to parse JSON from Redis');
                return null;
            }
        },

        async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
            const serialized = JSON.stringify(value);
            if (ttlSeconds) {
                await client.setex(key, ttlSeconds, serialized);
            } else {
                await client.set(key, serialized);
            }
        },

        async del(...keys: string[]): Promise<number> {
            if (keys.length === 0) return 0;
            return client.del(...keys);
        },

        async publish(channel: string, message: unknown): Promise<number> {
            const payload = typeof message === 'string' ? message : JSON.stringify(message);
            return client.publish(channel, payload);
        },
    };
}

export { Redis };
