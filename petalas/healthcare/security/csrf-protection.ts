/**
 * CSRF Protection Middleware for Directus
 *
 * Implements Double Submit Cookie pattern and SameSite cookies
 * to prevent Cross-Site Request Forgery attacks.
 */

import crypto from 'crypto';

/**
 * Generate CSRF Token
 */
function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * CSRF Protection Middleware
 */
export default ({ app }: any) => {
  app.use((req: any, res: any, next: any) => {
    // Skip CSRF for GET, HEAD, OPTIONS (safe methods)
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Skip CSRF for API endpoints with Bearer token
    if (req.headers.authorization?.startsWith('Bearer ')) {
      return next();
    }

    // Skip CSRF for health checks
    if (req.path === '/server/health') {
      return next();
    }

    // Get CSRF token from header and cookie
    const headerToken = req.headers['x-csrf-token'];
    const cookieToken = req.cookies?.['csrf-token'];

    // Validate CSRF tokens match
    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      return res.status(403).json({
        error: {
          message: 'Invalid CSRF token',
          code: 'CSRF_TOKEN_INVALID',
        },
      });
    }

    next();
  });

  // Generate CSRF token on GET requests
  app.use((req: any, res: any, next: any) => {
    if (req.method === 'GET' && !req.cookies?.['csrf-token']) {
      const token = generateCSRFToken();

      // Set CSRF cookie with security flags
      res.cookie('csrf-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      // Send token in response header for client to use
      res.setHeader('X-CSRF-Token', token);
    }

    next();
  });
};

export { generateCSRFToken };
