/**
 * @magicsaas/core - Error Handling
 * 
 * Standardized error classes for consistent error handling
 * across all MagicSaaS packages.
 */

/**
 * Base error class for all MagicSaaS errors
 */
export class MagicSaaSError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly details?: Record<string, unknown>;
    public readonly timestamp: Date;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        options: {
            code?: string;
            statusCode?: number;
            details?: Record<string, unknown>;
            isOperational?: boolean;
            cause?: Error;
        } = {}
    ) {
        super(message, { cause: options.cause });
        this.name = this.constructor.name;
        this.code = options.code || 'MAGICSAAS_ERROR';
        this.statusCode = options.statusCode || 500;
        this.details = options.details;
        this.timestamp = new Date();
        this.isOperational = options.isOperational ?? true;

        Error.captureStackTrace(this, this.constructor);
    }

    toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            details: this.details,
            timestamp: this.timestamp.toISOString(),
        };
    }
}

/**
 * Validation error for input/schema validation failures
 */
export class ValidationError extends MagicSaaSError {
    constructor(
        message: string,
        details?: Record<string, unknown>
    ) {
        super(message, {
            code: 'VALIDATION_ERROR',
            statusCode: 400,
            details,
        });
    }
}

/**
 * Not found error
 */
export class NotFoundError extends MagicSaaSError {
    constructor(
        resource: string,
        identifier?: string
    ) {
        super(`${resource} not found${identifier ? `: ${identifier}` : ''}`, {
            code: 'NOT_FOUND',
            statusCode: 404,
            details: { resource, identifier },
        });
    }
}

/**
 * Authorization/authentication error
 */
export class UnauthorizedError extends MagicSaaSError {
    constructor(
        message = 'Unauthorized',
        details?: Record<string, unknown>
    ) {
        super(message, {
            code: 'UNAUTHORIZED',
            statusCode: 401,
            details,
        });
    }
}

/**
 * Permission denied error
 */
export class ForbiddenError extends MagicSaaSError {
    constructor(
        message = 'Forbidden',
        details?: Record<string, unknown>
    ) {
        super(message, {
            code: 'FORBIDDEN',
            statusCode: 403,
            details,
        });
    }
}

/**
 * Conflict error (duplicate, race condition, etc.)
 */
export class ConflictError extends MagicSaaSError {
    constructor(
        message: string,
        details?: Record<string, unknown>
    ) {
        super(message, {
            code: 'CONFLICT',
            statusCode: 409,
            details,
        });
    }
}

/**
 * External service error
 */
export class ExternalServiceError extends MagicSaaSError {
    public readonly service: string;

    constructor(
        service: string,
        message: string,
        cause?: Error
    ) {
        super(`${service}: ${message}`, {
            code: 'EXTERNAL_SERVICE_ERROR',
            statusCode: 502,
            details: { service },
            cause,
        });
        this.service = service;
    }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends MagicSaaSError {
    public readonly retryAfter?: number;

    constructor(
        message = 'Rate limit exceeded',
        retryAfter?: number
    ) {
        super(message, {
            code: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429,
            details: { retryAfter },
        });
        this.retryAfter = retryAfter;
    }
}

/**
 * Type guard to check if error is MagicSaaSError
 */
export function isMagicSaaSError(error: unknown): error is MagicSaaSError {
    return error instanceof MagicSaaSError;
}

/**
 * Type guard to check if error is operational (expected)
 */
export function isOperationalError(error: unknown): boolean {
    if (isMagicSaaSError(error)) {
        return error.isOperational;
    }
    return false;
}

/**
 * Wrap unknown error in MagicSaaSError
 */
export function wrapError(error: unknown, defaultMessage = 'An unexpected error occurred'): MagicSaaSError {
    if (isMagicSaaSError(error)) {
        return error;
    }

    if (error instanceof Error) {
        return new MagicSaaSError(error.message || defaultMessage, {
            cause: error,
            isOperational: false,
        });
    }

    return new MagicSaaSError(
        typeof error === 'string' ? error : defaultMessage,
        { isOperational: false }
    );
}
