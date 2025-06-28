import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, User, Settings, LogOut, Menu } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import ThemeSelector from './ThemeSelector'
import toast from 'react-hot-toast'

const Header = () => {
  const { user, logout } = useAuth()
  const { currentTheme, isDark } = useTheme()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Error logging out')
    }
  }

  return (
    <motion.header 
      className="bg-bg-primary/80 backdrop-blur-xl border-b border-border-primary shadow-sm relative z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between px-8 py-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search links, projects, analytics..."
              className="w-full pl-12 pr-4 py-3 bg-bg-secondary/80 backdrop-blur-xl border border-border-primary rounded-2xl focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary text-text-primary placeholder-text-tertiary transition-all duration-300"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Theme Selector */}
          <ThemeSelector />

          {/* Notifications */}
          <motion.button
            className="relative p-3 text-text-secondary hover:text-text-primary hover:bg-bg-secondary/80 rounded-xl transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-status-error rounded-full"></span>
          </motion.button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-semibold text-text-primary">
                {user?.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-xs text-text-tertiary capitalize">
                {currentTheme} Theme
              </div>
            </div>
            
            <div className="relative">
              <motion.button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                  isDark 
                    ? 'bg-gradient-to-r from-brand-primary to-brand-secondary' 
                    : 'bg-gray-800'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User className="w-5 h-5 text-white" />
              </motion.button>
              
              {/* Backdrop Overlay */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-48 bg-bg-primary border border-border-primary rounded-2xl shadow-2xl z-50"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            // Navigate to settings if needed
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-bg-secondary/80 rounded-xl transition-all duration-200"
                        >
                          <Settings className={`w-4 h-4 ${isDark ? 'text-text-secondary' : 'text-gray-700'}`} />
                          <span className="text-sm font-medium">Settings</span>
                        </button>
                        <button 
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            handleLogout()
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-status-error hover:bg-status-error/10 rounded-xl transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
