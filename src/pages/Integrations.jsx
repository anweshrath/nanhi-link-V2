import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Puzzle, 
  Plus, 
  Search, 
  Settings, 
  ExternalLink,
  CheckCircle,
  XCircle,
  Zap,
  Globe,
  BarChart3,
  Mail,
  MessageSquare,
  Share2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Integrations = () => {
  const { user } = useAuth()
  const [integrations, setIntegrations] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  // Mock integrations data
  useEffect(() => {
    setIntegrations([
      {
        id: 1,
        name: 'Google Analytics',
        description: 'Track link clicks and user behavior with Google Analytics',
        category: 'analytics',
        icon: BarChart3,
        color: 'orange',
        isConnected: true,
        isPopular: true,
        features: ['Click tracking', 'User behavior', 'Conversion tracking']
      },
      {
        id: 2,
        name: 'Slack',
        description: 'Send link notifications and reports to Slack channels',
        category: 'communication',
        icon: MessageSquare,
        color: 'purple',
        isConnected: false,
        isPopular: true,
        features: ['Real-time notifications', 'Daily reports', 'Team collaboration']
      },
      {
        id: 3,
        name: 'Zapier',
        description: 'Connect with 3000+ apps through Zapier automation',
        category: 'automation',
        icon: Zap,
        color: 'yellow',
        isConnected: true,
        isPopular: true,
        features: ['Workflow automation', '3000+ app connections', 'Custom triggers']
      },
      {
        id: 4,
        name: 'Mailchimp',
        description: 'Integrate with email marketing campaigns',
        category: 'marketing',
        icon: Mail,
        color: 'blue',
        isConnected: false,
        isPopular: false,
        features: ['Email campaigns', 'Subscriber tracking', 'A/B testing']
      },
      {
        id: 5,
        name: 'Facebook Pixel',
        description: 'Track conversions and optimize Facebook ads',
        category: 'analytics',
        icon: Share2,
        color: 'blue',
        isConnected: false,
        isPopular: true,
        features: ['Conversion tracking', 'Audience insights', 'Ad optimization']
      },
      {
        id: 6,
        name: 'Webhook',
        description: 'Send real-time data to any endpoint',
        category: 'developer',
        icon: Globe,
        color: 'green',
        isConnected: true,
        isPopular: false,
        features: ['Real-time data', 'Custom endpoints', 'Event triggers']
      }
    ])
  }, [])

  const categories = [
    { id: 'all', name: 'All', count: integrations.length },
    { id: 'analytics', name: 'Analytics', count: integrations.filter(i => i.category === 'analytics').length },
    { id: 'communication', name: 'Communication', count: integrations.filter(i => i.category === 'communication').length },
    { id: 'automation', name: 'Automation', count: integrations.filter(i => i.category === 'automation').length },
    { id: 'marketing', name: 'Marketing', count: integrations.filter(i => i.category === 'marketing').length },
    { id: 'developer', name: 'Developer', count: integrations.filter(i => i.category === 'developer').length }
  ]

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || integration.category === filter
    return matchesSearch && matchesFilter
  })

  const handleToggleIntegration = (integrationId) => {
    setIntegrations(integrations.map(integration =>
      integration.id === integrationId
        ? { ...integration, isConnected: !integration.isConnected }
        : integration
    ))
    
    const integration = integrations.find(i => i.id === integrationId)
    toast.success(`${integration.name} ${integration.isConnected ? 'disconnected' : 'connected'} successfully`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Integrations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect with your favorite tools and services
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Browse More</span>
        </motion.button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === category.id
                    ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Puzzle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Integrations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {integrations.length}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {integrations.filter(i => i.isConnected).length}
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
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Popular</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {integrations.filter(i => i.isPopular).length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.length > 0 ? (
          filteredIntegrations.map((integration, index) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 bg-${integration.color}-100 dark:bg-${integration.color}-900/20 rounded-lg`}>
                    <integration.icon className={`w-6 h-6 text-${integration.color}-600 dark:text-${integration.color}-400`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {integration.name}
                      </h3>
                      {integration.isPopular && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                          Popular
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      integration.isConnected
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {integration.isConnected ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Not Connected
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {integration.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Features:</p>
                {integration.features.map((feature, featureIndex) => (
                  <p key={featureIndex} className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    • {feature}
                  </p>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggleIntegration(integration.id)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    integration.isConnected
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40'
                      : 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/40'
                  }`}
                >
                  {integration.isConnected ? 'Disconnect' : 'Connect'}
                </motion.button>
                
                {integration.isConnected && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Puzzle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm || filter !== 'all' ? 'No integrations found' : 'No integrations available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Browse our integration marketplace to connect your favorite tools'
              }
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Browse Integrations</span>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Integrations
