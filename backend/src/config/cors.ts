import { CorsOptions } from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (como curl o llamadas locales del sistema)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por la política CORS de Onniik.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};
