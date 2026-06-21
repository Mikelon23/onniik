# Política de Privacidad y Términos de Servicio Preliminares

Este documento contiene los términos legales y las políticas de tratamiento de datos personales e información corporativa que rigen el uso de la plataforma Onniik.

---

## PARTE 1: Política de Privacidad Preliminar

*Última actualización: 21 de junio de 2026*

Onniik se compromete a proteger la privacidad y seguridad de la información confidencial de las empresas clientes y sus empleados. Esta política detalla cómo recopilamos, utilizamos, almacenamos y protegemos sus datos.

### 1. Información que Recopilamos
Para prestar el servicio de optimización de costos en SaaS, recopilamos las siguientes categorías de datos tras su consentimiento explícito:
*   **Datos de Cuenta**: Nombre, correo electrónico y detalles de la organización provistos al registrarse vía Google SSO.
*   **Datos de Google Workspace (mediante API OAuth)**: Lista de usuarios (directorio corporativo), metadatos de correos electrónicos (fecha, remitente, encabezado de correos que coincidan con facturas o recibos de software).
*   **Datos de Slack (mediante API OAuth)**: Lista de integraciones instaladas (bots, aplicaciones) y mapeo de identidades de usuarios.
*   **Facturas y Recibos**: Documentos PDF subidos manualmente o extraídos de forma automatizada por el motor de la plataforma.

### 2. Uso de la Información
Utilizamos la información recopilada únicamente para:
*   Construir el inventario consolidado de herramientas de software de la empresa cliente.
*   Identificar licencias inactivas, ex-empleados con acceso activo (licencias huérfanas) y duplicidades de herramientas.
*   Generar borradores personalizados de correos para cancelación, reembolso o negociación a través del Agente de IA.
*   No vendemos, comercializamos ni transferimos sus datos a anunciantes o terceros para fines ajenos al servicio de optimización de Onniik.

### 3. Subprocesadores de Datos
Para procesar la información de manera segura, Onniik comparte datos con los siguientes subprocesadores bajo estrictos acuerdos de confidencialidad y protección de datos:
*   **Proveedor de Nube e Infraestructura (ej. Render, Supabase)**: Hospedaje de servidores y almacenamiento encriptado de la base de datos de PostgreSQL y colas de Redis.
*   **Servicio de Inteligencia Artificial (OpenAI API)**: Procesamiento efímero de texto OCR de facturas. De acuerdo con las políticas de API de OpenAI, los datos enviados no son utilizados para entrenar modelos públicos.

### 4. Seguridad de los Datos
*   **Cifrado en Reposo y Tránsito**: Toda la comunicación se realiza mediante HTTPS (TLS 1.3). Los tokens de acceso OAuth de Google Workspace y Slack se almacenan cifrados en PostgreSQL mediante el estándar robusto **AES-256-GCM**.
*   **Derecho al Olvido**: El usuario puede solicitar la eliminación total de sus datos corporativos y credenciales de acceso desde los Ajustes del sistema. Los datos serán destruidos físicamente de la base de datos activa y respaldos en un periodo máximo de 24 horas.

---

## PARTE 2: Términos de Servicio (TOS) Preliminares

*Última actualización: 21 de junio de 2026*

Al registrarse y utilizar la plataforma Onniik, usted y su organización aceptan cumplir con los siguientes términos de servicio.

### 1. Descripción del Servicio
Onniik proporciona una plataforma SaaS que ayuda a startups y scaleups a auditar, monitorear y recortar su gasto recurrente en software conectando servicios corporativos mediante OAuth y procesando facturas mediante algoritmos de IA.

### 2. Tarifas, Comisión por Éxito y Facturación
El cliente acepta pagar las tarifas de acuerdo con el plan seleccionado:
*   **Plan Pro (Renta Fija)**: **$99 USD al mes** facturados al inicio de cada periodo de facturación mensual.
*   **Tarifa de Éxito (Success Fee)**: Comisión del **10% sobre los ahorros netos mensuales reales logrados** por el uso de Onniik.
    *   **Cálculo del Ahorro**: El ahorro se considera "logrado" cuando el cliente ejecuta una acción de optimización propuesta por la plataforma (por ejemplo, confirmar la cancelación de una suscripción redundante o reclamar licencias inactivas).
    *   **Vigencia del Cobro**: La comisión del 10% se aplicará mensualmente sobre el monto del ahorro mensual efectivo durante un periodo máximo de **12 meses consecutivos** a partir de la ejecución de la optimización.
    *   **Incumplimiento**: La falta de pago de las tarifas Pro o de Éxito facultará a Onniik a suspender el acceso a la plataforma de forma temporal o definitiva.

### 3. Limitación de Responsabilidad y "Human-in-the-Loop"
*   **Aprobación del Usuario**: El cliente reconoce y acepta que Onniik funciona bajo un modelo "Human-in-the-loop". Esto significa que Onniik solo genera sugerencias, recomendaciones y borradores de comunicación. El cliente es el único responsable de revisar, editar, aprobar y enviar dichos correos y tomar las decisiones de cancelación correspondientes.
*   **Exclusión de Responsabilidades**: Onniik no será responsable bajo ninguna circunstancia por:
    *   Pérdidas de datos o cancelaciones accidentales de suscripciones que afecten la operación de la empresa del cliente.
    *   Multas o cargos por penalizaciones de proveedores de SaaS por terminación anticipada de contratos.
    *   Interrupciones operativas causadas por la desvinculación de herramientas autorizadas por el CFO/IT Manager.

### 4. Cancelación de Cuenta
El cliente puede cancelar su suscripción a Onniik en cualquier momento. Al cancelar, el acceso a la plataforma se mantendrá activo hasta el final del ciclo de facturación mensual pagado. Onniik procederá a eliminar de forma permanente todas las credenciales de integraciones conectadas (Google Workspace y Slack) de inmediato tras procesarse la baja.
