import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ExternalLink, Copy, Edit, Trash2, BarChart3, Eye, EyeOff, 
  Calendar, Shield, Globe, Code, Target, Zap, Check, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const LinkCard = ({ link, onEdit, onDelete, onToggleStatus }) => {
  const [copied, setCopied] = useState(false)

  // Get the correct short domain from environment or use default
  const getShortDomain = () => {
    const shortDomain = import.meta.env.VITE_SHORT_DOMAIN || 'nanhi.link'
    return shortDomain
  }

  // Generate the proper short URL
  const getShortUrl = () => {
    return `https://${getShortDomain()}/${link.short_code}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShortUrl())
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleExternalClick = () => {
    window.open(getShortUrl(), '_blank')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getFeatureBadges = () => {
    const badges = []
    
    if (link.password_protection) {
      badges.push({ icon: Shield, label: 'Password Protected', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' })
    }
    
    if (link.expiration_enabled && link.expiration_date) {
      const isExpired = new Date(link.expiration_date) < new Date()
      badges.push({ 
        icon: Calendar, 
        label: isExpired ? 'Expired' : 'Expires', 
        color: isExpired ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      })
    }
    
    if (link.click_limit_enabled && link.click_limit) {
      const isLimitReached = (link.total_clicks || 0) >= link.click_limit
      badges.push({ 
        icon: Target, 
        label: `${link.total_clicks || 0}/${link.click_limit}`, 
        color: isLimitReached ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      })
    }
    
    if (link.script_injection_enabled) {
      badges.push({ icon: Code, label: 'Scripts', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400' })
    }
    
    if (link.utm_enabled) {
      badges.push({ icon: Globe, label: 'UTM Tracking', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' })
    }
    
    if (link.ab_testing_enabled) {
      badges.push({ icon: Zap, label: 'A/B Testing', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' })
    }
    
    return badges
  }

  const badges = getFeatureBadges()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-500/5 transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
              {link.title}
            </h3>
            <div className="flex items-center space-x-2">
              {!link.is_active && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Inactive</span>
                </span>
              )}
            </div>
          </div>
          
          {/* Short URL Display */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-3">
            <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600">
              <p className="font-mono text-xs sm:text-sm text-blue-600 dark:text-blue-400 break-all">
                {getShortUrl()}
              </p>
            </div>
            <div className="flex space-x-2 sm:flex-shrink-0">
              <button
                onClick={copyToClipboard}
                className={`p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  copied 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title="Copy link"
                aria-label={copied ? 'Link copied' : 'Copy link'}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleExternalClick}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                title="Open link"
                aria-label="Open link in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Destination URL */}
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 break-all" title={link.destination_url || link.original_url}>
            → <span className="truncate inline-block max-w-full">{link.destination_url || link.original_url}</span>
          </p>

          {/* Feature Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
                >
                  <badge.icon className="w-3 h-3 mr-1" />
                  <span className="truncate">{badge.label}</span>
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {link.description && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 line-clamp-2">
              {link.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className="text-center">
          <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
            {link.total_clicks || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Clicks</div>
        </div>
        <div className="text-center">
          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
            {formatDate(link.created_at)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Created</div>
        </div>
        <div className="text-center">
          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
            {link.last_clicked_at ? formatDate(link.last_clicked_at) : 'Never'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Last Click</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => onEdit(link)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            title="Edit link"
            aria-label="Edit link"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStatus(link)}
            className={`p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              link.is_active
                ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20'
            }`}
            title={link.is_active ? 'Deactivate link' : 'Activate link'}
            aria-label={link.is_active ? 'Deactivate link' : 'Activate link'}
          >
            {link.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(link)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            title="Delete link"
            aria-label="Delete link"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500">
          <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Analytics</span>
        </button>
      </div>
    </motion.div>
  )
}

export default LinkCard
