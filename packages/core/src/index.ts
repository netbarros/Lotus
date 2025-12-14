/**
 * @magicsaas/core - Main Entry Point
 * 
 * Centralized exports for all core utilities used
 * across MagicSaaS packages and pétalas.
 */

// Logger
export {
    createLogger,
    defaultLogger,
    childLogger,
    type Logger,
    type LoggerConfig,
} from './logger.js';

// Redis
export {
    createRedisClient,
    Redis,
    type RedisClient,
    type RedisConfig,
} from './redis.js';

// Errors
export {
    MagicSaaSError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    ExternalServiceError,
    RateLimitError,
    isMagicSaaSError,
    isOperationalError,
    wrapError,
} from './errors.js';

// Common Types
export interface TenantContext {
    tenantId: string;
    userId?: string;
    role?: string;
}

export interface PaginationOptions {
    page?: number;
    limit?: number;
    offset?: number;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    service: string;
    timestamp: Date;
    details?: Record<string, unknown>;
}

// Utility Functions
export function generateId(): string {
    return crypto.randomUUID();
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function retry<T>(
    fn: () => Promise<T>,
    options: {
        attempts?: number;
        delay?: number;
        backoff?: number;
    } = {}
): Promise<T> {
    const { attempts = 3, delay = 1000, backoff = 2 } = options;

    return new Promise((resolve, reject) => {
        let attempt = 0;

        const tryFn = async () => {
            try {
                const result = await fn();
                resolve(result);
            } catch (error) {
                attempt++;
                if (attempt >= attempts) {
                    reject(error);
                } else {
                    const waitTime = delay * Math.pow(backoff, attempt - 1);
                    setTimeout(tryFn, waitTime);
                }
            }
        };

        tryFn();
    });
}

// Package info
export const VERSION = '1.0.0';
export const PACKAGE_NAME = '@magicsaas/core';
// Auth
export * from './auth.js';

// Database
export * from './db.js';

// Context
export * from './context.js';
