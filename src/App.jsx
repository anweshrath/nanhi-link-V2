import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Links from './pages/Links'
import Analytics from './pages/Analytics'
import Account from './pages/Account'
import Help from './pages/Help'
import APIPage from './pages/APIPage'
import Reports from './pages/Reports'
import Filters from './pages/Filters'
import Domains from './pages/Domains'
import Integrations from './pages/Integrations'
import Settings from './pages/Settings'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Main Feature Routes */}
            <Route path="/links" element={
              <ProtectedRoute>
                <Layout>
                  <Links />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/filters" element={
              <ProtectedRoute>
                <Layout>
                  <Filters />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/domains" element={
              <ProtectedRoute>
                <Layout>
                  <Domains />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/integrations" element={
              <ProtectedRoute>
                <Layout>
                  <Integrations />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/api" element={
              <ProtectedRoute>
                <Layout>
                  <APIPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* User Routes */}
            <Route path="/account" element={
              <ProtectedRoute>
                <Layout>
                  <Account />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/help" element={
              <ProtectedRoute>
                <Layout>
                  <Help />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
