# =============================================
# STAGE 1: Builder
# Instala todas las dependencias, genera el
# cliente de Prisma y compila TypeScript a JS.
# =============================================
FROM node:20-alpine AS builder

# Instalar dependencias del sistema necesarias para compilar módulos nativos (pg)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar archivos de definición de dependencias primero (mejor caché de capas)
COPY package.json package-lock.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para tsc y prisma)
RUN npm ci

# Copiar el esquema de Prisma antes de generar el cliente
COPY prisma ./prisma

# Generar el cliente de Prisma (necesario antes de compilar)
RUN npx prisma generate

# Copiar el resto del código fuente
COPY tsconfig.json ./
COPY src ./src

# Compilar TypeScript → dist/
RUN npm run build

# =============================================
# STAGE 2: Runtime (Producción)
# Imagen mínima con sólo los artefactos
# necesarios para ejecutar la aplicación.
# =============================================
FROM node:20-alpine AS runtime

# Instalar dependencias del sistema mínimas para módulos nativos en runtime
RUN apk add --no-cache python3 make g++

# Variables de entorno de producción (sobrescribibles al correr el contenedor)
ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

# Copiar archivos de dependencias de producción
COPY package.json package-lock.json ./

# Instalar SÓLO las dependencias de producción (sin devDependencies)
RUN npm ci --omit=dev

# Copiar el esquema de Prisma y regenerar el cliente en el contexto de producción
COPY prisma ./prisma
RUN npx prisma generate

# Copiar los artefactos compilados desde el stage de builder
COPY --from=builder /app/dist ./dist

# Crear un usuario no-root para ejecutar la aplicación (seguridad)
RUN addgroup -S onniik && adduser -S onniik -G onniik

# Asegurar que el directorio de logs exista y tenga permisos correctos
RUN mkdir -p /app/logs && chown -R onniik:onniik /app

USER onniik

# Exponer el puerto del servidor Express
EXPOSE 5000

# Verificación de salud del contenedor usando el endpoint /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Comando de inicio de la aplicación compilada
CMD ["node", "dist/index.js"]
