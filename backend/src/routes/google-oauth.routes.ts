/**
 * google-oauth.routes.ts
 * Rutas para el flujo de autorización OAuth2 de Google Workspace.
 */

import { Router } from 'express';
import {
  getGoogleAuthUrl,
  redirectToGoogleAuth,
  handleGoogleCallback,
  refreshGoogleToken,
} from '../controllers/google-oauth.controller';
import { getDirectoryUsers } from '../controllers/google-directory.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/v1/auth/google/url — Retorna la URL de consentimiento en JSON
router.get('/url', getGoogleAuthUrl);

// GET /api/v1/auth/google/callback — Recibe código de autorización, intercambia tokens y guarda en BD
router.get('/callback', handleGoogleCallback);

// POST /api/v1/auth/google/refresh — Renueva el token de acceso de Google usando el refresh token
router.post('/refresh', requireAuth, refreshGoogleToken);

// GET /api/v1/auth/google/directory/users — Obtiene usuarios y empleados del dominio Google Workspace
router.get('/directory/users', requireAuth, requireRole('ADMIN', 'IT_MANAGER'), getDirectoryUsers);

// GET /api/v1/auth/google — Redirige (302) a la pantalla de consentimiento de Google
router.get('/', redirectToGoogleAuth);

export default router;
