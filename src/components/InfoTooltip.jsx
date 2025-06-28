import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info } from 'lucide-react'

const InfoTooltip = ({ title, description, examples = [], position = 'top' }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="p-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        aria-label={`More information about ${title}`}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? 'tooltip-content' : undefined}
      >
        <Info className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="tooltip-content"
            role="tooltip"
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
            className={`absolute z-50 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 ${
              position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            } left-1/2 transform -translate-x-1/2`}
            style={{
              // Ensure tooltip doesn't go off-screen on mobile
              maxWidth: 'calc(100vw - 2rem)',
              left: 'clamp(1rem, 50%, calc(100vw - 1rem - 100%))'
            }}
          >
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm break-words">
                {title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words">
                {description}
              </p>
              {examples.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Examples:
                  </p>
                  <ul className="space-y-1">
                    {examples.map((example, index) => (
                      <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                        <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                        <span className="break-words">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Arrow */}
            <div className={`absolute left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rotate-45 ${
              position === 'top' ? 'top-full -mt-2 border-t-0 border-l-0' : 'bottom-full -mb-2 border-b-0 border-r-0'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default InfoTooltip
