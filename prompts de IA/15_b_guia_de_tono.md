# Guía de Tono de Comunicación y Copywriting: Onniik

Este documento establece las directrices de redacción y voz para la interfaz de usuario, las comunicaciones transaccionales y el comportamiento lingüístico del Agente de IA de Onniik. Su propósito es garantizar una comunicación homogénea, sofisticada y que inspire total seguridad financiera.

---

## 1. Pilares del Tono de Comunicación

Onniik habla el lenguaje de los tomadores de decisiones financieras (CFOs, directores generales y gestores de TI). Nuestra voz se define a través de tres pilares:

### A. Profesional y Seguro
*   **Definición**: Nos expresamos con absoluta seriedad y propiedad. El dinero de la empresa y la gobernanza de TI son temas críticos.
*   **Aplicación**: Usamos términos financieros e informáticos estándar de la industria. Evitamos contracciones informales, modismos locales o humor.

### B. Pragmático y Conciso
*   **Definición**: Respetamos el tiempo del usuario. Mostramos datos directamente y vamos al grano de forma clara.
*   **Aplicación**: Eliminamos palabras de relleno, adornos gramaticales y metáforas complejas. Los números y el retorno de inversión (ROI) deben sobresalir.

### C. Inteligente y Orientado a Soluciones
*   **Definición**: Explicamos el "por qué" y ofrecemos el "cómo" en un solo paso. La IA de Onniik no solo reporta problemas, sino que prepara planes de acción listos para validar.
*   **Aplicación**: En lugar de mostrar solo una alerta, presentamos la alerta acompañada de un botón de acción correctiva directa.

---

## 2. Matriz de Contraste Lingüístico (Cómo Habla Onniik)

| Contexto / Situación | Cómo habla Onniik (SÍ) | Cómo NO habla Onniik (NO) |
|---|---|---|
| **Detección de Ahorros** | *"Se identificaron 3 licencias inactivas de Slack. Ahorro potencial: $36 USD/mes."* | *"¡Súper! Encontré licencias sin usar en Slack. Haz clic aquí para ahorrar un dinerito."* |
| **Error de Sincronización** | *"No se pudo completar la conexión con Google Workspace. El token OAuth es inválido o expiró."* | *"¡Ups! Algo salió mal conectando con Google. Por favor, inténtalo de nuevo más tarde."* |
| **Cancelación de Cuenta** | *"Tu cuenta ha sido dada de baja. Todas las credenciales y tokens OAuth asociados han sido purgados."* | *"Lamentamos mucho que te vayas de la familia. Borraremos tus cositas pronto."* |
| **Alerta de Shadow IT** | *"Aplicación 'Trello' conectada sin aprobación en Slack por el usuario: miguel@onniik.com."* | *"¡Ojo! Miguel instaló una app secreta en Slack. Checa si es peligrosa."* |

---

## 3. Guía de Redacción de la Interfaz (UI Copywriting)

### A. Botones y Llamadas a la Acción (CTAs):
*   Deben ser imperativos, claros y de longitud mínima (1 a 3 palabras).
*   *Correcto*: `[ Conectar Slack ]`, `[ Generar Borrador ]`, `[ Confirmar Cancelación ]`.
*   *Incorrecto*: `[ ¡Comencemos ahora! ]`, `[ Sí, quiero borrar esto ]`, `[ Crear el correo ]`.

### B. Mensajes de Estado y Carga (Loading States):
*   Deben ser explicativos de la actividad de fondo de la IA para transmitir dinamismo técnico.
*   *Durante procesamiento*: *"Extrayendo metadatos de factura mediante OCR..."* o *"IA redactando borrador de cancelación..."*.

### C. Mensajes de Error Técnico:
*   Evitar los códigos de error crípticos (ej., *Error 500* o *NullPointer*), pero no infantilizar el error. Indicar claramente la acción recomendada.
*   *Ejemplo*: *"Error al subir factura: El archivo excede el tamaño máximo permitido de 10 MB. Por favor, sube un archivo PDF más liviano."*

---

## 4. Comunicaciones Transaccionales (Emails & Slack)

### A. Correo Semanal de Resumen Financiero (CFO Digest)
*   **Asunto**: `[Onniik] Reporte de optimización semanal - [Nombre_StartUp]`
*   **Estructura del Cuerpo**:
    *   **Resumen ejecutivo**: *"Hola [Nombre], esta semana Onniik ha procesado [N] facturas y monitoreado [N] licencias."*
    *   **Indicadores**:
        *   Gasto total en SaaS del mes: `$X,XXX USD`
        *   Ahorros identificados pendientes de aprobación: `$XXX USD/mes`
    *   **Llamado a la acción**: `[ Ver alertas de ahorro ]` (Enlace directo a `/alerts`).

### B. Notificaciones en Slack (Alertas de Shadow IT)
*   **Destinatario**: Canal privado de administración de TI (`#ti-alerts` o `#finance-alerts`).
*   **Mensaje**:
    > **⚠️ Alerta de Gobernanza de Software - Onniik**
    > *   **Aplicación**: Miro Integration
    > *   **Instalado por**: `sofia@onniik.com`
    > *   **Fecha**: 21/06/2026
    > *   *Acción recomendada: Auditar el uso de esta herramienta para evitar duplicidad de licencias de pizarra digital.*
    > `[ Ver en Onniik ]`

---

## 5. Directrices de Redacción para el Agente de IA

### A. Tono del Chatbot (Onniik Copilot)
*   Debe responder consultas de forma breve, estructurando los datos en listas y viñetas para facilitar la lectura rápida de números.
*   No debe divagar. Si no tiene datos suficientes para responder a una consulta sobre gasto de software, debe indicarlo: *"No tengo registro de facturas para ese software en este periodo. Por favor, sube los comprobantes correspondientes en /integrations."*

### B. Redacción de Correos de Cancelación Automatizados (Templates generados por IA)
*   Al redactar un correo dirigido a un proveedor de SaaS (ej. Figma, Jira, Zoom) para dar de baja asientos o rescindir un contrato, la IA debe seguir estas pautas:
    1.  **Firmeza y Claridad**: Indicar de inmediato la intención de cancelación o baja de la cuenta.
    2.  **Educación y Cortesía**: Usar fórmulas de saludo y despedida formales pero cordiales.
    3.  **Provisión de Datos Clave**: Incluir el ID de la organización o correo electrónico del administrador para evitar demoras por soporte técnico.
    *   *Ejemplo de Borrador*:
        > **Asunto:** Solicitud de baja de licencias inactivas - Cuenta [Nombre_Empresa]
        >
        > Estimado equipo de Soporte de [Nombre_Proveedor],
        >
        > Por medio del presente correo, solicito formalmente la cancelación de [N] licencias del plan [Nombre_Plan] asociadas a nuestra organización, correspondientes a los siguientes usuarios:
        > *   [Correo_Usuario_1]
        > *   [Correo_Usuario_2]
        >
        > Solicitamos que esta baja se haga efectiva para el próximo periodo de facturación mensual y que los cargos recurrentes sean ajustados de forma proporcional.
        >
        > Agradezco de antemano su confirmación y apoyo en este proceso.
        >
        > Atentamente,
        > [Nombre_Administrador]
        > [Cargo_Administrador]
        > [Nombre_Empresa]
