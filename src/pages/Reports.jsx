import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Clock,
  Eye
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { dataService } from '../services/dataService'

const Reports = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [dateRange, setDateRange] = useState('7d')

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const data = await dataService.getAnalytics(user.id)
        setAnalytics(data)
      } catch (error) {
        console.error('Failed to load analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [user, dateRange])

  const reportTypes = [
    {
      id: 'clicks',
      title: 'Click Analytics',
      description: 'Detailed click tracking and user behavior',
      icon: BarChart3,
      color: 'purple'
    },
    {
      id: 'performance',
      title: 'Performance Report',
      description: 'Link performance and conversion metrics',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      id: 'geographic',
      title: 'Geographic Report',
      description: 'Geographic distribution of clicks',
      icon: Globe,
      color: 'green'
    },
    {
      id: 'devices',
      title: 'Device Analytics',
      description: 'Device and browser usage statistics',
      icon: Users,
      color: 'orange'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate and download detailed analytics reports
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.totalClicks || 0}
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
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Links</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.activeLinks || 0}
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
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. CTR</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.averageCTR || '0%'}
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
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Session</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.averageSession || '0m'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 bg-${report.color}-100 dark:bg-${report.color}-900/20 rounded-lg`}>
                  <report.icon className={`w-6 h-6 text-${report.color}-600 dark:text-${report.color}-400`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {report.description}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-${report.color}-100 dark:bg-${report.color}-900/20 text-${report.color}-600 dark:text-${report.color}-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-${report.color}-200 dark:hover:bg-${report.color}-900/40 transition-colors flex items-center space-x-2`}
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Custom Report Builder */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Custom Report Builder
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Metrics
            </label>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>All Metrics</option>
                <option>Clicks Only</option>
                <option>Geographic Data</option>
                <option>Device Data</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Format
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>CSV</option>
              <option>PDF</option>
              <option>Excel</option>
              <option>JSON</option>
            </select>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Generate Custom Report</span>
        </motion.button>
      </div>
    </div>
  )
}

export default Reports
