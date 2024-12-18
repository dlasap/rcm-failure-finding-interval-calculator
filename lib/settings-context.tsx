'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Settings = {
  currency: string
  darkMode: boolean
  decimalSeparator: '.' | ','
}

type SettingsContextType = {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    currency: 'EUR',
    darkMode: false,
    decimalSeparator: '.',
  })

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('settings')
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving settings:', error)
    }
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

