import { supabase } from '../lib/supabase'

export const projectService = {
  // Create a new project
  async createProject(projectData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectData.name,
          description: projectData.description,
          destination_url: projectData.destination_url,
          color: projectData.color,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  },

  // Get user's projects - FIXED THE COMPLEX QUERY
  async getUserProjects() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error
    }
  },

  // Update project
  async updateProject(projectId, updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  },

  // Delete project
  async deleteProject(projectId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  },

  // Get project with links
  async getProjectWithLinks(projectId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          links(*)
        `)
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching project with links:', error)
      throw error
    }
  }
}
