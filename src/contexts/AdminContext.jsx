import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AdminContext = createContext({})

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)
  const [currentAdminPassword, setCurrentAdminPassword] = useState('sureto_admin_2024')

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const adminKey = localStorage.getItem('admin_key')
      const storedPassword = localStorage.getItem('admin_password') || 'sureto_admin_2024'
      setCurrentAdminPassword(storedPassword)
      
      if (adminKey === storedPassword) {
        setIsAdmin(true)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    } finally {
      setAdminLoading(false)
    }
  }

  const adminLogin = async (password) => {
    const storedPassword = localStorage.getItem('admin_password') || 'sureto_admin_2024'
    if (password === storedPassword) {
      localStorage.setItem('admin_key', storedPassword)
      setIsAdmin(true)
      return true
    }
    return false
  }

  const changeAdminPassword = async (currentPassword, newPassword) => {
    const storedPassword = localStorage.getItem('admin_password') || 'sureto_admin_2024'
    
    if (currentPassword !== storedPassword) {
      throw new Error('Current password is incorrect')
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long')
    }

    // Update stored password
    localStorage.setItem('admin_password', newPassword)
    localStorage.setItem('admin_key', newPassword)
    setCurrentAdminPassword(newPassword)
    
    return true
  }

  const adminLogout = () => {
    localStorage.removeItem('admin_key')
    setIsAdmin(false)
  }

  // Admin database queries
  const getAllUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  const getAllProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:user_id (name, email),
        links (count)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  const getAllLinks = async () => {
    const { data, error } = await supabase
      .from('links')
      .select(`
        *,
        profiles:user_id (name, email),
        projects:project_id (name)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  const getAllClicks = async () => {
    const { data, error } = await supabase
      .from('clicks')
      .select(`
        *,
        links:link_id (short_code, original_url, profiles:user_id (name, email))
      `)
      .order('clicked_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  const getAdminStats = async () => {
    const [usersResult, projectsResult, linksResult, clicksResult] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('projects').select('id', { count: 'exact' }),
      supabase.from('links').select('id', { count: 'exact' }),
      supabase.from('clicks').select('id', { count: 'exact' })
    ])

    return {
      totalUsers: usersResult.count || 0,
      totalProjects: projectsResult.count || 0,
      totalLinks: linksResult.count || 0,
      totalClicks: clicksResult.count || 0
    }
  }

  const deleteUser = async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
    
    if (error) throw error
  }

  const deleteProject = async (projectId) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
    
    if (error) throw error
  }

  const deleteLink = async (linkId) => {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', linkId)
    
    if (error) throw error
  }

  const toggleLinkStatus = async (linkId, isActive) => {
    const { error } = await supabase
      .from('links')
      .update({ is_active: isActive })
      .eq('id', linkId)
    
    if (error) throw error
  }

  const value = {
    isAdmin,
    adminLoading,
    adminLogin,
    adminLogout,
    changeAdminPassword,
    currentAdminPassword,
    getAllUsers,
    getAllProjects,
    getAllLinks,
    getAllClicks,
    getAdminStats,
    deleteUser,
    deleteProject,
    deleteLink,
    toggleLinkStatus
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}
