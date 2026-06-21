# Pruebas y Aseguramiento de Calidad (QA)

La estrategia de pruebas de Onniik garantiza la fiabilidad de los algoritmos de cálculo financiero y la estabilidad de las integraciones externas.

---

## 1. Pruebas Unitarias (Unit Testing)
- **Tecnología**: Jest en Backend / Vitest en Frontend.
- **Objetivo**: Asegurar el correcto funcionamiento de las funciones auxiliares de base (cálculo de inactividad de usuarios, extracción de metadatos de IA, limpieza de cadenas de texto y normalización de nombres de SaaS).
- **Cobertura Mínima**: Se requiere un mínimo del 80% de cobertura de código para los servicios críticos de negocio.

---

## 2. Pruebas de Integración (Integration Testing)
- **Objetivo**: Probar los flujos donde intervienen múltiples componentes.
  - Registro de usuario -> Creación de organización -> Asignación de roles por defecto.
  - Recepción de webhook de Slack -> Almacenamiento de alerta en base de datos -> Activación de cola en Redis.
- **Base de Datos de Prueba**: Se levanta una base de datos PostgreSQL aislada en Docker Compose que se reinicia antes de correr la suite de pruebas de integración para evitar contaminación de datos.

---

## 3. Pruebas de Extremo a Extremo (E2E Testing)
- **Tecnología**: Playwright o Cypress.
- **Objetivo**: Simular interacciones de usuarios reales sobre el navegador.
  - Flujo de Onboarding completo (Simulación/Mock de Google OAuth).
  - Carga manual de factura PDF -> Verificación de que el gráfico del Dashboard incrementa su valor.
  - Navegación móvil y colapso de la barra lateral.

---

## 4. Pruebas de Estrés y Rendimiento (Stress Testing)
- **Tecnología**: Autocannon o K6.
- **Objetivo**: Garantizar que el backend puede soportar la concurrencia de al menos 50 peticiones simultáneas sobre las rutas de análisis y carga de facturas sin degradar significativamente la latencia.
