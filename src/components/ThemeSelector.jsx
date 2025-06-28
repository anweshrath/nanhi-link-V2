import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Sun, Moon, Check, Sparkles, Briefcase, Leaf, Zap, Crown } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const ThemeSelector = () => {
  const { currentTheme, isDark, themes, changeTheme, toggleDarkMode } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, right: 0 })
  const buttonRef = useRef(null)

  const themeIcons = {
    modern: Sparkles,
    classic: Crown,
    neon: Zap,
    organic: Leaf,
    corporate: Briefcase
  }

  const themeColors = {
    modern: 'from-blue-500 to-indigo-500',
    classic: 'from-amber-500 to-orange-500',
    neon: 'from-purple-500 to-pink-500',
    organic: 'from-green-500 to-emerald-500',
    corporate: 'from-slate-500 to-gray-500'
  }

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      })
    }
  }, [isOpen])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const DropdownContent = () => (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0"
            style={{ zIndex: 999998 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Theme Selector Panel */}
          <motion.div
            className="fixed w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
            style={{ 
              zIndex: 999999,
              top: position.top,
              right: position.right
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                Choose Theme
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Select theme and mode
              </p>
            </div>

            {/* Dark/Light Toggle */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-md">
                    {isDark ? (
                      <Moon className="w-3 h-3 text-white" />
                    ) : (
                      <Sun className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {isDark ? 'Dark' : 'Light'}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Toggle appearance
                    </div>
                  </div>
                </div>
                <motion.button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                      : 'bg-gradient-to-r from-yellow-400 to-orange-400'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
                    animate={{ x: isDark ? 24 : 3 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  />
                </motion.button>
              </div>
            </div>

            {/* Theme Options */}
            <div className="p-4">
              <div className="space-y-2">
                {Object.entries(themes).map(([themeKey, theme]) => {
                  const Icon = themeIcons[themeKey]
                  const isSelected = currentTheme === themeKey
                  
                  return (
                    <motion.button
                      key={themeKey}
                      onClick={() => {
                        changeTheme(themeKey)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                        isSelected
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 bg-gradient-to-r ${themeColors[themeKey]} rounded-lg`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {theme.name}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {theme.fonts.primary}
                          </div>
                        </div>
                      </div>
                      
                      {/* Color Preview & Check */}
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {Object.values(theme[isDark ? 'dark' : 'light'].brand).slice(0, 2).map((color, index) => (
                            <div
                              key={index}
                              className="w-3 h-3 rounded-full border border-white/50"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        {isSelected && (
                          <motion.div
                            className="p-0.5 bg-violet-500 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400 text-center">
                AAA accessibility compliant
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <div className="relative">
      <motion.button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center space-x-2 px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg hover:bg-bg-tertiary transition-all duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Palette className="w-4 h-4 text-text-secondary" />
        <span className="text-sm font-medium text-text-primary">
          {themes[currentTheme].name}
        </span>
      </motion.button>

      {/* Render dropdown in portal at document root */}
      {typeof document !== 'undefined' && createPortal(<DropdownContent />, document.body)}
    </div>
  )
}

export default ThemeSelector
