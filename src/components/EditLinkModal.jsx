import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const EditLinkModal = ({ isOpen, onClose, link, onSave }) => {
  const modalRef = useRef(null)
  const firstInputRef = useRef(null)
  const [formData, setFormData] = useState({
    title: '',
    destination_url: '',
    short_code: '',
    is_active: true,
    cloaking_enabled: false,
    password_protection: false,
    password: '',
    expiration_enabled: false,
    expiration_date: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
      
      // Tab trapping within modal
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            event.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            event.preventDefault()
          }
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Focus first input when modal opens
      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus()
        }
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (link) {
      setFormData({
        title: link.title || '',
        destination_url: link.destination_url || link.original_url || '',
        short_code: link.short_code || '',
        is_active: link.is_active !== false,
        cloaking_enabled: link.cloaking_enabled || false,
        password_protection: link.password_protection || false,
        password: '',
        expiration_enabled: link.expiration_enabled || false,
        expiration_date: link.expiration_date ? link.expiration_date.split('T')[0] : ''
      })
    }
  }, [link])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.destination_url.trim()) {
      toast.error('Destination URL is required')
      return
    }

    try {
      setLoading(true)
      await onSave(link.id, formData)
      toast.success('Link updated successfully!')
    } catch (error) {
      toast.error('Failed to update link')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl w-full max-w-xs sm:max-w-lg md:max-w-2xl max-h-[98vh] sm:max-h-[90vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 
              id="edit-modal-title"
              className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate"
            >
              Edit Link
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* SCROLLABLE FORM CONTENT WITH CUSTOM SCROLLBAR */}
          <div className="max-h-[calc(98vh-140px)] sm:max-h-[calc(90vh-140px)] overflow-y-auto modal-scrollbar">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                  Basic Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter link title"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Destination URL *
                  </label>
                  <input
                    type="url"
                    name="destination_url"
                    value={formData.destination_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white break-all text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Short Code
                  </label>
                  <input
                    type="text"
                    name="short_code"
                    value={formData.short_code}
                    onChange={handleInputChange}
                    placeholder="custom-code"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                  Settings
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Active (link is accessible)
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="cloaking_enabled"
                      checked={formData.cloaking_enabled}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Enable cloaking
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="password_protection"
                      checked={formData.password_protection}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Password protection
                    </span>
                  </label>

                  {formData.password_protection && (
                    <div className="ml-7">
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter password"
                          className="w-full px-3 sm:px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="expiration_enabled"
                      checked={formData.expiration_enabled}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Set expiration date
                    </span>
                  </label>

                  {formData.expiration_enabled && (
                    <div className="ml-7">
                      <input
                        type="date"
                        name="expiration_date"
                        value={formData.expiration_date}
                        onChange={handleInputChange}
                        className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default EditLinkModal
