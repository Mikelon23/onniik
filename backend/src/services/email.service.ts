/**
 * email.service.ts
 * Servicio centralizado para el envío de correos electrónicos en Onniik.
 *
 * Responsabilidades:
 *   - Configurar el transporter de Nodemailer (SMTP) con soporte para fallbacks.
 *   - Proveer métodos tipados para el envío de correos de negocio y de sistema.
 *   - Generar plantillas HTML premium alineadas con el diseño visual de Onniik.
 *
 * En entornos de desarrollo/test, si no hay credenciales SMTP válidas configuradas,
 * el servicio imprime el correo en los logs del servidor usando Winston logger.
 *
 * Tareas 91 y 92 — Sistema de Envío de Correos y Plantillas HTML
 */

import nodemailer from 'nodemailer';
import logger from '../config/logger';

// ─────────────────────────────────────────────
// CONFIGURACIÓN DE SMTP
// ─────────────────────────────────────────────

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true'; // true para puerto 465
const EMAIL_FROM = process.env.EMAIL_FROM || 'Onniik Team <noreply@onniik.com>';

let transporter: nodemailer.Transporter | null = null;

// Evitar inicializar si son valores por defecto / placeholders o no están configurados
const hasValidConfig =
  SMTP_HOST &&
  SMTP_USER &&
  SMTP_PASS &&
  SMTP_HOST !== 'smtp.mailtrap.io' &&
  SMTP_USER !== 'username';

if (hasValidConfig) {
  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    logger.info(`[EMAIL] Transporter SMTP inicializado correctamente para host: ${SMTP_HOST}`);
  } catch (err) {
    logger.error('[EMAIL] Error inicializando el transporter SMTP de Nodemailer:', err);
  }
} else {
  logger.info(
    '[EMAIL] Modo desarrollo/logs activo. No se detectó configuración SMTP válida. Los correos se imprimirán en los logs.'
  );
}

// ─────────────────────────────────────────────
// PLANTILLAS HTML Y TEXTO BASE
// ─────────────────────────────────────────────

/**
 * Plantilla HTML envolvente (Wrapper) con diseño responsivo premium.
 * Implementa tipografía moderna, degradado de marca y estructura de tarjeta.
 */
function getHtmlTemplate(title: string, contentHtml: string): string {
  const currentYear = new Date().getFullYear();
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 48px 0;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      padding: 32px 40px;
      text-align: center;
    }
    .logo {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px;
      font-size: 16px;
      line-height: 1.6;
      color: #334155;
    }
    .title-content {
      color: #0f172a;
      font-size: 20px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .button-container {
      margin: 32px 0;
      text-align: center;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
    }
    .credential-box {
      background-color: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .credential-row {
      margin: 8px 0;
      font-size: 14px;
    }
    .credential-label {
      color: #64748b;
      font-weight: 600;
    }
    .credential-value {
      color: #0f172a;
      font-weight: 700;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 40px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 4px 0;
    }
    .divider {
      border: 0;
      border-top: 1px solid #e2e8f0;
      margin: 24px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">Onniik</div>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        <p>© ${currentYear} Onniik — Congelador de Costos SaaS.</p>
        <p>Este correo electrónico fue generado de forma automática. Por favor, no respondas a este mensaje.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// SERVICIO DE EMAIL
// ─────────────────────────────────────────────

export const EmailService = {
  /**
   * Envía un correo electrónico general. Envía vía SMTP si está configurado,
   * de lo contrario escribe en el log de Winston.
   *
   * @param to - Destinatario
   * @param subject - Asunto del correo
   * @param text - Cuerpo del correo en texto plano
   * @param html - Cuerpo del correo en HTML
   */
  async sendMail(to: string, subject: string, text: string, html: string): Promise<void> {
    if (transporter) {
      try {
        await transporter.sendMail({
          from: EMAIL_FROM,
          to,
          subject,
          text,
          html,
        });
        logger.info(`[EMAIL] Correo enviado exitosamente a: ${to} (Asunto: "${subject}")`);
      } catch (err) {
        logger.error(`[EMAIL] Error al enviar correo a ${to}:`, err);
        throw err;
      }
    } else {
      // Formatear log amigable para desarrollo local
      logger.info(`
[EMAIL LOG DE DESARROLLO]
┌─────────────────────────────────────────────────────────────────────────────
│ Remitente:   ${EMAIL_FROM}
│ Destinatario: ${to}
│ Asunto:       ${subject}
├─────────────────────────────────────────────────────────────────────────────
│ CUERPO EN TEXTO PLANO:
│ ${text.split('\n').join('\n│ ')}
└─────────────────────────────────────────────────────────────────────────────
      `);
    }
  },

  /**
   * Correo de bienvenida para usuarios recién registrados en la plataforma.
   */
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = '¡Te damos la bienvenida a Onniik!';
    const userName = name || 'Usuario';

    const text = `Hola ${userName},
¡Te damos la bienvenida a Onniik!

Estamos encantados de tenerte con nosotros. Onniik te ayudará a rastrear, analizar y optimizar el gasto de suscripciones SaaS de tu organización de forma automática mediante inteligencia artificial.

Próximos pasos recomendados:
1. Conecta tus integraciones (Google Workspace y Slack) en la sección de onboarding.
2. Sube tus facturas SaaS para identificar cobros recurrentes de forma automática.
3. Configura tus alertas para empezar a recortar el gasto innecesario (Shadow IT y licencias inactivas).

Si tienes alguna pregunta, puedes consultar nuestro Centro de Soporte o ponerte en contacto con nosotros en cualquier momento.

Atentamente,
El equipo de Onniik
https://onniik.com`;

    const html = getHtmlTemplate(
      subject,
      `<h2 class="title-content">¡Hola, ${userName}! 👋</h2>
      <p>Te damos una cálida bienvenida a <strong>Onniik</strong>, el optimizador inteligente de costos SaaS.</p>
      <p>Nuestra misión es ayudarte a congelar los gastos de software innecesarios, identificar el <em>Shadow IT</em> y reclamar licencias inactivas de manera automatizada gracias a nuestro motor de IA.</p>
      
      <h3 style="color: #0f172a; margin-top: 24px;">Tus primeros pasos sugeridos:</h3>
      <ul style="padding-left: 20px;">
        <li>Conecta tus cuentas de <strong>Google Workspace</strong> y <strong>Slack</strong> para el escaneo automático.</li>
        <li>Sube tus facturas en PDF para una digitalización inteligente.</li>
        <li>Monitorea las alertas de optimización en tu dashboard en tiempo real.</li>
      </ul>

      <div class="button-container">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login" class="button">Acceder a mi panel de control</a>
      </div>

      <hr class="divider" />
      <p style="font-size: 14px; color: #64748b;">¿Tienes dudas? Responde a este correo o contacta con el equipo de soporte. Estamos aquí para guiarte en el camino del ahorro.</p>`
    );

    await this.sendMail(to, subject, text, html);
  },

  /**
   * Correo de invitación para nuevos miembros de la organización.
   * Contiene el enlace de activación temporal y la contraseña provisoria generada.
   */
  async sendInvitationEmail(options: {
    to: string;
    name: string;
    inviterName: string;
    orgName: string;
    inviteToken: string;
    temporaryPassword: string;
  }): Promise<void> {
    const { to, name, inviterName, orgName, inviteToken, temporaryPassword } = options;
    const subject = `Invitación para unirte a ${orgName} en Onniik`;
    const inviteeName = name || 'Colega';

    // Generar enlace seguro para el frontend
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const acceptUrl = `${baseUrl}/accept-invite?token=${inviteToken}`;

    const text = `Hola ${inviteeName},

${inviterName} te ha invitado a unirte a la organización "${orgName}" en Onniik.

Onniik es la plataforma de gestión y optimización de licencias SaaS de la empresa.

Tus credenciales de acceso temporal son:
- Correo electrónico: ${to}
- Contraseña temporal: ${temporaryPassword}

Por seguridad, debes activar tu cuenta y configurar tu contraseña definitiva en el siguiente enlace (expira en 72 horas):
${acceptUrl}

Si no estabas al tanto de esta invitación, por favor ignora este mensaje.

Atentamente,
El equipo de Onniik`;

    const html = getHtmlTemplate(
      subject,
      `<h2 class="title-content">¡Hola, ${inviteeName}!</h2>
      <p><strong>${inviterName}</strong> te ha invitado a formar parte del equipo de <strong>${orgName}</strong> en Onniik, la plataforma de optimización de costos y licencias SaaS de la empresa.</p>
      
      <p>A través de Onniik, podrás colaborar en la auditoría de licencias, revisión de Shadow IT y consolidación del stack de software del equipo.</p>
      
      <div class="credential-box">
        <div class="credential-row">
          <span class="credential-label">Usuario:</span>
          <span class="credential-value">${to}</span>
        </div>
        <div class="credential-row">
          <span class="credential-label">Contraseña temporal:</span>
          <span class="credential-value" style="background-color: #cbd5e1; padding: 2px 6px; border-radius: 4px;">${temporaryPassword}</span>
        </div>
      </div>

      <p style="font-size: 14px; color: #dc2626; font-weight: 600;">⚠️ Por motivos de seguridad, esta invitación y contraseña temporal expirarán en 72 horas.</p>

      <div class="button-container">
        <a href="${acceptUrl}" class="button">Aceptar invitación y configurar cuenta</a>
      </div>

      <hr class="divider" />
      <p style="font-size: 14px; color: #64748b;">Si crees que este correo te llegó por error, puedes descartarlo de forma segura.</p>`
    );

    await this.sendMail(to, subject, text, html);
  },

  /**
   * Correo para alertas críticas del sistema.
   * Por ejemplo, cuando se detecta Shadow IT o la expiración inminente de un token.
   */
  async sendSystemAlertEmail(options: {
    to: string;
    alertTitle: string;
    alertDescription: string;
    actionUrl?: string;
  }): Promise<void> {
    const { to, alertTitle, alertDescription, actionUrl } = options;
    const subject = `⚠️ Notificación de Alerta: ${alertTitle}`;

    const text = `ATENCIÓN: Notificación de Onniik

Alerta del Sistema: ${alertTitle}

Descripción:
${alertDescription}

Puedes revisar los detalles e iniciar la resolución en el siguiente enlace:
${actionUrl || 'http://localhost:3000/dashboard'}

Atentamente,
Monitoreo automático de Onniik`;

    const html = getHtmlTemplate(
      subject,
      `<h2 class="title-content" style="color: #dc2626;">⚠️ Alerta de Optimización / Sistema</h2>
      <p>El motor de auditoría de Onniik ha registrado una nueva alerta que requiere atención en tu panel de control:</p>
      
      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin: 24px 0;">
        <h3 style="margin: 0 0 8px 0; color: #b45309; font-size: 16px;">${alertTitle}</h3>
        <p style="margin: 0; color: #78350f; font-size: 14px;">${alertDescription}</p>
      </div>

      <div class="button-container">
        <a href="${actionUrl || 'http://localhost:3000/dashboard'}" class="button" style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); box-shadow: 0 4px 10px rgba(220, 38, 38, 0.3);">Revisar en el Dashboard</a>
      </div>

      <hr class="divider" />
      <p style="font-size: 13px; color: #64748b;">Puedes deshabilitar o configurar las frecuencias de las alertas de correo en la pestaña de Configuración de tu Perfil.</p>`
    );

    await this.sendMail(to, subject, text, html);
  },
};
