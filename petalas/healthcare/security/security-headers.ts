/**
 * Security Headers Middleware for Directus
 *
 * Implements comprehensive security headers following OWASP recommendations
 * and industry best practices for API security.
 */

export default ({ app }: any) => {
  app.use((req: any, res: any, next: any) => {
    // Prevent clickjacking attacks
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter in browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');

    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.fashion.magicsaas.ai",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ')
    );

    // Strict Transport Security (HSTS)
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    // Permissions Policy (formerly Feature Policy)
    res.setHeader(
      'Permissions-Policy',
      [
        'geolocation=(self)',
        'microphone=()',
        'camera=()',
        'payment=(self)',
        'usb=()',
        'magnetometer=()',
        'gyroscope=()',
        'accelerometer=()'
      ].join(', ')
    );

    // Prevent caching of sensitive data
    if (req.path.includes('/auth') || req.path.includes('/users')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // Remove server header
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    next();
  });
};
