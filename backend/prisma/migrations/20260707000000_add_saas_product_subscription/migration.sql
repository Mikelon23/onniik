-- ============================================================
-- Migration: add_saas_product_subscription
-- Task: 71 — Extender schema con SaaSProduct y SaaSSubscription
-- Date: 2026-07-07
-- ============================================================

-- CreateEnum
CREATE TYPE "SaaSCategory" AS ENUM (
  'PRODUCTIVITY',
  'COMMUNICATION',
  'DEVELOPMENT',
  'SALES_CRM',
  'MARKETING',
  'DESIGN',
  'FINANCE',
  'HR_PEOPLE',
  'SECURITY',
  'INFRASTRUCTURE',
  'ANALYTICS',
  'CUSTOMER_SUCCESS',
  'OTHER'
);

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM (
  'MONTHLY',
  'QUARTERLY',
  'ANNUAL',
  'ONE_TIME',
  'CUSTOM'
);

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'CANCELLED',
  'PENDING_REVIEW',
  'SHADOW_IT'
);

-- CreateEnum
CREATE TYPE "DetectionSource" AS ENUM (
  'GOOGLE_WORKSPACE',
  'SLACK',
  'EMAIL_SCAN',
  'CSV_IMPORT',
  'MANUAL_ENTRY'
);

-- CreateTable: saas_products
-- Catálogo global de herramientas SaaS conocidas por Onniik.
-- Compartido entre todas las organizaciones (no pertenece a ninguna).
CREATE TABLE "saas_products" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "slug"        TEXT NOT NULL,
    "category"    "SaaSCategory" NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "website"     TEXT,
    "logo_url"    TEXT,
    "vendor"      TEXT,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable: saas_subscriptions
-- Núcleo del inventario de Onniik. Representa la relación
-- entre una organización y un producto SaaS (con sus metadatos financieros).
CREATE TABLE "saas_subscriptions" (
    "id"                 TEXT NOT NULL,
    "organization_id"    TEXT NOT NULL,
    "saas_product_id"    TEXT NOT NULL,
    "owner_id"           TEXT,
    "status"             "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "detection_source"   "DetectionSource"   NOT NULL DEFAULT 'MANUAL_ENTRY',
    "seat_count"         INTEGER,
    "active_seats"       INTEGER,
    "cost_per_seat"      DECIMAL(10,2),
    "total_monthly_cost" DECIMAL(12,2),
    "currency"           TEXT NOT NULL DEFAULT 'USD',
    "billing_cycle"      "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "renewal_date"       TIMESTAMP(3),
    "contract_start"     TIMESTAMP(3),
    "contract_end"       TIMESTAMP(3),
    "external_id"        TEXT,
    "notes"              TEXT,
    "created_at"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"         TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_subscriptions_pkey" PRIMARY KEY ("id")
);

-- Unique constraints: saas_products
CREATE UNIQUE INDEX "saas_products_name_key" ON "saas_products"("name");
CREATE UNIQUE INDEX "saas_products_slug_key" ON "saas_products"("slug");

-- Performance indexes: saas_products
CREATE INDEX "saas_products_category_idx" ON "saas_products"("category");
CREATE INDEX "saas_products_slug_idx"     ON "saas_products"("slug");

-- Performance indexes: saas_subscriptions
CREATE INDEX "saas_subscriptions_organization_id_idx"
  ON "saas_subscriptions"("organization_id");

CREATE INDEX "saas_subscriptions_organization_id_status_idx"
  ON "saas_subscriptions"("organization_id", "status");

CREATE INDEX "saas_subscriptions_organization_id_saas_product_id_idx"
  ON "saas_subscriptions"("organization_id", "saas_product_id");

CREATE INDEX "saas_subscriptions_renewal_date_idx"
  ON "saas_subscriptions"("renewal_date");

CREATE INDEX "saas_subscriptions_status_idx"
  ON "saas_subscriptions"("status");

CREATE INDEX "saas_subscriptions_detection_source_idx"
  ON "saas_subscriptions"("detection_source");

-- Unique constraint: evita duplicados del mismo producto en una org con mismo externalId
CREATE UNIQUE INDEX "saas_subscriptions_organization_id_saas_product_id_external_key"
  ON "saas_subscriptions"("organization_id", "saas_product_id", "external_id");

-- Foreign Keys: saas_subscriptions
ALTER TABLE "saas_subscriptions"
  ADD CONSTRAINT "saas_subscriptions_organization_id_fkey"
  FOREIGN KEY ("organization_id")
  REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "saas_subscriptions"
  ADD CONSTRAINT "saas_subscriptions_saas_product_id_fkey"
  FOREIGN KEY ("saas_product_id")
  REFERENCES "saas_products"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "saas_subscriptions"
  ADD CONSTRAINT "saas_subscriptions_owner_id_fkey"
  FOREIGN KEY ("owner_id")
  REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
