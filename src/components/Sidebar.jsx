import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Link as LinkIcon, 
  Settings, 
  User, 
  HelpCircle, 
  Filter,
  FileText,
  Globe,
  Puzzle,
  ChevronLeft,
  ChevronRight,
  Key
} from 'lucide-react'

const Sidebar = () => {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/' },
    { icon: LinkIcon, label: 'Links', path: '/links' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: Filter, label: 'Filters', path: '/filters' },
    { icon: Globe, label: 'Domains', path: '/domains' },
    { icon: Puzzle, label: 'Integrations', path: '/integrations' },
    { icon: Key, label: 'API', path: '/api' },
    { icon: User, label: 'Account', path: '/account' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ]

  return (
    <motion.div 
      className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 fixed left-0 top-0 h-full z-50 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Nanhi.Link</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">v2.0</p>
              </div>
            </motion.div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/dashboard')
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`} />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg -z-10"
                      layoutId="activeTab"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </motion.div>
  )
}

export default Sidebar
