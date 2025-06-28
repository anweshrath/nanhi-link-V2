import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { linkService } from '../services/linkService'
import toast from 'react-hot-toast'

const PasswordProtectedLink = ({ link, onAccessGranted }) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!password.trim()) {
      toast.error('Please enter the password')
      return
    }

    setIsVerifying(true)
    
    try {
      const isValid = await linkService.verifyLinkPassword(link.id, password)
      
      if (isValid) {
        toast.success('Access granted!')
        onAccessGranted()
      } else {
        toast.error('Incorrect password')
        setPassword('')
      }
    } catch (error) {
      console.error('Password verification error:', error)
      toast.error('Failed to verify password')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <LockClosedIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Password Protected Link
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400">
            This link is password protected. Please enter the password to continue.
          </p>
          
          {link.title && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {link.title}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter password"
                disabled={isVerifying}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={isVerifying}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isVerifying || !password.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              'Access Link'
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Powered by SureTo.click - Secure Link Management
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default PasswordProtectedLink
