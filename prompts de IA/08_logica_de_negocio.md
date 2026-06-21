# Lógica de Negocio: Algoritmos y Reglas Financieras

Para garantizar que Onniik sea útil y confiable, se aplican reglas algorítmicas claras para procesar la información y calcular los ahorros sugeridos al usuario.

---

## 1. Fórmulas de Cálculo de Ahorros

### Ahorro por Licencia Inactiva (Seat Reclamation)
El ahorro potencial de una herramienta que cobra por asiento/usuario se calcula de la siguiente manera:
$$\text{Ahorro Potencial} = \text{Número de Asientos Inactivos} \times \text{Costo Unitario por Asiento} \times (1 - \text{Descuento Contratado})$$
- **Definición de Asiento Inactivo**: Un usuario con una licencia asignada en el SaaS que cumple una de estas condiciones:
  1. No tiene registro de actividad en el log de auditoría del software en los últimos 30 días.
  2. Su cuenta de correo corporativo asociada está deshabilitada en Google Workspace.

### Ahorro por Duplicidad (Tool Redundancy)
Cuando se detectan dos herramientas que compiten en la misma categoría:
$$\text{Ahorro Proyectado} = \text{Costo de la Herramienta a Eliminar} - \text{Costo de Migración/Upgrade de la Herramienta a Conservar}$$
- **Regla de Negocio**: Si el volumen de usuarios es menor en la herramienta A que en la B, la IA sugerirá consolidar todo en la herramienta B y cancelar la suscripción de A.

---

## 2. Reglas de Negocio para Alertas de Optimización

### Alerta de Shadow IT (Detección Temprana)
- **Gatillo (Trigger)**: Se detecta un nuevo cobro en facturas de correo o una nueva aplicación instalada en Slack que no está registrada en el inventario aprobado.
- **Acción**:
  - Clasificar nivel de riesgo:
    - **Alto**: La aplicación de Slack tiene permisos para leer mensajes de canales privados o descargar archivos.
    - **Medio**: Acceso de escritura de mensajes o lectura de canales públicos.
    - **Bajo**: Solo comandos de barra diagonal (`/slash commands`).
  - Crear registro en la tabla `OptimizationAlert` y enviar una notificación push / correo al administrador de IT.

### Alerta de Suscripción Olvidada (Forgotten Subscription)
- **Gatillo**: Una herramienta con cobro recurrente mensual (detectada por facturas) registra un nivel de uso general de la organización del 0% durante 45 días consecutivos.
- **Acción**: Crear alerta de ahorro del 100% del costo y pre-redactar correo de cancelación.

---

## 3. Lógica del Agente de IA para Redacción de Mensajes

El agente de IA genera copys basados en plantillas enriquecidas por datos.

### Restricciones del Prompt del Agente
1. **Veracidad**: No inventar datos de facturación. Si falta el ID de cliente o de factura en la base de datos, colocar marcadores claros para que el usuario los complete manualmente (ej. `[COMPLETAR ID DE FACTURA]`).
2. **Tono**: Profesional, formal, claro, respetando los estándares de atención al cliente de los proveedores de software para acelerar el procesamiento del ticket de soporte.
