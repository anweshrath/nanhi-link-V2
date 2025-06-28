import Papa from 'papaparse'
import { linkService } from './linkService'

// Batch processing service for bulk operations
export const batchService = {
  // Parse CSV file
  parseCSV(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error('CSV parsing errors: ' + results.errors.map(e => e.message).join(', ')))
          } else {
            resolve(results.data)
          }
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  },

  // Validate CSV data structure
  validateCSVData(data) {
    const errors = []
    const requiredFields = ['original_url']
    
    if (!Array.isArray(data) || data.length === 0) {
      errors.push('CSV file is empty or invalid')
      return { isValid: false, errors }
    }

    // Check if required fields exist
    const firstRow = data[0]
    requiredFields.forEach(field => {
      if (!firstRow.hasOwnProperty(field)) {
        errors.push(`Required field '${field}' is missing`)
      }
    })

    // Validate each row
    data.forEach((row, index) => {
      if (!row.original_url || !row.original_url.trim()) {
        errors.push(`Row ${index + 1}: original_url is required`)
      } else {
        try {
          new URL(row.original_url)
        } catch {
          errors.push(`Row ${index + 1}: invalid URL format`)
        }
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      validRows: data.length - errors.filter(e => e.includes('Row')).length
    }
  },

  // Process batch link creation
  async processBatchLinks(csvData, options = {}) {
    const results = {
      successful: [],
      failed: [],
      total: csvData.length
    }

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i]
      
      try {
        const linkData = {
          originalUrl: row.original_url,
          title: row.title || '',
          description: row.description || '',
          customAlias: row.custom_alias || null,
          campaignId: options.defaultCampaignId || null,
          expiresAt: row.expires_at || null,
          password: row.password || null,
          clickLimit: row.click_limit ? parseInt(row.click_limit) : null,
          geoTargeting: row.geo_targeting ? JSON.parse(row.geo_targeting) : null,
          timeTargeting: row.time_targeting ? JSON.parse(row.time_targeting) : null,
          trackingSnippets: row.tracking_snippets ? JSON.parse(row.tracking_snippets) : null,
          cloakingEnabled: row.cloaking_enabled === 'true',
          cloakPage: row.cloak_page || null
        }

        const result = await linkService.createLink(linkData)
        results.successful.push({
          row: i + 1,
          originalUrl: row.original_url,
          shortUrl: result.short_code,
          id: result.id
        })
      } catch (error) {
        results.failed.push({
          row: i + 1,
          originalUrl: row.original_url,
          error: error.message
        })
      }

      // Add small delay to prevent overwhelming the database
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return results
  },

  // Export links to CSV
  async exportLinksToCSV(links) {
    const csvData = links.map(link => ({
      short_code: link.short_code,
      original_url: link.original_url,
      title: link.title,
      description: link.description,
      total_clicks: link.total_clicks,
      unique_clicks: link.unique_clicks,
      created_at: link.created_at,
      is_active: link.is_active,
      expires_at: link.expires_at,
      campaign: link.campaigns?.name || '',
      domain: link.domains?.domain || 'sureto.click'
    }))

    return Papa.unparse(csvData)
  },

  // Generate CSV template
  generateCSVTemplate() {
    const template = [
      {
        original_url: 'https://example.com',
        title: 'Example Link',
        description: 'This is an example link',
        custom_alias: 'example123',
        expires_at: '',
        password: '',
        click_limit: '',
        geo_targeting: '',
        time_targeting: '',
        tracking_snippets: '',
        cloaking_enabled: 'false',
        cloak_page: ''
      }
    ]

    return Papa.unparse(template)
  },

  // Bulk update links
  async bulkUpdateLinks(linkIds, updates) {
    const results = {
      successful: [],
      failed: [],
      total: linkIds.length
    }

    for (const linkId of linkIds) {
      try {
        await linkService.updateLink(linkId, updates)
        results.successful.push(linkId)
      } catch (error) {
        results.failed.push({
          linkId,
          error: error.message
        })
      }
    }

    return results
  },

  // Bulk delete links
  async bulkDeleteLinks(linkIds) {
    const results = {
      successful: [],
      failed: [],
      total: linkIds.length
    }

    for (const linkId of linkIds) {
      try {
        await linkService.deleteLink(linkId)
        results.successful.push(linkId)
      } catch (error) {
        results.failed.push({
          linkId,
          error: error.message
        })
      }
    }

    return results
  }
}
