import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'
import { useAdmin } from '../../contexts/AdminContext'

const AdminLayout = () => {
  const { isAdmin, adminLoading } = useAdmin()

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <AdminSidebar />
      <AdminTopbar />
      <main className="ml-64 pt-16">
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
