import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Filter, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Globe,
  Shield,
  Clock,
  Users,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Filters = () => {
  const { user } = useAuth()
  const [filters, setFilters] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Mock filters data
  useEffect(() => {
    setFilters([
      {
        id: 1,
        name: 'Geographic Filter',
        type: 'geographic',
        description: 'Block traffic from specific countries',
        isActive: true,
        rules: ['Block: CN, RU', 'Allow: US, CA, UK'],
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Bot Protection',
        type: 'security',
        description: 'Filter out bot traffic and suspicious requests',
        isActive: true,
        rules: ['Block known bots', 'Rate limiting: 10/min'],
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Time-based Filter',
        type: 'temporal',
        description: 'Restrict access during specific hours',
        isActive: false,
        rules: ['Block: 2AM-6AM UTC', 'Weekend restrictions'],
        created_at: new Date().toISOString()
      }
    ])
  }, [])

  const filteredFilters = filters.filter(filter =>
    filter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    filter.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filterTypes = [
    { id: 'geographic', name: 'Geographic', icon: Globe, color: 'blue' },
    { id: 'security', name: 'Security', icon: Shield, color: 'red' },
    { id: 'temporal', name: 'Time-based', icon: Clock, color: 'green' },
    { id: 'device', name: 'Device', icon: Users, color: 'purple' }
  ]

  const getFilterTypeInfo = (type) => {
    return filterTypes.find(t => t.id === type) || filterTypes[0]
  }

  const handleToggleFilter = (filterId) => {
    setFilters(filters.map(filter =>
      filter.id === filterId
        ? { ...filter, isActive: !filter.isActive }
        : filter
    ))
    toast.success('Filter updated successfully')
  }

  const handleDeleteFilter = (filterId) => {
    if (!confirm('Are you sure you want to delete this filter?')) return
    
    setFilters(filters.filter(filter => filter.id !== filterId))
    toast.success('Filter deleted successfully')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Filters</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage traffic filtering and security rules
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Filter</span>
        </motion.button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search filters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Filter Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {filterTypes.map((type, index) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-3 bg-${type.color}-100 dark:bg-${type.color}-900/20 rounded-lg`}>
                <type.icon className={`w-6 h-6 text-${type.color}-600 dark:text-${type.color}-400`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{type.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filters.filter(f => f.type === type.id).length}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters List */}
      <div className="space-y-4">
        {filteredFilters.length > 0 ? (
          filteredFilters.map((filter, index) => {
            const typeInfo = getFilterTypeInfo(filter.type)
            return (
              <motion.div
                key={filter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900/20 rounded-lg`}>
                      <typeInfo.icon className={`w-6 h-6 text-${typeInfo.color}-600 dark:text-${typeInfo.color}-400`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {filter.name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          filter.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {filter.isActive ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-800 dark:bg-${typeInfo.color}-900/20 dark:text-${typeInfo.color}-400`}>
                          {typeInfo.name}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {filter.description}
                      </p>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Rules:</p>
                        {filter.rules.map((rule, ruleIndex) => (
                          <p key={ruleIndex} className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            • {rule}
                          </p>
                        ))}
                      </div>
                      
                      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                        Created {new Date(filter.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleFilter(filter.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        filter.isActive
                          ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {filter.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </motion.button>
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
                      onClick={() => handleDeleteFilter(filter.id)}
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
              <Filter className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No filters found' : 'No filters created yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Create your first filter to manage traffic and security'
              }
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Filter</span>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Filters
