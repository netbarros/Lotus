/**
 * 🌐 MAGICSAAS API GATEWAY v4.0
 * Central API Gateway - Cognitive Mesh OS
 * Powered by Sofia AI v4.0
 *
 * This is the CENTRAL API GATEWAY that orchestrates all microservices:
 * - Sofia AI (intentions, learning, orchestration)
 * - Marketing Intelligence (campaigns, leads, content)
 * - ERP (financial, inventory, HR, CRM, projects)
 * - Pétalas (industry-specific microservices)
 * - Auth & Permissions (JWT, RBAC/ABAC)
 * - Multi-tenant management
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { Redis } from 'ioredis';

// Load environment variables
config();

// ==================== TYPES ====================

interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  tenant_id: string;
  role: string;
  permissions: string[];
  active: boolean;
  created_at: Date;
}

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    tenantId: string;
    role: string;
    permissions: string[];
  };
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  settings: any;
}

// ==================== CONFIGURATION ====================

const PORT = parseInt(process.env.API_PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION_PLEASE';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'CHANGE_THIS_REFRESH_SECRET_TOO';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Service URLs
const SOFIA_AI_URL = process.env.SOFIA_AI_URL || 'http://localhost:3001';
const MARKETING_AI_URL = process.env.MARKETING_AI_URL || 'http://localhost:3003';
const ERP_URL = process.env.ERP_URL || 'http://localhost:3004';

// Database configuration
const pgConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'magicsaas',
  user: process.env.POSTGRES_USER || 'magicsaas_user',
  password: process.env.POSTGRES_PASSWORD || 'changeme',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
};

// ==================== INITIALIZE APP ====================

const app = express();
let pool: Pool;
let redis: Redis;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression
app.use(compression());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// ==================== INITIALIZE SERVICES ====================

async function initializeServices(): Promise<void> {
  try {
    console.log('🌐 Initializing API Gateway services...');

    // Initialize PostgreSQL
    pool = new Pool(pgConfig);
    await pool.query('SELECT NOW()');
    console.log('   ✅ PostgreSQL connected');

    // Initialize Redis
    redis = new Redis(redisConfig);
    await redis.ping();
    console.log('   ✅ Redis connected');

    // Initialize database schema for auth & tenants
    await initializeSchema();
    console.log('   ✅ Auth schema initialized');

    console.log('✅ All services ready');

  } catch (error: any) {
    console.error('❌ Service initialization failed:', error.message);
    throw error;
  }
}

async function initializeSchema(): Promise<void> {
  const schema = `
    -- Tenants
    CREATE TABLE IF NOT EXISTS tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      plan VARCHAR(50) DEFAULT 'free',
      settings JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
      active BOOLEAN DEFAULT true,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Refresh tokens
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(500) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Roles & Permissions
    CREATE TABLE IF NOT EXISTS roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Audit log
    CREATE TABLE IF NOT EXISTS audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      tenant_id UUID REFERENCES tenants(id),
      action VARCHAR(100) NOT NULL,
      resource VARCHAR(100) NOT NULL,
      resource_id UUID,
      ip_address INET,
      user_agent TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_log_tenant ON audit_log(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
  `;

  await pool.query(schema);
}

// ==================== MIDDLEWARE ====================

/**
 * JWT Authentication Middleware
 * Verifies JWT token and extracts user info
 */
async function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Check if token is blacklisted
    const blacklisted = await redis.get(`blacklist:${token}`);
    if (blacklisted) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has been revoked',
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      tenantId: decoded.tenantId,
      role: decoded.role,
      permissions: decoded.permissions || [],
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired',
      });
      return;
    }

    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
    });
  }
}

/**
 * RBAC Middleware - Check if user has required role
 */
function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Required role: ${roles.join(' or ')}`,
      });
      return;
    }

    next();
  };
}

/**
 * ABAC Middleware - Check if user has required permission
 */
function requirePermission(...permissions: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const hasPermission = permissions.some(perm =>
      req.user!.permissions.includes(perm) || req.user!.role === 'admin'
    );

    if (!hasPermission) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Required permission: ${permissions.join(' or ')}`,
      });
      return;
    }

    next();
  };
}

/**
 * Audit logging middleware
 */
async function auditLog(action: string, resource: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user) {
        await pool.query(
          `INSERT INTO audit_log (user_id, tenant_id, action, resource, ip_address, user_agent, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            req.user.id,
            req.user.tenantId,
            action,
            resource,
            req.ip,
            req.get('user-agent'),
            { body: req.body, params: req.params, query: req.query },
          ]
        );
      }
    } catch (error) {
      console.error('Audit log error:', error);
    }
    next();
  };
}

// ==================== ROUTES ====================

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    await redis.ping();

    res.status(200).json({
      status: 'healthy',
      service: 'api-gateway',
      version: '4.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

// ==================== AUTH ROUTES ====================

/**
 * POST /api/auth/register
 * Register new user and tenant
 */
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, tenantName } = req.body;

    // Validation
    if (!email || !password || !name || !tenantName) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'email, password, name, and tenantName are required',
      });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists',
      });
    }

    // Create tenant
    const tenantSlug = tenantName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const tenant = await pool.query(
      `INSERT INTO tenants (name, slug, status, plan)
       VALUES ($1, $2, 'active', 'trial')
       RETURNING id, name, slug, status, plan`,
      [tenantName, tenantSlug]
    );

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await pool.query(
      `INSERT INTO users (tenant_id, email, name, password_hash, role, permissions, active)
       VALUES ($1, $2, $3, $4, 'admin', ARRAY['*'], true)
       RETURNING id, email, name, tenant_id, role, permissions`,
      [tenant.rows[0].id, email, name, passwordHash]
    );

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.rows[0].id,
        email: user.rows[0].email,
        tenantId: user.rows[0].tenant_id,
        role: user.rows[0].role,
        permissions: user.rows[0].permissions,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user.rows[0].id },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.rows[0].id, refreshToken, expiresAt]
    );

    res.status(201).json({
      success: true,
      message: 'User and tenant created successfully',
      data: {
        user: {
          id: user.rows[0].id,
          email: user.rows[0].email,
          name: user.rows[0].name,
          role: user.rows[0].role,
        },
        tenant: tenant.rows[0],
        token,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'email and password are required',
      });
    }

    // Find user
    const result = await pool.query(
      `SELECT u.*, t.name as tenant_name, t.slug as tenant_slug
       FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       WHERE u.email = $1 AND u.active = true`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        tenantId: user.tenant_id,
        role: user.role,
        permissions: user.permissions,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, refreshToken, expiresAt]
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          tenant: {
            id: user.tenant_id,
            name: user.tenant_name,
            slug: user.tenant_slug,
          },
        },
        token,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
app.post('/api/auth/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'refreshToken is required',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;

    // Check if refresh token exists and is valid
    const result = await pool.query(
      `SELECT rt.*, u.email, u.tenant_id, u.role, u.permissions
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = $1 AND rt.expires_at > NOW() AND u.active = true`,
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired refresh token',
      });
    }

    const tokenData = result.rows[0];

    // Generate new access token
    const token = jwt.sign(
      {
        id: tokenData.user_id,
        email: tokenData.email,
        tenantId: tokenData.tenant_id,
        role: tokenData.role,
        permissions: tokenData.permissions,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
      },
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Token refresh failed',
      message: 'Invalid refresh token',
    });
  }
});

/**
 * POST /api/auth/logout
 * Revoke token and refresh token
 */
app.post('/api/auth/logout', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization!;
    const token = authHeader.substring(7);

    // Blacklist token
    await redis.setex(`blacklist:${token}`, 24 * 60 * 60, 'true');

    // Delete refresh tokens
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.user!.id]);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
app.get('/api/auth/me', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.permissions, u.created_at, u.last_login,
              t.id as tenant_id, t.name as tenant_name, t.slug as tenant_slug, t.plan, t.status
       FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1`,
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        tenant: {
          id: user.tenant_id,
          name: user.tenant_name,
          slug: user.tenant_slug,
          plan: user.plan,
          status: user.status,
        },
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: error.message,
    });
  }
});

// ==================== TENANT ROUTES ====================

/**
 * GET /api/tenants
 * Get all tenants (admin only)
 */
app.get('/api/tenants', authenticateJWT, requireRole('admin', 'superadmin'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, slug, status, plan, settings, created_at, updated_at
       FROM tenants
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Get tenants error:', error);
    res.status(500).json({
      error: 'Failed to get tenants',
      message: error.message,
    });
  }
});

/**
 * GET /api/tenants/:id
 * Get tenant by ID
 */
app.get('/api/tenants/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check permission - user must be in the tenant or be admin
    if (req.user!.tenantId !== id && req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this tenant',
      });
    }

    const result = await pool.query(
      `SELECT id, name, slug, status, plan, settings, created_at, updated_at
       FROM tenants
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Tenant not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Get tenant error:', error);
    res.status(500).json({
      error: 'Failed to get tenant',
      message: error.message,
    });
  }
});

// ==================== USER MANAGEMENT ROUTES ====================

/**
 * GET /api/users
 * Get users in tenant
 */
app.get('/api/users', authenticateJWT, requirePermission('users.read'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, role, permissions, active, created_at, last_login
       FROM users
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [req.user!.tenantId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to get users',
      message: error.message,
    });
  }
});

/**
 * POST /api/users
 * Create new user in tenant
 */
app.post('/api/users', authenticateJWT, requirePermission('users.create'), auditLog('create', 'user'), async (req: AuthRequest, res: Response) => {
  try {
    const { email, name, password, role, permissions } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'email, name, and password are required',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (tenant_id, email, name, password_hash, role, permissions, active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, email, name, role, permissions, created_at`,
      [req.user!.tenantId, email, name, passwordHash, role || 'user', permissions || []]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Failed to create user',
      message: error.message,
    });
  }
});

// ==================== PROXY ROUTES TO MICROSERVICES ====================

/**
 * Sofia AI routes
 */
app.use('/api/sofia', authenticateJWT, async (req: AuthRequest, res: Response) => {
  // TODO: Proxy to Sofia AI service
  res.status(503).json({
    error: 'Service integration pending',
    message: 'Sofia AI integration will be completed in next phase',
    service_url: SOFIA_AI_URL,
  });
});

/**
 * Marketing AI routes
 */
app.use('/api/marketing', authenticateJWT, async (req: AuthRequest, res: Response) => {
  // TODO: Proxy to Marketing AI service
  res.status(503).json({
    error: 'Service integration pending',
    message: 'Marketing AI integration will be completed in next phase',
    service_url: MARKETING_AI_URL,
  });
});

/**
 * ERP routes
 */
app.use('/api/erp', authenticateJWT, async (req: AuthRequest, res: Response) => {
  // TODO: Proxy to ERP service
  res.status(503).json({
    error: 'Service integration pending',
    message: 'ERP integration will be completed in next phase',
    service_url: ERP_URL,
  });
});

// ==================== ERROR HANDLERS ====================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
});

// ==================== START SERVER ====================

async function startServer(): Promise<void> {
  try {
    // Initialize services
    await initializeServices();

    // Start listening
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════════╗');
      console.log('║                                                              ║');
      console.log('║     🌐 MAGICSAAS API GATEWAY v4.0 - ONLINE                  ║');
      console.log('║     System-∞ Cognitive Mesh OS                              ║');
      console.log('║     Powered by Sofia AI                                     ║');
      console.log('║                                                              ║');
      console.log('╚══════════════════════════════════════════════════════════════╝');
      console.log('');
      console.log(`🌐 Server running on http://0.0.0.0:${PORT}`);
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`🔐 JWT Auth: Enabled`);
      console.log(`🛡️  RBAC/ABAC: Enabled`);
      console.log('');
      console.log('Endpoints:');
      console.log('  🔓 Public:');
      console.log(`     GET  /health                  - Health check`);
      console.log(`     POST /api/auth/register       - Register user & tenant`);
      console.log(`     POST /api/auth/login          - Login user`);
      console.log(`     POST /api/auth/refresh        - Refresh access token`);
      console.log('');
      console.log('  🔐 Protected:');
      console.log(`     POST /api/auth/logout         - Logout user`);
      console.log(`     GET  /api/auth/me             - Get current user`);
      console.log(`     GET  /api/tenants             - List tenants (admin)`);
      console.log(`     GET  /api/tenants/:id         - Get tenant`);
      console.log(`     GET  /api/users               - List users`);
      console.log(`     POST /api/users               - Create user`);
      console.log('');
      console.log('  🧠 Microservices (via proxy):');
      console.log(`     /api/sofia/*                  - Sofia AI`);
      console.log(`     /api/marketing/*              - Marketing Intelligence`);
      console.log(`     /api/erp/*                    - ERP System`);
      console.log('');
    });

  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// ==================== GRACEFUL SHUTDOWN ====================

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (pool) await pool.end();
  if (redis) await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  if (pool) await pool.end();
  if (redis) await redis.quit();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// ==================== START ====================

startServer();

export default app;
