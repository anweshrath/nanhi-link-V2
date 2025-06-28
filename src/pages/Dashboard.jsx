import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Globe, 
  Plus,
  ExternalLink,
  Calendar,
  MousePointer,
  Activity,
  Zap
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        console.log('Loading dashboard data for user:', user.id)
        
        // Load all data in parallel with proper error handling
        const [linksResult, projectsResult, clicksResult] = await Promise.allSettled([
          supabase
            .from('links')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          
          supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          
          supabase
            .from('clicks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100)
        ])

        // Process links data
        const links = linksResult.status === 'fulfilled' && !linksResult.value.error 
          ? linksResult.value.data || [] 
          : []
        
        // Process projects data
        const projects = projectsResult.status === 'fulfilled' && !projectsResult.value.error 
          ? projectsResult.value.data || [] 
          : []
        
        // Process clicks data (may not exist yet)
        const clicks = clicksResult.status === 'fulfilled' && !clicksResult.value.error 
          ? clicksResult.value.data || [] 
          : []

        console.log('Loaded data:', { links: links.length, projects: projects.length, clicks: clicks.length })

        // Calculate metrics
        const totalClicks = links.reduce((sum, link) => sum + (link.total_clicks || 0), 0)
        const activeLinks = links.filter(link => link.is_active !== false).length
        const recentClicks = clicks.filter(click => {
          const clickDate = new Date(click.created_at)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return clickDate >= weekAgo
        }).length

        // Calculate click rate
        const clickRate = links.length > 0 ? ((totalClicks / links.length) * 100).toFixed(1) : '0.0'

        // Get top performing links
        const topLinks = links
          .sort((a, b) => (b.total_clicks || 0) - (a.total_clicks || 0))
          .slice(0, 5)
          .map(link => ({
            ...link,
            clickCount: link.total_clicks || 0
          }))

        // Generate chart data for last 7 days
        const chartData = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          
          // Count clicks for this day
          const dayClicks = clicks.filter(click => {
            const clickDate = new Date(click.created_at)
            return clickDate.toDateString() === date.toDateString()
          }).length

          chartData.push({
            date: dateStr,
            clicks: dayClicks
          })
        }

        // Add link counts to projects
        const projectsWithCounts = projects.map(project => ({
          ...project,
          linkCount: links.filter(link => link.project_id === project.id).length,
          clickCount: links
            .filter(link => link.project_id === project.id)
            .reduce((sum, link) => sum + (link.total_clicks || 0), 0)
        }))

        const metrics = {
          totalClicks,
          totalLinks: links.length,
          activeLinks,
          recentClicks,
          clickRate: parseFloat(clickRate)
        }

        setDashboardData({
          metrics,
          topLinks,
          chartData,
          projects: projectsWithCounts,
          links
        })

      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        toast.error('Failed to load dashboard data')
        
        // Set empty data so dashboard still renders
        setDashboardData({
          metrics: {
            totalClicks: 0,
            totalLinks: 0,
            activeLinks: 0,
            recentClicks: 0,
            clickRate: 0
          },
          topLinks: [],
          chartData: [],
          projects: [],
          links: []
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Failed to load dashboard data</p>
      </div>
    )
  }

  const { metrics, topLinks, chartData, projects, links } = dashboardData

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's your link performance overview.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/links'}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Link</span>
        </motion.button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {metrics.totalClicks.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <MousePointer className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">
              {metrics.recentClicks}
            </span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">this week</span>
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
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Links</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {metrics.totalLinks.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Activity className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-blue-500 font-medium">
              {metrics.activeLinks}
            </span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">active</span>
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
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Click Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {metrics.clickRate}%
              </p>
            </div>
            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Zap className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-gray-600 dark:text-gray-400">avg per link</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {projects.length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Calendar className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-gray-600 dark:text-gray-400">organized</span>
          </div>
        </motion.div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Click Analytics Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Click Analytics</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">Last 7 days</div>
          </div>
          
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
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
                    borderRadius: '8px',
                    color: '#0f172a'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-600 dark:text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No click data available yet</p>
                <p className="text-sm mt-1">Create some links to see analytics</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Top Performing Links */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Links</h3>
            <ExternalLink className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {topLinks.length > 0 ? (
              topLinks.map((link, index) => (
                <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {link.title || 'Untitled Link'}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                      /{link.short_code}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {link.clickCount}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">clicks</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No links created yet</p>
                <p className="text-sm mt-1">Create your first link to see performance</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Projects</h3>
          <button 
            onClick={() => window.location.href = '/links'}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
              <motion.div 
                key={project.id} 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/links'}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {project.name}
                  </h4>
                  <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                    {project.linkCount || 0} links
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {project.description || 'No description'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                  <span>
                    {project.clickCount || 0} clicks
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No projects created yet</p>
            <p className="text-sm mt-1">Create a project to organize your links</p>
          </div>
        )}
      </motion.div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 text-xs">
          <h4 className="font-medium mb-2">Debug Info:</h4>
          <p>User ID: {user?.id}</p>
          <p>Links: {links.length}</p>
          <p>Projects: {projects.length}</p>
          <p>Total Clicks: {metrics.totalClicks}</p>
          <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL}</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
