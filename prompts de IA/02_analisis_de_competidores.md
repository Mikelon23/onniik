# Análisis de Competidores: Mercado de SaaS Management

Este documento analiza el entorno competitivo de Onniik, evaluando tanto a competidores directos en la gestión de suscripciones de software como a competidores indirectos en las áreas de gestión de gastos e identidad.

---

## 1. Competidores Directos

### A. Zylo (Enfoque Enterprise)
*   **Descripción**: Plataforma de nivel empresarial para el descubrimiento, la optimización y la gobernanza de software. Se enfoca en grandes carteras de SaaS.
*   **Público Objetivo**: Empresas medianas y grandes (generalmente con más de 500 empleados).
*   **Método de Operación**: Integración profunda con sistemas ERP corporativos (ej. NetSuite, SAP), cuentas de contabilidad avanzadas y proveedores de identidad (SSO) como Okta. Utiliza algoritmos de machine learning patentados para emparejar registros de gastos con su base de datos de SaaS.
*   **Modelo de Precios**: Cotización personalizada (no pública). Estimaciones del mercado sitúan el coste anual entre **$30,000 y $50,000 USD**.
*   **Fortalezas**:
    *   Servicios gestionados de negociación (SaaS Operations Services) con negociadores humanos.
    *   Gobernanza avanzada y catálogo de aplicaciones aprobadas por IT.
*   **Debilidades**:
    *   Proceso de Onboarding complejo y lento (semanas o meses).
    *   Costo de entrada prohibitivo para startups en etapas tempranas o de rápido crecimiento.

### B. Cledara (Enfoque Fintech / SMB)
*   **Descripción**: Plataforma de gestión de SaaS basada en el uso de tarjetas de pago virtuales para centralizar y controlar el gasto en software.
*   **Público Objetivo**: Startups y pequeñas y medianas empresas (PyMEs) de entre 20 y 150 empleados.
*   **Método de Operación**: Cledara emite tarjetas de débito virtuales (Mastercard/Visa) dedicadas para cada herramienta contratada. Si una suscripción no tiene tarjeta asignada o el límite de la tarjeta se supera, el cobro rebota, controlando el gasto en el punto de pago. Se integra con herramientas contables como Xero y QuickBooks.
*   **Modelo de Precios**:
    *   **Basic**: $75 USD/mes (hasta 20 aplicaciones).
    *   **Premium**: $200 USD/mes (hasta 75 aplicaciones).
    *   *Ganancia adicional*: Ofrece cashback (hasta un 2% en suscripciones).
*   **Fortalezas**:
    *   Control financiero estricto e instantáneo (si cancelas la tarjeta, cancelas la suscripción).
    *   Simplifica la conciliación contable para el equipo de finanzas.
*   **Debilidades**:
    *   **Alto roce de onboarding**: Obliga a la startup a cambiar el método de pago de todas sus suscripciones actuales a las tarjetas de Cledara.
    *   No ofrece escaneo automatizado y pasivo de Shadow IT (solo detecta lo que pasa por sus tarjetas).
    *   No analiza la inactividad de las licencias a nivel de usuario en detalle.

### C. LeanIX SaaS Intelligence (Anteriormente Cleanshelf)
*   **Descripción**: Herramienta de optimización de SaaS adquirida por LeanIX en marzo de 2021. Se ha integrado en la suite de arquitectura empresarial de LeanIX.
*   **Público Objetivo**: Empresas medianas con alto enfoque tecnológico y necesidades de gobernanza de TI.
*   **Método de Operación**: Conectores con sistemas ERP, herramientas de colaboración y APIs directas de proveedores de SaaS para recopilar datos de uso e inventario.
*   **Modelo de Precios**: Cotizaciones de suscripción empresarial adaptadas a la escala del cliente.
*   **Fortalezas**:
    *   Integración nativa con la suite de gobernanza de TI y modelado de sistemas de LeanIX.
    *   Buen mapeo de redundancia funcional de herramientas.
*   **Debilidades**:
    *   Enfoque corporativo complejo.
    *   Carece de automatización ágil de cancelaciones orientada al CFO de una startup.

---

## 2. Competidores Indirectos

### A. Plataformas de Gestión de Gastos (Spend Management)
*   *Ejemplos*: **Ramp**, **Brex**, **Jeeves**.
*   *Funcionamiento*: Emiten tarjetas de crédito corporativas y permiten crear tarjetas virtuales para suscripciones.
*   *Diferencia*: Solo ven los montos cobrados en la tarjeta. No tienen visibilidad de si los empleados están usando activamente el software (por ejemplo, si no inician sesión en Figma) ni pueden redactar correos de negociación o cancelación automáticos.

### B. Gestores de Identidad y SSO (Identity / Access Providers)
*   *Ejemplos*: **Okta**, **Google Workspace Workspace Admin**.
*   *Funcionamiento*: Registran el último inicio de sesión de los usuarios en la suite corporativa.
*   *Diferencia*: Tienen datos de inactividad excelentes, pero carecen por completo de información financiera (cuánto cuesta la licencia, cuándo se renueva la factura o qué tarifa se cobra).

---

## 3. Matriz Comparativa

| Criterio | Zylo | Cledara | LeanIX (Cleanshelf) | Onniik (Propuesta) |
|---|---|---|---|---|
| **Target principal** | Enterprise (>500 emp.) | Startups/SMBs (20-150 emp.) | Mid-Market / Enterprise | Startups & Scaleups (20-500 emp.) |
| **Método de detección** | Integración ERP / SSO | Tarjetas virtuales exclusivas | Integración ERP / API | **Google OAuth + Slack + OCR de Facturas** |
| **Tiempo de Onboarding** | Semanas / Meses | Alto (requiere migrar pagos) | Semanas | **< 5 Minutos (Conexión 1-click)** |
| **Control de inactividad** | Sí (mediante SSO) | Muy limitado / Básico | Sí (mediante API) | **Sí (Google Directory + APIs directas)** |
| **Automatización de Cancelación** | No (humano/manual) | No (manual) | No (manual) | **Sí (Agente de IA redacta y prepara envío)** |
| **Modelo de precios** | Custom ($30k-$50k/año) | SaaS mensual ($75-$200/mes) | Custom | **Freemium + 10% de Tarifa de Éxito sobre ahorro** |

---

## 4. Destaque y Diferenciadores Clave de Onniik

Para ganar en el mercado, Onniik se apoya en tres pilares diferenciales:

1.  **Onboarding sin Fricciones (Zero Friction)**: A diferencia de Cledara, que exige migrar todos los datos de pago corporativos, Onniik realiza una auditoría pasiva. Al conectarse mediante OAuth a Slack y Google Workspace en 5 minutos, la plataforma escanea menciones de cobros y facturas y mapea el inventario de software sin interrumpir las operaciones financieras de la empresa.
2.  **Agente de IA Proactivo (Human-in-the-Loop AI)**: Ningún competidor actual automatiza el "siguiente paso" de forma inteligente. El Agente de IA de Onniik no solo reporta la inactividad de una licencia de Miro o Notion, sino que redacta de manera autónoma el borrador del correo de cancelación o reasignación, permitiendo al CFO ejecutar la optimización con un solo clic.
3.  **Alineación de Incentivos (Success-Fee Model)**: El cobro basado en el 10% del ahorro real generado elimina las objeciones presupuestarias que suelen frenar la adopción de herramientas empresariales caras como Zylo o LeanIX. Si Onniik no encuentra ahorros, el servicio es gratuito.
