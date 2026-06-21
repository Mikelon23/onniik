# Configuración de Entorno: Inicialización del Servidor Backend

Este documento detalla la estructura física y las dependencias de producción inicializadas para el módulo backend del MVP de Onniik.

---

## 1. Estructura de Directorios del Backend

Se ha inicializado la siguiente estructura limpia de carpetas bajo `/backend`:

```text
backend/
├── package.json
└── src/
    └── index.js
```

---

## 2. Dependencias de Producción y Desarrollo Instaladas

*   `express`: Framework base para la construcción de las APIs REST del sistema.
*   `cors`: Habilita solicitudes de recursos de origen cruzado seguras para comunicarse con la interfaz frontend.
*   `helmet`: Middleware de seguridad que configura cabeceras HTTP defensivas (bloqueando ataques XSS, clickjacking, etc.).
*   `morgan`: Logger de peticiones HTTP en consola simplificado para depuración rápida.
*   `dotenv`: Administrador de carga de variables de entorno desde archivos `.env`.
*   `nodemon` (Dev): Recarga automáticamente el servidor ante cualquier cambio detectado en el código fuente.

---

## 3. Comandos de Operación

*   **Instalar Dependencias**: `npm install`
*   **Iniciar Servidor (Producción)**: `npm start`
*   **Iniciar Servidor (Desarrollo)**: `npm run dev`
