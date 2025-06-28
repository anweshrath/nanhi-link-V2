import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  ExternalLink,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Settings
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AddDomainModal from '../components/AddDomainModal'
import toast from 'react-hot-toast'

const Domains = () => {
  const { user } = useAuth()
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  // Mock domains data
  useEffect(() => {
    setDomains([
      {
        id: 1,
        domain: 'nanhi.link',
        status: 'active',
        isDefault: true,
        ssl: true,
        verified: true,
        clicks: 15420,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        domain: 'short.example.com',
        status: 'pending',
        isDefault: false,
        ssl: true,
        verified: false,
        clicks: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        domain: 'link.mysite.com',
        status: 'active',
        isDefault: false,
        ssl: true,
        verified: true,
        clicks: 2340,
        created_at: new Date().toISOString()
      }
    ])
  }, [])

  const filteredDomains = domains.filter(domain =>
    domain.domain.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { icon: CheckCircle, color: 'green', text: 'Active' }
      case 'pending':
        return { icon: AlertCircle, color: 'yellow', text: 'Pending' }
      case 'inactive':
        return { icon: XCircle, color: 'red', text: 'Inactive' }
      default:
        return { icon: AlertCircle, color: 'gray', text: 'Unknown' }
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Domain copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const handleSetDefault = (domainId) => {
    setDomains(domains.map(domain => ({
      ...domain,
      isDefault: domain.id === domainId
    })))
    toast.success('Default domain updated')
  }

  const handleDeleteDomain = (domainId) => {
    const domain = domains.find(d => d.id === domainId)
    if (domain?.isDefault) {
      toast.error('Cannot delete the default domain')
      return
    }
    
    if (!confirm('Are you sure you want to delete this domain?')) return
    
    setDomains(domains.filter(domain => domain.id !== domainId))
    toast.success('Domain deleted successfully')
  }

  const handleEditDomain = (domainId) => {
    toast.info('Domain settings opened')
    // Add edit functionality here
  }

  const handleViewDomain = (domain) => {
    window.open(`https://${domain}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Domains</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your custom domains and SSL certificates
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Domain</span>
        </motion.button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search domains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Domain Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Domains</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {domains.length}
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
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Domains</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {domains.filter(d => d.status === 'active').length}
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
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">SSL Enabled</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {domains.filter(d => d.ssl).length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Domains List */}
      <div className="space-y-4">
        {filteredDomains.length > 0 ? (
          filteredDomains.map((domain, index) => {
            const statusInfo = getStatusInfo(domain.status)
            return (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <button
                          onClick={() => handleViewDomain(domain.domain)}
                          className="font-semibold text-gray-900 dark:text-white text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        >
                          {domain.domain}
                        </button>
                        
                        {domain.isDefault && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                            Default
                          </span>
                        )}
                        
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          statusInfo.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          statusInfo.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          <statusInfo.icon className="w-3 h-3 mr-1" />
                          {statusInfo.text}
                        </span>
                        
                        {domain.ssl && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            <Shield className="w-3 h-3 mr-1" />
                            SSL
                          </span>
                        )}
                        
                        {domain.verified && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <ExternalLink className="w-4 h-4" />
                          <span>{domain.clicks.toLocaleString()} clicks</span>
                        </div>
                        <div>
                          Added {new Date(domain.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyToClipboard(domain.domain)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                      title="Copy domain"
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                    
                    {!domain.isDefault && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSetDefault(domain.id)}
                        className="px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors cursor-pointer"
                        title="Set as default domain"
                      >
                        Set Default
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditDomain(domain.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                      title="Domain settings"
                    >
                      <Settings className="w-4 h-4" />
                    </motion.button>
                    
                    {!domain.isDefault && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteDomain(domain.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                        title="Delete domain"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No domains found' : 'No custom domains added yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Add your first custom domain to brand your short links'
              }
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 mx-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Domain</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Add Domain Modal */}
      <AddDomainModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </div>
  )
}

export default Domains
