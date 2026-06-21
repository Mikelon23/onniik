# Experiencia de Usuario (UX): Onniik

## Principios de Diseño UX

### 1. Simplicidad Radical ("Onboarding de 3 clics")
El CFO no tiene tiempo de configurar plataformas complejas. El Onboarding debe permitir iniciar sesión y conectar las integraciones base (Google Workspace y Slack) en menos de 3 pasos sencillos. El sistema de inmediato debe comenzar a analizar y mostrar resultados parciales de inmediato.

### 2. Accionabilidad (Action Over Data)
No saturemos al usuario con infinitas tablas y datos incomprensibles. Cada dato relevante debe estar acompañado de una acción directa (ej. "Recomendamos cancelar 5 asientos -> [Redactar Correo de Cancelación con IA]").

### 3. Transparencia de Datos y Confianza
Dado que la plataforma accede a correos y datos de empleados, debemos comunicarle al usuario de forma explícita qué datos estamos analizando, cómo los encriptamos y darles la seguridad de que no almacenamos el cuerpo de los correos irrelevantes.

---

## Personas y Mapa de Viaje (User Journey)

### Persona 1: Sofía, la CFO de una Startup en Crecimiento (50 empleados)
- **Dolor**: Ve que la tarjeta corporativa cobra mensualmente miles de dólares a nombres raros como "paddle.com", "stripe" o proveedores directos. No tiene tiempo de revisar qué empleado compró qué herramienta.
- **Viaje en Onniik**:
  1. Descubre Onniik en Product Hunt. Se registra usando Google SSO.
  2. Conecta la cuenta de Google Workspace de la empresa con autorización de administrador.
  3. En 2 minutos, el dashboard le identifica a 3 ex-empleados que conservan licencias activas de Figma y Jira (cruzando los usuarios del directorio de Google Workspace suspendidos con los correos de las facturas cargadas), y calcula que se están pagando $1,200 USD al mes innecesariamente.
  4. Da clic en "Recuperar Asientos" y el sistema le redacta los correos. Ella los aprueba y ahorra $800 USD en su primer día.

### Persona 2: Diego, Director de IT y Operaciones (120 empleados)
- **Dolor**: Mantener el inventario de software actualizado para auditorías de seguridad SOC2. No sabe qué integraciones tienen instalados los ingenieros en Slack.
- **Viaje en Onniik**:
  1. Conecta la integración de Slack.
  2. Visualiza la tabla de herramientas de "Shadow IT" organizadas por nivel de riesgo de acceso de datos (ej. bots que leen mensajes públicos).
  3. Utiliza la plataforma para solicitar la baja o autorización formal de dichas herramientas.

---

## Estados del Sistema

### Estado Vacío (Empty State)
Cuando no hay integraciones conectadas, el Dashboard debe mostrar placeholders animados con un tono amigable e instrucciones claras:
> *"Aún no vemos tu gasto en frío. Conecta Google Workspace para congelar tus primeros costos en menos de 60 segundos."*

### Estado de Carga (Loading State)
Dado que el procesamiento de IA y APIs externas toma de 15 a 45 segundos, se implementan "Skeletons" (tarjetas de carga grises con animación de pulso) junto con mensajes informativos sobre qué está haciendo la IA (ej. *"Auditando cuentas inactivas de Slack...", "Analizando facturas PDF de Gmail..."*).

### Manejo de Errores
Si una integración OAuth expira o se desconecta, se muestra un banner superior en rojo con un botón de reconexión inmediata:
> *⚠️ Conexión perdida con Google Workspace. Vuelve a autenticarte para no perder las alertas de esta semana.*
