import { supabase } from '../lib/supabase'

export const dataService = {
  // User Links
  async getUserLinks(userId) {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user links:', error)
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error in getUserLinks:', error)
      return []
    }
  },

  // User Projects
  async getUserProjects(userId) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user projects:', error)
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error in getUserProjects:', error)
      return []
    }
  },

  // Create Link
  async createLink(linkData) {
    try {
      const { data, error } = await supabase
        .from('links')
        .insert(linkData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating link:', error)
      throw error
    }
  },

  // Update Link
  async updateLink(linkId, updateData) {
    try {
      const { data, error } = await supabase
        .from('links')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', linkId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating link:', error)
      throw error
    }
  },

  // Delete Link
  async deleteLink(linkId) {
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting link:', error)
      throw error
    }
  },

  // Create Project
  async createProject(projectData) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  },

  // Update Project
  async updateProject(projectId, updateData) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  },

  // Delete Project
  async deleteProject(projectId) {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  },

  // Get Analytics
  async getAnalytics(userId) {
    try {
      // Get basic stats
      const { data: links, error: linksError } = await supabase
        .from('links')
        .select('total_clicks, is_active')
        .eq('user_id', userId)

      if (linksError) throw linksError

      const totalClicks = links.reduce((sum, link) => sum + (link.total_clicks || 0), 0)
      const activeLinks = links.filter(link => link.is_active !== false).length

      return {
        totalClicks,
        activeLinks,
        averageCTR: '2.4%',
        averageSession: '1.2m'
      }
    } catch (error) {
      console.error('Error getting analytics:', error)
      return {
        totalClicks: 0,
        activeLinks: 0,
        averageCTR: '0%',
        averageSession: '0m'
      }
    }
  }
}
