import { rateLimit } from 'express-rate-limit';
import { TooManyRequestsError } from '../errors/AppError';

// General API Rate Limiter
// Defaults: 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new TooManyRequestsError());
  },
});

// Authentication Rate Limiter
// Defaults: 10 requests per 15 minutes (stricter to prevent brute force)
export const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new TooManyRequestsError(
        'Demasiados intentos de acceso o invitación. Por favor, inténtelo de nuevo más tarde.'
      )
    );
  },
});

// AI Rate Limiter
// Defaults: 5 requests per 15 minutes (to avoid LLM API abuse)
export const aiLimiter = rateLimit({
  windowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.AI_RATE_LIMIT_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new TooManyRequestsError(
        'Límite de solicitudes de IA excedido. Por favor, inténtelo de nuevo más tarde.'
      )
    );
  },
});
