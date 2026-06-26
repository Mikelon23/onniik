import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError';

export const errorHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

  // 1. Registro del error (para posterior acoplamiento a logger estructurado)
  console.error('[ERROR]', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // 2. Errores operacionales conocidos de la aplicación (AppError)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.statusCode >= 500 ? 'error' : 'fail',
      message: err.message,
      ...(err.details && { details: err.details }),
      ...(isDev && { stack: err.stack }),
    });
    return;
  }

  // 3. Errores conocidos de Prisma ORM
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let statusCode = 500;
    let message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let details: any = null;

    switch (err.code) {
      case 'P2002':
        statusCode = 409; // Conflict
        message = 'El registro con este identificador único ya existe.';
        details = { target: err.meta?.target };
        break;
      case 'P2025':
        statusCode = 404; // Not Found
        message = 'El registro solicitado no fue encontrado.';
        break;
      case 'P2003':
        statusCode = 400; // Bad Request
        message = 'Error de integridad referencial. El registro padre/hijo relacionado no existe.';
        details = { field: err.meta?.field_name };
        break;
      default:
        message = `Error en base de datos (${err.code}).`;
    }

    res.status(statusCode).json({
      status: 'fail',
      message,
      ...(details && { details }),
      ...(isDev && { stack: err.stack }),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      status: 'fail',
      message: 'Los datos enviados no coinciden con el esquema requerido por la base de datos.',
      ...(isDev && { stack: err.stack }),
    });
    return;
  }

  // 4. Errores de sintaxis de JSON en Express body parsing
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    res.status(400).json({
      status: 'fail',
      message: 'Sintaxis JSON inválida en el cuerpo de la petición.',
    });
    return;
  }

  // 5. Errores inesperados o de programación (500)
  res.status(500).json({
    status: 'error',
    message: isDev
      ? err.message || 'Error interno del servidor.'
      : 'Algo salió mal en el servidor.',
    ...(isDev && { stack: err.stack }),
  });
};
