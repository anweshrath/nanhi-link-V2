import { supabase } from '../lib/supabase'

export const subscriptionService = {
  // Get all available plans
  async getPlans() {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching plans:', error)
      throw error
    }
  },

  // Get user's current subscription
  async getUserSubscription() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error fetching user subscription:', error)
      return null
    }
  },

  // Get user's current usage
  async getUserUsage() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const currentMonth = new Date().toLocaleString('default', { month: 'long' })
      const currentYear = new Date().getFullYear()

      const { data, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || { links_created: 0, clicks_tracked: 0 }
    } catch (error) {
      console.error('Error fetching user usage:', error)
      return { links_created: 0, clicks_tracked: 0 }
    }
  },

  // Check if user can create more links
  async canCreateLink() {
    try {
      const [subscription, usage] = await Promise.all([
        this.getUserSubscription(),
        this.getUserUsage()
      ])

      if (!subscription) return false

      const plan = subscription.subscription_plans
      if (!plan.link_limit) return true // Unlimited

      return usage.links_created < plan.link_limit
    } catch (error) {
      console.error('Error checking link creation limit:', error)
      return false
    }
  },

  // Check if user has access to a feature
  async hasFeatureAccess(feature) {
    try {
      const subscription = await this.getUserSubscription()
      if (!subscription) return false

      const plan = subscription.subscription_plans
      return plan.features[feature] === true
    } catch (error) {
      console.error('Error checking feature access:', error)
      return false
    }
  },

  // Get usage stats for dashboard
  async getUsageStats() {
    try {
      const [subscription, usage] = await Promise.all([
        this.getUserSubscription(),
        this.getUserUsage()
      ])

      if (!subscription) return null

      const plan = subscription.subscription_plans
      
      return {
        plan: plan.name,
        linksUsed: usage.links_created,
        linksLimit: plan.link_limit,
        clicksTracked: usage.clicks_tracked,
        billingCycle: subscription.billing_cycle,
        currentPeriodEnd: subscription.current_period_end,
        features: plan.features
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error)
      return null
    }
  },

  // Upgrade subscription
  async upgradeSubscription(planId, billingCycle = 'monthly') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // For now, just update the subscription directly
      // In production, this would integrate with Stripe
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          plan_id: planId,
          billing_cycle: billingCycle,
          current_period_start: new Date().toISOString(),
          current_period_end: billingCycle === 'yearly' 
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('status', 'active')
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      throw error
    }
  }
}
