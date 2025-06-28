import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  ExternalLink,
  BarChart3,
  Calendar,
  Target,
  Users,
  TrendingUp,
  Play,
  Pause,
  Copy
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Campaigns = () => {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Mock campaigns data
  useEffect(() => {
    setCampaigns([
      {
        id: 1,
        name: 'Summer Sale 2024',
        description: 'Promotional campaign for summer products',
        status: 'active',
        links_count: 15,
        total_clicks: 2340,
        conversion_rate: 3.2,
        created_at: new Date().toISOString(),
        start_date: '2024-06-01',
        end_date: '2024-08-31'
      },
      {
        id: 2,
        name: 'Product Launch',
        description: 'New product announcement campaign',
        status: 'paused',
        links_count: 8,
        total_clicks: 1250,
        conversion_rate: 4.1,
        created_at: new Date().toISOString(),
        start_date: '2024-05-15',
        end_date: '2024-07-15'
      },
      {
        id: 3,
        name: 'Holiday Special',
        description: 'Holiday season promotional links',
        status: 'draft',
        links_count: 0,
        total_clicks: 0,
        conversion_rate: 0,
        created_at: new Date().toISOString(),
        start_date: '2024-12-01',
        end_date: '2024-12-31'
      }
    ])
  }, [])

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { color: 'green', text: 'Active', icon: Play }
      case 'paused':
        return { color: 'yellow', text: 'Paused', icon: Pause }
      case 'draft':
        return { color: 'gray', text: 'Draft', icon: Edit }
      case 'completed':
        return { color: 'blue', text: 'Completed', icon: Target }
      default:
        return { color: 'gray', text: 'Unknown', icon: Edit }
    }
  }

  const handleStatusChange = (campaignId, newStatus) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: newStatus }
        : campaign
    ))
    toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`)
  }

  const handleDeleteCampaign = (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    
    setCampaigns(campaigns.filter(campaign => campaign.id !== campaignId))
    toast.success('Campaign deleted successfully')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize and track your marketing campaigns
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </motion.button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {campaigns.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Play className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {campaigns.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {campaigns.reduce((sum, c) => sum + c.total_clicks, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Conversion</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(campaigns.reduce((sum, c) => sum + c.conversion_rate, 0) / campaigns.length || 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign, index) => {
            const statusInfo = getStatusInfo(campaign.status)
            const StatusIcon = statusInfo.icon
            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {campaign.name}
                        </h3>
                        
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800 dark:bg-${statusInfo.color}-900/20 dark:text-${statusInfo.color}-400`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.text}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {campaign.description}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <ExternalLink className="w-4 h-4" />
                          <span>{campaign.links_count} links</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-4 h-4" />
                          <span>{campaign.total_clicks.toLocaleString()} clicks</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{campaign.conversion_rate}% conversion</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{campaign.start_date} - {campaign.end_date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {campaign.status === 'active' ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStatusChange(campaign.id, 'paused')}
                        className="px-3 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                      >
                        Pause
                      </motion.button>
                    ) : campaign.status === 'paused' ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStatusChange(campaign.id, 'active')}
                        className="px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      >
                        Activate
                      </motion.button>
                    ) : null}
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No campaigns found' : 'No campaigns created yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Create your first campaign to organize your marketing links'
              }
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Campaigns
