import React, { useState, useEffect } from 'react'
import { Key, Copy, Eye, EyeOff, Plus, Trash2, Code, Book, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

const API = () => {
  const [apiKeys, setApiKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewKeyModal, setShowNewKeyModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [visibleKeys, setVisibleKeys] = useState(new Set())
  const [testingKey, setTestingKey] = useState(null)

  // Mock API keys for demo
  useEffect(() => {
    setTimeout(() => {
      setApiKeys([
        {
          id: '1',
          name: 'Production API',
          key: 'nl_live_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
          created_at: '2024-01-15T10:30:00.000Z',
          last_used: '2024-01-20T14:22:00.000Z',
          usage_count: 1247
        },
        {
          id: '2', 
          name: 'Development',
          key: 'nl_test_xyz987wvu654tsr321qpo098nml765kji432hgf109edc876ba',
          created_at: '2024-01-10T09:15:00.000Z',
          last_used: '2024-01-19T16:45:00.000Z',
          usage_count: 89
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name')
      return
    }

    const newKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `nl_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      created_at: new Date().toISOString(),
      last_used: null,
      usage_count: 0
    }

    setApiKeys(prev => [newKey, ...prev])
    setNewKeyName('')
    setShowNewKeyModal(false)
    toast.success('API key generated successfully')
  }

  const deleteApiKey = async (keyId) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) return
    
    setApiKeys(prev => prev.filter(key => key.id !== keyId))
    toast.success('API key deleted')
  }

  const copyApiKey = (apiKey) => {
    navigator.clipboard.writeText(apiKey)
    toast.success('API key copied to clipboard')
  }

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev)
      if (newSet.has(keyId)) {
        newSet.delete(keyId)
      } else {
        newSet.add(keyId)
      }
      return newSet
    })
  }

  const testApiKey = async (keyId) => {
    setTestingKey(keyId)
    
    // Simulate API test
    setTimeout(() => {
      setTestingKey(null)
      toast.success('API key is working correctly')
    }, 2000)
  }

  const maskApiKey = (key) => {
    if (key.length <= 12) return key
    return `${key.substring(0, 12)}${'•'.repeat(key.length - 20)}${key.substring(key.length - 8)}`
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your API keys and access the Nanhi.Links API
            </p>
          </div>
          <button 
            onClick={() => setShowNewKeyModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Generate API Key</span>
          </button>
        </div>
      </div>

      {/* API Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Keys</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {apiKeys.length}
              </p>
            </div>
            <Key className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {apiKeys.reduce((sum, key) => sum + key.usage_count, 0).toLocaleString()}
              </p>
            </div>
            <Code className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rate Limit</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                1000/hr
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Book className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                API Documentation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Complete guide to using the Nanhi.Links API
              </p>
            </div>
          </div>
          <a 
            href="/api/docs" 
            target="_blank"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>View Documentation</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Code className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                API Endpoint
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Base URL for all API requests
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <code className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono">
              https://api.nanhi.link/api
            </code>
            <button
              onClick={() => copyApiKey('https://api.nanhi.link/api')}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Key className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your API Keys
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and monitor your API keys
              </p>
            </div>
          </div>
        </div>

        {apiKeys.length > 0 ? (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{key.name}</h3>
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded font-mono">
                          {visibleKeys.has(key.id) ? key.key : maskApiKey(key.key)}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {visibleKeys.has(key.id) ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyApiKey(key.key)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                      <span>{key.usage_count.toLocaleString()} requests</span>
                      {key.last_used && (
                        <span>Last used {new Date(key.last_used).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => testApiKey(key.id)}
                      disabled={testingKey === key.id}
                      className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                      {testingKey === key.id ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Testing...</span>
                        </div>
                      ) : (
                        'Test'
                      )}
                    </button>
                    <button
                      onClick={() => deleteApiKey(key.id)}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No API keys generated yet</p>
            <button 
              onClick={() => setShowNewKeyModal(true)}
              className="btn-primary"
            >
              Generate Your First API Key
            </button>
          </div>
        )}
      </div>

      {/* Example Usage */}
      <div className="card p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Start Example
        </h3>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`curl -X POST https://api.nanhi.link/api/links \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/very-long-url",
    "title": "My Example Link"
  }'`}
          </pre>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
          Replace <code>your_api_key_here</code> with one of your API keys above.
        </p>
      </div>

      {/* Generate API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Generate New API Key
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Key Name
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production API, Development, Mobile App"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                    Important Security Notice
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Store your API key securely. It won't be shown again after creation.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNewKeyModal(false)
                  setNewKeyName('')
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={generateApiKey}
                className="btn-primary"
              >
                Generate API Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default API
