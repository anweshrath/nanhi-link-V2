import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const LinkRedirect = () => {
  const { shortCode } = useParams()
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Get link from database
        const { data: link, error: linkError } = await supabase
          .from('links')
          .select('*')
          .eq('short_code', shortCode)
          .eq('is_active', true)
          .single()

        if (linkError || !link) {
          setStatus('not_found')
          setError('Link not found or has been deactivated')
          return
        }

        // Check if link has expired
        if (link.expires_at && new Date(link.expires_at) < new Date()) {
          setStatus('expired')
          setError('This link has expired')
          return
        }

        // Check click limit
        if (link.click_limit && link.click_count >= link.click_limit) {
          setStatus('limit_reached')
          setError('This link has reached its click limit')
          return
        }

        // Track the click
        const userAgent = navigator.userAgent
        const referrer = document.referrer

        // Insert click record
        const { error: clickError } = await supabase
          .from('clicks')
          .insert({
            link_id: link.id,
            user_agent: userAgent,
            ip_address: '', // Will be filled by server if needed
            referrer: referrer,
            clicked_at: new Date().toISOString()
          })

        if (clickError) {
          console.error('Failed to track click:', clickError)
        }

        // Update click count
        const { error: updateError } = await supabase
          .from('links')
          .update({ click_count: (link.click_count || 0) + 1 })
          .eq('id', link.id)

        if (updateError) {
          console.error('Failed to update click count:', updateError)
        }

        // Redirect to destination
        setStatus('redirecting')
        setTimeout(() => {
          window.location.href = link.original_url
        }, 1000)

      } catch (err) {
        console.error('Redirect error:', err)
        setStatus('error')
        setError('An error occurred while processing the redirect')
      }
    }

    if (shortCode) {
      handleRedirect()
    }
  }, [shortCode])

  const renderStatus = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Loading...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Preparing your redirect
            </p>
          </div>
        )

      case 'redirecting':
        return (
          <div className="text-center">
            <div className="animate-pulse w-12 h-12 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Redirecting...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Taking you to your destination
            </p>
          </div>
        )

      case 'not_found':
      case 'expired':
      case 'limit_reached':
      case 'error':
        return (
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {status === 'not_found' ? 'Link Not Found' :
               status === 'expired' ? 'Link Expired' :
               status === 'limit_reached' ? 'Click Limit Reached' :
               'Error'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Go to Homepage
            </a>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Nanhi.Links
            </h1>
          </div>
          
          {renderStatus()}
        </div>
      </div>
    </div>
  )
}

export default LinkRedirect
