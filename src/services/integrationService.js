import { supabase } from '../lib/supabase'
import { encryptionUtils } from '../utils/encryption'

// Generate a random API key
const generateRandomApiKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'sk_'
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const integrationService = {
  // Get user's integrations
  async getUserIntegrations() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No authenticated user found')
        return []
      }

      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Supabase error fetching integrations:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching integrations:', error)
      return []
    }
  },

  // Connect integration
  async connectIntegration(integrationType, config = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Check if integration already exists
      const { data: existing } = await supabase
        .from('user_integrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('integration_type', integrationType)
        .single()

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('user_integrations')
          .update({
            config,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Create new
        const { data, error } = await supabase
          .from('user_integrations')
          .insert({
            user_id: user.id,
            integration_type: integrationType,
            config,
            is_active: true
          })
          .select()
          .single()

        if (error) throw error
        return data
      }
    } catch (error) {
      console.error('Error connecting integration:', error)
      throw error
    }
  },

  // Disconnect integration
  async disconnectIntegration(integrationType) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('user_integrations')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('integration_type', integrationType)

      if (error) throw error
    } catch (error) {
      console.error('Error disconnecting integration:', error)
      throw error
    }
  },

  // Get user's API keys with decryption
  async getUserApiKeys() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No authenticated user found')
        return []
      }

      const { data, error } = await supabase
        .from('api_keys')
        .select('id, key_name, api_key, permissions, last_used, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error fetching API keys:', error)
        return []
      }
      
      // Decrypt API keys for display
      const decryptedData = (data || []).map(key => {
        try {
          const decryptedApiKey = encryptionUtils.isEncrypted(key.api_key) 
            ? encryptionUtils.decryptApiKey(key.api_key)
            : key.api_key // Handle legacy unencrypted keys
          
          return {
            ...key,
            api_key: decryptedApiKey
          }
        } catch (error) {
          console.error('Error decrypting API key:', error)
          return {
            ...key,
            api_key: 'Error: Unable to decrypt'
          }
        }
      })
      
      return decryptedData
    } catch (error) {
      console.error('Error fetching API keys:', error)
      return []
    }
  },

  // Generate new API key with encryption
  async generateApiKey(keyName, permissions = { read: true, write: false }) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Generate API key locally
      const apiKey = generateRandomApiKey()
      
      // Encrypt the API key before storing
      const encryptedApiKey = encryptionUtils.encryptApiKey(apiKey)

      const { data: keyData, error: insertError } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          key_name: keyName,
          api_key: encryptedApiKey, // Store encrypted version
          permissions
        })
        .select()
        .single()

      if (insertError) throw insertError
      
      // Return with decrypted API key for immediate display
      return {
        ...keyData,
        api_key: apiKey // Return original unencrypted key for user
      }
    } catch (error) {
      console.error('Error generating API key:', error)
      throw error
    }
  },

  // Delete API key
  async deleteApiKey(keyId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', user.id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting API key:', error)
      throw error
    }
  }
}
