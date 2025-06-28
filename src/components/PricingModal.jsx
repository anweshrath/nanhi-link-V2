import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Zap, Crown, Gift, Star } from 'lucide-react'
import { subscriptionService } from '../services/subscriptionService'
import toast from 'react-hot-toast'

const PricingModal = ({ isOpen, onClose, onUpgrade }) => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [currentPlan, setCurrentPlan] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    try {
      const [plansData, subscriptionData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getUserSubscription()
      ])
      setPlans(plansData)
      setCurrentPlan(subscriptionData?.subscription_plans?.id || 'free')
    } catch (error) {
      console.error('Error loading pricing data:', error)
      toast.error('Failed to load pricing information')
    }
  }

  const handleUpgrade = async (planId) => {
    if (planId === currentPlan) return

    setLoading(true)
    try {
      await subscriptionService.upgradeSubscription(planId, billingCycle)
      toast.success('Subscription updated successfully!')
      onUpgrade?.()
      onClose()
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      toast.error('Failed to upgrade subscription')
    } finally {
      setLoading(false)
    }
  }

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'free': return Gift
      case 'pro': return Zap
      case 'vip': return Crown
      default: return Star
    }
  }

  const getPlanColor = (planId) => {
    switch (planId) {
      case 'free': return 'from-gray-500 to-gray-600'
      case 'pro': return 'from-blue-500 to-indigo-600'
      case 'vip': return 'from-purple-500 to-pink-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getFeatureList = (features) => {
    const featureNames = {
      analytics: 'Advanced Analytics',
      qr_codes: 'QR Code Generation',
      basic_customization: 'Basic Customization',
      cloaking: 'Link Cloaking',
      rotator: 'Link Rotation',
      geo_targeting: 'Geo Targeting',
      time_targeting: 'Time Targeting',
      script_injection: 'Script Injection',
      ab_testing: 'A/B Testing',
      password_protection: 'Password Protection',
      custom_domains: 'Custom Domains',
      api_access: 'API Access',
      priority_support: 'Priority Support',
      vip_support: 'VIP Support',
      white_label: 'White Label',
      bulk_operations: 'Bulk Operations',
      advanced_analytics: 'Advanced Analytics'
    }

    return Object.entries(features)
      .filter(([_, enabled]) => enabled)
      .map(([feature, _]) => featureNames[feature] || feature)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/50"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between p-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800/50 dark:to-gray-700/50">
          <div>
            <h2 className="text-3xl font-display text-gray-900 dark:text-white flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                <Crown className="w-8 h-8" />
              </div>
              <span className="text-gradient">Choose Your Plan</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Unlock powerful features and scale your link management
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 70%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const Icon = getPlanIcon(plan.id)
              const isCurrentPlan = plan.id === currentPlan
              const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly
              const features = getFeatureList(plan.features)
              
              return (
                <motion.div
                  key={plan.id}
                  className={`relative card p-8 ${
                    plan.id === 'vip' 
                      ? 'ring-2 ring-purple-500 dark:ring-purple-400 scale-105' 
                      : ''
                  } ${isCurrentPlan ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  {plan.id === 'vip' && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${getPlanColor(plan.id)} text-white mb-4`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center space-x-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        ${price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && plan.id === 'vip' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        Save $127 per year!
                      </p>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="text-center mb-4">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {plan.link_limit ? `${plan.link_limit} links` : 'Unlimited links'}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400"> per month</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    {features.slice(0, 6).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                    {features.length > 6 && (
                      <div className="text-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          +{features.length - 6} more features
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading || isCurrentPlan}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      isCurrentPlan
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : plan.id === 'vip'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
                        : plan.id === 'pro'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : plan.id === 'free' ? (
                      'Downgrade to Free'
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                </motion.div>
              )
            })}
          </div>

          {/* Feature Comparison */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Need help choosing?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              All plans include our core features. Upgrade for advanced tools and higher limits.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <Gift className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Free</h4>
                <p className="text-gray-600 dark:text-gray-400">Perfect for personal use</p>
              </div>
              <div className="text-center">
                <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Pro</h4>
                <p className="text-gray-600 dark:text-gray-400">Advanced tools for marketers</p>
              </div>
              <div className="text-center">
                <Crown className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white">VIP</h4>
                <p className="text-gray-600 dark:text-gray-400">Everything + VIP support</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PricingModal
