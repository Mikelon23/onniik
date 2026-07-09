-- ============================================================
-- Migration: design_ai_savings_relationships
-- Task: 73 — Diseñar la relación entre usuarios, suscripciones
--             y recomendaciones de ahorro de IA
-- Date: 2026-07-09
-- ============================================================
-- Changes:
--   1. CreateEnum: AlertPriority (LOW, MEDIUM, HIGH, CRITICAL)
--   2. AlterTable: optimization_alerts
--      - ADD COLUMN triggered_by_user_id (FK → users.id)
--      - ADD COLUMN priority (AlertPriority, default MEDIUM)
--   3. AddForeignKey: optimization_alerts.triggered_by_user_id → users.id
--   4. CreateIndex: dashboard KPI composite index
--   5. CreateIndex: expiry cron composite index
--   6. CreateIndex: triggered_by_user_id, priority
-- ============================================================

-- CreateEnum: AlertPriority
-- Permite al dashboard ordenar alertas por impacto estimado.
-- Calculada por el LLM según ahorro, urgencia y tipo de alerta.
CREATE TYPE "AlertPriority" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
);

-- AlterTable: Add triggered_by_user_id column
-- NULL  = generada automáticamente por el motor de IA / cron job
-- UUID  = iniciada manualmente por un administrador o IT Manager
ALTER TABLE "optimization_alerts"
  ADD COLUMN "triggered_by_user_id" TEXT;

-- AlterTable: Add priority column with default MEDIUM
ALTER TABLE "optimization_alerts"
  ADD COLUMN "priority" "AlertPriority" NOT NULL DEFAULT 'MEDIUM';

-- AddForeignKey: optimization_alerts → users (triggered_by_user_id)
-- ON DELETE SET NULL: si el usuario es eliminado, la alerta queda como generada por sistema
ALTER TABLE "optimization_alerts"
  ADD CONSTRAINT "optimization_alerts_triggered_by_user_id_fkey"
  FOREIGN KEY ("triggered_by_user_id")
  REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex: Dashboard KPI query
-- Soporta: SELECT SUM(estimated_savings) WHERE org_id=? AND status='PENDING' ORDER BY estimated_savings DESC
-- Utilizado por el endpoint de resumen financiero del Dashboard
CREATE INDEX "optimization_alerts_dashboard_idx"
  ON "optimization_alerts"("organization_id", "status", "estimated_savings");

-- CreateIndex: Cron job de expiración automática
-- Soporta: UPDATE status='EXPIRED' WHERE status='PENDING' AND expires_at <= NOW()
CREATE INDEX "optimization_alerts_expiry_idx"
  ON "optimization_alerts"("status", "expires_at");

-- CreateIndex: triggered_by_user_id (historial de alertas iniciadas por usuario)
CREATE INDEX "optimization_alerts_triggered_by_user_id_idx"
  ON "optimization_alerts"("triggered_by_user_id");

-- CreateIndex: priority (filtrado rápido por nivel de urgencia)
CREATE INDEX "optimization_alerts_priority_idx"
  ON "optimization_alerts"("priority");
