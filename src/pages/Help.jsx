import React, { useState } from 'react'
import { Search, HelpCircle, Book, MessageCircle, Mail, ExternalLink, Code, Key, Globe, Zap, Shield, BarChart3, Users, Database, Server } from 'lucide-react'

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('faq')

  const faqs = [
    {
      id: 1,
      question: 'How do I create a short link?',
      answer: 'To create a short link, go to the Links page and click "Create Link". Enter your original URL, optionally customize the short URL, and click "Create Link".'
    },
    {
      id: 2,
      question: 'Can I customize my short URLs?',
      answer: 'Yes! When creating a link, you can specify a custom alias instead of using our randomly generated one. Custom aliases must be unique and follow our naming guidelines.'
    },
    {
      id: 3,
      question: 'How do I track link performance?',
      answer: 'Visit the Analytics page to see detailed statistics about your links, including clicks, geographic data, device information, and more.'
    },
    {
      id: 4,
      question: 'What is link filtering?',
      answer: 'Link filtering allows you to control who can access your links based on criteria like geographic location, device type, or time of day.'
    },
    {
      id: 5,
      question: 'How do I add a custom domain?',
      answer: 'Go to the Domains page, click "Add Domain", enter your domain name, and follow the DNS setup instructions. We\'ll verify your domain automatically.'
    },
    {
      id: 6,
      question: 'Can I integrate with other tools?',
      answer: 'Yes! We offer integrations with popular tools like Google Analytics, Slack, Zapier, and more. Check the Integrations page for available options.'
    }
  ]

  const apiGuide = {
    gettingStarted: {
      title: 'Getting Started with Nanhi.Links API',
      content: [
        {
          title: 'Authentication',
          description: 'All API requests require authentication using an API key.',
          code: `// Include API key in headers
X-API-Key: your_api_key_here

// Or as query parameter
?api_key=your_api_key_here`
        },
        {
          title: 'Base URL',
          description: 'All API endpoints are relative to the base URL:',
          code: 'https://api.nanhi.link/api'
        },
        {
          title: 'Rate Limits',
          description: 'API requests are limited to 100 requests per 15 minutes per IP address.',
          code: `// Rate limit headers in response
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200`
        }
      ]
    },
    endpoints: {
      title: 'API Endpoints',
      content: [
        {
          title: 'Create Short Link',
          description: 'Create a new short link',
          method: 'POST',
          endpoint: '/links',
          code: `curl -X POST https://api.nanhi.link/api/links \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/very-long-url",
    "title": "My Example Link",
    "custom_code": "my-link"
  }'`
        },
        {
          title: 'Get Links',
          description: 'Retrieve your links with pagination',
          method: 'GET',
          endpoint: '/links',
          code: `curl -X GET "https://api.nanhi.link/api/links?page=1&limit=20" \\
  -H "X-API-Key: your_api_key_here"`
        },
        {
          title: 'Get Link Analytics',
          description: 'Retrieve detailed analytics for a specific link',
          method: 'GET',
          endpoint: '/links/:id/analytics',
          code: `curl -X GET "https://api.nanhi.link/api/links/uuid-here/analytics?period=30d" \\
  -H "X-API-Key: your_api_key_here"`
        },
        {
          title: 'Update Link',
          description: 'Update an existing link',
          method: 'PUT',
          endpoint: '/links/:id',
          code: `curl -X PUT https://api.nanhi.link/api/links/uuid-here \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Updated Title",
    "is_active": false
  }'`
        },
        {
          title: 'Delete Link',
          description: 'Delete a link permanently',
          method: 'DELETE',
          endpoint: '/links/:id',
          code: `curl -X DELETE https://api.nanhi.link/api/links/uuid-here \\
  -H "X-API-Key: your_api_key_here"`
        },
        {
          title: 'Bulk Create Links',
          description: 'Create multiple links in a single request (max 100)',
          method: 'POST',
          endpoint: '/links/bulk',
          code: `curl -X POST https://api.nanhi.link/api/links/bulk \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "links": [
      {
        "url": "https://example1.com",
        "title": "Link 1"
      },
      {
        "url": "https://example2.com", 
        "title": "Link 2"
      }
    ]
  }'`
        }
      ]
    },
    sdks: {
      title: 'SDKs & Libraries',
      content: [
        {
          title: 'JavaScript/Node.js',
          description: 'Use our JavaScript SDK for easy integration',
          code: `const NanhiLinks = require('nanhi-links-sdk');

const client = new NanhiLinks({
  apiKey: 'your_api_key_here',
  baseUrl: 'https://api.nanhi.link/api'
});

// Create a short link
const link = await client.links.create({
  url: 'https://example.com/very-long-url',
  title: 'My Example Link'
});

console.log(link.short_url); // https://nanhi.link/abc123`
        },
        {
          title: 'Python',
          description: 'Python SDK for server-side applications',
          code: `from nanhi_links import NanhiLinksClient

client = NanhiLinksClient(api_key='your_api_key_here')

# Create a short link
link = client.links.create(
    url='https://example.com/very-long-url',
    title='My Example Link'
)

print(link.short_url)  # https://nanhi.link/abc123`
        },
        {
          title: 'PHP',
          description: 'PHP SDK for web applications',
          code: `<?php
require_once 'vendor/autoload.php';

use NanhiLinks\\Client;

$client = new Client('your_api_key_here');

// Create a short link
$link = $client->links->create([
    'url' => 'https://example.com/very-long-url',
    'title' => 'My Example Link'
]);

echo $link->short_url; // https://nanhi.link/abc123
?>`
        }
      ]
    },
    webhooks: {
      title: 'Webhooks',
      content: [
        {
          title: 'Webhook Events',
          description: 'Configure webhooks to receive real-time notifications',
          code: `// Supported events:
- link.created: New link created
- link.clicked: Link was clicked  
- link.updated: Link was updated
- link.deleted: Link was deleted`
        },
        {
          title: 'Webhook Payload',
          description: 'Example webhook payload for link.clicked event',
          code: `{
  "event": "link.clicked",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "link": {
      "id": "uuid-here",
      "short_code": "abc123",
      "url": "https://example.com"
    },
    "click": {
      "country": "United States",
      "device": "Desktop", 
      "referrer": "Google"
    }
  }
}`
        }
      ]
    },
    errors: {
      title: 'Error Handling',
      content: [
        {
          title: 'Error Response Format',
          description: 'All errors follow a consistent format',
          code: `{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_ERROR_CODE"
}`
        },
        {
          title: 'Common Error Codes',
          description: 'Standard error codes you may encounter',
          code: `MISSING_API_KEY: API key not provided
INVALID_API_KEY: API key is invalid or expired
RATE_LIMIT_EXCEEDED: Too many requests
MISSING_URL: Required URL parameter not provided
INVALID_URL: URL format is invalid
CODE_EXISTS: Custom short code already exists
LINK_NOT_FOUND: Requested link not found
INTERNAL_ERROR: Internal server error`
        },
        {
          title: 'HTTP Status Codes',
          description: 'Standard HTTP status codes used by the API',
          code: `200 OK: Request successful
201 Created: Resource created successfully
400 Bad Request: Invalid request parameters
401 Unauthorized: Authentication required or failed
404 Not Found: Resource not found
409 Conflict: Resource conflict (e.g., duplicate short code)
429 Too Many Requests: Rate limit exceeded
500 Internal Server Error: Server error`
        }
      ]
    }
  }

  const resources = [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics of using Nanhi.Links',
      icon: Book,
      link: '#'
    },
    {
      title: 'API Documentation',
      description: 'Complete API reference and examples',
      icon: Code,
      link: '/api/docs'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      icon: ExternalLink,
      link: '#'
    },
    {
      title: 'Best Practices',
      description: 'Tips for optimizing your link strategy',
      icon: Book,
      link: '#'
    }
  ]

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const renderApiSection = () => {
    const section = apiGuide[activeSection]
    if (!section) return null

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {section.title}
        </h3>
        {section.content.map((item, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                {item.method && (
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    item.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    item.method === 'POST' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    item.method === 'PUT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    item.method === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {item.method}
                  </span>
                )}
                <span>{item.title}</span>
                {item.endpoint && (
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {item.endpoint}
                  </code>
                )}
              </h4>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-3">{item.description}</p>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{item.code}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(item.code)}
                className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                title="Copy to clipboard"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help Center</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Find answers to common questions and get support
        </p>
      </div>

      {/* Search */}
      <div className="card p-6 mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Section Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'faq', label: 'FAQ', icon: HelpCircle },
              { id: 'gettingStarted', label: 'API Getting Started', icon: Key },
              { id: 'endpoints', label: 'API Endpoints', icon: Code },
              { id: 'sdks', label: 'SDKs & Libraries', icon: Book },
              { id: 'webhooks', label: 'Webhooks', icon: Zap },
              { id: 'errors', label: 'Error Handling', icon: Shield }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSection === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            {activeSection === 'faq' ? (
              <>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <details key={faq.id} className="group">
                      <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {faq.question}
                        </span>
                        <HelpCircle className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform duration-200" />
                      </summary>
                      <div className="mt-3 p-4 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </>
            ) : (
              renderApiSection()
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Support */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Need More Help?
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30">
                <MessageCircle className="w-5 h-5" />
                <span>Live Chat</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                <Mail className="w-5 h-5" />
                <span>Email Support</span>
              </button>
            </div>
          </div>

          {/* Resources */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resources
            </h3>
            <div className="space-y-3">
              {resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.link}
                  className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <resource.icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{resource.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {resource.description}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Status
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">All systems operational</span>
            </div>
            <a href="/status" className="text-sm text-purple-600 dark:text-purple-400 hover:underline mt-2 inline-block">
              View status page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help
