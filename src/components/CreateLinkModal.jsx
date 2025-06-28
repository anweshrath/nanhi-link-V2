import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link, Wand2, Copy, Check, Settings, Eye, EyeOff, Clock, Shield, Info } from 'lucide-react'
import { linkService } from '../services/linkService'
import InfoTooltip from './InfoTooltip'
import toast from 'react-hot-toast'

const CreateLinkModal = ({ isOpen, onClose, onLinkCreated, projectId }) => {
  const modalRef = useRef(null)
  const firstInputRef = useRef(null)
  const [formData, setFormData] = useState({
    title: '',
    destination_url: '',
    short_code: '',
    description: '',
    // Advanced options
    password: '',
    expires_at: '',
    click_limit: '',
    is_active: true,
    // Cloaking options
    cloaking_enabled: false,
    cloaking_page_title: 'Loading...',
    cloaking_page_description: 'Please wait while we redirect you...',
    // Tracking options
    script_injection_enabled: false,
    tracking_scripts: [],
    script_delay: 2,
    script_position: 'head'
  })
  
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose()
      }
      
      // Tab trapping within modal
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            event.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            event.preventDefault()
          }
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Focus first input when modal opens
      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus()
        }
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden' // Prevent background scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Get the correct short domain from environment or use default
  const getShortDomain = () => {
    // In production, this should be your actual short domain
    const shortDomain = import.meta.env.VITE_SHORT_DOMAIN || 'nanhi.link'
    return shortDomain
  }

  const generateShortCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, short_code: result }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate URL
      try {
        new URL(formData.destination_url)
      } catch {
        toast.error('Please enter a valid URL')
        setLoading(false)
        return
      }

      // Generate short code if not provided
      let shortCode = formData.short_code
      if (!shortCode) {
        shortCode = Math.random().toString(36).substring(2, 8)
      }

      // Check if short code is available
      const isAvailable = await linkService.isShortCodeAvailable(shortCode)
      if (!isAvailable) {
        toast.error('Short code already exists. Please choose another.')
        setLoading(false)
        return
      }

      const linkData = {
        ...formData,
        short_code: shortCode,
        project_id: projectId,
        link_type: 'short',
        expires_at: formData.expires_at || null,
        click_limit: formData.click_limit ? parseInt(formData.click_limit) : null
      }

      const newLink = await linkService.createLink(linkData)
      
      // Generate the actual short URL
      const shortUrl = `https://${getShortDomain()}/${shortCode}`
      
      setGeneratedLink({
        ...newLink,
        short_url: shortUrl
      })

      toast.success('Link created successfully!')
      
      if (onLinkCreated) {
        onLinkCreated(newLink)
      }

      // Reset form
      setFormData({
        title: '',
        destination_url: '',
        short_code: '',
        description: '',
        password: '',
        expires_at: '',
        click_limit: '',
        is_active: true,
        cloaking_enabled: false,
        cloaking_page_title: 'Loading...',
        cloaking_page_description: 'Please wait while we redirect you...',
        script_injection_enabled: false,
        tracking_scripts: [],
        script_delay: 2,
        script_position: 'head'
      })

    } catch (error) {
      console.error('Error creating link:', error)
      toast.error('Failed to create link')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (generatedLink?.short_url) {
      try {
        await navigator.clipboard.writeText(generatedLink.short_url)
        setCopied(true)
        toast.success('Link copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error('Failed to copy link')
      }
    }
  }

  const handleClose = () => {
    setGeneratedLink(null)
    setCopied(false)
    setShowAdvanced(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <motion.div 
          ref={modalRef}
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/50"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 flex-shrink-0">
            <h2 
              id="modal-title"
              className="text-lg sm:text-xl lg:text-2xl font-display text-gray-900 dark:text-white flex items-center space-x-2 sm:space-x-3"
            >
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg sm:rounded-xl text-white">
                <Link className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
              <span className="truncate">Create Short Link</span>
              <div className="hidden sm:block">
                <InfoTooltip
                  title="Quick Link Creation"
                  description="Create a simple short link with basic options. For advanced features like A/B testing, geo-targeting, and cloaking, use the Advanced Link Creator."
                  examples={[
                    "Perfect for social media sharing",
                    "Quick campaign links",
                    "Simple URL shortening"
                  ]}
                />
              </div>
            </h2>
            <button
              onClick={handleClose}
              className="p-2 sm:p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Content - SCROLLABLE WITH CUSTOM SCROLLBAR */}
          <div className="flex-1 overflow-y-auto max-h-[calc(98vh-80px)] sm:max-h-[calc(95vh-140px)] premium-scrollbar">
            <div className="p-4 sm:p-6 lg:p-8">
              {!generatedLink ? (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Info Card */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1 text-sm sm:text-base">Quick Link Creation</h4>
                        <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                          Create a simple short link with basic tracking. For advanced features like A/B testing, geo-targeting, and cloaking, use the "Create Links" page.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Basic Fields */}
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center space-x-2">
                        <span>Link Title *</span>
                        <div className="hidden sm:block">
                          <InfoTooltip
                            title="Link Title"
                            description="A descriptive name for your link to help you identify it later in your dashboard."
                            examples={[
                              "Summer Sale Campaign",
                              "Product Launch Link",
                              "Social Media Post"
                            ]}
                          />
                        </div>
                      </label>
                      <input
                        ref={firstInputRef}
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                        placeholder="My Campaign Link"
                        required
                        aria-describedby="title-help"
                      />
                      <p id="title-help" className="sr-only">Enter a descriptive name for your link</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center space-x-2">
                        <span>Destination URL *</span>
                        <div className="hidden sm:block">
                          <InfoTooltip
                            title="Destination URL"
                            description="The full URL where visitors will be redirected when they click your short link."
                            examples={[
                              "https://example.com/product",
                              "https://shop.example.com/sale",
                              "https://blog.example.com/post"
                            ]}
                          />
                        </div>
                      </label>
                      <input
                        type="url"
                        value={formData.destination_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, destination_url: e.target.value }))}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base break-all"
                        placeholder="https://example.com"
                        required
                        aria-describedby="url-help"
                      />
                      <p id="url-help" className="sr-only">Enter the full URL where visitors will be redirected</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center space-x-2">
                        <span>Custom Short Code (Optional)</span>
                        <div className="hidden sm:block">
                          <InfoTooltip
                            title="Custom Short Code"
                            description="Create a memorable alias for your short link. If left empty, a random code will be generated."
                            examples={[
                              "summer-sale",
                              "new-product",
                              "special-offer"
                            ]}
                          />
                        </div>
                      </label>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <div className="flex-1 relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs sm:text-sm font-mono truncate max-w-[60px] sm:max-w-none">
                            {getShortDomain()}/
                          </span>
                          <input
                            type="text"
                            value={formData.short_code}
                            onChange={(e) => setFormData(prev => ({ ...prev, short_code: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                            className="w-full pl-16 sm:pl-24 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm sm:text-base"
                            placeholder="my-link"
                            aria-describedby="shortcode-help"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={generateShortCode}
                          className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                          aria-label="Generate random short code"
                        >
                          <Wand2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Generate</span>
                        </button>
                      </div>
                      <p id="shortcode-help" className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Leave empty to auto-generate a random code
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                        Description (Optional)
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm sm:text-base"
                        placeholder="Optional description for your link"
                        aria-describedby="description-help"
                      />
                      <p id="description-help" className="sr-only">Optional description for your link</p>
                    </div>
                  </div>

                  {/* Advanced Options Toggle */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-1"
                      aria-expanded={showAdvanced}
                      aria-controls="advanced-options"
                    >
                      <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
                      <div className="hidden sm:block">
                        <InfoTooltip
                          title="Advanced Options"
                          description="Additional settings for password protection, expiration, click limits, and basic cloaking."
                          examples={[
                            "Password protect your links",
                            "Set expiration dates",
                            "Limit number of clicks"
                          ]}
                        />
                      </div>
                    </button>
                  </div>

                  {/* Advanced Options */}
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        id="advanced-options"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 sm:space-y-6 overflow-hidden"
                      >
                        {/* Security & Limits */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Password Protection</span>
                              <div className="hidden sm:block">
                                <InfoTooltip
                                  title="Password Protection"
                                  description="Require visitors to enter a password before accessing the destination URL."
                                  examples={[
                                    "Protect sensitive content",
                                    "Limit access to team members",
                                    "Create exclusive access"
                                  ]}
                                />
                              </div>
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                                placeholder="Optional password"
                                aria-describedby="password-help"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <p id="password-help" className="sr-only">Optional password to protect your link</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Expiration Date</span>
                              <div className="hidden sm:block">
                                <InfoTooltip
                                  title="Expiration Date"
                                  description="Automatically disable the link after a specific date and time."
                                  examples={[
                                    "Limited-time offers",
                                    "Event registration deadlines",
                                    "Temporary access links"
                                  ]}
                                />
                              </div>
                            </label>
                            <input
                              type="datetime-local"
                              value={formData.expires_at}
                              onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                              aria-describedby="expiration-help"
                            />
                            <p id="expiration-help" className="sr-only">Set when this link should expire</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                              <span>Click Limit</span>
                              <div className="hidden sm:block">
                                <InfoTooltip
                                  title="Click Limit"
                                  description="Limit the total number of clicks this link can receive before becoming inactive."
                                  examples={[
                                    "First 100 customers only",
                                    "Limited beta access",
                                    "Exclusive early bird offers"
                                  ]}
                                />
                              </div>
                            </label>
                            <input
                              type="number"
                              value={formData.click_limit}
                              onChange={(e) => setFormData(prev => ({ ...prev, click_limit: e.target.value }))}
                              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                              placeholder="Unlimited"
                              min="1"
                              aria-describedby="clicklimit-help"
                            />
                            <p id="clicklimit-help" className="sr-only">Maximum number of clicks allowed</p>
                          </div>
                        </div>

                        {/* Cloaking Options */}
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
                          <div className="flex items-center space-x-3 mb-4">
                            <input
                              type="checkbox"
                              checked={formData.cloaking_enabled}
                              onChange={(e) => setFormData(prev => ({ ...prev, cloaking_enabled: e.target.checked }))}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              id="cloaking-checkbox"
                            />
                            <label htmlFor="cloaking-checkbox" className="text-sm font-semibold text-purple-800 dark:text-purple-200 flex items-center space-x-2">
                              <span>Enable Link Cloaking</span>
                              <div className="hidden sm:block">
                                <InfoTooltip
                                  title="Link Cloaking"
                                  description="Show a custom loading page before redirecting to hide the destination URL and add branding."
                                  examples={[
                                    "Hide affiliate links",
                                    "Add brand consistency",
                                    "Professional appearance"
                                  ]}
                                />
                              </div>
                            </label>
                          </div>

                          {formData.cloaking_enabled && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="space-y-4"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                                    Page Title
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.cloaking_page_title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cloaking_page_title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                    placeholder="Loading..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                                    Page Description
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.cloaking_page_description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cloaking_page_description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                    placeholder="Please wait while we redirect you..."
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Status */}
                        <div>
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.is_active}
                              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              id="active-checkbox"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Link is active (can be accessed)
                            </span>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 sm:px-6 py-2 sm:py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all duration-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating...</span>
                        </div>
                      ) : (
                        'Create Link'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center space-y-4 sm:space-y-6">
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl sm:rounded-2xl border border-green-200 dark:border-green-800">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Check className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Link Created Successfully!
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                      Your short link is ready to use
                    </p>
                    
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Short Link:
                      </p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <div className="flex-1 bg-white dark:bg-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600">
                          <p className="font-mono text-blue-600 dark:text-blue-400 break-all text-sm sm:text-base">
                            {generatedLink.short_url}
                          </p>
                        </div>
                        <button
                          onClick={copyToClipboard}
                          className={`p-2 sm:p-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            copied 
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40'
                          }`}
                          aria-label={copied ? 'Link copied' : 'Copy link'}
                        >
                          {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-left space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Title:</span>
                        <span className="font-medium text-gray-900 dark:text-white truncate ml-2 max-w-[60%]" title={generatedLink.title}>
                          {generatedLink.title}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Destination:</span>
                        <span className="font-medium text-gray-900 dark:text-white truncate ml-2 max-w-[60%]" title={generatedLink.destination_url}>
                          {generatedLink.destination_url}
                        </span>
                      </div>
                      {generatedLink.expires_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(generatedLink.expires_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleClose}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      Create Another Link
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CreateLinkModal
