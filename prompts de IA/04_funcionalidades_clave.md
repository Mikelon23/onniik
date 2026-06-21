# Funcionalidades Clave: Onniik

El MVP y la primera versión productiva de Onniik se dividen en cuatro módulos funcionales principales:

## 1. Panel de Control Financiero (Dashboard)
Un panel intuitivo y unificado orientado al CFO que muestra la salud financiera de la infraestructura de software.
- **KPIs principales**: Gasto total mensual en SaaS, ahorro acumulado histórico, ahorro proyectado disponible para reclamar, y cantidad de aplicaciones detectadas (aprobadas vs. no aprobadas).
- **Gráfico de Tendencia**: Visualización temporal de costos por mes e identificación de picos atípicos de gasto.
- **Top 5 Herramientas más Costosas**: Gráfico rápido para enfocar la atención en los mayores centros de costo.

## 2. Motor de Auditoría y Detección de Shadow IT
Escáner automatizado que identifica herramientas no autorizadas o desconocidas por el área de finanzas.
- **Integración con Slack**: Identifica qué aplicaciones han sido conectadas a los canales por los usuarios y cruza esta información con la base de datos de herramientas de pago conocidas.
- **Integración con Google Directory y Gmail**: Escanea los metadatos de correos entrantes buscando palabras claves como "invoice", "receipt", "subscription updated", "billing" de proveedores de software.
- **Tabla de Aplicaciones Desconocidas**: Listado con semáforo de riesgo (alto, medio, bajo) basado en el costo estimado y accesos a datos corporativos.

## 3. Reclamación de Asientos (Seat Reclamation)
Optimización del costo por usuario dentro de las suscripciones autorizadas.
- **Detección de Inactividad**: Compara los usuarios activos en Google Workspace con la base de datos de actividad de herramientas integradas.
- **Detección de Licencias Huérfanas**: Identifica cuentas asociadas a correos electrónicos que han sido suspendidos o eliminados de la organización (e.g. ex-empleados).
- **Acción Rápida**: Botón para mandar una alerta al usuario del sistema recomendando remover o reasignar la licencia.

## 4. Agente de Cancelación y Negociación (Onniik Bot)
Un agente conversacional de Inteligencia Artificial que reduce el roce administrativo para recortar gastos.
- **Borradores de Cancelación**: Redacción automática del correo de solicitud de baja con los datos de facturación exactos de la cuenta del cliente para enviar directamente.
- **Borradores de Descuento**: Redacción de un mensaje persuasivo para enviar al equipo de ventas del proveedor solicitando un descuento basado en el uso parcial de las características de la herramienta.
- **Chat Conversacional**: Una interfaz de chat estilo agente que permite al CFO preguntar: *"¿Qué herramientas de diseño podemos recortar este mes?"* o *"Redáctame un correo para cancelar nuestra cuenta de Miro"*.
