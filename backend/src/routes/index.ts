import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import orgRoutes from './org.routes';

const router = Router();

// ── Rutas versionadas (v1) ────────────────────────────────────────────
const v1Router = Router();
v1Router.use('/health', healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/orgs', orgRoutes); // Tarea 80: gestión de organizaciones

router.use('/v1', v1Router);

// ── Alias sin versión (compatibilidad con healthchecks de infraestructura)
// Permite que Docker, load balancers y proxies usen GET /api/health
router.use('/health', healthRoutes);

export default router;
