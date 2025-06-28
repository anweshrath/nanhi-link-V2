import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { X, Globe, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react'

const AddDomainModal = ({ isOpen, onClose }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const onSubmit = (data) => {
    toast.success('Domain added successfully! Please configure DNS.', {
      duration: 4000,
      style: {
        background: 'linear-gradient(135deg, #10B981, #059669)',
        color: 'white',
        fontWeight: '600',
        borderRadius: '12px',
        padding: '16px 24px'
      }
    })
    reset()
    onClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={handleBackdropClick}
          />

          {/* Modal */}
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0.9, 
              y: 20,
              rotateX: -15 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              rotateX: 0 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95, 
              y: 10,
              rotateX: 5 
            }}
            transition={{ 
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.5
            }}
            className="relative w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 px-8 py-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl"
                  >
                    <Globe className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <motion.h3 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-2xl font-bold text-white"
                    >
                      Add Custom Domain
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-white/80 text-sm"
                    >
                      Brand your links with your own domain
                    </motion.p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Form Content - WITH CUSTOM SCROLLBAR */}
            <div className="p-8 max-h-[70vh] overflow-y-auto modal-scrollbar">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Domain Name *
                  </label>
                  <div className="relative">
                    <input
                      {...register('domain', { 
                        required: 'Domain name is required',
                        pattern: {
                          value: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
                          message: 'Please enter a valid domain name'
                        }
                      })}
                      type="text"
                      placeholder="links.yourdomain.com"
                      className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 text-lg font-medium"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-6">
                      <Globe className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.domain && (
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium"
                    >
                      {errors.domain.message}
                    </motion.p>
                  )}
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Enter your custom domain (e.g., links.yourdomain.com)
                  </p>
                </motion.div>

                {/* Info Cards */}
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                        <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-2">Domain Requirements</h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1.5">
                          <li className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            <span>You must own the domain or have DNS access</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            <span>Subdomains are recommended (e.g., links.yourdomain.com)</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            <span>SSL certificate will be automatically provisioned</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">DNS Configuration</h4>
                        <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                          After adding your domain, configure DNS by adding a CNAME record pointing to{' '}
                          <code className="bg-amber-100 dark:bg-amber-800 px-2 py-1 rounded-lg font-mono text-xs">
                            cname.sureto.click
                          </code>
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
                        <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-2">Benefits</h4>
                        <ul className="text-sm text-emerald-800 dark:text-emerald-200 space-y-1.5">
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Branded short links with your domain</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Increased trust and click-through rates</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Professional appearance for your links</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>

                  {/* Additional content to demonstrate scrolling */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-5"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-2">Advanced Features</h4>
                        <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1.5">
                          <li className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                            <span>Custom SSL certificates supported</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                            <span>Wildcard subdomain support</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                            <span>Advanced analytics and tracking</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                            <span>Custom redirect pages</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleClose}
                    className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                  >
                    <span className="relative z-10">Add Domain</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  // Render modal in a portal to escape layout constraints
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null
}

export default AddDomainModal
