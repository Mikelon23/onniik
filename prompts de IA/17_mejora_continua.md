# Plan de Mejora Continua y Optimización

Onniik implementa ciclos de mejora continua para afinar la precisión del motor de IA y maximizar el valor comercial de la plataforma para los clientes.

---

## 1. Ciclo de Retroalimentación de Precisión de IA (Feedback Loop)
- **Calificación de Recomendaciones**: Cada tarjeta de alerta de ahorro y cada borrador de correo generado por la IA en la UI cuenta con botones de pulgar arriba/abajo (`[👍 / 👎]`).
- **Análisis de Falsos Positivos**: Las recomendaciones marcadas con pulgar abajo se encolan automáticamente en un reporte semanal para auditoría interna de producto.
- **Refinamiento de Prompts**: Si detectamos un patrón de error en el parseo de facturas de un proveedor específico (ej. "Vercel"), el equipo de ingeniería refina la plantilla del prompt del sistema en el archivo del backend para manejar ese caso de borde.

---

## 2. Telemetría y Análisis del Embudo de Conversión
- **Analíticas de Comportamiento**: Uso de PostHog o Amplitude para rastrear de forma anónima cómo interactúan los usuarios con la plataforma.
- **Métricas de Éxito Comercial**:
  - Tasa de Onboarding exitoso (usuarios que inician registro vs. usuarios que completan su primera integración).
  - Tasa de aceptación de ahorros (ahorro propuesto por IA vs. ahorro aprobado por el CFO).
  - ROI Promedio por Cliente: Ahorros netos divididos por el costo de suscripción de Onniik.

---

## 3. Optimización de Costos de IA
- **Monitoreo de Costos de API**: Medición continua de la latencia y el costo por token procesado de la API de OpenAI.
- **Estrategia de Caching**: Implementación de almacenamiento en caché mediante Redis para solicitudes idénticas (ej. si se vuelve a analizar la misma factura PDF de Adobe sin cambios, devolver directamente el JSON almacenado de forma previa).
- **Evaluación de Modelos más Ligeros**: Realizar pruebas comparativas (A/B testing) para evaluar si un modelo de IA más económico y rápido (ej. GPT-4o-mini o modelos de código abierto autocontenidos) logra la misma tasa de acierto de extracción de metadatos que modelos más pesados.
