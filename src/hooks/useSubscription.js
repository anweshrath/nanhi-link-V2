import { useState, useEffect } from 'react'
import { subscriptionService } from '../services/subscriptionService'
import toast from 'react-hot-toast'

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null)
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch subscription data
  const fetchSubscription = async () => {
    try {
      setLoading(true)
      const [subscriptionData, usageData] = await Promise.all([
        subscriptionService.getUserSubscription(),
        subscriptionService.getUserUsage()
      ])
      setSubscription(subscriptionData)
      setUsage(usageData)
    } catch (error) {
      console.error('Error fetching subscription:', error)
      toast.error('Failed to fetch subscription data')
    } finally {
      setLoading(false)
    }
  }

  // Check if user can create links
  const canCreateLink = async () => {
    try {
      return await subscriptionService.canCreateLink()
    } catch (error) {
      console.error('Error checking link creation limit:', error)
      return false
    }
  }

  // Check feature access
  const hasFeatureAccess = async (feature) => {
    try {
      return await subscriptionService.hasFeatureAccess(feature)
    } catch (error) {
      console.error('Error checking feature access:', error)
      return false
    }
  }

  // Get usage stats
  const getUsageStats = async () => {
    try {
      return await subscriptionService.getUsageStats()
    } catch (error) {
      console.error('Error fetching usage stats:', error)
      return null
    }
  }

  // Upgrade subscription
  const upgradeSubscription = async (planId, billingCycle = 'monthly') => {
    try {
      setLoading(true)
      await subscriptionService.upgradeSubscription(planId, billingCycle)
      await fetchSubscription() // Refresh data
      toast.success('Subscription updated successfully!')
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      toast.error('Failed to upgrade subscription')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchSubscription()
  }, [])

  return {
    subscription,
    usage,
    loading,
    canCreateLink,
    hasFeatureAccess,
    getUsageStats,
    upgradeSubscription,
    refresh: fetchSubscription
  }
}
