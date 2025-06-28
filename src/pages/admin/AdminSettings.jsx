import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Database, Shield, AlertTriangle, Save, RefreshCw, Key, Lock } from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'
import toast from 'react-hot-toast'

const AdminSettings = () => {
  const { adminLogout, changeAdminPassword } = useAdmin()
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    maxLinksPerUser: 1000,
    linkExpirationDays: 365,
    enableAnalytics: true,
    enableGeoTracking: true
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    try {
      await changeAdminPassword(passwordForm.currentPassword, passwordForm.newPassword)
      toast.success('Admin password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleSaveSettings = () => {
    // In a real app, this would save to database
    toast.success('Settings saved successfully')
  }

  const handleClearCache = () => {
    // In a real app, this would clear application cache
    toast.success('Cache cleared successfully')
  }

  const handleDatabaseBackup = () => {
    // In a real app, this would trigger database backup
    toast.success('Database backup initiated')
  }

  const handleLogout = () => {
    adminLogout()
    window.location.href = '/admin/login'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
          <p className="text-gray-400 mt-1">System configuration and management</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <Settings className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm font-medium">Configuration</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">System Settings</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Maintenance Mode</label>
                <p className="text-gray-400 text-sm">Temporarily disable the platform</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Allow Registrations</label>
                <p className="text-gray-400 text-sm">Enable new user registrations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowRegistrations}
                  onChange={(e) => handleSettingChange('allowRegistrations', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div>
              <label className="text-white font-medium block mb-2">Max Links Per User</label>
              <input
                type="number"
                value={settings.maxLinksPerUser}
                onChange={(e) => handleSettingChange('maxLinksPerUser', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
              />
            </div>

            <div>
              <label className="text-white font-medium block mb-2">Default Link Expiration (Days)</label>
              <input
                type="number"
                value={settings.linkExpirationDays}
                onChange={(e) => handleSettingChange('linkExpirationDays', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
              />
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">Security Settings</h3>
          </div>

          <div className="space-y-6">
            {/* Change Password Button */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">Superadmin Password</h4>
                  <p className="text-gray-400 text-sm">Change your admin panel password</p>
                </div>
                <Key className="w-5 h-5 text-red-400" />
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors text-red-400 hover:text-red-300 font-medium"
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {/* Password Change Form */}
            {showPasswordForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleChangePassword}
                className="space-y-4 bg-gray-700/30 border border-gray-600/50 rounded-lg p-4"
              >
                <div>
                  <label className="text-white font-medium block mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-white font-medium block mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="text-white font-medium block mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                    required
                    minLength={8}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </motion.form>
            )}

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Security Notice</span>
              </div>
              <p className="text-gray-300 text-sm">
                Use a strong password with at least 8 characters. Your password is stored locally and securely.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Privacy & Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">Privacy & Analytics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Enable Analytics</label>
              <p className="text-gray-400 text-sm">Track link clicks and user behavior</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableAnalytics}
                onChange={(e) => handleSettingChange('enableAnalytics', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Enable Geo Tracking</label>
              <p className="text-gray-400 text-sm">Track user location for analytics</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableGeoTracking}
                onChange={(e) => handleSettingChange('enableGeoTracking', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* System Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">System Actions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleSaveSettings}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors text-green-400 hover:text-green-300"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>

          <button
            onClick={handleClearCache}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors text-blue-400 hover:text-blue-300"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear Cache</span>
          </button>

          <button
            onClick={handleDatabaseBackup}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-colors text-purple-400 hover:text-purple-300"
          >
            <Database className="w-4 h-4" />
            <span>Backup DB</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors text-red-400 hover:text-red-300"
          >
            <Shield className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminSettings
