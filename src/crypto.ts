import { webcrypto } from "crypto";

// #############
// ### Utils ###
// #############

// Convertir un ArrayBuffer en Base64
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// Convertir un Base64 en ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  return Buffer.from(base64, "base64").buffer;
}

// ################
// ### RSA keys ###
// ################

export async function generateRsaKeyPair(): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey }> {
  const keyPair = await webcrypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
  );

  return keyPair;
}

// Exporter une clé publique en Base64
export async function exportPubKey(key: CryptoKey): Promise<string> {
  const exported = await webcrypto.subtle.exportKey("spki", key);
  return arrayBufferToBase64(exported);
}

// Exporter une clé privée en Base64
export async function exportPrvKey(key: CryptoKey): Promise<string> {
  const exported = await webcrypto.subtle.exportKey("pkcs8", key);
  return arrayBufferToBase64(exported);
}

// Importer une clé publique depuis Base64
export async function importPubKey(strKey: string): Promise<webcrypto.CryptoKey> {
  const buffer = base64ToArrayBuffer(strKey);
  return await webcrypto.subtle.importKey(
      "spki",
      new Uint8Array(buffer), // Assurer que c'est un Uint8Array
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
  );
}

export async function importPrvKey(strKey: string): Promise<webcrypto.CryptoKey> {
  const buffer = base64ToArrayBuffer(strKey);
  return await webcrypto.subtle.importKey(
      "pkcs8",
      new Uint8Array(buffer), // Assurer que c'est un Uint8Array
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["decrypt"]
  );
}


// Chiffrer un message avec une clé publique RSA
export async function rsaEncrypt(b64Data: string, strPublicKey: string): Promise<string> {
  const publicKey = await importPubKey(strPublicKey);
  const encrypted = await webcrypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      Buffer.from(b64Data, "utf-8")
  );
  return arrayBufferToBase64(encrypted);
}

// Déchiffrer un message avec une clé privée RSA
export async function rsaDecrypt(
    encryptedData: string,
    privateKey: CryptoKey | string
): Promise<string> {
  let key: CryptoKey;

  if (typeof privateKey === "string") {
    key = await importPrvKey(privateKey);
  } else {
    key = privateKey;
  }

  const decrypted = await webcrypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      key,
      base64ToArrayBuffer(encryptedData)
  );
  return Buffer.from(decrypted).toString("utf-8");
}



// ######################
// ### Symmetric keys ###
// ######################

export async function createRandomSymmetricKey(): Promise<webcrypto.CryptoKey> {
  return await webcrypto.subtle.generateKey(
      { name: "AES-CBC", length: 256 }, // Utilisation d'AES-CBC
      true,
      ["encrypt", "decrypt"]
  );
}


export async function exportSymKey(key: CryptoKey): Promise<string> {
  const exported = await webcrypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exported);
}

export async function importSymKey(strKey: string): Promise<CryptoKey> {
  return await webcrypto.subtle.importKey(
      "raw",
      base64ToArrayBuffer(strKey),
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"]
  );
}

export async function symEncrypt(key: CryptoKey, data: string): Promise<string> {
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const encrypted = await webcrypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(data)
  );
  return arrayBufferToBase64(iv) + ":" + arrayBufferToBase64(encrypted);
}


export async function symDecrypt(strKey: string, encryptedData: string): Promise<string> {
  const key = await importSymKey(strKey);
  const [ivB64, encryptedB64] = encryptedData.split(":");

  const decrypted = await webcrypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToArrayBuffer(ivB64) },
      key,
      base64ToArrayBuffer(encryptedB64)
  );

  return new TextDecoder().decode(decrypted);
}
