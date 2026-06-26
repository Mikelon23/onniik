import { Router } from 'express';
import healthRoutes from './health.routes';

const router = Router();

// Registrar submódulos de rutas
router.use('/health', healthRoutes);

export default router;
