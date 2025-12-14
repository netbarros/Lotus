/**
 * @magicsaas/core - Logger Configuration
 * 
 * Centralized logging using Pino with structured output
 * for all MagicSaaS packages.
 */

import pino from 'pino';

export interface LoggerConfig {
    /** Service name for log identification */
    service: string;
    /** Log level: trace, debug, info, warn, error, fatal */
    level?: string;
    /** Pretty print for development */
    pretty?: boolean;
    /** Additional base fields */
    base?: Record<string, unknown>;
}

/**
 * Creates a configured Pino logger instance
 */
export function createLogger(config: LoggerConfig): pino.Logger {
    const { service, level = 'info', pretty = false, base = {} } = config;

    const transport = pretty
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        }
        : undefined;

    return pino({
        name: service,
        level,
        base: {
            service,
            env: process.env.NODE_ENV || 'development',
            ...base,
        },
        transport,
        formatters: {
            level: (label) => ({ level: label }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
    });
}

/**
 * Default logger instance for quick usage
 */
export const defaultLogger = createLogger({
    service: 'magicsaas',
    level: process.env.LOG_LEVEL || 'info',
    pretty: process.env.NODE_ENV !== 'production',
});

/**
 * Child logger factory for component-specific logging
 */
export function childLogger(
    parent: pino.Logger,
    bindings: Record<string, unknown>
): pino.Logger {
    return parent.child(bindings);
}

export type Logger = pino.Logger;
