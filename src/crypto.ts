import { webcrypto as crypto } from "crypto";

// #############
// ### Utils ###
// #############

// Convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// Convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const buff = Buffer.from(base64, "base64");
  return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}

// ################
// ### RSA keys ###
// ################

// Generates a pair of private / public RSA keys
type GenerateRsaKeyPair = {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
};
export async function generateRsaKeyPair(): Promise<GenerateRsaKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

// Export a public key to Base64
export async function exportPubKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("spki", key);
  return arrayBufferToBase64(exported);
}

// Export a private key to Base64
export async function exportPrvKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("pkcs8", key);
  return arrayBufferToBase64(exported);
}

// Import a Base64 public key
export async function importPubKey(strKey: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
      "spki",
      base64ToArrayBuffer(strKey),
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
  );
}

// Import a Base64 private key
export async function importPrvKey(strKey: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
      "pkcs8",
      base64ToArrayBuffer(strKey),
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["decrypt"]
  );
}

// Encrypt a message using an RSA public key
export async function rsaEncrypt(
    b64Data: string,
    strPublicKey: string
): Promise<string> {
  const publicKey = await importPubKey(strPublicKey);
  const encrypted = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      base64ToArrayBuffer(b64Data)
  );
  return arrayBufferToBase64(encrypted);
}

// Decrypt a message using an RSA private key
export async function rsaDecrypt(
    encryptedData: string,
    strPrivateKey: string
): Promise<string> {
  const privateKey = await importPrvKey(strPrivateKey);
  const decrypted = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      base64ToArrayBuffer(encryptedData)
  );
  return Buffer.from(decrypted).toString("utf-8");
}

// ######################
// ### Symmetric keys ###
// ######################

// Generates a random symmetric key
export async function createRandomSymmetricKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
  );
}

// Export a symmetric key to Base64
export async function exportSymKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exported);
}

// Import a Base64 symmetric key
export async function importSymKey(strKey: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
      "raw",
      base64ToArrayBuffer(strKey),
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"]
  );
}

// Encrypt a message using a symmetric key
export async function symEncrypt(
    key: CryptoKey,
    data: string
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate IV
  const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(data)
  );
  return arrayBufferToBase64(iv) + "." + arrayBufferToBase64(encrypted);
}

// Decrypt a message using a symmetric key
export async function symDecrypt(
    strKey: string,
    encryptedData: string
): Promise<string> {
  const key = await importSymKey(strKey);
  const [ivB64, encryptedB64] = encryptedData.split(".");
  const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToArrayBuffer(ivB64) },
      key,
      base64ToArrayBuffer(encryptedB64)
  );
  return new TextDecoder().decode(decrypted);
}
