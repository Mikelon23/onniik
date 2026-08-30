/**
 * google-oauth.routes.ts
 * Rutas para el flujo de autorización OAuth2 de Google Workspace.
 */

import { Router } from 'express';
import { getGoogleAuthUrl, redirectToGoogleAuth } from '../controllers/google-oauth.controller';

const router = Router();

// GET /api/v1/auth/google/url — Retorna la URL de consentimiento en JSON
router.get('/url', getGoogleAuthUrl);

// GET /api/v1/auth/google — Redirige (302) a la pantalla de consentimiento de Google
router.get('/', redirectToGoogleAuth);

export default router;
