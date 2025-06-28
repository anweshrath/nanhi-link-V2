import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Complete theme definitions
const themes = {
  modern: {
    name: 'Modern',
    fonts: {
      primary: 'Inter',
      display: 'Inter',
      mono: 'JetBrains Mono'
    },
    light: {
      bg: {
        primary: '#FFFFFF',
        secondary: '#F8FAFC',
        tertiary: '#F1F5F9',
        accent: '#EEF2FF'
      },
      text: {
        primary: '#0F172A',
        secondary: '#334155',
        tertiary: '#64748B',
        accent: '#6366F1'
      },
      border: {
        primary: '#E2E8F0',
        secondary: '#CBD5E1',
        accent: '#C7D2FE'
      },
      brand: {
        primary: '#6366F1',
        secondary: '#8B5CF6',
        tertiary: '#06B6D4'
      },
      status: {
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        info: '#0284C7'
      }
    },
    dark: {
      bg: {
        primary: '#0F172A',
        secondary: '#1E293B',
        tertiary: '#334155',
        accent: '#312E81'
      },
      text: {
        primary: '#F8FAFC',
        secondary: '#CBD5E1',
        tertiary: '#94A3B8',
        accent: '#A5B4FC'
      },
      border: {
        primary: '#334155',
        secondary: '#475569',
        accent: '#6366F1'
      },
      brand: {
        primary: '#6366F1',
        secondary: '#8B5CF6',
        tertiary: '#06B6D4'
      },
      status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      }
    }
  },
  classic: {
    name: 'Classic',
    fonts: {
      primary: 'Georgia',
      display: 'Playfair Display',
      mono: 'Courier New'
    },
    light: {
      bg: {
        primary: '#FFFEF7',
        secondary: '#FEF3C7',
        tertiary: '#FDE68A',
        accent: '#FEF3C7'
      },
      text: {
        primary: '#451A03',
        secondary: '#92400E',
        tertiary: '#B45309',
        accent: '#D97706'
      },
      border: {
        primary: '#FDE68A',
        secondary: '#FBBF24',
        accent: '#F59E0B'
      },
      brand: {
        primary: '#D97706',
        secondary: '#F59E0B',
        tertiary: '#FBBF24'
      },
      status: {
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        info: '#0284C7'
      }
    },
    dark: {
      bg: {
        primary: '#451A03',
        secondary: '#92400E',
        tertiary: '#B45309',
        accent: '#78350F'
      },
      text: {
        primary: '#FEF3C7',
        secondary: '#FDE68A',
        tertiary: '#FBBF24',
        accent: '#F59E0B'
      },
      border: {
        primary: '#92400E',
        secondary: '#B45309',
        accent: '#D97706'
      },
      brand: {
        primary: '#F59E0B',
        secondary: '#FBBF24',
        tertiary: '#FDE68A'
      },
      status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      }
    }
  },
  neon: {
    name: 'Neon',
    fonts: {
      primary: 'Orbitron',
      display: 'Orbitron',
      mono: 'Fira Code'
    },
    light: {
      bg: {
        primary: '#0A0A0A',
        secondary: '#1A1A1A',
        tertiary: '#2A2A2A',
        accent: '#1E1B4B'
      },
      text: {
        primary: '#00FFFF',
        secondary: '#FF00FF',
        tertiary: '#FFFF00',
        accent: '#00FF00'
      },
      border: {
        primary: '#7C3AED',
        secondary: '#A855F7',
        accent: '#C084FC'
      },
      brand: {
        primary: '#7C3AED',
        secondary: '#A855F7',
        tertiary: '#C084FC'
      },
      status: {
        success: '#00FF00',
        warning: '#FFFF00',
        error: '#FF0000',
        info: '#00FFFF'
      }
    },
    dark: {
      bg: {
        primary: '#000000',
        secondary: '#0F0F0F',
        tertiary: '#1F1F1F',
        accent: '#1E1B4B'
      },
      text: {
        primary: '#00FFFF',
        secondary: '#FF00FF',
        tertiary: '#FFFF00',
        accent: '#00FF00'
      },
      border: {
        primary: '#7C3AED',
        secondary: '#A855F7',
        accent: '#C084FC'
      },
      brand: {
        primary: '#7C3AED',
        secondary: '#A855F7',
        tertiary: '#C084FC'
      },
      status: {
        success: '#00FF00',
        warning: '#FFFF00',
        error: '#FF0000',
        info: '#00FFFF'
      }
    }
  },
  organic: {
    name: 'Organic',
    fonts: {
      primary: 'Nunito',
      display: 'Nunito',
      mono: 'Source Code Pro'
    },
    light: {
      bg: {
        primary: '#F7FDF7',
        secondary: '#ECFDF5',
        tertiary: '#D1FAE5',
        accent: '#A7F3D0'
      },
      text: {
        primary: '#064E3B',
        secondary: '#065F46',
        tertiary: '#047857',
        accent: '#059669'
      },
      border: {
        primary: '#A7F3D0',
        secondary: '#6EE7B7',
        accent: '#34D399'
      },
      brand: {
        primary: '#059669',
        secondary: '#10B981',
        tertiary: '#34D399'
      },
      status: {
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        info: '#0284C7'
      }
    },
    dark: {
      bg: {
        primary: '#064E3B',
        secondary: '#065F46',
        tertiary: '#047857',
        accent: '#134E4A'
      },
      text: {
        primary: '#ECFDF5',
        secondary: '#D1FAE5',
        tertiary: '#A7F3D0',
        accent: '#6EE7B7'
      },
      border: {
        primary: '#047857',
        secondary: '#059669',
        accent: '#10B981'
      },
      brand: {
        primary: '#10B981',
        secondary: '#34D399',
        tertiary: '#6EE7B7'
      },
      status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      }
    }
  },
  corporate: {
    name: 'Corporate',
    fonts: {
      primary: 'Roboto',
      display: 'Roboto',
      mono: 'Roboto Mono'
    },
    light: {
      bg: {
        primary: '#FFFFFF',
        secondary: '#F9FAFB',
        tertiary: '#F3F4F6',
        accent: '#E5E7EB'
      },
      text: {
        primary: '#111827',
        secondary: '#374151',
        tertiary: '#6B7280',
        accent: '#9CA3AF'
      },
      border: {
        primary: '#E5E7EB',
        secondary: '#D1D5DB',
        accent: '#9CA3AF'
      },
      brand: {
        primary: '#374151',
        secondary: '#4B5563',
        tertiary: '#6B7280'
      },
      status: {
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        info: '#0284C7'
      }
    },
    dark: {
      bg: {
        primary: '#111827',
        secondary: '#1F2937',
        tertiary: '#374151',
        accent: '#4B5563'
      },
      text: {
        primary: '#F9FAFB',
        secondary: '#F3F4F6',
        tertiary: '#E5E7EB',
        accent: '#D1D5DB'
      },
      border: {
        primary: '#374151',
        secondary: '#4B5563',
        accent: '#6B7280'
      },
      brand: {
        primary: '#9CA3AF',
        secondary: '#D1D5DB',
        tertiary: '#E5E7EB'
      },
      status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      }
    }
  }
}

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('modern')
  const [isDark, setIsDark] = useState(false)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const savedMode = localStorage.getItem('darkMode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme)
    }

    if (savedMode !== null) {
      setIsDark(savedMode === 'true')
    } else if (prefersDark) {
      setIsDark(true)
    }
  }, [])

  // Apply theme variables to CSS
  useEffect(() => {
    const theme = themes[currentTheme]
    const mode = isDark ? 'dark' : 'light'
    const colors = theme[mode]

    // Apply CSS variables
    const root = document.documentElement
    
    // Fonts
    root.style.setProperty('--font-primary', theme.fonts.primary)
    root.style.setProperty('--font-display', theme.fonts.display)
    root.style.setProperty('--font-mono', theme.fonts.mono)
    
    // Background colors
    root.style.setProperty('--color-bg-primary', colors.bg.primary)
    root.style.setProperty('--color-bg-secondary', colors.bg.secondary)
    root.style.setProperty('--color-bg-tertiary', colors.bg.tertiary)
    root.style.setProperty('--color-bg-accent', colors.bg.accent)
    
    // Text colors
    root.style.setProperty('--color-text-primary', colors.text.primary)
    root.style.setProperty('--color-text-secondary', colors.text.secondary)
    root.style.setProperty('--color-text-tertiary', colors.text.tertiary)
    root.style.setProperty('--color-text-accent', colors.text.accent)
    
    // Border colors
    root.style.setProperty('--color-border-primary', colors.border.primary)
    root.style.setProperty('--color-border-secondary', colors.border.secondary)
    root.style.setProperty('--color-border-accent', colors.border.accent)
    
    // Brand colors
    root.style.setProperty('--color-brand-primary', colors.brand.primary)
    root.style.setProperty('--color-brand-secondary', colors.brand.secondary)
    root.style.setProperty('--color-brand-tertiary', colors.brand.tertiary)
    
    // Status colors
    root.style.setProperty('--color-status-success', colors.status.success)
    root.style.setProperty('--color-status-warning', colors.status.warning)
    root.style.setProperty('--color-status-error', colors.status.error)
    root.style.setProperty('--color-status-info', colors.status.info)

    // Apply theme class to body
    document.body.className = `theme-${currentTheme} ${isDark ? 'dark' : 'light'}`
    
    // Apply dark class to html for Tailwind
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Save to localStorage
    localStorage.setItem('theme', currentTheme)
    localStorage.setItem('darkMode', isDark.toString())
  }, [currentTheme, isDark])

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName)
    }
  }

  const toggleDarkMode = () => {
    setIsDark(!isDark)
  }

  const value = {
    currentTheme,
    isDark,
    themes,
    changeTheme,
    toggleDarkMode,
    // Legacy support
    theme: isDark ? 'dark' : 'light',
    toggleTheme: toggleDarkMode
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
