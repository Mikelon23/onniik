import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// ── Rutas públicas ────────────────────────────────────────────────────
// POST /api/v1/auth/register — Registro de nuevo usuario
router.post('/register', register);

// POST /api/v1/auth/login — Inicio de sesión
router.post('/login', login);

// ── Rutas protegidas (requieren JWT válido en cookie) ─────────────────
// POST /api/v1/auth/logout — Cierre de sesión
router.post('/logout', requireAuth, logout);

// GET /api/v1/auth/me — Perfil del usuario autenticado
router.get('/me', requireAuth, getMe);

export default router;
