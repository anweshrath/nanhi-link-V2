import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  Copy, 
  Edit, 
  Trash2, 
  Eye, 
  BarChart3,
  Calendar,
  Globe,
  Users,
  TrendingUp,
  Zap,
  Target,
  Settings,
  FolderPlus,
  Link as LinkIcon,
  ArrowUpRight,
  Clock,
  Shield
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import AdvancedLinkCreator from '../components/AdvancedLinkCreator'
import ProjectModal from '../components/ProjectModal'
import toast from 'react-hot-toast'

const Links = () => {
  const { user } = useAuth()
  const [links, setLinks] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAdvancedModal, setShowAdvancedModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [selectedLinkType, setSelectedLinkType] = useState({ id: 'short', title: 'Short Link' })

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        // Load projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (projectsError) throw projectsError
        setProjects(projectsData || [])

        // Load links
        const { data: linksData, error: linksError } = await supabase
          .from('links')
          .select(`
            *,
            projects (
              id,
              name,
              color
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (linksError) throw linksError
        setLinks(linksData || [])
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const handleAdvancedLinkSubmit = async (formData) => {
    try {
      // Get the first project if none selected
      const projectId = selectedProject === 'all' ? projects[0]?.id : selectedProject

      if (!projectId) {
        toast.error('Please create a project first')
        return
      }

      // Create advanced link with all features
      const linkData = {
        title: formData.title,
        destination_url: formData.rotationUrls?.[0]?.url || '',
        short_code: formData.customAlias || Math.random().toString(36).substring(2, 8),
        project_id: projectId,
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
        .select(`
          *,
          projects (
            id,
            name,
            color
          )
        `)
        .single()

      if (error) throw error

      // Add to links list
      setLinks(prev => [newLink, ...prev])
      
      toast.success(`${selectedLinkType.title} created successfully!`)
      setShowAdvancedModal(false)
      
    } catch (error) {
      console.error('Error creating advanced link:', error)
      toast.error('Failed to create link')
      throw error
    }
  }

  const handleProjectSubmit = async (projectData) => {
    try {
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      setProjects(prev => [newProject, ...prev])
      toast.success('Project created successfully!')
      setShowProjectModal(false)
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    }
  }

  const copyToClipboard = async (shortUrl) => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const filteredLinks = links.filter(link => {
    const matchesProject = selectedProject === 'all' || link.project_id === selectedProject
    const matchesSearch = link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.destination_url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.short_code?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesProject && matchesSearch
  })

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
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Links & Projects
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your shortened links and organize them into projects
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <motion.button
              onClick={() => setShowProjectModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Project</span>
            </motion.button>
            
            <motion.button
              onClick={() => {
                setSelectedLinkType({ id: 'short', title: 'Short Link' })
                setShowAdvancedModal(true)
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span>Create Link</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/30 p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { title: 'Total Links', value: links.length, icon: LinkIcon, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { title: 'Total Clicks', value: links.reduce((sum, link) => sum + (link.total_clicks || 0), 0), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
            { title: 'Active Links', value: links.filter(link => link.is_active).length, icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
            { title: 'Projects', value: projects.length, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/30 p-6"
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Links List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/30 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Links ({filteredLinks.length})
            </h3>
          </div>
          
          {filteredLinks.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLinks.map((link, index) => (
                <motion.div
                  key={link.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {link.title || 'Untitled Link'}
                        </h4>
                        {link.projects && (
                          <span 
                            className="px-2 py-1 text-xs font-medium rounded-full"
                            style={{ 
                              backgroundColor: `${link.projects.color}20`,
                              color: link.projects.color 
                            }}
                          >
                            {link.projects.name}
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          link.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {link.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          <span className="font-medium">Short:</span> nanhi.link/{link.short_code}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          <span className="font-medium">Destination:</span> {link.destination_url}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{link.total_clicks || 0} clicks</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(link.created_at).toLocaleDateString()}</span>
                        </div>
                        {link.link_type && link.link_type !== 'short' && (
                          <div className="flex items-center space-x-1">
                            {link.link_type === 'cloaked' && <Shield className="w-4 h-4" />}
                            {link.link_type === 'time' && <Clock className="w-4 h-4" />}
                            {link.link_type === 'geo' && <Globe className="w-4 h-4" />}
                            <span className="capitalize">{link.link_type}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <motion.button
                        onClick={() => copyToClipboard(`https://nanhi.link/${link.short_code}`)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Copy className="w-4 h-4" />
                      </motion.button>
                      
                      <motion.button
                        onClick={() => window.open(`https://nanhi.link/${link.short_code}`, '_blank')}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </motion.button>
                      
                      <motion.button
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No links found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first link to get started'}
              </p>
              <motion.button
                onClick={() => {
                  setSelectedLinkType({ id: 'short', title: 'Short Link' })
                  setShowAdvancedModal(true)
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Create Your First Link
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Advanced Link Modal - WITH LEFT SIDEBAR */}
      <AdvancedLinkCreator
        isOpen={showAdvancedModal}
        onClose={() => {
          setShowAdvancedModal(false)
          setSelectedLinkType(null)
        }}
        onSubmit={handleAdvancedLinkSubmit}
        linkType={selectedLinkType?.id}
        projectData={projects.find(p => p.id === selectedProject) || projects[0]}
      />

      {/* Project Modal */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSubmit={handleProjectSubmit}
      />
    </div>
  )
}

export default Links
