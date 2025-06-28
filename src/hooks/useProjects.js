import { useState, useEffect } from 'react'
import { projectService } from '../services/projectService'
import toast from 'react-hot-toast'

export const useProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await projectService.getUserProjects()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  // Create new project
  const createProject = async (projectData) => {
    try {
      setLoading(true)
      const newProject = await projectService.createProject(projectData)
      
      // Add to beginning of projects array
      setProjects(prev => [newProject, ...prev])
      toast.success('Project created successfully!')
      
      return newProject
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error(error.message || 'Failed to create project')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update project
  const updateProject = async (projectId, updates) => {
    try {
      setLoading(true)
      const updatedProject = await projectService.updateProject(projectId, updates)
      
      // Update in projects array
      setProjects(prev => prev.map(project => 
        project.id === projectId ? updatedProject : project
      ))
      toast.success('Project updated successfully!')
      
      return updatedProject
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error(error.message || 'Failed to update project')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Delete project
  const deleteProject = async (projectId) => {
    try {
      setLoading(true)
      await projectService.deleteProject(projectId)
      
      // Remove from projects array
      setProjects(prev => prev.filter(project => project.id !== projectId))
      toast.success('Project deleted successfully!')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error(error.message || 'Failed to delete project')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Refresh projects
  const refresh = () => {
    fetchProjects()
  }

  // Initial load
  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refresh,
    fetchProjects
  }
}
