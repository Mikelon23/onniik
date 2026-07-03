# =============================================
# STAGE 1: Builder
# Instala dependencias y compila la SPA de
# Vite generando los assets estáticos en /dist
# =============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias primero (cacheo óptimo de capas)
COPY package.json package-lock.json ./

# Instalar todas las dependencias (incluyendo vite como devDependency)
RUN npm ci

# Copiar el código fuente completo
COPY . .

# Construir la aplicación para producción.
# VITE_API_URL se inyecta como build arg para que sea bakeado en el bundle.
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# =============================================
# STAGE 2: Runtime (Nginx)
# Imagen mínima nginx:alpine para servir los
# assets estáticos con rendimiento máximo.
# =============================================
FROM nginx:stable-alpine AS runtime

# Remover la configuración default de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar la configuración personalizada de nginx para la SPA
COPY nginx.conf /etc/nginx/conf.d/onniik.conf

# Copiar el bundle compilado desde el stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto HTTP estándar
EXPOSE 80

# Verificación de salud del contenedor
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/index.html || exit 1

# Nginx se inicia en primer plano (foreground) para que Docker lo gestione
CMD ["nginx", "-g", "daemon off;"]
