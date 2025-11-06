-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'TRIAL', 'SUSPENDED', 'CHURNED');
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'QUANTUM');
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT', 'REFUND', 'BONUS');
CREATE TYPE "TransactionCategory" AS ENUM ('AI_USAGE', 'VOICE', 'EDGE', 'BLOCKCHAIN', 'QUANTUM', 'RECHARGE', 'SUBSCRIPTION', 'REFERRAL');
CREATE TYPE "ServiceType" AS ENUM ('LLM', 'VOICE_TTS', 'VOICE_STT', 'OCR', 'EDGE_COMPUTE', 'BLOCKCHAIN_TX', 'QUANTUM_JOB');
CREATE TYPE "WorkflowStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DRAFT');
CREATE TYPE "ExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE "AIProviderType" AS ENUM ('LLM', 'VISION', 'EMBEDDING', 'VOICE');
CREATE TYPE "VoiceSessionType" AS ENUM ('INTERACTIVE', 'BATCH', 'STREAMING');
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED');
CREATE TYPE "InstallationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR');
CREATE TYPE "ModelType" AS ENUM ('CLASSIFICATION', 'REGRESSION', 'NLP', 'VISION');
CREATE TYPE "PrivacyLevel" AS ENUM ('DIFFERENTIAL', 'SECURE_AGGREGATION', 'HOMOMORPHIC');
CREATE TYPE "FederatedModelStatus" AS ENUM ('INITIALIZING', 'TRAINING', 'AGGREGATING', 'COMPLETED');
CREATE TYPE "ParticipantStatus" AS ENUM ('ENROLLED', 'TRAINING', 'SUBMITTED', 'DROPPED');
CREATE TYPE "QuantumJobType" AS ENUM ('OPTIMIZATION', 'SIMULATION', 'ML', 'CRYPTOGRAPHY');
CREATE TYPE "QuantumJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');
CREATE TYPE "AuditStatus" AS ENUM ('SUCCESS', 'FAILURE');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "plan_id" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'TRIAL',
    "branding" JSONB NOT NULL,
    "features" TEXT[],
    "limits" JSONB NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role_id" TEXT NOT NULL,
    "permissions" TEXT[],
    "twofa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "twofa_secret" TEXT,
    "last_login_at" TIMESTAMP(3),
    "login_count" INTEGER NOT NULL DEFAULT 0,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tier" "PlanTier" NOT NULL,
    "pricing" JSONB NOT NULL,
    "limits" JSONB NOT NULL,
    "features" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_wallets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'LOTUS_CREDITS',
    "reserved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lifetime_earned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lifetime_spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_recharge_at" TIMESTAMP(3),
    "auto_recharge_enabled" BOOLEAN NOT NULL DEFAULT false,
    "auto_recharge_threshold" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "auto_recharge_amount" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_transactions" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category" "TransactionCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "reference_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_records" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "service_type" "ServiceType" NOT NULL,
    "provider" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "cost_credits" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "execution_count" INTEGER NOT NULL DEFAULT 0,
    "last_executed_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_executions" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "status" "ExecutionStatus" NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "duration_ms" INTEGER,

    CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AIProviderType" NOT NULL,
    "provider" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "cost_per_unit" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_sessions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_type" "VoiceSessionType" NOT NULL,
    "language" TEXT NOT NULL,
    "features" TEXT[],
    "context_data" JSONB,
    "duration_seconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "cost_credits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "voice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_contexts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "context_data" JSONB NOT NULL DEFAULT '{}',
    "personality_profile" JSONB NOT NULL DEFAULT '{}',
    "interaction_history" JSONB NOT NULL DEFAULT '[]',
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "last_interaction_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voice_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_plugins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "ipfs_hash" TEXT NOT NULL,
    "blockchain_tx_hash" TEXT,
    "nft_token_id" TEXT,
    "price_usd" DOUBLE PRECISION NOT NULL,
    "price_crypto" JSONB,
    "royalty_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "total_sales" INTEGER NOT NULL DEFAULT 0,
    "rating_avg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "installs_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_plugins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugin_purchases" (
    "id" TEXT NOT NULL,
    "plugin_id" TEXT NOT NULL,
    "buyer_tenant_id" TEXT NOT NULL,
    "buyer_user_id" TEXT,
    "amount_paid_usd" DOUBLE PRECISION NOT NULL,
    "amount_paid_crypto" JSONB,
    "blockchain_tx_hash" TEXT,
    "license_key" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plugin_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugin_installations" (
    "id" TEXT NOT NULL,
    "plugin_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "InstallationStatus" NOT NULL DEFAULT 'ACTIVE',
    "config" JSONB,
    "installed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugin_installations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "federated_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "model_type" "ModelType" NOT NULL,
    "base_model_version" TEXT NOT NULL,
    "current_round" INTEGER NOT NULL DEFAULT 0,
    "total_rounds" INTEGER NOT NULL,
    "min_participants" INTEGER NOT NULL,
    "privacy_level" "PrivacyLevel" NOT NULL,
    "status" "FederatedModelStatus" NOT NULL DEFAULT 'INITIALIZING',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "federated_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "federated_participants" (
    "id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'ENROLLED',
    "contribution_count" INTEGER NOT NULL DEFAULT 0,
    "last_contribution_at" TIMESTAMP(3),
    "rewards_earned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "federated_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quantum_jobs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_type" "QuantumJobType" NOT NULL,
    "algorithm" TEXT NOT NULL,
    "backend" TEXT NOT NULL,
    "input_data" JSONB NOT NULL,
    "output_data" JSONB,
    "status" "QuantumJobStatus" NOT NULL DEFAULT 'QUEUED',
    "cost_credits" DOUBLE PRECISION NOT NULL,
    "execution_time_ms" INTEGER,
    "quantum_advantage" DOUBLE PRECISION,
    "error_rate" DOUBLE PRECISION,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "quantum_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "changes" JSONB,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "status" "AuditStatus" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
CREATE UNIQUE INDEX "tenants_domain_key" ON "tenants"("domain");
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");
CREATE INDEX "tenants_domain_idx" ON "tenants"("domain");
CREATE INDEX "tenants_status_idx" ON "tenants"("status");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenant_id_name_key" ON "roles"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "credit_wallets_tenant_id_key" ON "credit_wallets"("tenant_id");

-- CreateIndex
CREATE INDEX "credit_transactions_wallet_id_idx" ON "credit_transactions"("wallet_id");
CREATE INDEX "credit_transactions_created_at_idx" ON "credit_transactions"("created_at");

-- CreateIndex
CREATE INDEX "usage_records_tenant_id_idx" ON "usage_records"("tenant_id");
CREATE INDEX "usage_records_service_type_idx" ON "usage_records"("service_type");
CREATE INDEX "usage_records_created_at_idx" ON "usage_records"("created_at");

-- CreateIndex
CREATE INDEX "workflows_tenant_id_idx" ON "workflows"("tenant_id");
CREATE INDEX "workflows_status_idx" ON "workflows"("status");

-- CreateIndex
CREATE INDEX "workflow_executions_workflow_id_idx" ON "workflow_executions"("workflow_id");
CREATE INDEX "workflow_executions_status_idx" ON "workflow_executions"("status");
CREATE INDEX "workflow_executions_started_at_idx" ON "workflow_executions"("started_at");

-- CreateIndex
CREATE UNIQUE INDEX "ai_providers_name_key" ON "ai_providers"("name");

-- CreateIndex
CREATE INDEX "voice_sessions_tenant_id_idx" ON "voice_sessions"("tenant_id");
CREATE INDEX "voice_sessions_user_id_idx" ON "voice_sessions"("user_id");
CREATE INDEX "voice_sessions_started_at_idx" ON "voice_sessions"("started_at");

-- CreateIndex
CREATE UNIQUE INDEX "voice_contexts_user_id_key" ON "voice_contexts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_plugins_slug_key" ON "marketplace_plugins"("slug");
CREATE INDEX "marketplace_plugins_slug_idx" ON "marketplace_plugins"("slug");
CREATE INDEX "marketplace_plugins_category_idx" ON "marketplace_plugins"("category");
CREATE INDEX "marketplace_plugins_verified_idx" ON "marketplace_plugins"("verified");

-- CreateIndex
CREATE UNIQUE INDEX "plugin_purchases_license_key_key" ON "plugin_purchases"("license_key");
CREATE INDEX "plugin_purchases_plugin_id_idx" ON "plugin_purchases"("plugin_id");
CREATE INDEX "plugin_purchases_buyer_tenant_id_idx" ON "plugin_purchases"("buyer_tenant_id");
CREATE INDEX "plugin_purchases_license_key_idx" ON "plugin_purchases"("license_key");

-- CreateIndex
CREATE INDEX "plugin_installations_tenant_id_idx" ON "plugin_installations"("tenant_id");
CREATE UNIQUE INDEX "plugin_installations_plugin_id_tenant_id_key" ON "plugin_installations"("plugin_id", "tenant_id");

-- CreateIndex
CREATE INDEX "federated_participants_model_id_idx" ON "federated_participants"("model_id");
CREATE UNIQUE INDEX "federated_participants_model_id_tenant_id_key" ON "federated_participants"("model_id", "tenant_id");

-- CreateIndex
CREATE INDEX "quantum_jobs_tenant_id_idx" ON "quantum_jobs"("tenant_id");
CREATE INDEX "quantum_jobs_user_id_idx" ON "quantum_jobs"("user_id");
CREATE INDEX "quantum_jobs_status_idx" ON "quantum_jobs"("status");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs"("tenant_id");
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_wallets" ADD CONSTRAINT "credit_wallets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "credit_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_sessions" ADD CONSTRAINT "voice_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_sessions" ADD CONSTRAINT "voice_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_contexts" ADD CONSTRAINT "voice_contexts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_purchases" ADD CONSTRAINT "plugin_purchases_plugin_id_fkey" FOREIGN KEY ("plugin_id") REFERENCES "marketplace_plugins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_installations" ADD CONSTRAINT "plugin_installations_plugin_id_fkey" FOREIGN KEY ("plugin_id") REFERENCES "marketplace_plugins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_installations" ADD CONSTRAINT "plugin_installations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "federated_participants" ADD CONSTRAINT "federated_participants_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "federated_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "federated_participants" ADD CONSTRAINT "federated_participants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quantum_jobs" ADD CONSTRAINT "quantum_jobs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quantum_jobs" ADD CONSTRAINT "quantum_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
