# Mantenimiento y Operación Continua

Este documento establece las tareas preventivas y correctivas necesarias para mantener la plataforma estable, segura y optimizada una vez desplegada.

---

## 1. Monitoreo y Observabilidad
- **Monitoreo de Errores**: Integración de Sentry en Frontend y Backend para capturar excepciones en tiempo real e identificar bugs silenciosos.
- **Métricas de Infraestructura**: Configuración de paneles en Datadog / Grafana para monitorear el uso de CPU, memoria del servidor, consumo de memoria de Redis y espacio de almacenamiento en disco de PostgreSQL.
- **Alertas críticas**: Configuración de canales de Slack integrados con webhooks para avisar al equipo técnico si la base de datos supera el 85% de capacidad de almacenamiento o si la API registra picos de errores 5xx.

---

## 2. Rotación de Credenciales y Llaves API
- **Tokens de Integración**: Monitoreo de los flujos de autorización OAuth expirados. Se ejecutan scripts automatizados cada 12 horas en BullMQ para comprobar si los tokens de refresco siguen siendo válidos y reactivar las conexiones.
- **Llaves API del Sistema**: Las llaves de OpenAI y tokens internos de backend deben rotarse cada 90 días mediante el gestor de secretos de la plataforma en la nube (AWS Secrets Manager o equivalente).

---

## 3. Mantenimiento Preventivo de Base de Datos
- **Copias de Seguridad (Backups)**: Respaldos completos automáticos cada 24 horas y copias incrementales cada hora. Retención mínima de respaldos durante 30 días para recuperación ante desastres (Point-in-Time Recovery).
- **Limpieza de Logs de Auditoría**: Las tablas de logs históricos `ActivityLog` y registros de depuración se purgarán automáticamente cada 180 días, moviendo los datos antiguos a un almacenamiento en frío y comprimido (ej. AWS S3) para optimizar el rendimiento del PostgreSQL relacional.
- **Reindexación**: Ejecución de comandos `VACUUM` y reindexación de tablas principales en PostgreSQL los fines de semana a horas de bajo tráfico de red.
