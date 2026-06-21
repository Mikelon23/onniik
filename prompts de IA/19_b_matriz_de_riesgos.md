# Matriz de Riesgos del Proyecto: Onniik

Este documento identifica, clasifica y evalúa los riesgos potenciales (técnicos, de seguridad, operativos y comerciales) que podrían afectar el desarrollo y la viabilidad de la plataforma Onniik, estableciendo planes de contingencia para mitigar su impacto.

---

## 1. Metodología de Evaluación de Riesgos

Los riesgos se califican en función de dos variables principales en una escala cualitativa de tres niveles (Bajo, Medio, Alto):
*   **Probabilidad (P)**: Posibilidad de ocurrencia del riesgo durante el ciclo de vida del MVP.
*   **Impacto (I)**: Nivel de degradación operativa, económica o legal si el riesgo se materializa.
*   **Nivel de Severidad**: Determinado por la combinación de Probabilidad e Impacto.

---

## 2. Matriz de Riesgos General

| ID | Categoría | Descripción del Riesgo | P | I | Disparador (Trigger) | Plan de Mitigación / Contingencia |
|---|---|---|---|---|---|---|
| **TR-01** | **Seguridad** | Compromiso o fuga de tokens OAuth de Google/Slack de la base de datos. | Baja | Crítico | Alerta de intrusión en base de datos PostgreSQL o anomalía en peticiones salientes. | Tokens cifrados con AES-256-GCM. Aislamiento de red mediante VPC. Protocolo de revocación masiva automática (Kill-Switch). |
| **TR-02** | **Técnico** | Agotamiento del límite de cuota (Rate Limits) en la API de OpenAI. | Media | Alto | Respuesta HTTP 429 de OpenAI durante el escaneo masivo de facturas de un cliente. | Implementar colas de procesamiento asíncronas con BullMQ. Uso alternativo de GPT-4o-mini de menor coste y fallback a APIs secundarias. |
| **TR-03** | **Operativo** | Extracción errónea de metadatos financieros de facturas PDF debido a OCR ineficaz. | Alta | Medio | Quejas de clientes por cobros de SaaS erróneos o duplicidades falsas en el Dashboard. | Validación con expresiones regulares (RegEx) de campos clave. Human-in-the-loop: el CFO siempre debe validar la información antes de aplicar la cancelación. |
| **TR-04** | **Comercial** | Disputas de clientes al pagar comisiones del Success Fee (10%). | Media | Alto | Negativa del CFO a pagar el 10% argumentando que la cancelación se habría hecho igual sin Onniik. | Mantener un log inmutable de auditoría donde el CFO haga clic en "Aprobar acción". Firma digital previa de los términos de servicio (TOS) con el cálculo exacto de ahorro. |
| **TR-05** | **Legal** | Bloqueo o revocación de accesos por cambio en las políticas de APIs de Google/Slack. | Baja | Muy Alto | Pérdida definitiva del acceso a los scopes de lectura del directorio de Workspace o correos de Gmail. | Desarrollar un canal alternativo para subida manual de reportes CSV de SaaS y re-envío automático de facturas (Mail Forwarding). |

---

## 3. Planes de Acción Detallados por Escenario

### A. TR-01: Fuga de Tokens OAuth (Seguridad)
*   **Mitigación en Desarrollo**: La llave de desencriptación AES-256-GCM se almacena como una variable de entorno protegida (`ENCRYPTION_KEY`) no accesible directamente desde el motor de base de datos de PostgreSQL. Los respaldos de base de datos están encriptados.
*   **Acción de Contingencia**: En caso de incidente de seguridad, se desvinculan los conectores mandando una solicitud masiva de invalidación de tokens a Google y Slack y se obliga a todos los administradores activos a re-autenticarse en la plataforma tras parchar la vulnerabilidad.

### B. TR-02: Límites de Cuota de la API de OpenAI (Técnico)
*   **Mitigación en Desarrollo**: El procesamiento de facturas subidas se delega a BullMQ (Redis) con un worker asíncrono y control de velocidad (rate limiting interno) que limita las solicitudes concurrentes a OpenAI para mantener el uso por debajo del límite de la cuota asignada por minuto (TPM).
*   **Acción de Contingencia**: Ante una saturación persistente, el sistema transiciona las solicitudes del motor de clasificación temporalmente a modelos alternativos como la API de Anthropic Claude o modelos locales rápidos.

### C. TR-03: Fallos en Extracción OCR/IA (Operativo)
*   **Mitigación en Desarrollo**: El backend realiza una validación lógica estructurada (ej. la fecha de la factura debe ser coherente, el monto total debe ser numérico positivo y coincidir con el IVA o impuestos desglosados). Si falla, se etiqueta la alerta como "Requiere Revisión Manual".
*   **Acción de Contingencia**: Habilitar en la interfaz un botón simple para que el usuario pueda corregir manualmente los metadatos de la factura detectados erróneamente (ej. editar el costo o el proveedor) directamente en la tabla.

### D. TR-04: Disputas Comerciales por Success Fee (Comercial)
*   **Mitigación en Desarrollo**: Cada propuesta de optimización en `/alerts` cuenta con un flujo claro: el CFO aprueba explícitamente la acción de cancelación o baja de licencias mediante firma de registro. El sistema calcula y muestra el desglose del ROI en tiempo real.
*   **Acción de Contingencia**: Si existe una discrepancia legítima en los ahorros reales logrados, Onniik ofrece una opción de conciliación directa en la cual un analista financiero revisa los estados de cobros bancarios del cliente para ajustar la factura de éxito de forma manual.
