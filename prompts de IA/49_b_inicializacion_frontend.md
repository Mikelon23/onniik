# Configuración de Entorno: Inicialización del Cliente Frontend

Este documento detalla la estructura física y las dependencias de producción inicializadas para la interfaz cliente (frontend) del MVP de Onniik.

---

## 1. Estructura de Directorios del Frontend

Se ha inicializado el proyecto utilizando **Vite** y la plantilla **Vanilla JS** bajo la carpeta `/frontend`:

```text
frontend/
├── index.html
├── package.json
├── public/
│   └── vite.svg
└── src/
    ├── counter.js
    ├── main.js
    ├── style.css
    └── assets/
        └── javascript.svg
```

---

## 2. Dependencias de Desarrollo e Infraestructura

*   `vite`: Herramienta de compilación rápida y servidor de desarrollo HMR (Hot Module Replacement).
*   `vanilla-js`: Estructura pura de Javascript para evitar sobrecarga de frameworks React/Vue en el MVP, alineado con el diseño estético de alta velocidad.

---

## 3. Comandos de Operación

*   **Instalar Dependencias**: `npm install`
*   **Servidor de Desarrollo**: `npm run dev`
*   **Compilar para Producción**: `npm run build`
*   **Previsualizar Compilación**: `npm run preview`
