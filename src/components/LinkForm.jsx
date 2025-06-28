import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, Settings, Code, Zap, Eye, Clock, Shield, Target } from 'lucide-react'
import { toast } from 'react-hot-toast'
import TrackingSnippetModal from './TrackingSnippetModal'

const LinkForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    originalUrl: '',
    customCode: '',
    title: '',
    description: '',
    expiresAt: '',
    password: '',
    // Tracking & Scripts
    scriptInjectionEnabled: false,
    trackingScripts: [],
    scriptDelay: 2,
    scriptPosition: 'head',
    // Cloaking
    cloakingEnabled: false,
    cloakingPageTitle: 'Loading...',
    cloakingPageDescription: 'Please wait while we redirect you...'
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleTrackingSave = (trackingData) => {
    setFormData(prev => ({
      ...prev,
      ...trackingData
    }))
    setShowTrackingModal(false)
    toast.success('Tracking configuration saved!', {
      style: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }
    })
  }

  return (
    <>
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-white/95 via-white/90 to-slate-50/95 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/30"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-indigo-500/5 animate-gradient" />
        
        <div className="relative p-8">
          <div className="flex items-center space-x-4 mb-8">
            <motion.div
              className="p-3 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Link className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-violet-900 to-slate-900 dark:from-white dark:via-violet-200 dark:to-white bg-clip-text text-transparent">
              Create Smart Link
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* URL Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Destination URL *
              </label>
              <input
                type="url"
                value={formData.originalUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, originalUrl: e.target.value }))}
                required
                className="w-full px-6 py-4 border-2 border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-2xl text-lg font-medium"
                placeholder="https://example.com/your-page"
              />
            </motion.div>

            {/* Custom Short Code */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Custom Short Code (Optional)
              </label>
              <input
                type="text"
                value={formData.customCode}
                onChange={(e) => setFormData(prev => ({ ...prev, customCode: e.target.value }))}
                className="w-full px-6 py-4 border-2 border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-2xl text-lg font-medium"
                placeholder="my-custom-link"
              />
            </motion.div>

            {/* Tracking & Scripts Section */}
            <motion.div
              className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5" />
              
              <div className="relative flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      Tracking & Scripts
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Add tracking pixels, analytics, and custom scripts
                    </p>
                  </div>
                </div>
                
                <motion.button
                  type="button"
                  onClick={() => setShowTrackingModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Configure
                </motion.button>
              </div>

              {formData.scriptInjectionEnabled && formData.trackingScripts.length > 0 && (
                <motion.div
                  className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                      {formData.trackingScripts.filter(s => s.enabled).length} tracking scripts active
                    </span>
                  </div>
                  <div className="space-y-1">
                    {formData.trackingScripts.filter(s => s.enabled).map((script, index) => (
                      <div key={index} className="text-xs text-slate-600 dark:text-slate-400">
                        • {script.name}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Advanced Options Toggle */}
            <motion.button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold transition-colors"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Settings className="w-4 h-4" />
              <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
            </motion.button>

            {/* Advanced Options */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Title & Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Link Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                        placeholder="My awesome link"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Description
                      </label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                        placeholder="Link description"
                      />
                    </div>
                  </div>

                  {/* Expiration & Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Expiration Date</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.expiresAt}
                        onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl text-slate-900 dark:text-white transition-all duration-300"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Password Protection</span>
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                        placeholder="Optional password"
                      />
                    </div>
                  </div>

                  {/* Cloaking Options */}
                  <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">
                          Page Cloaking
                        </h3>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Customize the intermediate page before redirect
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.cloakingEnabled}
                          onChange={(e) => setFormData(prev => ({ ...prev, cloakingEnabled: e.target.checked }))}
                          className="w-5 h-5 text-purple-600 border-2 border-purple-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                          Enable custom cloaking page
                        </span>
                      </label>

                      {formData.cloakingEnabled && (
                        <motion.div
                          className="space-y-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                        >
                          <div>
                            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                              Page Title
                            </label>
                            <input
                              type="text"
                              value={formData.cloakingPageTitle}
                              onChange={(e) => setFormData(prev => ({ ...prev, cloakingPageTitle: e.target.value }))}
                              className="w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white"
                              placeholder="Loading..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                              Page Description
                            </label>
                            <input
                              type="text"
                              value={formData.cloakingPageDescription}
                              onChange={(e) => setFormData(prev => ({ ...prev, cloakingPageDescription: e.target.value }))}
                              className="w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white"
                              placeholder="Please wait while we redirect you..."
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !formData.originalUrl}
              className="w-full px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl shadow-2xl hover:shadow-violet-500/25 disabled:shadow-none transition-all duration-500 text-lg"
              whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Link...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <Target className="w-5 h-5" />
                  <span>Create Smart Link</span>
                </div>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* Tracking Snippet Modal */}
      <TrackingSnippetModal
        isOpen={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        onSave={handleTrackingSave}
      />
    </>
  )
}

export default LinkForm
