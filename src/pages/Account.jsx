import React, { useState } from 'react'
import { User, Mail, Lock, CreditCard, Bell, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Account = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Profile Information
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="John"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Doe"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email || 'user@example.com'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    placeholder="Your company name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Tell us about yourself"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Change Password
                </h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary">
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Two-Factor Authentication
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      Two-factor authentication is disabled
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button className="btn-primary">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Current Plan
                </h2>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">
                        Pro Plan
                      </h3>
                      <p className="text-purple-700 dark:text-purple-400">
                        $29/month • Billed monthly
                      </p>
                    </div>
                    <button className="btn-secondary">
                      Change Plan
                    </button>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Payment Method
                </h2>
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        •••• •••• •••• 4242
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Expires 12/25
                      </p>
                    </div>
                  </div>
                  <button className="btn-secondary">
                    Update
                  </button>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Billing History
                </h2>
                <div className="space-y-3">
                  {[
                    { date: '2024-01-01', amount: '$29.00', status: 'Paid' },
                    { date: '2023-12-01', amount: '$29.00', status: 'Paid' },
                    { date: '2023-11-01', amount: '$29.00', status: 'Paid' }
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Pro Plan
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {invoice.amount}
                        </p>
                        <p className="text-sm text-green-600">
                          {invoice.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Notification Preferences
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Email Notifications
                  </h3>
                  <div className="space-y-3">
                    {[
                      { id: 'weekly-reports', label: 'Weekly performance reports', checked: true },
                      { id: 'link-alerts', label: 'Link performance alerts', checked: true },
                      { id: 'security-alerts', label: 'Security alerts', checked: true },
                      { id: 'product-updates', label: 'Product updates and news', checked: false }
                    ].map((notification) => (
                      <div key={notification.id} className="flex items-center justify-between">
                        <label htmlFor={notification.id} className="text-gray-700 dark:text-gray-300">
                          {notification.label}
                        </label>
                        <input
                          id={notification.id}
                          type="checkbox"
                          defaultChecked={notification.checked}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Push Notifications
                  </h3>
                  <div className="space-y-3">
                    {[
                      { id: 'browser-notifications', label: 'Browser notifications', checked: false },
                      { id: 'mobile-notifications', label: 'Mobile app notifications', checked: true }
                    ].map((notification) => (
                      <div key={notification.id} className="flex items-center justify-between">
                        <label htmlFor={notification.id} className="text-gray-700 dark:text-gray-300">
                          {notification.label}
                        </label>
                        <input
                          id={notification.id}
                          type="checkbox"
                          defaultChecked={notification.checked}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button className="btn-primary">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Account
