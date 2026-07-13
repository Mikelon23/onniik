import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import orgRoutes from './org.routes';
import saasRoutes from './saas.routes';
import alertRoutes from './alert.routes';
import logRoutes from './activity-log.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

// ── Rutas versionadas (v1) ────────────────────────────────────────────
const v1Router = Router();
v1Router.use('/health', healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/orgs', orgRoutes); // Tarea 80: gestión de organizaciones
v1Router.use('/saas', saasRoutes); // Tarea 81-82: inventario SaaS (productos y suscripciones)
v1Router.use('/alerts', alertRoutes); // Tarea 83: alertas de optimización IA
v1Router.use('/logs', logRoutes); // Tarea 84: historial de auditoría
v1Router.use('/dashboard', dashboardRoutes); // Tarea 87: panel consolidado de control

router.use('/v1', v1Router);

// ── Alias sin versión (compatibilidad con healthchecks de infraestructura)
// Permite que Docker, load balancers y proxies usen GET /api/health
router.use('/health', healthRoutes);

export default router;
