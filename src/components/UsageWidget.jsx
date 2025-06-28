import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Zap, Crown, ArrowUp } from 'lucide-react'
import { subscriptionService } from '../services/subscriptionService'

const UsageWidget = ({ onUpgradeClick }) => {
  const [usageStats, setUsageStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsageStats()
  }, [])

  const loadUsageStats = async () => {
    try {
      const stats = await subscriptionService.getUsageStats()
      setUsageStats(stats)
    } catch (error) {
      console.error('Error loading usage stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!usageStats) return null

  const { plan, linksUsed, linksLimit, clicksTracked } = usageStats
  const usagePercentage = linksLimit ? (linksUsed / linksLimit) * 100 : 0
  const isNearLimit = usagePercentage > 80

  const getPlanIcon = () => {
    switch (plan.toLowerCase()) {
      case 'pro': return Zap
      case 'vip': return Crown
      default: return BarChart3
    }
  }

  const getPlanColor = () => {
    switch (plan.toLowerCase()) {
      case 'pro': return 'from-blue-500 to-indigo-500'
      case 'vip': return 'from-purple-500 to-pink-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const Icon = getPlanIcon()

  return (
    <motion.div 
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${getPlanColor()}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {plan} Plan
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current usage
            </p>
          </div>
        </div>
        {plan.toLowerCase() === 'free' && (
          <button
            onClick={onUpgradeClick}
            className="btn-secondary text-xs flex items-center space-x-1"
          >
            <ArrowUp className="w-3 h-3" />
            <span>Upgrade</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Links Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Links Created
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {linksUsed} / {linksLimit || '∞'}
            </span>
          </div>
          {linksLimit && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isNearLimit 
                    ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          )}
          {isNearLimit && linksLimit && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              You're approaching your monthly limit
            </p>
          )}
        </div>

        {/* Clicks Tracked */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Clicks Tracked
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {clicksTracked.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Upgrade CTA for Free Plan */}
        {plan.toLowerCase() === 'free' && isNearLimit && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              Need more links? Upgrade to Pro for 25 links/month + advanced tools!
            </p>
            <button
              onClick={onUpgradeClick}
              className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default UsageWidget
