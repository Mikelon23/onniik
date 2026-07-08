-- ============================================================
-- Migration: add_oauth_activitylog_optimizationalert
-- Task: 72 — Agregar OAuthCredential, ActivityLog y OptimizationAlert
-- Date: 2026-07-07
-- ============================================================

-- CreateEnum: OAuthProvider
CREATE TYPE "OAuthProvider" AS ENUM (
  'GOOGLE_WORKSPACE',
  'SLACK',
  'STRIPE'
);

-- CreateEnum: ActivityAction
CREATE TYPE "ActivityAction" AS ENUM (
  'USER_LOGIN',
  'USER_LOGOUT',
  'USER_REGISTER',
  'PASSWORD_CHANGED',
  'INTEGRATION_CONNECTED',
  'INTEGRATION_DISCONNECTED',
  'INTEGRATION_SYNC_STARTED',
  'INTEGRATION_SYNC_COMPLETED',
  'INTEGRATION_SYNC_FAILED',
  'SUBSCRIPTION_CREATED',
  'SUBSCRIPTION_UPDATED',
  'SUBSCRIPTION_CANCELLED',
  'SHADOW_IT_DETECTED',
  'ALERT_CREATED',
  'ALERT_ACCEPTED',
  'ALERT_DISMISSED',
  'AI_DRAFT_GENERATED',
  'MEMBER_INVITED',
  'MEMBER_REMOVED',
  'ROLE_CHANGED',
  'CSV_IMPORTED',
  'DATA_EXPORTED'
);

-- CreateEnum: AlertStatus
CREATE TYPE "AlertStatus" AS ENUM (
  'PENDING',
  'ACCEPTED',
  'DISMISSED',
  'COMPLETED',
  'EXPIRED'
);

-- CreateEnum: AlertType
CREATE TYPE "AlertType" AS ENUM (
  'INACTIVE_SEATS',
  'DUPLICATE_TOOL',
  'RENEWAL_APPROACHING',
  'SHADOW_IT_FOUND',
  'COST_ANOMALY',
  'LICENCE_DOWNGRADE',
  'CANCELLATION_CANDIDATE'
);

-- CreateTable: oauth_credentials
-- Tokens OAuth cifrados (AES-256) por organización e integración.
-- Nunca se almacena plaintext — solo ciphertext del access/refresh token.
CREATE TABLE "oauth_credentials" (
    "id"                   TEXT NOT NULL,
    "organization_id"      TEXT NOT NULL,
    "provider"             "OAuthProvider" NOT NULL,
    "access_token_enc"     TEXT NOT NULL,
    "refresh_token_enc"    TEXT,
    "scope"                TEXT,
    "token_type"           TEXT NOT NULL DEFAULT 'Bearer',
    "expires_at"           TIMESTAMP(3),
    "is_active"            BOOLEAN NOT NULL DEFAULT true,
    "external_account_id"  TEXT,
    "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"           TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable: activity_logs
-- Log inmutable de auditoría. Sin columna updated_at por diseño (append-only).
CREATE TABLE "activity_logs" (
    "id"              TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id"         TEXT,
    "actor_type"      TEXT NOT NULL DEFAULT 'user',
    "action"          "ActivityAction" NOT NULL,
    "entity_type"     TEXT,
    "entity_id"       TEXT,
    "metadata"        JSONB,
    "ip_address"      TEXT,
    "user_agent"      TEXT,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: optimization_alerts
-- Alertas de optimización generadas por el motor de IA de Onniik.
CREATE TABLE "optimization_alerts" (
    "id"               TEXT NOT NULL,
    "organization_id"  TEXT NOT NULL,
    "subscription_id"  TEXT,
    "alert_type"       "AlertType"   NOT NULL,
    "status"           "AlertStatus" NOT NULL DEFAULT 'PENDING',
    "title"            TEXT NOT NULL,
    "description"      TEXT NOT NULL,
    "recommendation"   TEXT NOT NULL,
    "estimated_savings" DECIMAL(12,2),
    "currency"         TEXT NOT NULL DEFAULT 'USD',
    "ai_model_version" TEXT,
    "confidence_score" DOUBLE PRECISION,
    "ai_raw_response"  JSONB,
    "resolved_by_id"   TEXT,
    "resolved_at"      TIMESTAMP(3),
    "resolution_note"  TEXT,
    "expires_at"       TIMESTAMP(3),
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "optimization_alerts_pkey" PRIMARY KEY ("id")
);

-- Indexes: oauth_credentials
CREATE UNIQUE INDEX "oauth_credentials_organization_id_provider_key"
  ON "oauth_credentials"("organization_id", "provider");
CREATE INDEX "oauth_credentials_organization_id_idx" ON "oauth_credentials"("organization_id");
CREATE INDEX "oauth_credentials_provider_idx"         ON "oauth_credentials"("provider");
CREATE INDEX "oauth_credentials_expires_at_idx"       ON "oauth_credentials"("expires_at");

-- Indexes: activity_logs
CREATE INDEX "activity_logs_organization_id_idx"
  ON "activity_logs"("organization_id");
CREATE INDEX "activity_logs_organization_id_action_idx"
  ON "activity_logs"("organization_id", "action");
CREATE INDEX "activity_logs_organization_id_created_at_idx"
  ON "activity_logs"("organization_id", "created_at");
CREATE INDEX "activity_logs_user_id_idx"
  ON "activity_logs"("user_id");
CREATE INDEX "activity_logs_entity_type_entity_id_idx"
  ON "activity_logs"("entity_type", "entity_id");
CREATE INDEX "activity_logs_created_at_idx"
  ON "activity_logs"("created_at");

-- Indexes: optimization_alerts
CREATE INDEX "optimization_alerts_organization_id_idx"
  ON "optimization_alerts"("organization_id");
CREATE INDEX "optimization_alerts_organization_id_status_idx"
  ON "optimization_alerts"("organization_id", "status");
CREATE INDEX "optimization_alerts_organization_id_alert_type_idx"
  ON "optimization_alerts"("organization_id", "alert_type");
CREATE INDEX "optimization_alerts_subscription_id_idx"
  ON "optimization_alerts"("subscription_id");
CREATE INDEX "optimization_alerts_status_idx"
  ON "optimization_alerts"("status");
CREATE INDEX "optimization_alerts_expires_at_idx"
  ON "optimization_alerts"("expires_at");

-- Foreign Keys: oauth_credentials
ALTER TABLE "oauth_credentials"
  ADD CONSTRAINT "oauth_credentials_organization_id_fkey"
  FOREIGN KEY ("organization_id")
  REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign Keys: activity_logs
ALTER TABLE "activity_logs"
  ADD CONSTRAINT "activity_logs_organization_id_fkey"
  FOREIGN KEY ("organization_id")
  REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "activity_logs"
  ADD CONSTRAINT "activity_logs_user_id_fkey"
  FOREIGN KEY ("user_id")
  REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys: optimization_alerts
ALTER TABLE "optimization_alerts"
  ADD CONSTRAINT "optimization_alerts_organization_id_fkey"
  FOREIGN KEY ("organization_id")
  REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "optimization_alerts"
  ADD CONSTRAINT "optimization_alerts_subscription_id_fkey"
  FOREIGN KEY ("subscription_id")
  REFERENCES "saas_subscriptions"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "optimization_alerts"
  ADD CONSTRAINT "optimization_alerts_resolved_by_id_fkey"
  FOREIGN KEY ("resolved_by_id")
  REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
