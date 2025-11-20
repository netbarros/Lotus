/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MAGICSAAS SYSTEM-∞ - PRISMA SEED
 * Seed database with development & demo data
 * Version: ∞.2026.Q1
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { PrismaClient, PlanTier, TenantStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MagicSaaS database seeding...\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. CREATE PLANS
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('📋 Creating plans...');

  const planFree = await prisma.plan.upsert({
    where: { name: 'Free' },
    update: {},
    create: {
      name: 'Free',
      description: 'Perfect for trying out MagicSaaS',
      tier: PlanTier.FREE,
      pricing: {
        monthly_usd: 0,
        annual_usd: 0,
        currency: 'USD',
      },
      limits: {
        seats: 1,
        ai_tokens_monthly: 10000,
        voice_minutes_monthly: 30,
        storage_gb: 1,
        api_rate_limit: 100,
        workflows: 3,
      },
      features: ['Basic SaaS Generation', 'Community Support', 'Basic Templates'],
      is_active: true,
    },
  });

  const planStarter = await prisma.plan.upsert({
    where: { name: 'Starter' },
    update: {},
    create: {
      name: 'Starter',
      description: 'For solo developers and small teams',
      tier: PlanTier.STARTER,
      pricing: {
        monthly_usd: 49,
        annual_usd: 490,
        currency: 'USD',
      },
      limits: {
        seats: 3,
        ai_tokens_monthly: 100000,
        voice_minutes_monthly: 300,
        storage_gb: 10,
        api_rate_limit: 1000,
        workflows: 25,
      },
      features: [
        'Advanced SaaS Generation',
        'Priority Support',
        'Premium Templates',
        'Custom Branding',
        'API Access',
      ],
      is_active: true,
    },
  });

  const planProfessional = await prisma.plan.upsert({
    where: { name: 'Professional' },
    update: {},
    create: {
      name: 'Professional',
      description: 'For growing businesses',
      tier: PlanTier.PROFESSIONAL,
      pricing: {
        monthly_usd: 149,
        annual_usd: 1490,
        currency: 'USD',
      },
      limits: {
        seats: 10,
        ai_tokens_monthly: 500000,
        voice_minutes_monthly: 1000,
        storage_gb: 50,
        api_rate_limit: 5000,
        workflows: 100,
      },
      features: [
        'Enterprise SaaS Generation',
        'Premium Support',
        'All Templates',
        'White Label',
        'Advanced API Access',
        'Custom Workflows',
        'SSO Integration',
      ],
      is_active: true,
    },
  });

  const planEnterprise = await prisma.plan.upsert({
    where: { name: 'Enterprise' },
    update: {},
    create: {
      name: 'Enterprise',
      description: 'For large organizations',
      tier: PlanTier.ENTERPRISE,
      pricing: {
        monthly_usd: 499,
        annual_usd: 4990,
        currency: 'USD',
      },
      limits: {
        seats: -1, // unlimited
        ai_tokens_monthly: -1, // unlimited
        voice_minutes_monthly: -1, // unlimited
        storage_gb: 500,
        api_rate_limit: 50000,
        workflows: -1, // unlimited
      },
      features: [
        'Unlimited SaaS Generation',
        'Dedicated Support',
        'All Templates + Custom',
        'Full White Label',
        'Unlimited API Access',
        'Custom Workflows',
        'SSO + SAML',
        'On-Premise Deployment',
        'SLA 99.9%',
      ],
      is_active: true,
    },
  });

  const planQuantum = await prisma.plan.upsert({
    where: { name: 'Quantum' },
    update: {},
    create: {
      name: 'Quantum',
      description: 'Cutting-edge quantum-powered AI (FUTURE)',
      tier: PlanTier.QUANTUM,
      pricing: {
        monthly_usd: 1999,
        annual_usd: 19990,
        currency: 'USD',
      },
      limits: {
        seats: -1,
        ai_tokens_monthly: -1,
        voice_minutes_monthly: -1,
        storage_gb: -1,
        api_rate_limit: -1,
        workflows: -1,
      },
      features: [
        'Everything in Enterprise',
        'Quantum AI Processing',
        'Neural Network Optimization',
        'Federated Learning',
        'Real-time Multi-Modal AI',
        'Custom AI Model Training',
      ],
      is_active: false, // Not yet available
    },
  });

  console.log(
    `✅ Created ${[planFree, planStarter, planProfessional, planEnterprise, planQuantum].length} plans\n`
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. CREATE DEMO TENANTS
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('🏢 Creating demo tenants...');

  const tenantAcme = await prisma.tenant.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      domain: 'acme.magicsaas.dev',
      plan_id: planEnterprise.id,
      status: TenantStatus.ACTIVE,
      branding: {
        logo_url: 'https://via.placeholder.com/200x50?text=ACME',
        primary_color: '#3B82F6',
        secondary_color: '#10B981',
        custom_css: '',
      },
      features: [
        'saas_generation',
        'microsaas_generation',
        'api_generation',
        'workflow_automation',
        'voice_interface',
        'marketplace',
        'white_label',
      ],
      limits: {
        max_users: -1,
        max_storage_gb: 500,
        api_rate_limit: 50000,
      },
      metadata: {
        industry: 'Technology',
        company_size: '100-500',
        country: 'US',
      },
    },
  });

  const tenantStartup = await prisma.tenant.upsert({
    where: { slug: 'startup-demo' },
    update: {},
    create: {
      name: 'Startup Demo Inc',
      slug: 'startup-demo',
      domain: 'startup.magicsaas.dev',
      plan_id: planStarter.id,
      status: TenantStatus.ACTIVE,
      branding: {
        logo_url: 'https://via.placeholder.com/200x50?text=Startup',
        primary_color: '#8B5CF6',
        secondary_color: '#EC4899',
        custom_css: '',
      },
      features: ['saas_generation', 'microsaas_generation', 'basic_workflows'],
      limits: {
        max_users: 3,
        max_storage_gb: 10,
        api_rate_limit: 1000,
      },
      metadata: {
        industry: 'SaaS',
        company_size: '1-10',
        country: 'BR',
      },
    },
  });

  console.log(`✅ Created ${[tenantAcme, tenantStartup].length} tenants\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. CREATE ROLES
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('👤 Creating roles...');

  const roleOwner = await prisma.role.upsert({
    where: { tenant_id_name: { tenant_id: tenantAcme.id, name: 'Owner' } },
    update: {},
    create: {
      tenant_id: tenantAcme.id,
      name: 'Owner',
      description: 'Full system access',
      permissions: {
        all: ['*'],
      },
      is_system: false,
    },
  });

  const roleAdmin = await prisma.role.upsert({
    where: { tenant_id_name: { tenant_id: tenantAcme.id, name: 'Admin' } },
    update: {},
    create: {
      tenant_id: tenantAcme.id,
      name: 'Admin',
      description: 'Administrative access',
      permissions: {
        manage: ['users', 'roles', 'workflows', 'integrations'],
        read: ['analytics', 'logs'],
        execute: ['workflows'],
      },
      is_system: false,
    },
  });

  const roleUser = await prisma.role.upsert({
    where: { tenant_id_name: { tenant_id: tenantAcme.id, name: 'User' } },
    update: {},
    create: {
      tenant_id: tenantAcme.id,
      name: 'User',
      description: 'Standard user access',
      permissions: {
        read: ['workflows', 'analytics'],
        execute: ['workflows'],
        create: ['requests'],
      },
      is_system: false,
    },
  });

  console.log(`✅ Created ${[roleOwner, roleAdmin, roleUser].length} roles\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. CREATE USERS
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('👥 Creating users...');

  const passwordHash = await bcrypt.hash('demo123456', 10);

  const userOwner = await prisma.user.upsert({
    where: { tenant_id_email: { tenant_id: tenantAcme.id, email: 'owner@acme.com' } },
    update: {},
    create: {
      tenant_id: tenantAcme.id,
      email: 'owner@acme.com',
      password_hash: passwordHash,
      full_name: 'John Doe (Owner)',
      avatar_url: 'https://via.placeholder.com/150?text=JD',
      role_id: roleOwner.id,
      permissions: [],
      twofa_enabled: false,
      preferences: {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: true,
        },
      },
    },
  });

  const userAdmin = await prisma.user.upsert({
    where: { tenant_id_email: { tenant_id: tenantAcme.id, email: 'admin@acme.com' } },
    update: {},
    create: {
      tenant_id: tenantAcme.id,
      email: 'admin@acme.com',
      password_hash: passwordHash,
      full_name: 'Jane Smith (Admin)',
      avatar_url: 'https://via.placeholder.com/150?text=JS',
      role_id: roleAdmin.id,
      permissions: [],
      twofa_enabled: true,
      twofa_secret: 'DEMO_SECRET_DO_NOT_USE_IN_PROD',
      preferences: {
        theme: 'light',
        language: 'en',
      },
    },
  });

  const userRegular = await prisma.user.upsert({
    where: { tenant_id_email: { tenant_id: tenantAcme.id, email: 'user@acme.com' } },
    update: {},
    create: {
      tenant_id: tenantAcme.id,
      email: 'user@acme.com',
      password_hash: passwordHash,
      full_name: 'Bob Johnson (User)',
      avatar_url: 'https://via.placeholder.com/150?text=BJ',
      role_id: roleUser.id,
      permissions: [],
      twofa_enabled: false,
      preferences: {
        theme: 'auto',
        language: 'en',
      },
    },
  });

  console.log(`✅ Created ${[userOwner, userAdmin, userRegular].length} users\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. CREATE CREDIT WALLETS
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('💰 Creating credit wallets...');

  const walletAcme = await prisma.creditWallet.upsert({
    where: { tenant_id: tenantAcme.id },
    update: {},
    create: {
      tenant_id: tenantAcme.id,
      balance: 10000.0,
      currency: 'LOTUS_CREDITS',
      reserved: 0,
      lifetime_earned: 15000.0,
      lifetime_spent: 5000.0,
    },
  });

  const walletStartup = await prisma.creditWallet.upsert({
    where: { tenant_id: tenantStartup.id },
    update: {},
    create: {
      tenant_id: tenantStartup.id,
      balance: 500.0,
      currency: 'LOTUS_CREDITS',
      reserved: 0,
      lifetime_earned: 1000.0,
      lifetime_spent: 500.0,
    },
  });

  console.log(`✅ Created ${[walletAcme, walletStartup].length} credit wallets\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('\n╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                          ║');
  console.log('║           ✅ DATABASE SEEDING COMPLETED SUCCESSFULLY ✅                  ║');
  console.log('║                                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

  console.log('📊 Summary:');
  console.log(`   • Plans: ${5} (Free, Starter, Professional, Enterprise, Quantum)`);
  console.log(`   • Tenants: ${2} (Acme Corp, Startup Demo)`);
  console.log(`   • Roles: ${3} (Owner, Admin, User)`);
  console.log(`   • Users: ${3}`);
  console.log(`   • Credit Wallets: ${2}`);
  console.log('');
  console.log('🔐 Demo Credentials:');
  console.log('   • Email: owner@acme.com');
  console.log('   • Email: admin@acme.com');
  console.log('   • Email: user@acme.com');
  console.log('   • Password (all): demo123456');
  console.log('');
  console.log('🌐 Demo Domains:');
  console.log('   • Acme Corp: acme.magicsaas.dev');
  console.log('   • Startup Demo: startup.magicsaas.dev');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
