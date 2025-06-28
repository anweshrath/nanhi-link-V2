import React, { createContext, useContext, useState, useEffect } from 'react'
import { linkService } from '../services/linkService'
import { clickService } from '../services/clickService'

const DataContext = createContext({})

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [links, setLinks] = useState([])
  const [clicks, setClicks] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch links and clicks in parallel
        const [linksData, clicksData] = await Promise.all([
          linkService.getUserLinks().catch(() => []),
          clickService.getUserClicks().catch(() => [])
        ])
        
        setLinks(linksData || [])
        setClicks(clicksData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        setLinks([])
        setClicks([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const value = {
    links: links || [],
    clicks: clicks || [],
    setLinks,
    setClicks,
    loading,
    setLoading,
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
