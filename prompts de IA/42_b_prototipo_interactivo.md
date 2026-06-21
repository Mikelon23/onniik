# Especificaciones de Alta Fidelidad: Prototipo Interactivo Digital

Este documento especifica la estructura y el alcance de las interacciones implementadas en el archivo auto-contenido del prototipo digital de Onniik: **[42_prototipo_interactivo.html](file:///home/miguel/Desktop/Miguelon/onniik/prompts%20de%20IA/42_prototipo_interactivo.html)**.

---

## 1. Alcance de Interacciones Simuladas

El prototipo implementa en código de un solo archivo las siguientes capacidades de navegación e interactividad para validar los flujos de experiencia de usuario:

1. **Navegación del Sidebar (Pestañas)**:
   - Alternancia instantánea entre pestañas: **Dashboard**, **Integraciones**, **Copilot** y **Facturación**.
   - Resalte de elemento activo en el menú lateral y actualización del área principal de visualización.
2. **Dashboard Financiero**:
   - Renderización dinámica del gráfico de barras apiladas de gasto/ahorro utilizando **Chart.js** desde una CDN pública.
   - Interactividad en las tarjetas de KPI superior con elevaciones sutiles CSS.
3. **Sección de Integraciones**:
   - Simulación del modal de confirmación al desvincular un conector (por ejemplo, Google Workspace).
   - Cambio de badges de estado al revocar.
4. **Chat del Onniik Copilot**:
   - Envío de mensajes del CFO en tiempo real al chat del Agente de IA.
   - Respuesta automática simulada del Copilot tras 800ms con animación de escritura visual.
5. **Sección de Facturación**:
   - Visualización de la tarjeta de crédito Glassmorphic y listado de cobros.

---

## 2. Instrucciones para la Ejecución del Prototipo

Para visualizar el prototipo interactivo:
1. Abre el archivo **[42_prototipo_interactivo.html](file:///home/miguel/Desktop/Miguelon/onniik/prompts%20de%20IA/42_prototipo_interactivo.html)** directamente en cualquier navegador web moderno (Chrome, Safari, Firefox).
2. O bien, ejecútalo en un servidor local utilizando extensiones de editor (como Live Server) o herramientas de consola (`python3 -m http.server 8080`).
