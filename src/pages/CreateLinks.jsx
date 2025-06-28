import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Link, 
  Globe, 
  Shield, 
  Clock, 
  Target, 
  Zap, 
  Code,
  BarChart3,
  Settings,
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import AdvancedLinkCreator from '../components/AdvancedLinkCreator'
import toast from 'react-hot-toast'

const CreateLinks = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [showAdvancedModal, setShowAdvancedModal] = useState(false)
  const [selectedLinkType, setSelectedLinkType] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        const { data: projectsData, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setProjects(projectsData || [])
      } catch (error) {
        console.error('Error loading projects:', error)
        toast.error('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [user])

  const linkTypes = [
    {
      id: 'short',
      title: 'Short Link',
      description: 'Simple URL shortening with basic analytics',
      icon: Globe,
      color: 'from-blue-500 to-cyan-500',
      features: ['Custom alias', 'Click tracking', 'Basic analytics', 'QR codes']
    },
    {
      id: 'cloaked',
      title: 'Cloaked Link',
      description: 'Hide destination with custom landing page',
      icon: Shield,
      color: 'from-purple-500 to-indigo-500',
      features: ['Custom landing page', 'Script injection', 'Pixel tracking', 'Brand protection'],
      premium: true
    },
    {
      id: 'geo',
      title: 'Geo-Targeted',
      description: 'Redirect based on visitor location',
      icon: Globe,
      color: 'from-green-500 to-emerald-500',
      features: ['Country targeting', 'City targeting', 'Fallback URLs', 'Location analytics'],
      premium: true
    },
    {
      id: 'time',
      title: 'Time-Based',
      description: 'Schedule redirects and expiration',
      icon: Clock,
      color: 'from-orange-500 to-red-500',
      features: ['Scheduled activation', 'Auto expiration', 'Time zones', 'Date ranges'],
      premium: true
    },
    {
      id: 'utm',
      title: 'UTM Tracking',
      description: 'Advanced campaign tracking parameters',
      icon: Target,
      color: 'from-red-500 to-pink-500',
      features: ['UTM parameters', 'Campaign tracking', 'Source attribution', 'Conversion tracking']
    },
    {
      id: 'rotator',
      title: 'A/B Testing',
      description: 'Split traffic between multiple URLs',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      features: ['Traffic splitting', 'Weight distribution', 'Performance comparison', 'Auto optimization'],
      premium: true
    }
  ]

  const handleLinkTypeSelect = (linkType) => {
    if (!selectedProject) {
      toast.error('Please select a project first')
      return
    }
    
    setSelectedLinkType(linkType)
    setShowAdvancedModal(true)
  }

  const handleAdvancedLinkSubmit = async (formData) => {
    try {
      // Create advanced link with all features
      const linkData = {
        title: formData.title,
        destination_url: formData.rotationUrls?.[0]?.url || '',
        short_code: formData.customAlias || Math.random().toString(36).substring(2, 8),
        project_id: selectedProject.id,
        user_id: user.id,
        link_type: selectedLinkType.id,
        is_active: true,
        total_clicks: 0,
        
        // Advanced features
        rotation_urls: formData.rotationUrls || [],
        geo_targeting: formData.geoTargeting || {},
        time_targeting: formData.timeTargeting || {},
        utm_source: formData.utmSource || null,
        utm_medium: formData.utmMedium || null,
        utm_campaign: formData.utmCampaign || null,
        utm_term: formData.utmTerm || null,
        utm_content: formData.utmContent || null,
        cloaking_enabled: formData.cloakingEnabled || false,
        cloaking_page: formData.cloakPage || null,
        script_injection_enabled: formData.script_injection_enabled || false,
        tracking_scripts: formData.tracking_scripts || [],
        script_delay: formData.script_delay || 2,
        script_position: formData.script_position || 'head',
        password: formData.password || null,
        click_limit: formData.clickLimit ? parseInt(formData.clickLimit) : null,
        expires_at: formData.expiresAt || null
      }

      const { data: newLink, error } = await supabase
        .from('links')
        .insert(linkData)
        .select()
        .single()

      if (error) throw error

      toast.success(`${selectedLinkType.title} created successfully!`)
      setShowAdvancedModal(false)
      setSelectedLinkType(null)
      
      // Redirect to links page to see the new link
      window.location.href = '/links'
      
    } catch (error) {
      console.error('Error creating advanced link:', error)
      toast.error('Failed to create link')
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <motion.div
              className="p-3 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-violet-900 to-slate-900 dark:from-white dark:via-violet-200 dark:to-white bg-clip-text text-transparent">
              Create Smart Links
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Choose from our powerful link types to create the perfect solution for your campaign needs
          </p>
        </motion.div>

        {/* Project Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/30 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Project
            </h3>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <motion.button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedProject?.id === project.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {project.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {project.description || 'No description'}
                    </p>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No projects found. Create a project first to organize your links.
                </p>
                <button
                  onClick={() => window.location.href = '/links'}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Go to Projects
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Link Types Grid */}
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {linkTypes.map((linkType, index) => (
              <motion.div
                key={linkType.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="group relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/30 hover:shadow-2xl transition-all duration-500"
                whileHover={{ y: -5 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${linkType.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${linkType.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <linkType.icon className="w-6 h-6 text-white" />
                    </div>
                    {linkType.premium && (
                      <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
                        PRO
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {linkType.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                    {linkType.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {linkType.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${linkType.color}`} />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <motion.button
                    onClick={() => handleLinkTypeSelect(linkType)}
                    className={`w-full py-3 px-4 bg-gradient-to-r ${linkType.color} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 group-hover:scale-105`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Create {linkType.title}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Quick Stats */}
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/30 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Project: {selectedProject.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Links</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">0%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Click Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Links</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Advanced Link Modal - THIS IS THE ONE WITH LEFT SIDEBAR */}
      <AdvancedLinkCreator
        isOpen={showAdvancedModal}
        onClose={() => {
          setShowAdvancedModal(false)
          setSelectedLinkType(null)
        }}
        onSubmit={handleAdvancedLinkSubmit}
        linkType={selectedLinkType?.id}
        projectData={selectedProject}
      />
    </div>
  )
}

export default CreateLinks
