import { encrypt, decrypt } from '../crypto.utils';

describe('CryptoUtils (AES-256-GCM)', () => {
  const sampleSecret = 'ya29.a0Axoo123456_super_secret_access_token_sample';

  it('debe cifrar y descifrar un texto de manera reversible e idéntica', () => {
    const encrypted = encrypt(sampleSecret);
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toBe(sampleSecret);
    expect(encrypted.split(':').length).toBe(3);

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(sampleSecret);
  });

  it('debe generar diferentes ciphertexts para el mismo texto por el uso de IV aleatorio', () => {
    const enc1 = encrypt(sampleSecret);
    const enc2 = encrypt(sampleSecret);

    expect(enc1).not.toBe(enc2);
    expect(decrypt(enc1)).toBe(sampleSecret);
    expect(decrypt(enc2)).toBe(sampleSecret);
  });

  it('debe retornar cadena vacía si se pasa una cadena vacía', () => {
    expect(encrypt('')).toBe('');
    expect(decrypt('')).toBe('');
  });

  it('debe lanzar error al intentar descifrar un formato inválido', () => {
    expect(() => decrypt('formato_invalido_sin_dos_puntos')).toThrow(
      'Error al descifrar credenciales sensibles'
    );
  });

  it('debe lanzar error si el authTag o contenido cifrado es alterado', () => {
    const encrypted = encrypt(sampleSecret);
    const parts = encrypted.split(':');
    const tampered = `${parts[0]}:00000000000000000000000000000000:${parts[2]}`;

    expect(() => decrypt(tampered)).toThrow('Error al descifrar credenciales sensibles');
  });
});
