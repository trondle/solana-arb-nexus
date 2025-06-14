
/**
 * Secure encryption utilities for sensitive data
 * Uses AES-256-GCM encryption with PBKDF2 key derivation
 */

// Convert string to ArrayBuffer
const stringToArrayBuffer = (str: string): ArrayBuffer => {
  return new TextEncoder().encode(str);
};

// Convert ArrayBuffer to string
const arrayBufferToString = (buffer: ArrayBuffer): string => {
  return new TextDecoder().decode(buffer);
};

// Convert ArrayBuffer to base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

// Convert base64 to ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Derive encryption key from password using PBKDF2
const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToArrayBuffer(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000, // High iteration count for security
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// Generate random salt
const generateSalt = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(16));
};

// Generate random IV
const generateIV = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(12));
};

/**
 * Encrypt sensitive data using AES-256-GCM
 */
export const encryptSensitiveData = async (
  data: any,
  userPassword: string
): Promise<string> => {
  try {
    const salt = generateSalt();
    const iv = generateIV();
    const key = await deriveKey(userPassword, salt);
    
    const plaintext = stringToArrayBuffer(JSON.stringify(data));
    
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      plaintext
    );

    // Combine salt, iv, and ciphertext
    const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

    return arrayBufferToBase64(combined.buffer);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
};

/**
 * Decrypt sensitive data using AES-256-GCM
 */
export const decryptSensitiveData = async (
  encryptedData: string,
  userPassword: string
): Promise<any> => {
  try {
    const combined = base64ToArrayBuffer(encryptedData);
    const salt = new Uint8Array(combined, 0, 16);
    const iv = new Uint8Array(combined, 16, 12);
    const ciphertext = new Uint8Array(combined, 28);

    const key = await deriveKey(userPassword, salt);
    
    const plaintext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      ciphertext
    );

    return JSON.parse(arrayBufferToString(plaintext));
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt sensitive data - invalid password or corrupted data');
  }
};

/**
 * Check if Web Crypto API is available
 */
export const isEncryptionSupported = (): boolean => {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.getRandomValues !== 'undefined';
};
