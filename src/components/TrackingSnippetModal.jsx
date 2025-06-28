import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Code, Eye, EyeOff, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const TrackingSnippetModal = ({ isOpen, onClose, onSave }) => {
  const [trackingData, setTrackingData] = useState({
    scriptInjectionEnabled: false,
    trackingScripts: [],
    scriptDelay: 2,
    scriptPosition: 'head'
  })
  
  const [newScript, setNewScript] = useState({
    name: '',
    code: '',
    enabled: true,
    position: 'head',
    delay: 0
  })
  
  const [showCode, setShowCode] = useState({})
  const [copied, setCopied] = useState(false)

  const predefinedScripts = [
    {
      name: 'Google Analytics 4',
      code: `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>`,
      position: 'head'
    },
    {
      name: 'Facebook Pixel',
      code: `<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
/></noscript>`,
      position: 'head'
    },
    {
      name: 'Google Tag Manager',
      code: `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->`,
      position: 'head'
    },
    {
      name: 'TikTok Pixel',
      code: `<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('YOUR_PIXEL_ID');
  ttq.page();
}(window, document, 'ttq');
</script>`,
      position: 'head'
    },
    {
      name: 'Hotjar Tracking',
      code: `<script>
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>`,
      position: 'head'
    }
  ]

  const addPredefinedScript = (script) => {
    const newScriptData = {
      ...script,
      id: Date.now(),
      enabled: true,
      delay: 0
    }
    
    setTrackingData(prev => ({
      ...prev,
      trackingScripts: [...prev.trackingScripts, newScriptData],
      scriptInjectionEnabled: true
    }))
    
    toast.success(`${script.name} added successfully!`)
  }

  const addCustomScript = () => {
    if (!newScript.name.trim() || !newScript.code.trim()) {
      toast.error('Please provide both name and code')
      return
    }

    const scriptData = {
      ...newScript,
      id: Date.now()
    }
    
    setTrackingData(prev => ({
      ...prev,
      trackingScripts: [...prev.trackingScripts, scriptData],
      scriptInjectionEnabled: true
    }))
    
    setNewScript({
      name: '',
      code: '',
      enabled: true,
      position: 'head',
      delay: 0
    })
    
    toast.success('Custom script added successfully!')
  }

  const removeScript = (scriptId) => {
    setTrackingData(prev => ({
      ...prev,
      trackingScripts: prev.trackingScripts.filter(script => script.id !== scriptId)
    }))
  }

  const toggleScript = (scriptId) => {
    setTrackingData(prev => ({
      ...prev,
      trackingScripts: prev.trackingScripts.map(script =>
        script.id === scriptId ? { ...script, enabled: !script.enabled } : script
      )
    }))
  }

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  const handleSave = () => {
    onSave(trackingData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Tracking & Scripts
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add tracking pixels, analytics, and custom scripts
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6 space-y-6">
              {/* Global Settings */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Global Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={trackingData.scriptInjectionEnabled}
                        onChange={(e) => setTrackingData(prev => ({ 
                          ...prev, 
                          scriptInjectionEnabled: e.target.checked 
                        }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enable Script Injection
                      </span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Default Position
                    </label>
                    <select
                      value={trackingData.scriptPosition}
                      onChange={(e) => setTrackingData(prev => ({ 
                        ...prev, 
                        scriptPosition: e.target.value 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="head">Head</option>
                      <option value="body">Body</option>
                      <option value="footer">Footer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Default Delay (seconds)
                    </label>
                    <input
                      type="number"
                      value={trackingData.scriptDelay}
                      onChange={(e) => setTrackingData(prev => ({ 
                        ...prev, 
                        scriptDelay: parseInt(e.target.value) || 0 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      min="0"
                      max="30"
                    />
                  </div>
                </div>
              </div>

              {/* Predefined Scripts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Popular Tracking Scripts
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predefinedScripts.map((script, index) => (
                    <motion.div
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {script.name}
                        </h4>
                        <button
                          onClick={() => addPredefinedScript(script)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Position: {script.position}
                        </span>
                        <button
                          onClick={() => setShowCode(prev => ({ 
                            ...prev, 
                            [index]: !prev[index] 
                          }))}
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          {showCode[index] ? 'Hide Code' : 'View Code'}
                        </button>
                      </div>
                      
                      {showCode[index] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3"
                        >
                          <div className="relative">
                            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto max-h-32">
                              <code>{script.code}</code>
                            </pre>
                            <button
                              onClick={() => copyCode(script.code)}
                              className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                              {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-600" />}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Custom Script */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Add Custom Script
                </h3>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Script Name
                      </label>
                      <input
                        type="text"
                        value={newScript.name}
                        onChange={(e) => setNewScript(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="My Custom Script"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Position
                      </label>
                      <select
                        value={newScript.position}
                        onChange={(e) => setNewScript(prev => ({ ...prev, position: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="head">Head</option>
                        <option value="body">Body</option>
                        <option value="footer">Footer</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Script Code
                    </label>
                    <textarea
                      value={newScript.code}
                      onChange={(e) => setNewScript(prev => ({ ...prev, code: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder="<script>
// Your custom script here
console.log('Hello World!');
</script>"
                    />
                  </div>
                  
                  <button
                    onClick={addCustomScript}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Add Custom Script
                  </button>
                </div>
              </div>

              {/* Active Scripts */}
              {trackingData.trackingScripts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Active Scripts ({trackingData.trackingScripts.filter(s => s.enabled).length})
                  </h3>
                  
                  <div className="space-y-3">
                    {trackingData.trackingScripts.map((script) => (
                      <motion.div
                        key={script.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleScript(script.id)}
                            className={`p-1 rounded ${
                              script.enabled 
                                ? 'text-green-600 hover:text-green-700' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {script.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {script.name}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Position: {script.position} • Delay: {script.delay}s
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeScript(script.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default TrackingSnippetModal
