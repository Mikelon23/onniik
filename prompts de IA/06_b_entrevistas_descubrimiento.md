# Guía de Descubrimiento de Clientes: Entrevistas y Encuestas

Este documento contiene los cuestionarios semiestructurados y el diseño de la encuesta cuantitativa para validar los dolores, la disposición al pago y los requisitos de seguridad de Onniik con CFOs y Managers de TI de startups y scaleups.

---

## 1. Objetivos del Descubrimiento de Clientes
1.  **Validar dolores prioritarios**: Confirmar si el gasto hormiga, las licencias inactivas y el Shadow IT son dolores de cabeza reales en la agenda del CFO e IT Manager.
2.  **Entender el proceso actual**: Documentar cómo resuelven hoy el control de SaaS (ej. hojas de cálculo manuales, auditorías esporádicas, plataformas caras o ignorar el problema).
3.  **Probar sensibilidad al precio**: Validar la receptividad ante el modelo de cobro por éxito (10% del ahorro real) y la suscripción Pro mensual ($99 USD).
4.  **Identificar barreras de seguridad**: Comprender la resistencia a conectar Google Workspace y Slack mediante permisos OAuth.
5.  **Evaluar confianza en la IA**: Medir la disposición a permitir que un bot de IA redacte o ejecute cancelaciones de cuentas.

---

## 2. Guía de Entrevista: Perfil Financiero (Sofía, CFO)

*   **Público Objetivo**: CFOs, COOs, Directores de Finanzas o Fundadores en startups de 20 a 500 empleados.
*   **Duración Estimada**: 20-30 minutos.
*   **Enfoque**: Entender pérdidas económicas, roce operativo y control presupuestario.

### A. Contexto e Introducción (5 mins)
*   *¿Cuántos empleados tiene la empresa actualmente? ¿A qué velocidad están contratando?*
*   *¿Cuántas herramientas de software estimas que pagan activamente al mes?*

### B. Descubrimiento del Dolor - Situación Actual (10 mins)
*   *¿Cómo se aprueba y se compra hoy un nuevo software en el equipo? (¿Hay presupuesto asignado por departamento o libre albedrío?)*
*   *¿Cuál es el proceso actual para auditar y conciliar el gasto mensual de SaaS? ¿Quién lo hace y cuánto tiempo le dedica?*
*   *¿Cuándo fue la última vez que encontraste una cuenta activa cobrándose por un ex-empleado o una herramienta redundante? ¿Cómo lo descubriste y qué hiciste al respecto?*

### C. Validación de la Solución Conceptual (10 mins)
*   *Si tuvieras una herramienta que se conecta de forma segura a Google Workspace y Slack en 2 minutos y te muestra en tiempo real qué empleados no usan las licencias asignadas (ej. Figma, Notion) y qué herramientas se están pagando de más, ¿cuál sería tu primera reacción?*
*   *La herramienta tiene un Agente de IA que redacta por ti el correo formal de cancelación o reasignación de licencias de inmediato para que tú solo des clic en "Enviar". ¿Qué opinas de esto? ¿Te sentirías cómodo(a) aprobando y enviando ese correo redactado por IA?*
*   *¿Qué preocupaciones de privacidad o seguridad tendrías al otorgarle acceso OAuth a este sistema para leer las cabeceras de tus facturas en Gmail?*

### D. Disposición de Pago (5 mins)
*   *Esta solución ofrece un plan base de $99 USD/mes más una tarifa del 10% sobre los ahorros reales demostrados y logrados por el sistema. Si la herramienta te genera $2,000 USD de ahorro al mes, y te cobrara $200 USD por ello, ¿cómo percibirías este trato?*

---

## 3. Guía de Entrevista: Perfil Técnico / Operativo (Diego, IT Manager)

*   **Público Objetivo**: Directores de TI, Ingenieros DevOps, o SysAdmins.
*   **Duración Estimada**: 20-30 minutos.
*   **Enfoque**: Seguridad, gobernanza de datos, aprovisionamiento de cuentas y Shadow IT.

### A. Contexto y Flujo de Trabajo (5 mins)
*   *¿Cómo gestionan hoy las credenciales e identidades en la empresa? ¿Usan algún sistema SSO (Okta, Google SSO) centralizado para todas las herramientas?*
*   *¿Cuál es el flujo actual cuando un empleado sale de la compañía? ¿Cómo se aseguran de retirarlo de todas las herramientas secundarias de nicho (ej. Miro, JetBrains, Webflow)?*

### B. Descubrimiento del Dolor - Shadow IT y Seguridad (10 mins)
*   *¿Te preocupa que los empleados instalen integraciones o bots en los canales de Slack corporativos sin tu autorización? ¿Cómo los controlas hoy?*
*   *¿Qué tan difícil es actualmente armar el inventario de software e integraciones de cara a una auditoría de cumplimiento como SOC2 o ISO 27001?*
*   *¿Has detectado alguna vez filtraciones de datos o riesgos de seguridad causados por software no aprobado (Shadow IT)?*

### C. Validación de la Solución Conceptual (10 mins)
*   *¿Qué requisitos o certificaciones de seguridad (ej. cifrado de datos, retención de logs) le exigirías a una plataforma externa que solicita permisos de lectura de Google Workspace Directory y Slack API?*
*   *Onniik clasifica el Shadow IT detectado según el riesgo de permisos de datos (Bajo, Medio, Alto) y te avisa cuando un bot de Slack solicita permisos intrusivos. ¿Cómo te ayuda esto en tu día a día?*
*   *¿Preferirías que la plataforma proponga automatizar el desaprovisionamiento de licencias de ex-empleados directamente vía API, o solo prefieres recibir la recomendación en una alerta para ejecutarla manualmente?*

---

## 4. Encuesta Cuantitativa (Escala Digital)

*   **Objetivo**: Escalar la validación con una muestra de >30 participantes.
*   **Canal**: LinkedIn, newsletters de finanzas/IT o Typeform.

### Preguntas del Formulario:

1.  **¿Cuál es tu cargo principal en la organización?**
    *   [ ] CFO / Director de Finanzas
    *   [ ] Fundador / CEO
    *   [ ] Director de IT / SysAdmin
    *   [ ] Operations Manager
2.  **¿Cuántos empleados tiene tu compañía?**
    *   ( ) 1 - 20
    *   ( ) 21 - 100
    *   ( ) 101 - 500
    *   ( ) Más de 500
3.  **¿Qué tan visible es para ti el gasto real en suscripciones de SaaS de toda la empresa?**
    *   (1 = Completamente a ciegas, 5 = Control total centavo a centavo)
4.  **¿Con qué frecuencia realizan auditorías manuales de uso de licencias de software (ej. ver quién no usa Zoom/Figma)?**
    *   ( ) Mensualmente
    *   ( ) Trimestralmente
    *   ( ) Una vez al año
    *   ( ) Nunca / Solo cuando hay crisis de caja
5.  **¿Cuánto estimas que gasta tu empresa en licencias duplicadas, inactivas o de ex-empleados mensualmente?**
    *   ( ) Menos de $200 USD
    *   ( ) $200 - $1,000 USD
    *   ( ) $1,000 - $5,000 USD
    *   ( ) Más de $5,000 USD
    *   ( ) No tengo idea
6.  **Al contratar una herramienta de optimización de costos, ¿cuál es tu mayor preocupación? (Selecciona máximo 2)**
    *   [ ] Seguridad y encriptación de datos de la empresa
    *   [ ] Privacidad de los correos de los empleados
    *   [ ] Roce y tiempo de configuración de la herramienta
    *   [ ] Costo de la suscripción del optimizador
    *   [ ] Resistencia del equipo a cancelar herramientas
7.  **¿Estarías dispuesto(a) a pagar una comisión basada en el éxito (ej. 10% del ahorro neto real) a cambio de una auditoría automatizada continua?**
    *   ( ) Sí, es un trato excelente y sin riesgo.
    *   ( ) Prefiero pagar una tarifa mensual fija y quedarme con todo el ahorro.
    *   ( ) Depende de la complejidad de la configuración.
    *   ( ) No me interesa.
8.  **¿Te gustaría que una IA redacte automáticamente el borrador de soporte para solicitar cancelaciones y reembolsos?**
    *   ( ) Sí, me ahorra trabajo operativo pesado.
    *   ( ) Solo si puedo editar y aprobar el mensaje antes de enviarlo.
    *   ( ) No, prefiero redactarlo yo mismo por seguridad.
