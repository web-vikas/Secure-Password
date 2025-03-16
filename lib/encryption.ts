import CryptoJS from "crypto-js"

// Encrypt data using AES-256
export function encrypt(data: string, key: string): string {
  return CryptoJS.AES.encrypt(data, key).toString()
}

// Decrypt data using AES-256
export function decrypt(encryptedData: string, key: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key)
  return bytes.toString(CryptoJS.enc.Utf8)
}

// Generate a random encryption key
export function generateEncryptionKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString()
}

// Hash a password for storage
export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString()
}

// Generate a random TOTP code
export function generateTOTP(): string {
  // Generate a 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate a UUID token for shared passwords
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

