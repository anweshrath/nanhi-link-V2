import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Link, FolderOpen, MousePointer, TrendingUp, Activity, Globe, Calendar } from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const AdminDashboard = () => {
  const { getAdminStats, getAllClicks } = useAdmin()
  const [stats, setStats] = useState({})
  const [recentClicks, setRecentClicks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsData, clicksData] = await Promise.all([
        getAdminStats(),
        getAllClicks()
      ])
      
      setStats(statsData)
      setRecentClicks(clicksData.slice(0, 10))
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects || 0,
      icon: FolderOpen,
      color: 'from-green-500 to-green-600',
      change: '+8%'
    },
    {
      title: 'Total Links',
      value: stats.totalLinks || 0,
      icon: Link,
      color: 'from-purple-500 to-purple-600',
      change: '+15%'
    },
    {
      title: 'Total Clicks',
      value: stats.totalClicks || 0,
      icon: MousePointer,
      color: 'from-red-500 to-red-600',
      change: '+23%'
    }
  ]

  const chartData = [
    { name: 'Mon', users: 12, links: 45, clicks: 234 },
    { name: 'Tue', users: 19, links: 52, clicks: 345 },
    { name: 'Wed', users: 8, links: 38, clicks: 189 },
    { name: 'Thu', users: 15, links: 61, clicks: 456 },
    { name: 'Fri', users: 22, links: 73, clicks: 567 },
    { name: 'Sat', users: 18, links: 55, clicks: 398 },
    { name: 'Sun', users: 14, links: 42, clicks: 289 }
  ]

  const pieData = [
    { name: 'Short Links', value: 45, color: '#8B5CF6' },
    { name: 'Cloaked Links', value: 25, color: '#06B6D4' },
    { name: 'Geo Links', value: 15, color: '#10B981' },
    { name: 'UTM Links', value: 10, color: '#F59E0B' },
    { name: 'A/B Links', value: 5, color: '#EF4444' }
  ]

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
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">System overview and analytics</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
          <Activity className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">System Online</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value.toLocaleString()}</p>
                <p className="text-green-400 text-sm mt-1">{stat.change} from last week</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Weekly Activity</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="users" fill="#3B82F6" />
              <Bar dataKey="links" fill="#8B5CF6" />
              <Bar dataKey="clicks" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Link Types Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Link Types</h3>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Recent Clicks</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Link</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Country</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentClicks.map((click, index) => (
                <tr key={index} className="border-b border-gray-700/50">
                  <td className="py-3 px-4">
                    <span className="text-white font-mono text-sm">
                      {click.links?.short_code || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-300">
                      {click.links?.profiles?.name || 'Anonymous'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-300">{click.country || 'Unknown'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-400 text-sm">
                      {new Date(click.clicked_at).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard
