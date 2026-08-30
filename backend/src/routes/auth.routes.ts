import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { authLimiter } from '../middlewares/rate-limit.middleware';

import googleOAuthRoutes from './google-oauth.routes';

const router = Router();

// ── Rutas públicas ────────────────────────────────────────────────────
// POST /api/v1/auth/register — Registro de nuevo usuario
router.post('/register', authLimiter, validateBody(registerSchema), register);

// POST /api/v1/auth/login — Inicio de sesión
router.post('/login', authLimiter, validateBody(loginSchema), login);

// ── Integración Google OAuth2 (Tarea 102) ──────────────────────────────
// GET /api/v1/auth/google — Redirección a Google OAuth2 consent screen
// GET /api/v1/auth/google/url — Retorna URL de consentimiento OAuth2 en JSON
router.use('/google', googleOAuthRoutes);

// ── Rutas protegidas (requieren JWT válido en cookie) ─────────────────
// POST /api/v1/auth/logout — Cierre de sesión
router.post('/logout', requireAuth, logout);

// GET /api/v1/auth/me — Perfil del usuario autenticado
router.get('/me', requireAuth, getMe);

export default router;
