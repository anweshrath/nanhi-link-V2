import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, Search, Trash2, Calendar, User, Link } from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'
import toast from 'react-hot-toast'

const AdminProjects = () => {
  const { getAllProjects, deleteProject } = useAdmin()
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    const filtered = projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProjects(filtered)
  }, [projects, searchTerm])

  const loadProjects = async () => {
    try {
      const data = await getAllProjects()
      setProjects(data)
      setFilteredProjects(data)
    } catch (error) {
      console.error('Error loading projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async (projectId, projectName) => {
    if (window.confirm(`Are you sure you want to delete project "${projectName}"? This will also delete all associated links.`)) {
      try {
        await deleteProject(projectId)
        toast.success('Project deleted successfully')
        loadProjects()
      } catch (error) {
        console.error('Error deleting project:', error)
        toast.error('Failed to delete project')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Project Management</h1>
          <p className="text-gray-400 mt-1">Manage all user projects</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
          <FolderOpen className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">{projects.length} Total Projects</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects by name, description, or user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: project.color || '#8B5CF6' }}
                >
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{project.name}</h3>
                  <p className="text-gray-400 text-sm">{project.profiles?.name || 'Unknown User'}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteProject(project.id, project.name)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {project.description && (
                <p className="text-gray-300 text-sm">{project.description}</p>
              )}
              
              <div className="flex items-center space-x-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  {project.profiles?.email || 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <Link className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  {project.links?.length || 0} links
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color || '#8B5CF6' }}
                  ></div>
                  <span className="text-gray-400">Project Color</span>
                </div>
                <span className="text-gray-300 font-mono text-xs">
                  {project.id.slice(0, 8)}...
                </span>
              </div>
            </div>

            {project.destination_url && (
              <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
                <p className="text-gray-400 text-xs mb-1">Destination URL</p>
                <p className="text-gray-300 text-sm truncate">{project.destination_url}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && !loading && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No projects found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'No projects have been created yet'}
          </p>
        </div>
      )}
    </div>
  )
}

export default AdminProjects
