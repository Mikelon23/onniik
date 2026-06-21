# Wireframe de Baja Fidelidad: Sección de Integraciones

Este documento define el diseño visual y la arquitectura de componentes de la sección de integración de plataformas de Onniik (`/dashboard/integrations`), permitiendo al usuario configurar y auditar de forma segura la conexión con Google Workspace, Slack y la carga manual de facturas.

---

## 1. Estructura del Layout

La sección se implementa sobre una retícula responsiva que organiza los conectores disponibles en tarjetas independientes:
*   **Contenedor Grid**: Estructura de 3 columnas (`grid-template-columns: repeat(3, 1fr)`) en pantallas de escritorio que se colapsa a 1 columna en resoluciones móviles.
*   **Espaciado**: Margen interno de `24px` (`gap: 24px`) entre tarjetas para conservar una interfaz limpia y aireada.

---

## 2. Diagrama del Wireframe (ASCII Diagram)

```
+---------------------------------------------------------------------------------------------------+
|  [ONNIIK LOGO]       |  Buscar integraciones...                          [🔔]  [Admin: Google SSO]|
+----------------------+----------------------------------------------------------------------------+
|  [🏠] Dashboard      |                                                                            |
|  [📊] Ahorros        |  CONECTORES Y FUENTES DE INFORMACIÓN                                       |
|  [🔌] Integraciones  |  Administra las conexiones de tu organización                              |
|  [💬] Copilot        |                                                                            |
|  [⚙️] Configuración   |  +--------------------+  +--------------------+  +----------------------+  |
|                      |  | [Icono Google] GWS |  | [Icono Slack] Slack|  | [Icono Mail] Forward |  |
|                      |  | Estado: Conectado  |  | Estado: Conectado  |  | Estado: Inactivo     |  |
|                      |  | Última sync: hoy   |  | Última sync: hoy   |  |                      |  |
|                      |  |                    |  |                    |  |                      |  |
|                      |  | [ Desconectar ]    |  | [ Desconectar ]    |  | [ Configurar ]       |  |
|                      |  +--------------------+  +--------------------+  +----------------------+  |
|                      |                                                                            |
|                      |  CARGA MANUAL DE ARCHIVOS                                                  |
|                      |  +----------------------------------------------------------------------+  |
|                      |  | [Icono PDF] Arrastra tus facturas adicionales aquí para escanearlas  |  |
|                      |  | Soporta formatos PDF, PNG de hasta 10MB.                             |  |
|                      |  +----------------------------------------------------------------------+  |
+----------------------+----------------------------------------------------------------------------+
```

---

## 3. Especificación de Componentes de Tarjeta (Card Components)

### A. Elementos Internos de la Tarjeta:
1.  **Encabezado**: Logo oficial de la aplicación (Google, Slack) seguido del nombre de la integración en tipografía **Outfit** (Semi-bold, `--text-primary`).
2.  **Badge de Estado (Status Badge)**:
    *   `Conectado`: Color de texto cian eléctrico (`--accent-cyan`), fondo translúcido (`rgba(0, 240, 255, 0.1)`).
    *   `Inactivo`: Color de texto gris apagado (`--text-muted`), fondo translúcido (`rgba(255, 255, 255, 0.05)`).
    *   `Error`: Color de texto rojo crítico (`--accent-red`), fondo translúcido (`rgba(255, 75, 75, 0.1)`).
3.  **Metadatos**: Detalle con la última fecha y hora de sincronización y cantidad de elementos auditados (ej. *24 licencias sincronizadas*).
4.  **Botón de Acción**:
    *   Si está conectado: Botón de contorno (outlined) `[ Desconectar ]` que abre un modal de confirmación para evitar desvinculaciones accidentales.
    *   Si está inactivo: Botón sólido `[ Configurar ]` para iniciar el flujo de consentimiento OAuth.

---

## 4. Modal de Configuración y Desvinculación (Wireframe Textual)

Al hacer clic en `[ Desconectar ]` sobre un conector activo, se despliega el siguiente modal central:

```
+-------------------------------------------------------------------------+
|  ⚠️ ¿DESCONECTAR INTEGRACIÓN?                                           |
|                                                                         |
|  Al desconectar Google Workspace, Onniik perderá acceso a:              |
|  - Auditoría de cuentas activas / inactivas en tu directorio.            |
|  - Escaneo automático de facturas en el buzón seleccionado.             |
|                                                                         |
|  Esto pausará el cálculo del MRR y la detección de Shadow IT.           |
|                                                                         |
|        [ Confirmar Desconexión ]           [ Cancelar ]                 |
+-------------------------------------------------------------------------+
```

*   **Pautas de Estilo**: El modal implementa Glassmorphism. El botón primario `[ Confirmar Desconexión ]` posee color de fondo crítico (`--accent-red`) para alertar sobre la naturaleza destructiva de la acción. Textos explicativos en tipografía **Inter** (Regular, `--text-muted`).
*   **Hover en Tarjetas**: Al colocar el cursor sobre una tarjeta de integración, esta experimenta una transición de borde de 1px a color cian eléctrico (`rgba(0, 240, 255, 0.3)`) y una leve elevación vertical (`transform: translateY(-4px)`) para incentivar la interactividad del usuario.
