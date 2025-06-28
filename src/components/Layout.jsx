import React from 'react'
import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="relative z-30">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* Top Navigation */}
        <div className="relative z-20">
          <TopNavbar />
        </div>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 pt-20 relative z-10">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
