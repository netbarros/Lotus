/**
 * GDPR Compliance Controller
 * Handles data export, deletion, and user rights requests
 */

import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @route GET /api/v1/users/me/export
 * @description Export all user data (GDPR Article 15 - Right to Access)
 * @access Private
 */
export async function exportUserData(req: Request, res: Response) {
  try {
    const userId = req.user.id; // From JWT middleware
    const tenantId = req.user.tenantId;

    // Set tenant context for RLS
    await prisma.$executeRaw`SELECT set_current_tenant(${tenantId})`;

    // Fetch all user data
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        voice_sessions: true,
        voice_contexts: true,
        quantum_jobs: true,
        audit_logs: {
          orderBy: { created_at: 'desc' },
          take: 1000, // Last 1000 actions
        },
      },
    });

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch tenant-related data
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        plan: true,
        credit_wallet: {
          include: {
            transactions: {
              where: { created_at: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } },
            },
          },
        },
      },
    });

    // Fetch usage records
    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        tenant_id: tenantId,
        user_id: userId,
      },
      orderBy: { created_at: 'desc' },
      take: 10000, // Last 10k records
    });

    // Compile comprehensive data export
    const dataExport = {
      export_metadata: {
        requested_at: new Date().toISOString(),
        user_id: userId,
        tenant_id: tenantId,
        format: 'json',
        version: '1.0',
      },
      personal_information: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        last_login_at: userData.last_login_at,
        login_count: userData.login_count,
        twofa_enabled: userData.twofa_enabled,
        preferences: userData.preferences,
        metadata: userData.metadata,
      },
      account_information: {
        tenant: {
          id: tenant?.id,
          name: tenant?.name,
          slug: tenant?.slug,
          domain: tenant?.domain,
          status: tenant?.status,
          plan: tenant?.plan?.name,
          created_at: tenant?.created_at,
        },
        role: {
          name: userData.role.name,
          permissions: userData.permissions,
        },
      },
      usage_data: {
        total_records: usageRecords.length,
        records: usageRecords.map((record) => ({
          service_type: record.service_type,
          quantity: record.quantity,
          unit: record.unit,
          cost_credits: record.cost_credits,
          created_at: record.created_at,
        })),
      },
      billing_data: {
        wallet: tenant?.credit_wallet
          ? {
              balance: tenant.credit_wallet.balance,
              lifetime_earned: tenant.credit_wallet.lifetime_earned,
              lifetime_spent: tenant.credit_wallet.lifetime_spent,
            }
          : null,
        transactions:
          tenant?.credit_wallet?.transactions.map((tx) => ({
            amount: tx.amount,
            type: tx.type,
            category: tx.category,
            description: tx.description,
            created_at: tx.created_at,
          })) || [],
      },
      voice_sessions: userData.voice_sessions.map((session) => ({
        session_type: session.session_type,
        language: session.language,
        duration_seconds: session.duration_seconds,
        tokens_used: session.tokens_used,
        cost_credits: session.cost_credits,
        started_at: session.started_at,
        ended_at: session.ended_at,
      })),
      quantum_jobs: userData.quantum_jobs.map((job) => ({
        job_type: job.job_type,
        algorithm: job.algorithm,
        backend: job.backend,
        status: job.status,
        cost_credits: job.cost_credits,
        submitted_at: job.submitted_at,
        completed_at: job.completed_at,
      })),
      audit_trail: userData.audit_logs.map((log) => ({
        action: log.action,
        resource_type: log.resource_type,
        resource_id: log.resource_id,
        status: log.status,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        created_at: log.created_at,
      })),
    };

    // Log the export request
    await prisma.auditLog.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        action: 'GDPR_DATA_EXPORT',
        resource_type: 'user',
        resource_id: userId,
        status: 'SUCCESS',
        ip_address: req.ip || '',
        user_agent: req.get('user-agent') || '',
      },
    });

    // Set headers for download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="magicsaas-data-export-${userId}-${Date.now()}.json"`
    );

    return res.json(dataExport);
  } catch (error) {
    console.error('GDPR export error:', error);
    return res.status(500).json({ error: 'Failed to export user data' });
  }
}

/**
 * @route POST /api/v1/users/me/delete
 * @description Request account deletion (GDPR Article 17 - Right to Erasure)
 * @access Private
 */
export async function requestAccountDeletion(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    // Set tenant context
    await prisma.$executeRaw`SELECT set_current_tenant(${tenantId})`;

    // Create deletion request (async processing via Inngest)
    await prisma.auditLog.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        action: 'GDPR_DELETE_REQUEST',
        resource_type: 'user',
        resource_id: userId,
        status: 'SUCCESS',
        ip_address: req.ip || '',
        user_agent: req.get('user-agent') || '',
        metadata: {
          requested_at: new Date().toISOString(),
          deletion_scheduled_for: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days grace period
        },
      },
    });

    return res.json({
      message: 'Account deletion requested successfully',
      deletion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      grace_period_days: 30,
      note: 'You can cancel this request within 30 days by logging in',
    });
  } catch (error) {
    console.error('GDPR deletion request error:', error);
    return res.status(500).json({ error: 'Failed to process deletion request' });
  }
}

/**
 * @route GET /api/v1/users/me/data-portability
 * @description Export data in portable format (GDPR Article 20 - Right to Data Portability)
 * @access Private
 */
export async function exportPortableData(req: Request, res: Response) {
  // Similar to exportUserData but in standardized CSV format
  return res.status(501).json({ message: 'CSV export coming soon' });
}
