# Roles de Usuario y Control de Acceso (RBAC)

Onniik implementa una estructura de control de acceso basada en roles (RBAC) para proteger la información financiera confidencial.

## Definición de Roles

### 1. Administrador de la Organización (Owner / CFO)
- **Descripción**: Dueño de la cuenta y líder financiero principal.
- **Permisos**:
  - Acceso total de lectura y escritura en todas las vistas.
  - Conectar y desconectar integraciones OAuth (Google, Slack).
  - Aprobar recomendaciones de ahorro y autorizar el envío de correos por la IA.
  - Gestionar facturación del plan Onniik e invitar a nuevos miembros del equipo directivo.
  - Solicitar la eliminación total de la cuenta de la organización.

### 2. Administrador de IT (IT Manager)
- **Descripción**: Encargado de la seguridad, infraestructura y auditoría técnica de software.
- **Permisos**:
  - Lectura completa de inventario de software y alertas de Shadow IT.
  - Administrar políticas de alertas de inactividad de usuarios.
  - Ver el chat del agente de IA para temas de seguridad (mas no financieros).
  - *Restricción*: No puede ver detalles de facturación de la organización ni autorizar pagos de planes.

### 3. Lector Financiero (Reader / Auditor)
- **Descripción**: Auditor externo o miembro del equipo de contabilidad.
- **Permisos**:
  - Acceso de lectura al Dashboard y Reportes de Ahorros.
  - *Restricción*: No puede modificar configuraciones, conectar nuevas integraciones, ni aprobar acciones del Agente de IA.

---

## Matriz de Permisos (RBAC Matrix)

| Acción / Vista | Admin / CFO | IT Manager | Reader / Auditor |
|---|---|---|---|
| Ver Dashboard General | ✅ Sí | ✅ Sí | ✅ Sí |
| Conectar / Eliminar Integraciones | ✅ Sí | ❌ No | ❌ No |
| Ver Detalles de Costos de SaaS | ✅ Sí | ✅ Sí | ✅ Sí |
| Aprobar Acciones del Agente de IA | ✅ Sí | ❌ No | ❌ No |
| Invitar a Nuevos Usuarios | ✅ Sí | ✅ Sí | ❌ No |
| Ver Logs de Auditoría del Sistema | ✅ Sí | ✅ Sí | ❌ No |
| Configurar Facturación de Onniik | ✅ Sí | ❌ No | ❌ No |
