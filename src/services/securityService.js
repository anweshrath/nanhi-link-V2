import { supabase } from '../lib/supabase'
import { encryptionUtils } from '../utils/encryption'
import { passwordUtils } from '../utils/passwordUtils'

export const securityService = {
  // Get security audit log (admin only)
  async getSecurityAuditLog(limit = 100) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching security audit log:', error)
      throw error
    }
  },

  // Get security status overview
  async getSecurityStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get API key encryption status
      const { data: apiKeyStats, error: apiError } = await supabase
        .from('api_keys')
        .select('is_encrypted, encryption_version')
        .eq('user_id', user.id)

      if (apiError) throw apiError

      // Get link password hashing status
      const { data: linkStats, error: linkError } = await supabase
        .from('links')
        .select('password_hashed, password_hash_version')
        .eq('user_id', user.id)
        .not('password', 'is', null)

      if (linkError) throw linkError

      // Calculate statistics
      const totalApiKeys = apiKeyStats?.length || 0
      const encryptedApiKeys = apiKeyStats?.filter(key => key.is_encrypted)?.length || 0
      
      const totalPasswordProtectedLinks = linkStats?.length || 0
      const hashedPasswordLinks = linkStats?.filter(link => link.password_hashed)?.length || 0

      return {
        apiKeys: {
          total: totalApiKeys,
          encrypted: encryptedApiKeys,
          unencrypted: totalApiKeys - encryptedApiKeys,
          encryptionRate: totalApiKeys > 0 ? (encryptedApiKeys / totalApiKeys) * 100 : 100
        },
        linkPasswords: {
          total: totalPasswordProtectedLinks,
          hashed: hashedPasswordLinks,
          plainText: totalPasswordProtectedLinks - hashedPasswordLinks,
          hashingRate: totalPasswordProtectedLinks > 0 ? (hashedPasswordLinks / totalPasswordProtectedLinks) * 100 : 100
        },
        overallSecurityScore: this.calculateSecurityScore({
          apiKeyEncryptionRate: totalApiKeys > 0 ? (encryptedApiKeys / totalApiKeys) * 100 : 100,
          passwordHashingRate: totalPasswordProtectedLinks > 0 ? (hashedPasswordLinks / totalPasswordProtectedLinks) * 100 : 100
        })
      }
    } catch (error) {
      console.error('Error fetching security status:', error)
      throw error
    }
  },

  // Calculate overall security score
  calculateSecurityScore({ apiKeyEncryptionRate, passwordHashingRate }) {
    // Weight API key encryption more heavily as it's higher risk
    const apiKeyWeight = 0.7
    const passwordWeight = 0.3
    
    const score = (apiKeyEncryptionRate * apiKeyWeight) + (passwordHashingRate * passwordWeight)
    return Math.round(score)
  },

  // Migrate legacy API key to encrypted format
  async migrateApiKeyToEncrypted(apiKeyId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get the current API key
      const { data: apiKey, error: fetchError } = await supabase
        .from('api_keys')
        .select('api_key, is_encrypted')
        .eq('id', apiKeyId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) throw fetchError

      // If already encrypted, skip
      if (apiKey.is_encrypted) {
        return { success: true, message: 'API key already encrypted' }
      }

      // Encrypt the API key
      const encryptedApiKey = encryptionUtils.encryptApiKey(apiKey.api_key)

      // Update the database
      const { error: updateError } = await supabase
        .from('api_keys')
        .update({
          api_key: encryptedApiKey,
          is_encrypted: true,
          encryption_version: 1
        })
        .eq('id', apiKeyId)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      return { success: true, message: 'API key encrypted successfully' }
    } catch (error) {
      console.error('Error migrating API key:', error)
      throw error
    }
  },

  // Migrate legacy link password to hashed format
  async migrateLinkPasswordToHashed(linkId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get the current link password
      const { data: link, error: fetchError } = await supabase
        .from('links')
        .select('password, password_hashed')
        .eq('id', linkId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) throw fetchError

      // If already hashed or no password, skip
      if (link.password_hashed || !link.password) {
        return { success: true, message: 'Link password already hashed or no password set' }
      }

      // Hash the password
      const hashedPassword = await passwordUtils.hashPassword(link.password)

      // Update the database
      const { error: updateError } = await supabase
        .from('links')
        .update({
          password: hashedPassword,
          password_hashed: true,
          password_hash_version: 1
        })
        .eq('id', linkId)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      return { success: true, message: 'Link password hashed successfully' }
    } catch (error) {
      console.error('Error migrating link password:', error)
      throw error
    }
  }
}
