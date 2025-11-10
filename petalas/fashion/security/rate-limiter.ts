/**
 * Advanced Rate Limiting for Directus
 *
 * Implements multi-tier rate limiting to prevent:
 * - DDoS attacks
 * - Brute force attacks
 * - API abuse
 * - Resource exhaustion
 */

import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis-service',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  enableOfflineQueue: false
});

/**
 * Global Rate Limiter
 * 100 requests per minute per IP
 */
const globalLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:global',
  points: 100,  // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60 * 5, // Block for 5 minutes if exceeded
});

/**
 * Authentication Rate Limiter
 * 5 login attempts per 15 minutes per IP
 * Prevents brute force attacks
 */
const authLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:auth',
  points: 5,
  duration: 60 * 15, // 15 minutes
  blockDuration: 60 * 30, // Block for 30 minutes
});

/**
 * API Endpoint Rate Limiter
 * 50 requests per minute per IP per endpoint
 */
const endpointLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:endpoint',
  points: 50,
  duration: 60,
  blockDuration: 60 * 2,
});

/**
 * Search Rate Limiter
 * 20 search requests per minute per IP
 * Search operations are expensive
 */
const searchLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:search',
  points: 20,
  duration: 60,
  blockDuration: 60 * 5,
});

/**
 * File Upload Rate Limiter
 * 10 uploads per hour per IP
 */
const uploadLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:upload',
  points: 10,
  duration: 60 * 60,
  blockDuration: 60 * 60,
});

/**
 * Checkout Rate Limiter
 * 3 checkout attempts per 5 minutes per IP
 * Prevents checkout spam and fraud
 */
const checkoutLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:checkout',
  points: 3,
  duration: 60 * 5,
  blockDuration: 60 * 15,
});

/**
 * Get Client IP Address
 */
function getClientIP(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

/**
 * Get User Identifier (IP + User Agent)
 * More accurate than IP alone
 */
function getUserIdentifier(req: any): string {
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  return `${ip}:${userAgent}`;
}

/**
 * Rate Limiter Middleware
 */
export default ({ app }: any) => {
  app.use(async (req: any, res: any, next: any) => {
    // Skip rate limiting for health checks
    if (req.path === '/server/health') {
      return next();
    }

    const identifier = getUserIdentifier(req);
    const endpoint = req.path;

    try {
      // Apply global rate limit
      await globalLimiter.consume(identifier);

      // Apply specific rate limits based on endpoint
      if (endpoint.includes('/auth/login') || endpoint.includes('/auth/password')) {
        await authLimiter.consume(identifier);
      } else if (endpoint.includes('/search') || req.query.search) {
        await searchLimiter.consume(identifier);
      } else if (endpoint.includes('/files') && req.method === 'POST') {
        await uploadLimiter.consume(identifier);
      } else if (endpoint.includes('/checkout') && req.method === 'POST') {
        await checkoutLimiter.consume(identifier);
      } else {
        await endpointLimiter.consume(`${identifier}:${endpoint}`);
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', '100');
      res.setHeader('X-RateLimit-Remaining', '99');
      res.setHeader('X-RateLimit-Reset', Date.now() + 60000);

      next();
    } catch (error: any) {
      if (error.msBeforeNext) {
        // Rate limit exceeded
        res.setHeader('Retry-After', Math.ceil(error.msBeforeNext / 1000));
        res.setHeader('X-RateLimit-Limit', '100');
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', Date.now() + error.msBeforeNext);

        return res.status(429).json({
          error: {
            message: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(error.msBeforeNext / 1000)
          }
        });
      }

      // Other errors
      next(error);
    }
  });
};

/**
 * Reset rate limit for a specific identifier
 * Useful for whitelisting or manual intervention
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  await Promise.all([
    globalLimiter.delete(identifier),
    authLimiter.delete(identifier),
    endpointLimiter.delete(identifier),
    searchLimiter.delete(identifier),
    uploadLimiter.delete(identifier),
    checkoutLimiter.delete(identifier)
  ]);
}

/**
 * Get rate limit status for identifier
 */
export async function getRateLimitStatus(identifier: string): Promise<any> {
  const [global, auth, endpoint, search, upload, checkout] = await Promise.all([
    globalLimiter.get(identifier),
    authLimiter.get(identifier),
    endpointLimiter.get(identifier),
    searchLimiter.get(identifier),
    uploadLimiter.get(identifier),
    checkoutLimiter.get(identifier)
  ]);

  return {
    global: global?.remainingPoints || 100,
    auth: auth?.remainingPoints || 5,
    endpoint: endpoint?.remainingPoints || 50,
    search: search?.remainingPoints || 20,
    upload: upload?.remainingPoints || 10,
    checkout: checkout?.remainingPoints || 3
  };
}
