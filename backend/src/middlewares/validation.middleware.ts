/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../errors/AppError';

/**
 * Middleware para validar el cuerpo de la petición (req.body) utilizando un esquema Zod.
 * En caso de error de validación, lanza un BadRequestError con los detalles estructurados.
 */
export const validateBody = (schema: ZodSchema<any, any, any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new BadRequestError('Error de validación en el cuerpo de la solicitud.', details));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware para validar los parámetros de la ruta (req.params) utilizando un esquema Zod.
 */
export const validateParams = (schema: ZodSchema<any, any, any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = (await schema.parseAsync(req.params)) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new BadRequestError('Error de validación en los parámetros de la ruta.', details));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware para validar los parámetros de búsqueda (req.query) utilizando un esquema Zod.
 */
export const validateQuery = (schema: ZodSchema<any, any, any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = (await schema.parseAsync(req.query)) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new BadRequestError('Error de validación en los parámetros de búsqueda.', details));
      } else {
        next(error);
      }
    }
  };
};
