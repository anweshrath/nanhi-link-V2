import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline'
import { analyticsService } from '../../services/analyticsService'

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await analyticsService.getAnalytics(timeRange)
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Clicks',
      value: analytics?.totalClicks || 0,
      change: '+12.5%',
      changeType: 'increase',
      icon: CursorArrowRaysIcon,
      color: 'purple'
    },
    {
      name: 'Unique Visitors',
      value: analytics?.uniqueVisitors || 0,
      change: '+8.2%',
      changeType: 'increase',
      icon: EyeIcon,
      color: 'blue'
    },
    {
      name: 'Active Links',
      value: analytics?.activeLinks || 0,
      change: '+2.1%',
      changeType: 'increase',
      icon: ChartBarIcon,
      color: 'green'
    },
    {
      name: 'Conversion Rate',
      value: '3.2%',
      change: '-0.5%',
      changeType: 'decrease',
      icon: TrendingUpIcon,
      color: 'orange'
    }
  ]

  const topCountries = [
    { name: 'United States', clicks: 1234, percentage: 45 },
    { name: 'United Kingdom', clicks: 567, percentage: 20 },
    { name: 'Canada', clicks: 345, percentage: 12 },
    { name: 'Germany', clicks: 234, percentage: 8 },
    { name: 'France', clicks: 123, percentage: 4 }
  ]

  const topDevices = [
    { name: 'Desktop', clicks: 1456, percentage: 52 },
    { name: 'Mobile', clicks: 1123, percentage: 40 },
    { name: 'Tablet', clicks: 234, percentage: 8 }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your link performance and audience insights
          </p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'increase' ? (
                    <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Click Trends Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Click Trends
            </h3>
            <ChartBarIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="h-64 flex items-end justify-between space-x-2">
            {[65, 45, 78, 52, 89, 67, 94].map((height, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                className="bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg flex-1 min-h-[20px]"
              />
            ))}
          </div>
          
          <div className="flex justify-between mt-4 text-sm text-gray-500">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </motion.div>

        {/* Top Referrers */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Referrers
            </h3>
            <GlobeAltIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {['Direct', 'Google', 'Twitter', 'Facebook', 'LinkedIn'].map((referrer, index) => (
              <motion.div
                key={referrer}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between"
              >
                <span className="text-gray-900 dark:text-white font-medium">
                  {referrer}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.random() * 100}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {Math.floor(Math.random() * 500)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Geographic and Device Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Countries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Countries
            </h3>
            <GlobeAltIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {topCountries.map((country, index) => (
              <motion.div
                key={country.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {country.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${country.percentage}%` }}
                      transition={{ delay: 0.9 + index * 0.1, duration: 0.8 }}
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {country.clicks}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Device Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Device Types
            </h3>
            <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-6">
            {topDevices.map((device, index) => (
              <motion.div
                key={device.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="text-center"
              >
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <motion.circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                      animate={{ 
                        strokeDashoffset: 2 * Math.PI * 40 * (1 - device.percentage / 100)
                      }}
                      transition={{ delay: 1 + index * 0.2, duration: 1 }}
                      className="text-purple-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {device.percentage}%
                    </span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {device.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {device.clicks.toLocaleString()} clicks
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AnalyticsPage
