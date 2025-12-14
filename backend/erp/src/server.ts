/**
 * 💼 ENTERPRISE ERP SERVER
 * Complete Business Management System
 * Financial | Inventory | HR | CRM | Projects
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import { ERPCore } from './ERPCore';

config();

const PORT = parseInt(process.env.PORT || '3004', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
};

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

const app: express.Application = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

let redis: Redis;
let pool: Pool;
let erp: ERPCore;

async function initializeServices(): Promise<void> {
  try {
    console.log('💼 Initializing ERP services...');

    redis = new Redis(redisConfig);
    await redis.ping();
    console.log('   ✅ Redis connected');

    pool = new Pool(pgConfig);
    await pool.query('SELECT NOW()');
    console.log('   ✅ PostgreSQL connected');

    erp = new ERPCore(redis, pool);
    await erp.initialize();
    console.log('   ✅ ERP Core initialized');

    console.log('✅ All services ready');
  } catch (error: any) {
    console.error('❌ Service initialization failed:', error.message);
    throw error;
  }
}

// Health check
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await redis.ping();
    await pool.query('SELECT 1');

    res.status(200).json({
      status: 'healthy',
      service: 'erp',
      version: '4.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error: any) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

// Status endpoint
app.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await erp.getStatus();
    res.status(200).json(status);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get status', message: error.message });
  }
});

// Financial endpoints
app.post('/api/financial/invoices', async (req: Request, res: Response) => {
  try {
    const invoice = await erp.financial.createInvoice(req.body);
    res.status(201).json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: 'Invoice creation failed', message: error.message });
  }
});

app.get('/api/financial/summary', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await erp.financial.getFinancialSummary(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.status(200).json(summary);
  } catch (error: any) {
    res.status(500).json({ error: 'Summary retrieval failed', message: error.message });
  }
});

// Inventory endpoints
app.post('/api/inventory/items', async (req: Request, res: Response) => {
  try {
    const item = await erp.inventory.createInventoryItem(req.body);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ error: 'Item creation failed', message: error.message });
  }
});

app.get('/api/inventory/low-stock', async (_req: Request, res: Response) => {
  try {
    const items = await erp.inventory.getLowStockItems();
    res.status(200).json(items);
  } catch (error: any) {
    res.status(500).json({ error: 'Low stock retrieval failed', message: error.message });
  }
});

// HR endpoints
app.post('/api/hr/employees', async (req: Request, res: Response) => {
  try {
    const employee = await erp.hr.createEmployee(req.body);
    res.status(201).json(employee);
  } catch (error: any) {
    res.status(500).json({ error: 'Employee creation failed', message: error.message });
  }
});

app.get('/api/hr/payroll', async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    const summary = await erp.hr.getPayrollSummary(
      parseInt(month as string),
      parseInt(year as string)
    );
    res.status(200).json(summary);
  } catch (error: any) {
    res.status(500).json({ error: 'Payroll retrieval failed', message: error.message });
  }
});

// CRM endpoints
app.post('/api/crm/customers', async (req: Request, res: Response) => {
  try {
    const customer = await erp.crm.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (error: any) {
    res.status(500).json({ error: 'Customer creation failed', message: error.message });
  }
});

app.get('/api/crm/top-customers', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const customers = await erp.crm.getTopCustomers(limit);
    res.status(200).json(customers);
  } catch (error: any) {
    res.status(500).json({ error: 'Top customers retrieval failed', message: error.message });
  }
});

// Projects endpoints
app.post('/api/projects', async (req: Request, res: Response) => {
  try {
    const project = await erp.projects.createProject(req.body);
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ error: 'Project creation failed', message: error.message });
  }
});

app.get('/api/projects/:id/progress', async (req: Request, res: Response) => {
  try {
    const progress = await erp.projects.getProjectProgress(req.params.id);
    res.status(200).json(progress);
  } catch (error: any) {
    res.status(500).json({ error: 'Progress retrieval failed', message: error.message });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', path: req.path, method: req.method });
});

// Error handler
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
});

async function startServer(): Promise<void> {
  try {
    await initializeServices();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════════╗');
      console.log('║                                                              ║');
      console.log('║     💼 ENTERPRISE ERP v4.0 - ONLINE                          ║');
      console.log('║     Complete Business Management System                     ║');
      console.log('║                                                              ║');
      console.log('╚══════════════════════════════════════════════════════════════╝');
      console.log('');
      console.log(`🌐 Server running on http://0.0.0.0:${PORT}`);
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`💼 Modules: Financial | Inventory | HR | CRM | Projects`);
      console.log('');
      console.log('Endpoints:');
      console.log(`   GET  /health                      - Health check`);
      console.log(`   GET  /status                      - ERP status`);
      console.log(`   POST /api/financial/transactions  - Create transaction`);
      console.log(`   GET  /api/financial/summary       - Financial summary`);
      console.log(`   POST /api/inventory/items         - Create item`);
      console.log(`   GET  /api/inventory/low-stock     - Low stock items`);
      console.log(`   POST /api/hr/employees            - Create employee`);
      console.log(`   GET  /api/hr/payroll              - Payroll summary`);
      console.log(`   POST /api/crm/customers           - Create customer`);
      console.log(`   GET  /api/crm/top-customers       - Top customers`);
      console.log(`   POST /api/projects                - Create project`);
      console.log(`   GET  /api/projects/:id/progress   - Project progress`);
      console.log('');
    });
  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (redis) await redis.quit();
  if (pool) await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  if (redis) await redis.quit();
  if (pool) await pool.end();
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

startServer();

export default app;
