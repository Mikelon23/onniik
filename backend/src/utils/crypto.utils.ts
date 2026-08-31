/**
 * crypto.utils.ts
 * Utilidades de cifrado y descifrado simétrico AES-256-GCM a nivel de aplicación
 * para la protección de tokens OAuth y credenciales sensibles.
 */

import crypto from 'crypto';
import logger from '../config/logger';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Recomendado para GCM

/**
 * Obtiene la clave de cifrado de 32 bytes derivada de ENCRYPTION_KEY o un fallback de desarrollo.
 */
function getEncryptionKey(): Buffer {
  const secret =
    process.env.ENCRYPTION_KEY ||
    process.env.NEXTAUTH_SECRET ||
    'onniik_default_encryption_key_32_bytes_secret!';

  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Cifra una cadena en texto plano utilizando AES-256-GCM.
 *
 * @param text Texto plano a cifrar
 * @returns Cadena formateada como `ivHex:authTagHex:ciphertextHex`
 */
export function encrypt(text: string): string {
  if (!text) {
    return '';
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    logger.error('[CryptoUtils] Error al cifrar texto:', error);
    throw new Error('Error al cifrar credenciales sensibles', { cause: error });
  }
}

/**
 * Descifra una cadena previamente cifrada con AES-256-GCM.
 *
 * @param encryptedText Cadena formateada como `ivHex:authTagHex:ciphertextHex`
 * @returns Texto plano descifrado
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) {
    return '';
  }

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Formato de texto cifrado no válido');
    }

    const [ivHex, authTagHex, ciphertextHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    logger.error('[CryptoUtils] Error al descifrar texto:', error);
    throw new Error('Error al descifrar credenciales sensibles', { cause: error });
  }
}
