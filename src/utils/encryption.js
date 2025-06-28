import CryptoJS from 'crypto-js'

// Use a consistent secret key for encryption/decryption
// In production, this should be an environment variable
const SECRET_KEY = 'sureto-click-encryption-key-2024'

export const encryptionUtils = {
  // Check if a string is encrypted (starts with our prefix)
  isEncrypted(text) {
    return typeof text === 'string' && text.startsWith('enc:')
  },

  // Encrypt API key
  encryptApiKey(apiKey) {
    try {
      const encrypted = CryptoJS.AES.encrypt(apiKey, SECRET_KEY).toString()
      return `enc:${encrypted}`
    } catch (error) {
      console.error('Encryption error:', error)
      return apiKey // Return original if encryption fails
    }
  },

  // Decrypt API key
  decryptApiKey(encryptedApiKey) {
    try {
      // Remove the 'enc:' prefix
      const encrypted = encryptedApiKey.replace('enc:', '')
      const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY).toString(CryptoJS.enc.Utf8)
      return decrypted || encryptedApiKey // Return original if decryption fails
    } catch (error) {
      console.error('Decryption error:', error)
      return encryptedApiKey // Return original if decryption fails
    }
  }
}
