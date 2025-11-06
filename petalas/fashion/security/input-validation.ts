/**
 * Input Validation Middleware for Directus
 *
 * Prevents SQL Injection, XSS, and other injection attacks
 * by validating and sanitizing all user inputs.
 */

import { createError } from '@directus/errors';
import validator from 'validator';
import xss from 'xss';

const InvalidInputError = createError('INVALID_INPUT', 'Invalid input detected', 400);

/**
 * SQL Injection Prevention
 * Detects common SQL injection patterns
 */
function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(-{2}|\/\*|\*\/)/g,  // SQL comments
    /(\bOR\b\s+\d+\s*=\s*\d+)/gi,  // OR 1=1
    /(\bAND\b\s+\d+\s*=\s*\d+)/gi,  // AND 1=1
    /(;|\||&)/g,  // Command chaining
    /(xp_|sp_)/gi,  // Stored procedures
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * XSS Prevention
 * Detects and sanitizes XSS attempts
 */
function sanitizeXSS(input: string): string {
  return xss(input, {
    whiteList: {},  // No HTML tags allowed by default
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style']
  });
}

/**
 * Path Traversal Prevention
 */
function detectPathTraversal(input: string): boolean {
  const pathPatterns = [
    /\.\./g,  // Directory traversal
    /~\//g,   // Home directory
    /\/etc\//gi,
    /\/proc\//gi,
    /\/sys\//gi
  ];

  return pathPatterns.some(pattern => pattern.test(input));
}

/**
 * Command Injection Prevention
 */
function detectCommandInjection(input: string): boolean {
  const commandPatterns = [
    /[;&|`$()]/g,  // Shell metacharacters
    /\$\{.*\}/g,   // Variable expansion
    /\bcat\b|\bls\b|\brm\b|\bchmod\b|\bwget\b|\bcurl\b/gi
  ];

  return commandPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate Email
 */
function validateEmail(email: string): boolean {
  return validator.isEmail(email, {
    allow_utf8_local_part: false,
    require_tld: true,
    allow_ip_domain: false
  });
}

/**
 * Validate URL
 */
function validateURL(url: string): boolean {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
    allow_underscores: false,
    allow_query_components: true
  });
}

/**
 * Validate Phone Number
 */
function validatePhone(phone: string): boolean {
  return validator.isMobilePhone(phone, 'any', { strictMode: false });
}

/**
 * Validate Credit Card
 */
function validateCreditCard(card: string): boolean {
  const sanitized = card.replace(/\s|-/g, '');
  return validator.isCreditCard(sanitized);
}

/**
 * Validate UUID
 */
function validateUUID(uuid: string): boolean {
  return validator.isUUID(uuid, 4);
}

/**
 * Validate JSON
 */
function validateJSON(json: string): boolean {
  try {
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
}

/**
 * Main Validation Middleware
 */
export default ({ app }: any) => {
  app.use((req: any, res: any, next: any) => {
    // Skip validation for health checks
    if (req.path === '/server/health') {
      return next();
    }

    try {
      // Validate query parameters
      if (req.query) {
        Object.entries(req.query).forEach(([key, value]) => {
          if (typeof value === 'string') {
            // Check for SQL injection
            if (detectSQLInjection(value)) {
              throw new InvalidInputError({
                reason: `SQL injection detected in query parameter: ${key}`
              });
            }

            // Check for XSS
            req.query[key] = sanitizeXSS(value);

            // Check for path traversal
            if (detectPathTraversal(value)) {
              throw new InvalidInputError({
                reason: `Path traversal detected in query parameter: ${key}`
              });
            }

            // Check for command injection
            if (detectCommandInjection(value)) {
              throw new InvalidInputError({
                reason: `Command injection detected in query parameter: ${key}`
              });
            }
          }
        });
      }

      // Validate request body
      if (req.body && typeof req.body === 'object') {
        Object.entries(req.body).forEach(([key, value]) => {
          if (typeof value === 'string') {
            // Check for SQL injection
            if (detectSQLInjection(value)) {
              throw new InvalidInputError({
                reason: `SQL injection detected in field: ${key}`
              });
            }

            // Sanitize XSS (except for specific HTML fields)
            if (!['description', 'content', 'body'].includes(key)) {
              req.body[key] = sanitizeXSS(value);
            }

            // Check for path traversal
            if (key.includes('path') || key.includes('file')) {
              if (detectPathTraversal(value)) {
                throw new InvalidInputError({
                  reason: `Path traversal detected in field: ${key}`
                });
              }
            }

            // Check for command injection
            if (detectCommandInjection(value)) {
              throw new InvalidInputError({
                reason: `Command injection detected in field: ${key}`
              });
            }

            // Validate specific field types
            if (key.includes('email') && !validateEmail(value)) {
              throw new InvalidInputError({
                reason: `Invalid email format: ${key}`
              });
            }

            if (key.includes('url') && !validateURL(value)) {
              throw new InvalidInputError({
                reason: `Invalid URL format: ${key}`
              });
            }

            if (key.includes('phone') && !validatePhone(value)) {
              throw new InvalidInputError({
                reason: `Invalid phone format: ${key}`
              });
            }

            if (key === 'id' && !validateUUID(value)) {
              throw new InvalidInputError({
                reason: `Invalid UUID format: ${key}`
              });
            }
          }
        });
      }

      // Validate Content-Type for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers['content-type'];
        if (contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
          throw new InvalidInputError({
            reason: 'Invalid Content-Type. Expected application/json or multipart/form-data'
          });
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  });
};

export {
  detectSQLInjection,
  sanitizeXSS,
  detectPathTraversal,
  detectCommandInjection,
  validateEmail,
  validateURL,
  validatePhone,
  validateCreditCard,
  validateUUID,
  validateJSON
};
