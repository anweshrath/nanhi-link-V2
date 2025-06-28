import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Users, 
  Link, 
  FolderOpen, 
  BarChart3, 
  Settings,
  Shield,
  Database
} from 'lucide-react'

const AdminSidebar = () => {
  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/admin/links', icon: Link, label: 'Links' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-gray-900 to-black border-r border-red-500/20 z-40"
    >
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-red-400 text-sm">Sureto.click</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">System Status</span>
          </div>
          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Database</span>
              <span className="text-green-400">Online</span>
            </div>
            <div className="flex justify-between">
              <span>Auth</span>
              <span className="text-green-400">Active</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AdminSidebar
