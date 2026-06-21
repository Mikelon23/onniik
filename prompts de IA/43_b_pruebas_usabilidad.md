# Reporte de Usabilidad: Pruebas con Usuarios Virtuales (3 Personas Objetivo)

Este reporte detalla los resultados de las pruebas de usabilidad virtuales realizadas sobre el prototipo interactivo digital (`42_prototipo_interactivo.html`) con el fin de evaluar la fricción cognitiva, facilidad de ruteo y comprensión de las reglas de negocio de Onniik.

---

## 1. Definición de 3 Personas de Usuario Virtuales

Para cubrir el espectro completo de tomadores de decisiones en startups de alto crecimiento, definimos los siguientes probadores:

1.  **Sofía (34 años, CFO en Startup Fintech)**:
    *   *Objetivo*: Optimizar costos recurrentes rápido. Le preocupa la transparencia de la comisión del 10% (Success Fee) y la precisión de la métrica de Ahorro Real en el Dashboard.
2.  **Alejandro (42 años, Director de TI / SecOps)**:
    *   *Objetivo*: Controlar el acceso y la seguridad de los tokens de integraciones. Evalúa el riesgo de la conexión y exige claridad extrema al desconectar herramientas.
3.  **Valeria (27 años, Analista de Finanzas y Operaciones)**:
    *   *Objetivo*: Operar la herramienta diariamente. Busca prompts ágiles en el Copilot para generar reportes ejecutivos semanales y descargar las facturas de cobro.

---

## 2. Matriz de Éxito de Tareas (Task Success Matrix)

Se evaluaron 4 tareas críticas de la interfaz bajo una escala de éxito binaria (Completado / Fallido) y se estimó el nivel de satisfacción subjetiva (CSAT de 1 a 5):

| Tarea Evaluada | Sofía (CFO) | Alejandro (TI) | Valeria (Analista) | Tasa de Éxito Global | CSAT Promedio |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Tarea A**: Interpretar Ahorro Mensual vs Comisión | Completado | Completado | Completado | **100%** | 4.6 / 5.0 |
| **Tarea B**: Desvincular conector (Google Workspace) | Completado | Completado | Completado | **100%** | 4.3 / 5.0 |
| **Tarea C**: Preguntar al Copilot sobre Figma inactivo | Completado | Completado | Completado | **100%** | 4.8 / 5.0 |
| **Tarea D**: Consultar historial y descargar factura | Completado | Completado | Completado | **100%** | 4.5 / 5.0 |

---

## 3. Transcripción Verbal y Comportamiento ("Think Aloud")

### Sesión 1: Sofía (CFO)
> *"El dashboard es muy limpio. Me gusta ver el ahorro en cian brillante directamente. La comisión del 10% ($145.00) sobre los $1,450.00 de ahorro se explica sola de manera muy transparente. El gráfico de barras apiladas me permite comparar de un vistazo el gasto frente al ahorro comprobado."*

### Sesión 2: Alejandro (Director de TI)
> *"El flujo para desconectar Google Workspace me parece correcto. El modal Glassmorphic resalta bien en el centro y me advierte claramente que se detendrá la auditoría. Sin embargo, me gustaría que la alerta de desconexión fuese más visualmente drástica para evitar desconexiones accidentales."*

### Sesión 3: Valeria (Analista Financiero)
> *"El Copilot es de gran ayuda. Al hacer clic en la sugerencia de '¿Asientos inactivos de Figma?', el prompt se carga en el input y responde en un segundo mostrando el desglose exacto de los $180 USD/mes de ahorro. La visualización de la tarjeta de crédito de Onniik y las facturas en tabla facilitan mucho el control."*

---

## 4. Puntos de Fricción Identificados y Mejoras Propuestas

*   **Fricción 1: Visibilidad de Alertas de Desconexión (Gravedad: Media)**
    *   *Observación*: El modal de desconexión de integraciones advierte el cese de la auditoría, pero los directores de TI quieren un paso de confirmación por texto (por ejemplo, escribir "DESVINCULAR") para evitar errores accidentales de conexión.
    *   *Propuesta*: Agregar un campo de texto de confirmación obligatoria en el modal de desconexión en futuras iteraciones.
*   **Fricción 2: Accesibilidad de los Quick Prompts en el Chat (Gravedad: Baja)**
    *   *Observación*: En pantallas móviles muy angostas, la barra lateral del Copilot que aloja las sugerencias rápidas puede requerir scroll adicional o esconderse detrás de un menú colapsable.
    *   *Propuesta*: Convertir los "Quick Prompts" en un carrusel horizontal de chips autodesplazables en la parte superior del chat.
