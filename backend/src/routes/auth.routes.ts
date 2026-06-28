import { Router } from 'express';
import { login, logout, getMe } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Rutas públicas
router.post('/login', login);

// Rutas protegidas
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);

export default router;
