import winston from 'winston';
import path from 'path';

// Definir niveles de logs (conforme al estándar RFC5424)
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Determinar el nivel de logging actual basado en el entorno
const level = (): string => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Definir colores para los niveles en modo desarrollo
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Registrar colores con Winston
winston.addColors(colors);

// Formato de desarrollo: legible y coloreado para la consola
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `[${info.timestamp}] [${info.level}]: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Formato de producción: JSON estructurado y serialización limpia de errores
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const isDev = (process.env.NODE_ENV || 'development') === 'development';

// Transports (transportadores) activos para el logger
const transports: winston.transport[] = [
  // 1. Siempre registrar logs en la consola
  new winston.transports.Console({
    format: isDev ? developmentFormat : productionFormat,
  }),
];

// Definir la ruta del directorio de archivos de logs
const logDir = path.join(process.cwd(), 'logs');

// 2. Registrar persistencia en archivos localmente
transports.push(
  // Guardar solo logs de nivel error
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: productionFormat,
  }),
  // Guardar todos los logs (error, warn, info, http, debug)
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: productionFormat,
  })
);

// Inicializar la instancia central de Winston Logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

export default logger;
