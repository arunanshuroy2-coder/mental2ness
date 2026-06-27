/**
 * Native Browser WebCrypto API wrapper for client-side AES-GCM encryption.
 * This guarantees the student's personal journals are stored securely
 * in localStorage as encrypted ciphertext and can only be unlocked with their local passkey.
 */

// Helper to convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper to convert string to ArrayBuffer
const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Derives a cryptographic key from a passcode and salt using PBKDF2.
 */
async function deriveKey(passcode: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(passcode),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a string using a passcode.
 * Returns a JSON string containing the base64-encoded salt, iv, and ciphertext.
 */
export async function encryptText(text: string, passcode: string): Promise<string> {
  try {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const key = await deriveKey(passcode, salt);
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encoder.encode(text)
    );

    const payload = {
      salt: bufferToBase64(salt),
      iv: bufferToBase64(iv),
      ciphertext: bufferToBase64(encryptedBuffer),
    };

    return JSON.stringify(payload);
  } catch (err) {
    console.error("Encryption error:", err);
    throw new Error("Failed to encrypt data locally.");
  }
}

/**
 * Decrypts a string using a passcode.
 * Throws an error if the passcode is incorrect or payload is tampered with.
 */
export async function decryptText(encryptedPayload: string, passcode: string): Promise<string> {
  try {
    const payload = JSON.parse(encryptedPayload);
    if (!payload.salt || !payload.iv || !payload.ciphertext) {
      throw new Error("Invalid payload format.");
    }

    const salt = new Uint8Array(base64ToBuffer(payload.salt));
    const iv = new Uint8Array(base64ToBuffer(payload.iv));
    const ciphertext = base64ToBuffer(payload.ciphertext);

    const key = await deriveKey(passcode, salt);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );

    return decoder.decode(decryptedBuffer);
  } catch (err) {
    console.warn("Decryption error (likely incorrect passkey):", err);
    throw new Error("Incorrect passkey. Failed to decrypt entry.");
  }
}

/**
 * Generates a verification hash to store locally so we can check if the user entered the correct passkey on login.
 */
export async function generatePasskeyHash(passcode: string): Promise<string> {
  const salt = encoder.encode("wellness_vault_salt_v1");
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(passcode),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 50000,
      hash: "SHA-256",
    },
    baseKey,
    256
  );

  return bufferToBase64(derivedBits);
}
