import { useState, useEffect } from 'react'
import { linkService } from '../services/linkService'
import { subscriptionService } from '../services/subscriptionService'
import toast from 'react-hot-toast'

export const useLinks = () => {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch all user links
  const fetchLinks = async () => {
    try {
      setLoading(true)
      const data = await linkService.getUserLinks()
      setLinks(data)
    } catch (error) {
      console.error('Error fetching links:', error)
      toast.error('Failed to fetch links')
    } finally {
      setLoading(false)
    }
  }

  // Get links by project
  const getLinksByProject = async (projectId) => {
    try {
      const data = await linkService.getLinksByProject(projectId)
      return data
    } catch (error) {
      console.error('Error fetching project links:', error)
      toast.error('Failed to fetch project links')
      return []
    }
  }

  // Create new link with usage check
  const createLink = async (linkData) => {
    try {
      setLoading(true)
      
      // Check if user can create more links
      const canCreate = await subscriptionService.canCreateLink()
      if (!canCreate) {
        toast.error('You have reached your monthly link limit. Please upgrade your plan.')
        throw new Error('Link limit reached')
      }
      
      // Check if short code is available if provided
      if (linkData.short_code) {
        const isAvailable = await linkService.isShortCodeAvailable(linkData.short_code)
        if (!isAvailable) {
          toast.error('Short code is already taken')
          throw new Error('Short code is already taken')
        }
      }
      
      // Check feature access for advanced features
      if (linkData.cloaking_enabled) {
        const hasAccess = await subscriptionService.hasFeatureAccess('cloaking')
        if (!hasAccess) {
          toast.error('Cloaking feature requires Pro or VIP plan')
          throw new Error('Feature not available in current plan')
        }
      }

      if (linkData.script_injection_enabled) {
        const hasAccess = await subscriptionService.hasFeatureAccess('script_injection')
        if (!hasAccess) {
          toast.error('Script injection requires Pro or VIP plan')
          throw new Error('Feature not available in current plan')
        }
      }

      if (linkData.geo_targeting_enabled) {
        const hasAccess = await subscriptionService.hasFeatureAccess('geo_targeting')
        if (!hasAccess) {
          toast.error('Geo targeting requires Pro or VIP plan')
          throw new Error('Feature not available in current plan')
        }
      }

      if (linkData.ab_testing_enabled) {
        const hasAccess = await subscriptionService.hasFeatureAccess('ab_testing')
        if (!hasAccess) {
          toast.error('A/B testing requires Pro or VIP plan')
          throw new Error('Feature not available in current plan')
        }
      }

      if (linkData.password_protection) {
        const hasAccess = await subscriptionService.hasFeatureAccess('password_protection')
        if (!hasAccess) {
          toast.error('Password protection requires Pro or VIP plan')
          throw new Error('Feature not available in current plan')
        }
      }
      
      const newLink = await linkService.createLink(linkData)
      
      // Add to links array
      setLinks(prev => [newLink, ...prev])
      toast.success('Link created successfully!')
      
      return newLink
    } catch (error) {
      console.error('Error creating link:', error)
      toast.error(error.message || 'Failed to create link')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update link
  const updateLink = async (linkId, updates) => {
    try {
      setLoading(true)
      
      // Check if short code is available if changed
      if (updates.short_code) {
        const currentLink = links.find(link => link.id === linkId)
        if (currentLink && currentLink.short_code !== updates.short_code) {
          const isAvailable = await linkService.isShortCodeAvailable(updates.short_code)
          if (!isAvailable) {
            toast.error('Short code is already taken')
            throw new Error('Short code is already taken')
          }
        }
      }

      // Check feature access for advanced features
      if (updates.cloaking_enabled) {
        const hasAccess = await subscriptionService.hasFeatureAccess('cloaking')
        if (!hasAccess) {
          toast.error('Cloaking feature requires Pro or VIP plan')
          throw new Error('Feature not available in current plan')
        }
      }

      if (updates.script_injection_enabled) {
        const hasAccess = await subscriptionService.hasFeatureAccess('script_injection')
        if (!hasAccess) {
          toast.error('Script injection requires Pro or VIP plan')
          throw new Error('Feature not available in current plan')
        }
      }
      
      const updatedLink = await linkService.updateLink(linkId, updates)
      
      // Update in links array
      setLinks(prev => prev.map(link => 
        link.id === linkId ? updatedLink : link
      ))
      toast.success('Link updated successfully!')
      
      return updatedLink
    } catch (error) {
      console.error('Error updating link:', error)
      toast.error(error.message || 'Failed to update link')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Delete link
  const deleteLink = async (linkId) => {
    try {
      setLoading(true)
      await linkService.deleteLink(linkId)
      
      // Remove from links array
      setLinks(prev => prev.filter(link => link.id !== linkId))
      toast.success('Link deleted successfully!')
    } catch (error) {
      console.error('Error deleting link:', error)
      toast.error(error.message || 'Failed to delete link')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Refresh links
  const refresh = () => {
    fetchLinks()
  }

  // Initial load
  useEffect(() => {
    fetchLinks()
  }, [])

  return {
    links,
    loading,
    createLink,
    updateLink,
    deleteLink,
    getLinksByProject,
    refresh,
    fetchLinks
  }
}
