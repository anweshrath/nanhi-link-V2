import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Palette, FolderPlus, Info } from 'lucide-react'
import InfoTooltip from './InfoTooltip'
import toast from 'react-hot-toast'

const ProjectModal = ({ isOpen, onClose, onSubmit }) => {
  const modalRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    destination_url: '',
    color: '#8B5CF6'
  })
  const [loading, setLoading] = useState(false)

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden' // Prevent background scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const colors = [
    '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B',
    '#EF4444', '#EC4899', '#6366F1', '#84CC16',
    '#F97316', '#06B6D4', '#8B5A2B', '#6B7280'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleColorSelect = (color) => {
    setFormData(prev => ({
      ...prev,
      color
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    try {
      setLoading(true)
      await onSubmit(formData)
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        destination_url: '',
        color: '#8B5CF6'
      })
    } catch (error) {
      // Error is handled in parent component
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 flex-shrink-0">
            <h2 className="text-2xl font-display text-gray-900 dark:text-white flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white">
                <FolderPlus className="w-6 h-6" />
              </div>
              <span>Create New Project</span>
              <InfoTooltip
                title="Project Organization"
                description="Projects help you organize your links by campaign, client, or purpose. Each project can have its own settings and branding."
                examples={[
                  "Social Media Campaign",
                  "Client: ABC Company",
                  "Product Launch 2024"
                ]}
              />
            </h2>
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content - SCROLLABLE WITH CUSTOM SCROLLBAR */}
          <div className="flex-1 overflow-y-auto max-h-[calc(95vh-140px)] premium-scrollbar">
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Info Card */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">Project Organization</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Projects help you organize your links by campaign, client, or purpose. Each project can have its own default settings and color coding.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                  <span>Project Name *</span>
                  <InfoTooltip
                    title="Project Name"
                    description="Choose a descriptive name that helps you identify this project's purpose or campaign."
                    examples={[
                      "Summer Sale 2024",
                      "Client: Tech Startup",
                      "Social Media Links"
                    ]}
                  />
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter project name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                  <span>Description</span>
                  <InfoTooltip
                    title="Project Description"
                    description="Optional description to provide more context about this project's goals or target audience."
                    examples={[
                      "Q4 marketing campaign for new product line",
                      "Client work for ABC Company's rebranding",
                      "Personal blog and social media links"
                    ]}
                  />
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter project description"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                  <span>Default Destination URL</span>
                  <InfoTooltip
                    title="Default Destination URL"
                    description="Optional default URL that will be pre-filled when creating new links in this project."
                    examples={[
                      "https://mystore.com",
                      "https://client-website.com",
                      "https://myblog.com"
                    ]}
                  />
                </label>
                <input
                  type="url"
                  name="destination_url"
                  value={formData.destination_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <div className="flex items-center space-x-2">
                    <Palette className="w-4 h-4" />
                    <span>Project Color</span>
                    <InfoTooltip
                      title="Project Color"
                      description="Choose a color to help visually identify this project in your dashboard and link listings."
                      examples={[
                        "Blue for corporate clients",
                        "Green for eco-friendly campaigns",
                        "Red for urgent promotions"
                      ]}
                    />
                  </div>
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      className={`w-12 h-12 rounded-xl transition-all duration-200 ${
                        formData.color === color
                          ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{loading ? 'Creating...' : 'Create Project'}</span>
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ProjectModal
