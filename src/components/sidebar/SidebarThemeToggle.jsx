/**
 * SidebarThemeToggle — theme switcher buttons rendered in the sidebar footer.
 * Extracted to keep AppSidebar focused on layout concerns.
 */

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/components/ThemeContext'

export function SidebarThemeToggle() {
  const { theme, setTheme } = useTheme()

  const buttons = [
    { value: 'light', Icon: Sun, title: 'Light mode' },
    { value: 'dark', Icon: Moon, title: 'Dark mode' },
    { value: 'system', Icon: Monitor, title: 'System theme' },
  ]

  return (
    <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
      <span className="text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
        Theme
      </span>
      <div className="flex gap-1 group-data-[collapsible=icon]:flex-col">
        {buttons.map((btn) => {
          const ThemeIcon = btn.Icon
          return (
            <button
              key={btn.value}
              onClick={() => setTheme(btn.value)}
              className={`p-2 rounded-lg transition-all group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center ${
                theme === btn.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title={btn.title}
            >
              <ThemeIcon className="h-4 w-4 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
