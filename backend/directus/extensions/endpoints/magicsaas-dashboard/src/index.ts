import { defineEndpoint } from '@directus/extensions-sdk';
import Redis from 'ioredis';
import { register, collectDefaultMetrics } from 'prom-client';

export default defineEndpoint({
  id: 'magicsaas-dashboard',
  handler: (router, context) => {
    const { services, getSchema, logger } = context;
    const { ItemsService } = services;

    // Initialize Redis connection
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });

    /**
     * GET /magicsaas/dashboard/metrics
     * Aggregates metrics from Redis, Prometheus, and PostgreSQL
     */
    router.get('/metrics', async (req, res) => {
      try {
        const { role = 'admin', dateRange = '30d' } = req.query;
        const schema = await getSchema();

        // Calculate date range
        const now = new Date();
        const rangeHours =
          {
            '24h': 24,
            '7d': 24 * 7,
            '30d': 24 * 30,
            '90d': 24 * 90,
          }[dateRange as string] || 24 * 30;

        const startDate = new Date(now.getTime() - rangeHours * 60 * 60 * 1000);

        // ========================================
        // REVENUE METRICS (from PostgreSQL + Redis cache)
        // ========================================
        let revenueMetrics = {};
        if (['owner', 'admin'].includes(role as string)) {
          // Try Redis cache first
          const cachedRevenue = await redis.get(`metrics:revenue:${dateRange}`);
          if (cachedRevenue) {
            revenueMetrics = JSON.parse(cachedRevenue);
          } else {
            // Query PostgreSQL for revenue data
            const subscriptionsService = new ItemsService('subscriptions', { schema });
            const subscriptions = await subscriptionsService.readByQuery({
              filter: {
                created_at: {
                  _gte: startDate.toISOString(),
                },
                status: {
                  _eq: 'active',
                },
              },
              aggregate: {
                sum: ['amount'],
                count: ['id'],
              },
            });

            const previousPeriodStart = new Date(startDate.getTime() - rangeHours * 60 * 60 * 1000);
            const previousSubscriptions = await subscriptionsService.readByQuery({
              filter: {
                created_at: {
                  _gte: previousPeriodStart.toISOString(),
                  _lt: startDate.toISOString(),
                },
                status: {
                  _eq: 'active',
                },
              },
              aggregate: {
                sum: ['amount'],
              },
            });

            const mrr = subscriptions[0]?.sum?.amount || 0;
            const previousMrr = previousSubscriptions[0]?.sum?.amount || 0;
            const mrrChange = previousMrr > 0 ? ((mrr - previousMrr) / previousMrr) * 100 : 0;

            // Query churn rate
            const cancelledService = new ItemsService('subscriptions', { schema });
            const cancelled = await cancelledService.readByQuery({
              filter: {
                cancelled_at: {
                  _gte: startDate.toISOString(),
                },
              },
              aggregate: {
                count: ['id'],
              },
            });

            const totalActive = subscriptions[0]?.count?.id || 1;
            const churnRate = ((cancelled[0]?.count?.id || 0) / totalActive) * 100;

            revenueMetrics = {
              mrr,
              mrrChange: parseFloat(mrrChange.toFixed(2)),
              arr: mrr * 12,
              arrChange: parseFloat(mrrChange.toFixed(2)),
              churnRate: parseFloat(churnRate.toFixed(2)),
              ltvCacRatio: 0, // Calculate from marketing data
            };

            // Cache for 5 minutes
            await redis.setex(`metrics:revenue:${dateRange}`, 300, JSON.stringify(revenueMetrics));
          }
        }

        // ========================================
        // USER METRICS (from PostgreSQL + Redis cache)
        // ========================================
        const cachedUsers = await redis.get(`metrics:users:${dateRange}`);
        let userMetrics = {};
        if (cachedUsers) {
          userMetrics = JSON.parse(cachedUsers);
        } else {
          const usersService = new ItemsService('directus_users', { schema });
          const tenantsService = new ItemsService('tenants', { schema });

          const [totalUsers, newUsers, activeTenants, newTenants] = await Promise.all([
            usersService.readByQuery({
              aggregate: { count: ['id'] },
            }),
            usersService.readByQuery({
              filter: {
                date_created: {
                  _gte: startDate.toISOString(),
                },
              },
              aggregate: { count: ['id'] },
            }),
            tenantsService.readByQuery({
              filter: { status: { _eq: 'active' } },
              aggregate: { count: ['id'] },
            }),
            tenantsService.readByQuery({
              filter: {
                created_at: {
                  _gte: startDate.toISOString(),
                },
              },
              aggregate: { count: ['id'] },
            }),
          ]);

          // Get DAU/MAU from Redis (tracked by Sofia AI)
          const dau = (await redis.get('metrics:dau')) || '0';
          const mau = (await redis.get('metrics:mau')) || '0';

          userMetrics = {
            totalUsers: totalUsers[0]?.count?.id || 0,
            newUsers: newUsers[0]?.count?.id || 0,
            activeTenants: activeTenants[0]?.count?.id || 0,
            newTenants: newTenants[0]?.count?.id || 0,
            dau: parseInt(dau),
            mau: parseInt(mau),
          };

          // Cache for 2 minutes
          await redis.setex(`metrics:users:${dateRange}`, 120, JSON.stringify(userMetrics));
        }

        // ========================================
        // SOFIA AI METRICS (from Redis - real-time)
        // ========================================
        const [
          intentionsProcessed,
          intentionsRate,
          sofiaSuccessRate,
          avgProcessingTime,
          p95ProcessingTime,
          deploymentsSuccess,
          deploymentsRate,
        ] = await Promise.all([
          redis.get('sofia:metrics:intentions:total') || '0',
          redis.get('sofia:metrics:intentions:rate_hour') || '0',
          redis.get('sofia:metrics:success_rate') || '0',
          redis.get('sofia:metrics:processing_time:avg') || '0',
          redis.get('sofia:metrics:processing_time:p95') || '0',
          redis.get('sofia:metrics:deployments:success') || '0',
          redis.get('sofia:metrics:deployments:rate_day') || '0',
        ]);

        const sofiaMetrics = {
          intentionsProcessed: parseInt(intentionsProcessed),
          intentionsRate: parseFloat(intentionsRate),
          sofiaSuccessRate: parseFloat(sofiaSuccessRate),
          avgProcessingTime: parseFloat(avgProcessingTime),
          p95ProcessingTime: parseFloat(p95ProcessingTime),
          deploymentsSuccess: parseInt(deploymentsSuccess),
          deploymentsRate: parseFloat(deploymentsRate),
        };

        // ========================================
        // SYSTEM HEALTH METRICS (from Prometheus via Redis cache)
        // ========================================
        const [uptime, apiLatencyP95, errorRate, errorBudget] = await Promise.all([
          redis.get('prometheus:uptime') || '0',
          redis.get('prometheus:api_latency_p95') || '0',
          redis.get('prometheus:error_rate') || '0',
          redis.get('prometheus:error_budget') || '100',
        ]);

        const healthMetrics = {
          uptime: parseFloat(uptime),
          apiLatencyP95: parseFloat(apiLatencyP95),
          errorRate: parseFloat(errorRate),
          errorBudget: parseFloat(errorBudget),
        };

        // ========================================
        // SECURITY METRICS (from PostgreSQL + Redis)
        // ========================================
        const securityService = new ItemsService('security_events', { schema });
        const [criticalAlerts, failedLogins, securityScore, vulnerabilities] = await Promise.all([
          securityService.readByQuery({
            filter: {
              severity: { _eq: 'critical' },
              created_at: {
                _gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              },
            },
            aggregate: { count: ['id'] },
          }),
          securityService.readByQuery({
            filter: {
              event_type: { _eq: 'failed_login' },
              created_at: {
                _gte: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
              },
            },
            aggregate: { count: ['id'] },
          }),
          redis.get('security:score') || '0',
          redis.get('security:vulnerabilities:total') || '0',
        ]);

        const securityMetrics = {
          criticalAlerts: criticalAlerts[0]?.count?.id || 0,
          failedLogins: failedLogins[0]?.count?.id || 0,
          securityScore: parseFloat(securityScore),
          vulnerabilities: parseInt(vulnerabilities),
          criticalVulns: 0, // Get from vulnerability scanner
        };

        // ========================================
        // COMBINE ALL METRICS
        // ========================================
        const combinedMetrics = {
          ...revenueMetrics,
          ...userMetrics,
          ...sofiaMetrics,
          ...healthMetrics,
          ...securityMetrics,
        };

        res.json({
          data: combinedMetrics,
          timestamp: new Date().toISOString(),
          dateRange,
          role,
        });
      } catch (error) {
        logger.error('Dashboard metrics error:', error);
        res.status(500).json({
          error: 'Failed to fetch dashboard metrics',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    /**
     * GET /magicsaas/dashboard/activity
     * Returns recent activity feed
     */
    router.get('/activity', async (req, res) => {
      try {
        const { limit = 10 } = req.query;
        const schema = await getSchema();

        const activityService = new ItemsService('activity_log', { schema });
        const activities = await activityService.readByQuery({
          sort: ['-created_at'],
          limit: parseInt(limit as string),
          fields: ['id', 'title', 'icon', 'type', 'created_at'],
        });

        res.json({
          data: activities.map((activity: any) => ({
            id: activity.id,
            title: activity.title,
            icon: activity.icon || 'info',
            type: activity.type || 'info',
            timestamp: activity.created_at,
          })),
        });
      } catch (error) {
        logger.error('Dashboard activity error:', error);
        res.status(500).json({
          error: 'Failed to fetch dashboard activity',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    /**
     * GET /magicsaas/dashboard/export
     * Exports dashboard data as CSV/JSON
     */
    router.get('/export', async (req, res) => {
      try {
        const { format = 'json', role = 'admin', dateRange = '30d' } = req.query;

        // Reuse metrics endpoint logic
        const metricsResponse = await fetch(
          `http://localhost:${process.env.PORT || 8055}/magicsaas/dashboard/metrics?role=${role}&dateRange=${dateRange}`
        );
        const metricsData = await metricsResponse.json();

        if (format === 'csv') {
          // Convert to CSV
          const csv = Object.entries(metricsData.data)
            .map(([key, value]) => `${key},${value}`)
            .join('\n');

          res.setHeader('Content-Type', 'text/csv');
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="magicsaas-dashboard-${Date.now()}.csv"`
          );
          res.send(`Metric,Value\n${csv}`);
        } else {
          // Return JSON
          res.setHeader('Content-Type', 'application/json');
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="magicsaas-dashboard-${Date.now()}.json"`
          );
          res.json(metricsData);
        }
      } catch (error) {
        logger.error('Dashboard export error:', error);
        res.status(500).json({
          error: 'Failed to export dashboard data',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  },
});
