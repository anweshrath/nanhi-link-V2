import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, Search, Trash2, Eye, EyeOff, ExternalLink, Calendar, User } from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'
import toast from 'react-hot-toast'

const AdminLinks = () => {
  const { getAllLinks, deleteLink, toggleLinkStatus } = useAdmin()
  const [links, setLinks] = useState([])
  const [filteredLinks, setFilteredLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadLinks()
  }, [])

  useEffect(() => {
    const filtered = links.filter(link =>
      link.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.original_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredLinks(filtered)
  }, [links, searchTerm])

  const loadLinks = async () => {
    try {
      const data = await getAllLinks()
      setLinks(data)
      setFilteredLinks(data)
    } catch (error) {
      console.error('Error loading links:', error)
      toast.error('Failed to load links')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLink = async (linkId, shortCode) => {
    if (window.confirm(`Are you sure you want to delete link "${shortCode}"? This action cannot be undone.`)) {
      try {
        await deleteLink(linkId)
        toast.success('Link deleted successfully')
        loadLinks()
      } catch (error) {
        console.error('Error deleting link:', error)
        toast.error('Failed to delete link')
      }
    }
  }

  const handleToggleStatus = async (linkId, currentStatus) => {
    try {
      await toggleLinkStatus(linkId, !currentStatus)
      toast.success(`Link ${!currentStatus ? 'activated' : 'deactivated'}`)
      loadLinks()
    } catch (error) {
      console.error('Error toggling link status:', error)
      toast.error('Failed to update link status')
    }
  }

  const getLinkTypeColor = (link) => {
    if (link.is_cloaked) return 'from-purple-500 to-purple-600'
    if (link.geo_targeting && Object.keys(link.geo_targeting).length > 0) return 'from-green-500 to-green-600'
    if (link.utm_params && Object.keys(link.utm_params).length > 0) return 'from-yellow-500 to-yellow-600'
    if (link.ab_testing && Object.keys(link.ab_testing).length > 0) return 'from-red-500 to-red-600'
    return 'from-blue-500 to-blue-600'
  }

  const getLinkType = (link) => {
    if (link.is_cloaked) return 'Cloaked'
    if (link.geo_targeting && Object.keys(link.geo_targeting).length > 0) return 'Geo-targeted'
    if (link.utm_params && Object.keys(link.utm_params).length > 0) return 'UTM Tracking'
    if (link.ab_testing && Object.keys(link.ab_testing).length > 0) return 'A/B Testing'
    return 'Short Link'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Link Management</h1>
          <p className="text-gray-400 mt-1">Manage all user links</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
          <Link className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 text-sm font-medium">{links.length} Total Links</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search links by code, URL, or user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
        />
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLinks.map((link, index) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${getLinkTypeColor(link)} rounded-lg flex items-center justify-center`}>
                  <Link className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-semibold font-mono">{link.short_code}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      link.is_active 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {link.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{getLinkType(link)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleStatus(link.id, link.is_active)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  {link.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDeleteLink(link.id, link.short_code)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 truncate">{link.original_url}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  {link.profiles?.name || 'Unknown'} ({link.profiles?.email})
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  Created {new Date(link.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-gray-400">Clicks</span>
                    <span className="text-white font-semibold ml-2">{link.click_count || 0}</span>
                  </div>
                  {link.click_limit && (
                    <div>
                      <span className="text-gray-400">Limit</span>
                      <span className="text-white font-semibold ml-2">{link.click_limit}</span>
                    </div>
                  )}
                </div>
                <span className="text-gray-300 font-mono text-xs">
                  {link.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredLinks.length === 0 && !loading && (
        <div className="text-center py-12">
          <Link className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No links found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'No links have been created yet'}
          </p>
        </div>
      )}
    </div>
  )
}

export default AdminLinks
