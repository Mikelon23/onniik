# Seguridad y Cumplimiento Regulatorio

Dada la naturaleza crítica de acceder a los datos financieros y de uso de herramientas de las organizaciones de nuestros usuarios, la seguridad es un pilar fundamental en Onniik.

---

## 1. Encriptación de Datos Sensibles

### En tránsito
- Todo el tráfico de red de la plataforma debe transmitirse obligatoriamente a través de HTTPS con TLS 1.3.
- Cabeceras de seguridad configuradas usando Helmet en el backend (HSTS, Content Security Policy, X-Frame-Options).

### En reposo (At Rest)
- **Tokens OAuth**: Las credenciales de acceso (`accessToken` y `refreshToken`) de Google Workspace y Slack deben almacenarse encriptadas usando cifrado simétrico robusto **AES-256-GCM** en PostgreSQL. La llave de encriptación debe almacenarse de forma independiente como una variable de entorno segura fuera de la base de datos.
- **Contraseñas**: Las contraseñas de los usuarios locales deben encriptarse mediante **bcryptjs** con un factor de costo de 12 saltos.

---

## 2. Gestión de Sesiones y Tokens JWT
- Los tokens JWT de autenticación de usuario tendrán un tiempo de expiración corto (máximo 1 hora).
- Las cookies de sesión deben tener las directivas `Secure`, `HttpOnly` y `SameSite=Strict` activadas para mitigar ataques XSS y CSRF.
- Las solicitudes se controlan mediante limitadores de tasa (rate limiters) para evitar ataques de fuerza bruta en los endpoints de autenticación y de APIs críticas.

---

## 3. Cumplimiento de Privacidad (GDPR & CCPA)
- **Principio de Minimización de Datos**: El escáner de facturas a través de Gmail y OCR solo extraerá metadatos transaccionales y descartará el cuerpo y contenido del correo que no coincida con palabras clave de proveedores SaaS validados.
- **Derecho al Olvido**: Implementación de un proceso automatizado que borra de manera definitiva la cuenta del usuario, sus credenciales OAuth conectadas y los históricos de facturación recopilados cuando el usuario solicita la baja.
