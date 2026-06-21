# Wireframe de Baja Fidelidad: Dashboard de Administración General

Este documento define la disposición espacial, estructura visual y jerarquía de componentes del panel de control principal de Onniik (`/dashboard`), optimizando la experiencia del CFO en la supervisión de costos y resolución de alertas de optimización.

---

## 1. Estructura de Retícula (Layout Grid)

La interfaz utiliza un diseño responsivo de dos columnas principales:
*   **Barra Lateral de Navegación (Sidebar)**: Ancho fijo de `260px` en pantallas de escritorio, colapsable en móviles.
*   **Área de Contenido Principal (Viewport)**: Ancho flexible con cuadrícula CSS Grid de 3 columnas para los widgets superiores y 2 columnas desiguales (relación 2:1) para el área central de gráficos y alertas.

---

## 2. Diagrama del Wireframe (ASCII Diagram)

```
+---------------------------------------------------------------------------------------------------+
|  [ONNIIK LOGO]       |  Buscar herramientas...                           [🔔]  [Admin: Google SSO]|
+----------------------+----------------------------------------------------------------------------+
|  [🏠] Dashboard      |                                                                            |
|  [📊] Ahorros        |  RESUMEN DE SUSCRIPCIONES (ORGANIZACIÓN)                                   |
|  [🔌] Integraciones  |  +--------------------+  +--------------------+  +----------------------+  |
|  [💬] Copilot        |  | Gasto Mensual (MRR)|  | Ahorro Neto Real   |  | Shadow IT Detectados |  |
|  [⚙️] Configuración   |  |     $4,850 USD     |  |     $1,220 USD     |  |       3 Alertas      |  |
|                      |  +--------------------+  +--------------------+  +----------------------+  |
|                      |                                                                            |
|                      |  +--------------------------------------------+  +----------------------+  |
|                      |  | GRÁFICO DE TENDENCIA DE COSTE              |  | ALERTAS DE ACCIÓN    |  |
|                      |  |                                            |  | [⚠️] Miro (Shadow IT) |  |
|                      |  | [ Gráfico de barras apiladas: Gasto vs     |  |   [ Optimizar con IA]|  |
|                      |  |   Ahorros mensuales, visualización cian ]  |  |                      |  |
|                      |  |                                            |  | [⚠️] Jira (Ex-emplead)|  |
|                      |  |                                            |  |   [ Optimizar con IA]|  |
|                      |  +--------------------------------------------+  +----------------------+  |
|                      |                                                                            |
|                      |  TOP 5 HERRAMIENTAS CON MAYOR GASTO                                        |
|                      |  +----------------------------------------------------------------------+  |
|                      |  | Software   | Categoría       | Facturas Cargadas  | Costo Mensual    |  |
|                      |  | AWS        | Infraestructura | 12 facturas (PDF)  | $2,400 USD/mes   |  |
|                      |  | Figma      | Diseño          | 12 facturas (PDF)  | $450 USD/mes     |  |
|                      |  +----------------------------------------------------------------------+  |
+----------------------+----------------------------------------------------------------------------+
```

---

## 3. Especificación de Componentes de Pantalla

### A. Widgets de Resumen Financiero (Fila Superior):
*   **Gasto Mensual (MRR)**: Muestra el costo actual proyectado acumulado de todas las aplicaciones SaaS activas conectadas.
*   **Ahorro Neto Real**: El valor real congelado que ya no se paga a proveedores gracias a cancelaciones confirmadas.
*   **Shadow IT Detectados**: Número de aplicaciones pendientes de revisión. El color del número cambia dinámicamente: `--accent-cyan` si está en cero, `--accent-amber` si hay entre 1 y 4 alertas, y `--accent-red` si hay 5 o más.

### B. Área Central (Gráfico e Inventario de Consumo):
*   **Gráfico de Tendencia**: Ocupa el 65% del ancho de la pantalla. Permite visualizar el impacto del "Congelador de Costos".
*   **Top 5 Herramientas**: Tabla interactiva que lista las herramientas SaaS ordenadas por costo de forma descendente. Al hacer clic en una fila, redirige al CFO al panel de detalle de la suscripción (`/subscriptions/:id`).

### C. Columna de Alertas de Optimización (Sidebar Derecho):
*   Sección flotante que muestra una lista con prioridad de las alertas de Shadow IT y Seat Reclamation pendientes de solución. Cada alerta es interactiva y cuenta con el botón `[ Optimizar con IA ]`.

---

## 4. Pautas de Diseño Premium y Micro-interacciones

Para dar la sensación de interfaz de alta gama, se aplican los siguientes estilos base:
1.  **Glassmorphism**: Todos los contenedores de tarjetas poseen fondo `--bg-card` translúcido, borde sutil de 1px en color blanco semitransparente (`border: 1px solid rgba(255, 255, 255, 0.05)`) y desenfoque de fondo (`backdrop-filter: blur(12px)`).
2.  **Botón [ Optimizar con IA ]**: Diseñado con un gradiente de cian eléctrico a azul conectado. En hover, el gradiente experimenta un leve desplazamiento de color y emite una sombra de brillo exterior (Cyan Glow: `box-shadow: 0 0 15px rgba(0, 240, 255, 0.35)`).
3.  **Fuentes**: Textos de etiquetas estructurados en **Inter** (Regular, color `--text-muted`), cifras financieras principales y títulos de sección en **Outfit** (Semi-bold, color `--text-primary`).
