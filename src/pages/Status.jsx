import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, AlertCircle, XCircle, Clock, Activity, Globe, Database, Server, Zap, Shield, BarChart3, RefreshCw, Play, Users, ArrowLeft, Home } from 'lucide-react'
import { statusService } from '../services/statusService'
import toast from 'react-hot-toast'

const Status = () => {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [testResults, setTestResults] = useState(null)
  const [testing, setTesting] = useState(false)

  // Load real metrics from Supabase
  const loadMetrics = async () => {
    try {
      setLoading(true)
      const data = await statusService.getSystemMetrics()
      setMetrics(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load metrics:', error)
      toast.error('Failed to load system metrics')
    } finally {
      setLoading(false)
    }
  }

  // Test URL shortening service
  const testUrlShortening = async () => {
    try {
      setTesting(true)
      const result = await statusService.testUrlShorteningService()
      setTestResults(result)
      
      if (result.success) {
        toast.success('URL shortening service test passed!')
      } else {
        toast.error('URL shortening service test failed!')
      }
    } catch (error) {
      console.error('Test failed:', error)
      toast.error('Service test failed')
      setTestResults({
        success: false,
        message: 'Test execution failed',
        error: error.message
      })
    } finally {
      setTesting(false)
    }
  }

  // Verify database tables
  const verifyTables = async () => {
    try {
      const tables = await statusService.verifyDatabaseTables()
      console.log('Database tables verification:', tables)
      
      const allTablesExist = Object.values(tables).every(table => table.exists)
      if (allTablesExist) {
        toast.success('All database tables verified!')
      } else {
        toast.error('Some database tables are missing!')
      }
      
      return tables
    } catch (error) {
      console.error('Table verification failed:', error)
      toast.error('Database verification failed')
    }
  }

  useEffect(() => {
    loadMetrics()
    verifyTables()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'major':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5" />
      case 'degraded':
        return <AlertCircle className="w-5 h-5" />
      case 'major':
        return <XCircle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const overallStatus = metrics?.serviceHealth?.every(service => service.status === 'operational') ? 'operational' : 'degraded'

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading system status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Nanhi.Links Status
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            System Status Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Real-time system status and performance monitoring
          </p>
          
          {/* Overall Status */}
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                overallStatus === 'operational' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
              }`}></div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {overallStatus === 'operational' ? 'All Systems Operational' : 'Some Issues Detected'}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={loadMetrics}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Real Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {metrics?.overallStats?.totalUsers || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {metrics?.overallStats?.totalLinks || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Links</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {metrics?.overallStats?.totalClicks || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {metrics?.performanceMetrics?.avgResponseTime || 0}ms
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Activity className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {metrics?.performanceMetrics?.uptime || 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
          </div>
        </div>

        {/* Service Testing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-12">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Service Testing
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Test core functionality to verify services are working
            </p>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">URL Shortening Service</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Test link creation, storage, and retrieval
                </p>
              </div>
              <button
                onClick={testUrlShortening}
                disabled={testing}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <Play className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Testing...' : 'Run Test'}</span>
              </button>
            </div>
            
            {testResults && (
              <div className={`p-4 rounded-lg ${
                testResults.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {testResults.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`font-medium ${
                    testResults.success 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {testResults.message}
                  </span>
                </div>
                {testResults.error && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Error: {testResults.error}
                  </p>
                )}
                {testResults.testLink && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Test link: {testResults.testLink}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Real Service Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-12">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Service Status
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time status of all Nanhi.Links services
            </p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {metrics?.serviceHealth?.map((service, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Server className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {service.responseTime}ms
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        response time
                      </div>
                    </div>
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                      {getStatusIcon(service.status)}
                      <span className="capitalize">{service.status}</span>
                    </div>
                  </div>
                </div>
                {service.error && (
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                    Error: {service.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity (Last 24 Hours)
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics?.recentActivity?.linksCreated || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Links Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics?.recentActivity?.clicksToday || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Clicks Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics?.recentActivity?.newUsers || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">New Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p className="mt-2 text-sm">
            Status page powered by Nanhi.Links • Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Status
