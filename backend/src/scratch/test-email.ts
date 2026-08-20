/**
 * test-email.ts
 * Script para verificar el funcionamiento del EmailService de forma aislada.
 *
 * Ejecutar con:
 *   npx ts-node src/scratch/test-email.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde backend/.env antes de importar EmailService
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { EmailService } from '../services/email.service';
import logger from '../config/logger';

async function runTests() {
  logger.info('[TEST-EMAIL] Iniciando pruebas de envío de correos...');

  const testRecipient = 'test-recipient@onniik.com';

  try {
    // 1. Probar Correo de Bienvenida
    logger.info('[TEST-EMAIL] Enviando correo de bienvenida...');
    await EmailService.sendWelcomeEmail(testRecipient, 'Miguel Auditor');

    // 2. Probar Correo de Invitación
    logger.info('[TEST-EMAIL] Enviando correo de invitación...');
    await EmailService.sendInvitationEmail({
      to: 'nuevo-miembro@onniik.com',
      name: 'Ana García',
      inviterName: 'Miguel Administrador',
      orgName: 'Mikelon Corp',
      inviteToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token.signature',
      temporaryPassword: 'temp_pass_12345',
    });

    // 3. Probar Correo de Alerta del Sistema
    logger.info('[TEST-EMAIL] Enviando correo de alerta de sistema...');
    await EmailService.sendSystemAlertEmail({
      to: testRecipient,
      alertTitle: 'Slack: 12 Asientos Inactivos Detectados',
      alertDescription:
        'El motor de IA de Onniik detectó que 12 usuarios no han iniciado sesión en Slack en los últimos 30 días, lo que representa un desperdicio estimado de $120.00/mes.',
      actionUrl: 'http://localhost:3000/alerts/detail-mock-id',
    });

    logger.info('[TEST-EMAIL] ✅ Todas las pruebas del EmailService finalizaron exitosamente.');
  } catch (error) {
    logger.error('[TEST-EMAIL] ❌ Error durante la ejecución de las pruebas:', error);
    process.exit(1);
  }
}

runTests();
