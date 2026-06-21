# Wireframe de Baja Fidelidad: Chat Interactivo del Agente de IA (Onniik Copilot)

Este documento especifica la distribución visual, los componentes interactivos y los flujos conversacionales de la interfaz de chat del Onniik Copilot (`/dashboard/copilot`), diseñada para la gestión financiera asistida por inteligencia artificial.

---

## 1. Estructura del Layout

La pantalla se distribuye en dos secciones dentro del área de visualización principal:
1.  **Panel de Acciones Rápidas (Sidebar Izquierdo del Chat)**: Ancho fijo de `300px`. Muestra botones preconfigurados (prompts rápidos) y el historial de chats archivados.
2.  **Ventana de Conversación Activa (Viewport de Chat)**: Ocupa el ancho restante de la pantalla y cuenta con scroll interno para la lista de mensajes y una sección inferior fija para la entrada de texto.

---

## 2. Diagrama del Wireframe (ASCII Diagram)

```
+---------------------------------------------------------------------------------------------------+
|  [ONNIIK LOGO]       |  Buscar en Copilot...                             [🔔]  [Admin: Google SSO]|
+----------------------+----------------------------------------------------------------------------+
|  [🏠] Dashboard      |  ONNIIK COPILOT CHAT                                                       |
|  [📊] Ahorros        |                                                                            |
|  [🔌] Integraciones  |  +--------------------+  +----------------------------------------------+  |
|  [💬] Copilot        |  | PROMPTS RÁPIDOS    |  | [🤖 Copilot] Hola, soy tu copiloto de ahorro |  |
|  [⚙️] Configuración   |  | > Consolidar gasto |  | financiero. ¿En qué te ayudo hoy?            |  |
|                      |  | > Buscar duplicados|  +----------------------------------------------+  |
|                      |  | > Redactar correo  |  | [🧑‍💼 CFO] ¿Cuánto ahorramos este mes en Zoom? |  |
|                      |  +--------------------+  +----------------------------------------------+  |
|                      |  | HISTORIAL CHATS    |  | [🤖 Copilot] Identifiqué 1 cuenta inactiva.  |  |
|                      |  | - Auditoría Mayo   |  | Ahorro proyectado: $15 USD/mes.              |  |
|                      |  | - Ajuste AWS Jun   |  | +------------------------------------------+ |  |
|                      |  +--------------------+  | | [⚠️] ZOOM: Solicitud de baja de licencia  | |  |
|                      |                          | | [ Redactar borrador con IA ]              | |  |
|                      |                          | +------------------------------------------+ |  |
|                      |                          +----------------------------------------------+  |
|                      |                          | [📎] Escribe una pregunta al Copiloto... [🚀]|  |
|                      |                          +----------------------------------------------+  |
+----------------------+----------------------------------------------------------------------------+
```

---

## 3. Especificación de Componentes de Conversación

### A. Burbujas de Mensaje:
*   **Mensaje del Usuario (CFO)**: Alineado a la derecha. Fondo gris oscuro translúcido (`--bg-card`), texto en fuente **Inter** (Regular, `--text-primary`), contorno sutil.
*   **Mensaje del Copilot**: Alineado a la izquierda. Fondo con gradiente oscuro y borde izquierdo de `3px` resaltado en cian eléctrico (`--accent-cyan`) para diferenciar la identidad del bot de IA de forma inmediata.

### B. Tarjeta de Acción Integrada (Action Card Widget):
*   Componente interactivo renderizado directamente en el flujo del chat cuando el Copilot propone una optimización.
*   Contiene el título de la alerta, el impacto de ahorro estimado y el botón primario de acción: `[ Redactar borrador con IA ]`. Al presionarlo, el backend genera y previsualiza el borrador del correo en el chat para su firma.

### C. Barra de Entrada (Input Box):
*   Área flotante en la parte inferior de la ventana del chat.
*   **Control de Adjuntos (`[📎]`)**: Permite al usuario subir archivos PDF de facturas directamente en el chat para que el Copiloto los analice.
*   **Botón de Envío (`[🚀]`)**: Icono en color cian. Activo únicamente cuando el campo de texto tiene caracteres.

---

## 4. Pautas de Micro-interacción y Animaciones Reactivas

1.  **Indicador de Escritura (Typing Indicator)**: Cuando el Copilot está procesando una consulta, se muestra una animación fluida de tres puntos cianes parpadeantes en la burbuja del bot para evitar la sensación de congelamiento del sistema.
2.  **Sugerencias de Entrada (Quick Prompts)**: Al pasar el cursor sobre las tarjetas del "Panel de Acciones Rápidas", estas adquieren un borde cian translúcido y se elevan ligeramente, indicando su usabilidad.
3.  **Fondo de Chat**: Se aplica un efecto de brillo difuminado (Glow Effect) detrás del área del chat mediante un gradiente radial muy sutil (`radial-gradient(circle at bottom right, rgba(0, 240, 255, 0.05), transparent)`) para mantener la estética Dark Mode Premium.
*   **Tipografía**: Textos conversacionales en fuente **Inter** (Regular, `--text-secondary`), títulos de widgets y estados de saldo/ahorro en fuente **Outfit** (Semi-bold, `--text-primary`).
