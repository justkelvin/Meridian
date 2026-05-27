import { createContext, useContext } from 'react'

export const ThemeContext = createContext({
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'dark'
})

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
