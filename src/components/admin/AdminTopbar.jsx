import React from 'react'
import { motion } from 'framer-motion'
import { LogOut, Shield, AlertTriangle } from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'

const AdminTopbar = () => {
  const { adminLogout } = useAdmin()

  const handleLogout = () => {
    adminLogout()
    window.location.href = '/admin/login'
  }

  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-64 right-0 h-16 bg-gray-900/95 backdrop-blur-sm border-b border-red-500/20 z-30"
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">ADMIN MODE</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-300">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Superadmin</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors text-red-400 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default AdminTopbar
