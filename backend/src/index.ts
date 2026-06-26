import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { errorHandler } from './middlewares/error.middleware';
import { NotFoundError } from './errors/AppError';

dotenv.config();

const app = express();
const PORT: number | string = process.env.PORT || 5000;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Security & Utility Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Fallback for non-existent routes (404)
app.use((req: Request, res: Response, next: NextFunction) => {
  next(
    new NotFoundError(`La ruta solicitada ${req.originalUrl} no fue encontrada en este servidor.`)
  );
});

// Register Global Error Handling Middleware (must be at the end)
app.use(errorHandler);

// Database connection verification
async function checkDatabaseConnection(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('[ONNIIK-API] Conexión exitosa con la base de datos PostgreSQL.');
  } catch (error) {
    console.error('[ONNIIK-API] Error conectando a la base de datos:', error);
    process.exit(1);
  }
}

// Start Server
app.listen(PORT, async () => {
  await checkDatabaseConnection();
  console.log(`[ONNIIK-API] Servidor iniciado y escuchando en el puerto ${PORT}`);
});
