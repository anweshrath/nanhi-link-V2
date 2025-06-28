import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Globe, 
  Calendar,
  MousePointer,
  Activity,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Analytics = () => {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)

  // Generate mock analytics data
  useEffect(() => {
    const generateMockData = () => {
      // Click trends data
      const clickTrends = []
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        clickTrends.push({
          date: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            ...(days > 30 && { year: '2-digit' })
          }),
          clicks: Math.floor(Math.random() * 500) + 100,
          uniqueClicks: Math.floor(Math.random() * 300) + 50,
          conversions: Math.floor(Math.random() * 50) + 10
        })
      }

      // Geographic data
      const geoData = [
        { country: 'United States', clicks: 2840, percentage: 35.2 },
        { country: 'United Kingdom', clicks: 1620, percentage: 20.1 },
        { country: 'Canada', clicks: 980, percentage: 12.2 },
        { country: 'Germany', clicks: 760, percentage: 9.4 },
        { country: 'France', clicks: 540, percentage: 6.7 },
        { country: 'Australia', clicks: 420, percentage: 5.2 },
        { country: 'Others', clicks: 890, percentage: 11.2 }
      ]

      // Device data
      const deviceData = [
        { name: 'Desktop', value: 45.2, clicks: 3640, color: '#8B5CF6' },
        { name: 'Mobile', value: 38.8, clicks: 3120, color: '#06B6D4' },
        { name: 'Tablet', value: 16.0, clicks: 1290, color: '#10B981' }
      ]

      // Browser data
      const browserData = [
        { name: 'Chrome', clicks: 4200, percentage: 52.1 },
        { name: 'Safari', clicks: 1680, percentage: 20.8 },
        { name: 'Firefox', clicks: 1200, percentage: 14.9 },
        { name: 'Edge', clicks: 720, percentage: 8.9 },
        { name: 'Others', clicks: 250, percentage: 3.3 }
      ]

      // Top performing links
      const topLinks = [
        { 
          id: 1, 
          title: 'Product Launch Campaign', 
          shortCode: 'launch2024', 
          clicks: 8420, 
          ctr: 12.4,
          conversions: 340
        },
        { 
          id: 2, 
          title: 'Holiday Sale Promotion', 
          shortCode: 'holiday-sale', 
          clicks: 6890, 
          ctr: 9.8,
          conversions: 280
        },
        { 
          id: 3, 
          title: 'Newsletter Signup', 
          shortCode: 'newsletter', 
          clicks: 5240, 
          ctr: 8.2,
          conversions: 210
        },
        { 
          id: 4, 
          title: 'Social Media Campaign', 
          shortCode: 'social-promo', 
          clicks: 4180, 
          ctr: 7.1,
          conversions: 165
        },
        { 
          id: 5, 
          title: 'Email Marketing', 
          shortCode: 'email-blast', 
          clicks: 3560, 
          ctr: 6.4,
          conversions: 142
        }
      ]

      // Referrer data
      const referrerData = [
        { source: 'Direct', clicks: 3240, percentage: 40.2 },
        { source: 'Social Media', clicks: 2180, percentage: 27.1 },
        { source: 'Email', clicks: 1420, percentage: 17.6 },
        { source: 'Search', clicks: 890, percentage: 11.0 },
        { source: 'Others', clicks: 320, percentage: 4.1 }
      ]

      return {
        clickTrends,
        geoData,
        deviceData,
        browserData,
        topLinks,
        referrerData,
        totalClicks: 8050,
        uniqueClicks: 6240,
        totalLinks: 156,
        avgCTR: 8.7,
        topCountry: 'United States',
        topDevice: 'Desktop',
        peakHour: '2:00 PM'
      }
    }

    setAnalyticsData(generateMockData())
  }, [timeRange])

  const handleExport = () => {
    toast.success('Analytics report exported successfully!', {
      style: {
        background: 'linear-gradient(135deg, #10B981, #059669)',
        color: 'white',
        fontWeight: '600',
        borderRadius: '12px',
        padding: '16px 24px'
      }
    })
  }

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setAnalyticsData(prev => ({ ...prev }))
      setLoading(false)
      toast.success('Analytics refreshed')
    }, 1000)
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const { 
    clickTrends, 
    geoData, 
    deviceData, 
    browserData, 
    topLinks, 
    referrerData,
    totalClicks,
    uniqueClicks,
    totalLinks,
    avgCTR,
    topCountry,
    topDevice,
    peakHour
  } = analyticsData

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights into your link performance
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <div className="flex bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
            {[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '90 Days' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  timeRange === range.value
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={loading}
            className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Clicks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {totalClicks.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <MousePointer className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+12.5%</span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Unique Clicks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {uniqueClicks.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+8.2%</span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Click-Through Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {avgCTR}%
              </p>
            </div>
            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+2.1%</span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Links</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {totalLinks}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Activity className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-gray-600 dark:text-gray-400">all performing well</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Click Trends Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Click Trends</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">Last {timeRange}</div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={clickTrends}>
              <defs>
                <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="uniqueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  color: '#0f172a',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="clicks" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                fill="url(#clicksGradient)"
                name="Total Clicks"
              />
              <Area 
                type="monotone" 
                dataKey="uniqueClicks" 
                stroke="#06B6D4" 
                strokeWidth={3}
                fill="url(#uniqueGradient)"
                name="Unique Clicks"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Device Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Device Distribution</h3>
            <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    color: '#0f172a'
                  }}
                  formatter={(value, name) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            {deviceData.map((device, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {device.name === 'Desktop' && <Monitor className="w-5 h-5" style={{ color: device.color }} />}
                  {device.name === 'Mobile' && <Smartphone className="w-5 h-5" style={{ color: device.color }} />}
                  {device.name === 'Tablet' && <Tablet className="w-5 h-5" style={{ color: device.color }} />}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{device.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{device.value}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{device.clicks.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Geographic Distribution & Top Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Geographic Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Geographic Distribution</h3>
            <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {geoData.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {country.country.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{country.country}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                  <div className="text-right min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {country.clicks.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {country.percentage}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Performing Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Links</h3>
            <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {topLinks.map((link, index) => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {link.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      /{link.shortCode}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {link.clicks.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {link.ctr}% CTR
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Browser & Referrer Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Browser Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Browser Distribution</h3>
            <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={browserData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={60} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  color: '#0f172a'
                }}
              />
              <Bar 
                dataKey="clicks" 
                fill="url(#browserGradient)"
                radius={[0, 4, 4, 0]}
              />
              <defs>
                <linearGradient id="browserGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Traffic Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Traffic Sources</h3>
            <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {referrerData.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">{source.source}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <div className="text-right min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {source.clicks.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {source.percentage}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
          Quick Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-lg w-fit mx-auto mb-3">
              <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Top Country</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{topCountry}</p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg w-fit mx-auto mb-3">
              <Monitor className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Top Device</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{topDevice}</p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg w-fit mx-auto mb-3">
              <Clock className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Peak Hour</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{peakHour}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Analytics
