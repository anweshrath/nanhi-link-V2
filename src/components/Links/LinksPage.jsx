import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  ShareIcon,
  LockClosedIcon,
  CalendarIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { linkService } from '../../services/linkService'
import { projectService } from '../../services/projectService'
import toast from 'react-hot-toast'

const LinksPage = () => {
  const [links, setLinks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [linksData, projectsData] = await Promise.all([
        linkService.getUserLinks(),
        projectService.getUserProjects()
      ])
      setLinks(linksData)
      setProjects(projectsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load links')
    } finally {
      setLoading(false)
    }
  }

  const filteredLinks = links
    .filter(link => {
      const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           link.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           link.destination_url.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesProject = selectedProject === 'all' || link.project_id === selectedProject
      return matchesSearch && matchesProject
    })
    .sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      }
      return aVal < bVal ? 1 : -1
    })

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const deleteLink = async (linkId) => {
    if (!confirm('Are you sure you want to delete this link?')) return
    
    try {
      await linkService.deleteLink(linkId)
      setLinks(links.filter(link => link.id !== linkId))
      toast.success('Link deleted successfully')
    } catch (error) {
      toast.error('Failed to delete link')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'No Project'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Links</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your shortened links and track their performance
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Create Link
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Project Filter */}
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

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="total_clicks-desc">Most Clicks</option>
            <option value="total_clicks-asc">Least Clicks</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>
        </div>
      </div>

      {/* Links Grid */}
      <div className="grid gap-6">
        <AnimatePresence>
          {filteredLinks.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {link.title}
                      </h3>
                      
                      {/* Status Badges */}
                      <div className="flex items-center gap-2">
                        {link.password_protection && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            <LockClosedIcon className="w-3 h-3 mr-1" />
                            Protected
                          </span>
                        )}
                        
                        {link.expiration_enabled && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            Expires
                          </span>
                        )}
                        
                        {link.geo_targeting_enabled && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            <GlobeAltIcon className="w-3 h-3 mr-1" />
                            Geo
                          </span>
                        )}
                        
                        {link.device_targeting_enabled && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <DevicePhoneMobileIcon className="w-3 h-3 mr-1" />
                            Device
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Short URL:</span>
                        <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-purple-600 dark:text-purple-400">
                          sureto.click/{link.short_code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(`https://sureto.click/${link.short_code}`)}
                          className="text-gray-400 hover:text-purple-600 transition-colors"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Destination:</span>
                        <span className="text-sm text-gray-900 dark:text-white truncate max-w-md">
                          {link.destination_url}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Project: {getProjectName(link.project_id)}</span>
                        <span>Created: {formatDate(link.created_at)}</span>
                        <span className="flex items-center gap-1">
                          <ChartBarIcon className="w-4 h-4" />
                          {link.total_clicks} clicks
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                      title="View Analytics"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                      title="Edit Link"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200"
                      title="Share Link"
                    >
                      <ShareIcon className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteLink(link.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                      title="Delete Link"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Performance Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Performance</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {link.total_clicks} total clicks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((link.total_clicks / 100) * 100, 100)}%` }}
                      transition={{ delay: index * 0.1, duration: 1 }}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredLinks.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShareIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm || selectedProject !== 'all' ? 'No links found' : 'No links yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || selectedProject !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first shortened link to get started'
            }
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <PlusIcon className="w-5 h-5" />
            Create Your First Link
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}

export default LinksPage
