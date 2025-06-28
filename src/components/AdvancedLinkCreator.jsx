import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Plus, Trash2, Globe, Clock, Target, Code, Shield, Zap, Percent, 
  Calendar, MapPin, Users, Settings, Eye, EyeOff, Link2, Smartphone,
  Monitor, Tablet, Ban, CheckCircle, AlertCircle, Info, HelpCircle
} from 'lucide-react'
import TrackingSnippetModal from './TrackingSnippetModal'
import InfoTooltip from './InfoTooltip'
import toast from 'react-hot-toast'

const AdvancedLinkCreator = ({ isOpen, onClose, onSubmit, linkType, projectData, initialData = null }) => {
  const modalRef = useRef(null)
  const [formData, setFormData] = useState({
    // Basic fields
    title: initialData?.title || '',
    customAlias: initialData?.short_code || '',
    
    // A/B Testing & Rotation
    rotationUrls: initialData?.rotation_urls || [
      { url: '', weight: 100, name: 'Original' }
    ],
    
    // Geo Targeting
    geoTargeting: {
      enabled: false,
      allowedCountries: [],
      blockedCountries: [],
      redirectRules: {},
      fallbackUrl: ''
    },
    
    // Time Targeting
    timeTargeting: {
      enabled: false,
      startsAt: '',
      expiresAt: '',
      allowedDays: [],
      allowedHours: { start: '09:00', end: '17:00' },
      timezone: 'America/New_York'
    },
    
    // UTM Parameters
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmTerm: '',
    utmContent: '',
    
    // Cloaking
    cloakingEnabled: linkType === 'cloaked',
    cloakPage: {
      title: 'Loading...',
      description: 'Please wait while we redirect you...',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      showLoader: true,
      customHtml: ''
    },
    
    // Script Injection
    script_injection_enabled: false,
    tracking_scripts: [],
    script_delay: 2,
    script_position: 'head',
    
    // Advanced Options
    password: '',
    clickLimit: '',
    expiresAt: '',
    deviceTargeting: {
      enabled: false,
      allowedDevices: ['desktop', 'mobile', 'tablet']
    },
    ipBlocking: {
      enabled: false,
      blockedIps: [],
      allowedIps: []
    }
  })

  const [activeTab, setActiveTab] = useState('basic')
  const [loading, setLoading] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(null)

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
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
  }, [isOpen, onClose])

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Australia', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'Russia', 'South Korea'
  ]

  const timezones = [
    'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome',
    'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Mumbai', 'Asia/Seoul',
    'Australia/Sydney', 'Australia/Melbourne'
  ]

  const weekDays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ]

  // Info modal content for non-technical users
  const infoContent = {
    basic: {
      title: "Basic Link Settings",
      description: "Set up the fundamental properties of your link including the title, destination URL, and custom alias.",
      tips: [
        "Choose a descriptive title to easily identify your link later",
        "Custom alias creates a memorable short URL (e.g., yoursite.com/my-campaign)",
        "Leave alias empty to auto-generate a random code"
      ]
    },
    rotation: {
      title: "A/B Testing & Traffic Splitting",
      description: "Split your traffic between multiple destination URLs to test which performs better.",
      tips: [
        "Add multiple URLs to test different landing pages",
        "Set weight percentages to control traffic distribution",
        "Total weight must equal 100% for proper splitting",
        "Great for testing different offers or page designs"
      ]
    },
    geo: {
      title: "Geographic Targeting",
      description: "Redirect visitors to different URLs based on their country or location.",
      tips: [
        "Show different content to visitors from different countries",
        "Useful for compliance with local laws and regulations",
        "Set a fallback URL for blocked or unspecified countries",
        "Perfect for international campaigns"
      ]
    },
    time: {
      title: "Time-Based Targeting",
      description: "Control when your link is active and redirect users based on time and date.",
      tips: [
        "Schedule campaigns to start and end automatically",
        "Restrict access to specific days of the week",
        "Set business hours for your links",
        "Perfect for limited-time offers and events"
      ]
    },
    utm: {
      title: "UTM Campaign Tracking",
      description: "Add tracking parameters to measure campaign performance in Google Analytics.",
      tips: [
        "UTM Source: Where traffic comes from (google, facebook, email)",
        "UTM Medium: How traffic arrives (cpc, social, email)",
        "UTM Campaign: Your campaign name (spring_sale, product_launch)",
        "Essential for measuring marketing ROI"
      ]
    },
    cloaking: {
      title: "Link Cloaking & Landing Pages",
      description: "Hide your destination URL and show a custom landing page before redirecting.",
      tips: [
        "Protects your destination URL from being seen",
        "Creates a branded experience before redirect",
        "Useful for affiliate marketing and brand protection",
        "Can include custom HTML and styling"
      ]
    },
    tracking: {
      title: "Tracking Scripts & Pixels",
      description: "Add analytics codes, Facebook pixels, and other tracking scripts to your links.",
      tips: [
        "Track conversions with Facebook Pixel, Google Analytics",
        "Add retargeting pixels for remarketing campaigns",
        "Include custom JavaScript for advanced tracking",
        "Scripts can be placed in head or body of the page"
      ]
    },
    advanced: {
      title: "Advanced Security & Limits",
      description: "Set password protection, click limits, expiration dates, and device targeting.",
      tips: [
        "Password protection restricts access to authorized users",
        "Click limits prevent overuse of your links",
        "Expiration dates automatically disable links",
        "Device targeting shows different content on mobile vs desktop"
      ]
    }
  }

  // Left sidebar navigation options
  const sidebarOptions = [
    { 
      id: 'basic', 
      label: 'Basic Settings', 
      icon: Settings, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'Link title, URL, and alias'
    },
    { 
      id: 'rotation', 
      label: 'A/B Testing', 
      icon: Zap, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      description: 'Split traffic between URLs',
      show: ['rotator', 'short'].includes(linkType)
    },
    { 
      id: 'geo', 
      label: 'Geo Targeting', 
      icon: MapPin, 
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'Location-based redirects',
      show: ['geo', 'short'].includes(linkType)
    },
    { 
      id: 'time', 
      label: 'Time Targeting', 
      icon: Clock, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      description: 'Schedule and expiration',
      show: ['time', 'short'].includes(linkType)
    },
    { 
      id: 'utm', 
      label: 'UTM Tracking', 
      icon: Target, 
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      description: 'Campaign parameters',
      show: ['utm', 'short'].includes(linkType)
    },
    { 
      id: 'cloaking', 
      label: 'Page Cloaking', 
      icon: Shield, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'Custom landing page',
      show: ['cloaked', 'short'].includes(linkType)
    },
    { 
      id: 'tracking', 
      label: 'Tracking Scripts', 
      icon: Code, 
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      description: 'Analytics and pixels'
    },
    { 
      id: 'advanced', 
      label: 'Advanced Options', 
      icon: Settings, 
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      description: 'Security and limits'
    }
  ].filter(option => option.show !== false)

  useEffect(() => {
    if (linkType && formData.rotationUrls.length === 1 && !formData.rotationUrls[0].url) {
      setFormData(prev => ({
        ...prev,
        rotationUrls: [{ url: '', weight: 100, name: 'Primary URL' }]
      }))
    }
  }, [linkType])

  const addRotationUrl = () => {
    setFormData(prev => ({
      ...prev,
      rotationUrls: [...prev.rotationUrls, { url: '', weight: 0, name: `Variant ${prev.rotationUrls.length + 1}` }]
    }))
  }

  const removeRotationUrl = (index) => {
    if (formData.rotationUrls.length > 1) {
      setFormData(prev => ({
        ...prev,
        rotationUrls: prev.rotationUrls.filter((_, i) => i !== index)
      }))
    }
  }

  const updateRotationUrl = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      rotationUrls: prev.rotationUrls.map((url, i) => 
        i === index ? { ...url, [field]: value } : url
      )
    }))
  }

  const normalizeWeights = () => {
    const totalWeight = formData.rotationUrls.reduce((sum, url) => sum + (parseFloat(url.weight) || 0), 0)
    if (totalWeight !== 100 && totalWeight > 0) {
      const factor = 100 / totalWeight
      setFormData(prev => ({
        ...prev,
        rotationUrls: prev.rotationUrls.map(url => ({
          ...url,
          weight: Math.round((parseFloat(url.weight) || 0) * factor)
        }))
      }))
    }
  }

  const handleTrackingSave = (trackingData) => {
    setFormData(prev => ({
      ...prev,
      ...trackingData
    }))
    setShowTrackingModal(false)
  }

  const toggleCountry = (country, type) => {
    setFormData(prev => ({
      ...prev,
      geoTargeting: {
        ...prev.geoTargeting,
        [type]: prev.geoTargeting[type].includes(country)
          ? prev.geoTargeting[type].filter(c => c !== country)
          : [...prev.geoTargeting[type], country]
      }
    }))
  }

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      timeTargeting: {
        ...prev.timeTargeting,
        allowedDays: prev.timeTargeting.allowedDays.includes(day)
          ? prev.timeTargeting.allowedDays.filter(d => d !== day)
          : [...prev.timeTargeting.allowedDays, day]
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate rotation URLs and weights for A/B testing
      if (linkType === 'rotator' && formData.rotationUrls.length > 1) {
        const totalWeight = formData.rotationUrls.reduce((sum, url) => sum + (parseFloat(url.weight) || 0), 0)
        if (Math.abs(totalWeight - 100) > 1) {
          toast.error('Total weight must equal 100%')
          setLoading(false)
          return
        }
      }

      // Validate at least one URL is provided
      const validUrls = formData.rotationUrls.filter(url => url.url.trim())
      if (validUrls.length === 0) {
        toast.error('Please provide at least one destination URL')
        setLoading(false)
        return
      }

      const linkData = {
        ...formData,
        linkType,
        projectId: projectData?.id
      }

      await onSubmit(linkData)
    } catch (error) {
      console.error('Error creating link:', error)
      toast.error('Failed to create link')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const getLinkTypeConfig = () => {
    switch (linkType) {
      case 'short':
        return { title: 'Short Link', icon: Globe, color: 'bg-blue-500' }
      case 'cloaked':
        return { title: 'Cloaked Link', icon: Shield, color: 'bg-purple-500' }
      case 'geo':
        return { title: 'Geo-Targeted Link', icon: MapPin, color: 'bg-green-500' }
      case 'time':
        return { title: 'Time-Based Link', icon: Clock, color: 'bg-orange-500' }
      case 'utm':
        return { title: 'UTM Tracking Link', icon: Target, color: 'bg-red-500' }
      case 'rotator':
        return { title: 'A/B Testing Rotator', icon: Zap, color: 'bg-yellow-500' }
      default:
        return { title: 'Advanced Link', icon: Globe, color: 'bg-gray-500' }
    }
  }

  const config = getLinkTypeConfig()

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-7xl h-[95vh] overflow-hidden shadow-2xl flex"
          >
            {/* LEFT SIDEBAR */}
            <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center text-white shadow-lg`}>
                    <config.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{config.title}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {projectData?.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Options - SCROLLABLE */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {sidebarOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={() => setActiveTab(option.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                      activeTab === option.id
                        ? `${option.bgColor} border-2 border-current ${option.color}`
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start space-x-3">
                      <option.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        activeTab === option.id ? option.color : 'text-gray-500 dark:text-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm truncate ${
                          activeTab === option.id 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {option.label}
                        </h3>
                        <p className={`text-xs mt-1 break-words ${
                          activeTab === option.id 
                            ? 'text-gray-600 dark:text-gray-400' 
                            : 'text-gray-500 dark:text-gray-500'
                        }`}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* RIGHT CONTENT AREA */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {sidebarOptions.find(opt => opt.id === activeTab)?.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {sidebarOptions.find(opt => opt.id === activeTab)?.description}
                    </p>
                  </div>
                  <InfoTooltip
                    title={infoContent[activeTab]?.title}
                    description={infoContent[activeTab]?.description}
                    examples={infoContent[activeTab]?.tips}
                  />
                </div>
                <button
                  onClick={onClose}
                  className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors flex-shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content - SCROLLABLE */}
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Basic Tab */}
                  {activeTab === 'basic' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Getting Started</h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              Fill in the basic information for your link. The title helps you identify it later, and the custom alias creates a memorable short URL.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Link Title *
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="My Campaign Link"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Custom Alias
                          </label>
                          <input
                            type="text"
                            value={formData.customAlias}
                            onChange={(e) => setFormData(prev => ({ ...prev, customAlias: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="my-custom-link"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Leave empty to auto-generate
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Primary Destination URL *
                        </label>
                        <input
                          type="url"
                          value={formData.rotationUrls[0]?.url || ''}
                          onChange={(e) => updateRotationUrl(0, 'url', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com"
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* A/B Testing Tab */}
                  {activeTab === 'rotation' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                          <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">A/B Testing Made Easy</h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                              Split your traffic between multiple URLs to test which performs better. Set weight percentages to control how traffic is distributed.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Traffic Distribution</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Split traffic between multiple URLs for A/B testing</p>
                        </div>
                        <button
                          type="button"
                          onClick={addRotationUrl}
                          className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add URL</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {formData.rotationUrls.map((rotation, index) => (
                          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                              <div className="md:col-span-3">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                  Variant Name
                                </label>
                                <input
                                  type="text"
                                  value={rotation.name}
                                  onChange={(e) => updateRotationUrl(index, 'name', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                  placeholder={`Variant ${index + 1}`}
                                />
                              </div>
                              <div className="md:col-span-6">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                  Destination URL
                                </label>
                                <input
                                  type="url"
                                  value={rotation.url}
                                  onChange={(e) => updateRotationUrl(index, 'url', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                  placeholder="https://example.com"
                                  required
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                  Weight %
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={rotation.weight}
                                    onChange={(e) => updateRotationUrl(index, 'weight', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                  />
                                  <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                                </div>
                              </div>
                              <div className="md:col-span-1">
                                {formData.rotationUrls.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeRotationUrl(index)}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Total Weight: {formData.rotationUrls.reduce((sum, url) => sum + (parseFloat(url.weight) || 0), 0).toFixed(1)}%
                        </span>
                        <button
                          type="button"
                          onClick={normalizeWeights}
                          className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          Auto-balance to 100%
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Geo Targeting Tab */}
                  {activeTab === 'geo' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">Geographic Targeting</h4>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Show different content to visitors from different countries. Perfect for compliance and localization.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 mb-6">
                        <input
                          type="checkbox"
                          checked={formData.geoTargeting.enabled}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            geoTargeting: { ...prev.geoTargeting, enabled: e.target.checked }
                          }))}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label className="text-lg font-semibold text-gray-900 dark:text-white">
                          Enable Geographic Targeting
                        </label>
                      </div>

                      {formData.geoTargeting.enabled && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              Fallback URL (for blocked countries)
                            </label>
                            <input
                              type="url"
                              value={formData.geoTargeting.fallbackUrl}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                geoTargeting: { ...prev.geoTargeting, fallbackUrl: e.target.value }
                              }))}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="https://fallback-page.com"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-md font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>Allowed Countries</span>
                              </h4>
                              <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
                                {countries.map((country) => (
                                  <label key={country} className="flex items-center space-x-2 py-1">
                                    <input
                                      type="checkbox"
                                      checked={formData.geoTargeting.allowedCountries.includes(country)}
                                      onChange={() => toggleCountry(country, 'allowedCountries')}
                                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{country}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-md font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center space-x-2">
                                <Ban className="w-4 h-4" />
                                <span>Blocked Countries</span>
                              </h4>
                              <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
                                {countries.map((country) => (
                                  <label key={country} className="flex items-center space-x-2 py-1">
                                    <input
                                      type="checkbox"
                                      checked={formData.geoTargeting.blockedCountries.includes(country)}
                                      onChange={() => toggleCountry(country, 'blockedCountries')}
                                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{country}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Time Targeting Tab */}
                  {activeTab === 'time' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                          <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">Time-Based Control</h4>
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                              Schedule when your links are active and automatically expire them. Perfect for limited-time offers.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 mb-6">
                        <input
                          type="checkbox"
                          checked={formData.timeTargeting.enabled}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            timeTargeting: { ...prev.timeTargeting, enabled: e.target.checked }
                          }))}
                          className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <label className="text-lg font-semibold text-gray-900 dark:text-white">
                          Enable Time-Based Targeting
                        </label>
                      </div>

                      {formData.timeTargeting.enabled && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Start Date & Time
                              </label>
                              <input
                                type="datetime-local"
                                value={formData.timeTargeting.startsAt}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  timeTargeting: { ...prev.timeTargeting, startsAt: e.target.value }
                                }))}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                End Date & Time
                              </label>
                              <input
                                type="datetime-local"
                                value={formData.timeTargeting.expiresAt}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  timeTargeting: { ...prev.timeTargeting, expiresAt: e.target.value }
                                }))}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Timezone
                              </label>
                              <select
                                value={formData.timeTargeting.timezone}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  timeTargeting: { ...prev.timeTargeting, timezone: e.target.value }
                                }))}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              >
                                {timezones.map((tz) => (
                                  <option key={tz} value={tz}>{tz}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              Allowed Days of Week
                            </label>
                            <div className="grid grid-cols-7 gap-2">
                              {weekDays.map((day) => (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => toggleDay(day)}
                                  className={`p-3 text-sm font-medium rounded-lg transition-colors ${
                                    formData.timeTargeting.allowedDays.includes(day)
                                      ? 'bg-orange-600 text-white'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                  }`}
                                >
                                  {day.slice(0, 3)}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Start Time (24h format)
                              </label>
                              <input
                                type="time"
                                value={formData.timeTargeting.allowedHours.start}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  timeTargeting: {
                                    ...prev.timeTargeting,
                                    allowedHours: { ...prev.timeTargeting.allowedHours, start: e.target.value }
                                  }
                                }))}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                End Time (24h format)
                              </label>
                              <input
                                type="time"
                                value={formData.timeTargeting.allowedHours.end}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  timeTargeting: {
                                    ...prev.timeTargeting,
                                    allowedHours: { ...prev.timeTargeting.allowedHours, end: e.target.value }
                                  }
                                }))}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* UTM Tracking Tab */}
                  {activeTab === 'utm' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                          <Target className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">Campaign Tracking</h4>
                            <p className="text-sm text-red-700 dark:text-red-300">
                              Add UTM parameters to track your campaigns in Google Analytics and measure marketing ROI.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">UTM Campaign Parameters</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                          Add UTM parameters to track campaign performance in Google Analytics
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            UTM Source *
                          </label>
                          <input
                            type="text"
                            value={formData.utmSource}
                            onChange={(e) => setFormData(prev => ({ ...prev, utmSource: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="google, facebook, newsletter"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Identify the advertiser, site, publication, etc.
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            UTM Medium *
                          </label>
                          <input
                            type="text"
                            value={formData.utmMedium}
                            onChange={(e) => setFormData(prev => ({ ...prev, utmMedium: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="cpc, email, social"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Advertising or marketing medium
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            UTM Campaign *
                          </label>
                          <input
                            type="text"
                            value={formData.utmCampaign}
                            onChange={(e) => setFormData(prev => ({ ...prev, utmCampaign: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="spring_sale, product_launch"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Product, promo code, or slogan
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            UTM Term
                          </label>
                          <input
                            type="text"
                            value={formData.utmTerm}
                            onChange={(e) => setFormData(prev => ({ ...prev, utmTerm: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="keyword terms"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Identify paid search keywords
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            UTM Content
                          </label>
                          <input
                            type="text"
                            value={formData.utmContent}
                            onChange={(e) => setFormData(prev => ({ ...prev, utmContent: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="logolink, textlink, banner"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Differentiate ads or links that point to the same URL
                          </p>
                        </div>
                      </div>

                      {/* UTM Preview */}
                      {(formData.utmSource || formData.utmMedium || formData.utmCampaign) && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                          <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                            UTM Preview
                          </h4>
                          <div className="text-xs font-mono text-red-700 dark:text-red-300 break-all">
                            {formData.rotationUrls[0]?.url || 'https://example.com'}
                            {formData.utmSource && `?utm_source=${encodeURIComponent(formData.utmSource)}`}
                            {formData.utmMedium && `&utm_medium=${encodeURIComponent(formData.utmMedium)}`}
                            {formData.utmCampaign && `&utm_campaign=${encodeURIComponent(formData.utmCampaign)}`}
                            {formData.utmTerm && `&utm_term=${encodeURIComponent(formData.utmTerm)}`}
                            {formData.utmContent && `&utm_content=${encodeURIComponent(formData.utmContent)}`}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Cloaking Tab */}
                  {activeTab === 'cloaking' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">Link Cloaking</h4>
                            <p className="text-sm text-purple-700 dark:text-purple-300">
                              Hide your destination URL and show a custom landing page. Perfect for affiliate marketing and brand protection.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 mb-6">
                        <input
                          type="checkbox"
                          checked={formData.cloakingEnabled}
                          onChange={(e) => setFormData(prev => ({ ...prev, cloakingEnabled: e.target.checked }))}
                          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label className="text-lg font-semibold text-gray-900 dark:text-white">
                          Enable Link Cloaking
                        </label>
                      </div>

                      {formData.cloakingEnabled && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Page Title
                              </label>
                              <input
                                type="text"
                                value={formData.cloakPage.title}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  cloakPage: { ...prev.cloakPage, title: e.target.value }
                                }))}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Loading..."
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Page Description
                              </label>
                              <input
                                type="text"
                                value={formData.cloakPage.description}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  cloakPage: { ...prev.cloakPage, description: e.target.value }
                                }))}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Please wait while we redirect you..."
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Background Color
                              </label>
                              <input
                                type="color"
                                value={formData.cloakPage.backgroundColor}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  cloakPage: { ...prev.cloakPage, backgroundColor: e.target.value }
                                }))}
                                className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Text Color
                              </label>
                              <input
                                type="color"
                                value={formData.cloakPage.textColor}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  cloakPage: { ...prev.cloakPage, textColor: e.target.value }
                                }))}
                                className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="flex items-center space-x-3 mb-4">
                              <input
                                type="checkbox"
                                checked={formData.cloakPage.showLoader}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  cloakPage: { ...prev.cloakPage, showLoader: e.target.checked }
                                }))}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Show loading spinner
                              </span>
                            </label>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              Custom HTML (Optional)
                            </label>
                            <textarea
                              value={formData.cloakPage.customHtml}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                cloakPage: { ...prev.cloakPage, customHtml: e.target.value }
                              }))}
                              rows={6}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                              placeholder="<div>Custom HTML content...</div>"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Add custom HTML to override the default cloaking page
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Tracking Tab */}
                  {activeTab === 'tracking' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                          <Code className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-1">Tracking & Analytics</h4>
                            <p className="text-sm text-indigo-700 dark:text-indigo-300">
                              Add tracking pixels, analytics codes, and custom scripts to monitor your link performance and conversions.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tracking & Scripts</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Add tracking pixels, analytics, and custom scripts
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowTrackingModal(true)}
                          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Code className="w-4 h-4" />
                          <span>Configure Tracking</span>
                        </button>
                      </div>

                      {formData.script_injection_enabled && formData.tracking_scripts.length > 0 ? (
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                              <Code className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-indigo-800 dark:text-indigo-200">
                                {formData.tracking_scripts.filter(s => s.enabled).length} tracking scripts configured
                              </h4>
                              <p className="text-sm text-indigo-600 dark:text-indigo-300">
                                Scripts will be injected in the {formData.script_position} with {formData.script_delay}s delay
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {formData.tracking_scripts.filter(s => s.enabled).map((script, index) => (
                              <div key={index} className="flex items-center space-x-3 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="font-medium text-indigo-800 dark:text-indigo-200">{script.name}</span>
                                <span className="text-indigo-600 dark:text-indigo-400">({script.position})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No tracking configured
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Add tracking pixels, analytics codes, and custom scripts to monitor your link performance
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowTrackingModal(true)}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Add Tracking Scripts
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Advanced Tab */}
                  {activeTab === 'advanced' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Advanced Security</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              Set password protection, click limits, expiration dates, and device targeting for enhanced control.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Advanced Options</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Password Protection
                          </label>
                          <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            placeholder="Optional password"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Require password to access link
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Click Limit
                          </label>
                          <input
                            type="number"
                            value={formData.clickLimit}
                            onChange={(e) => setFormData(prev => ({ ...prev, clickLimit: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            placeholder="Unlimited"
                            min="1"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Maximum number of clicks allowed
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Expires At
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.expiresAt}
                            onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Link will expire at this date/time
                          </p>
                        </div>
                      </div>

                      {/* Device Targeting */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <input
                            type="checkbox"
                            checked={formData.deviceTargeting.enabled}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              deviceTargeting: { ...prev.deviceTargeting, enabled: e.target.checked }
                            }))}
                            className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                          />
                          <label className="text-md font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                            <Smartphone className="w-4 h-4" />
                            <span>Device Targeting</span>
                          </label>
                        </div>

                        {formData.deviceTargeting.enabled && (
                          <div className="grid grid-cols-3 gap-4">
                            {[
                              { id: 'desktop', label: 'Desktop', icon: Monitor },
                              { id: 'mobile', label: 'Mobile', icon: Smartphone },
                              { id: 'tablet', label: 'Tablet', icon: Tablet }
                            ].map((device) => (
                              <label key={device.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={formData.deviceTargeting.allowedDevices.includes(device.id)}
                                  onChange={(e) => {
                                    const devices = e.target.checked
                                      ? [...formData.deviceTargeting.allowedDevices, device.id]
                                      : formData.deviceTargeting.allowedDevices.filter(d => d !== device.id)
                                    setFormData(prev => ({
                                      ...prev,
                                      deviceTargeting: { ...prev.deviceTargeting, allowedDevices: devices }
                                    }))
                                  }}
                                  className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                                />
                                <device.icon className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{device.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* IP Blocking */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <input
                            type="checkbox"
                            checked={formData.ipBlocking.enabled}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              ipBlocking: { ...prev.ipBlocking, enabled: e.target.checked }
                            }))}
                            className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                          />
                          <label className="text-md font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                            <Ban className="w-4 h-4" />
                            <span>IP Address Filtering</span>
                          </label>
                        </div>

                        {formData.ipBlocking.enabled && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Blocked IPs (one per line)
                              </label>
                              <textarea
                                value={formData.ipBlocking.blockedIps.join('\n')}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  ipBlocking: { ...prev.ipBlocking, blockedIps: e.target.value.split('\n').filter(ip => ip.trim()) }
                                }))}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                placeholder="192.168.1.1&#10;10.0.0.1"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Allowed IPs (one per line)
                              </label>
                              <textarea
                                value={formData.ipBlocking.allowedIps.join('\n')}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  ipBlocking: { ...prev.ipBlocking, allowedIps: e.target.value.split('\n').filter(ip => ip.trim()) }
                                }))}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                placeholder="192.168.1.100&#10;10.0.0.100"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer - FIXED AT BOTTOM */}
                <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-200"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating...</span>
                      </div>
                    ) : (
                      `Create ${config.title}`
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Tracking Snippet Modal */}
      <TrackingSnippetModal
        isOpen={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        onSave={handleTrackingSave}
      />
    </>
  )
}

export default AdvancedLinkCreator
