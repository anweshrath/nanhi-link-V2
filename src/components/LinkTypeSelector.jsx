import React, { useState } from 'react'
import { X, ArrowRight, Zap, Target, Clock, Globe, Shield, Link as LinkIcon } from 'lucide-react'

const LinkTypeSelector = ({ isOpen, onClose, linkTypes, onSelect, projectId }) => {
  const [selectedType, setSelectedType] = useState(null)

  const handleSelect = () => {
    if (selectedType) {
      onSelect(selectedType)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Choose Link Type
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select the type of link you want to create. Each type offers different features and targeting options.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {linkTypes.map((linkType) => (
              <div
                key={linkType.id}
                onClick={() => setSelectedType(linkType.id)}
                className={`card p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedType === linkType.id 
                    ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'hover:scale-105'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg ${linkType.color} flex items-center justify-center text-white`}>
                    <linkType.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{linkType.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{linkType.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {linkType.features.map((feature, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedType && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
                <Zap className="w-4 h-4" />
                <span className="font-medium">
                  {linkTypes.find(t => t.id === selectedType)?.name} Selected
                </span>
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                You'll be able to configure all the specific settings for this link type in the next step.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedType}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LinkTypeSelector
