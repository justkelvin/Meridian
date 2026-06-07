/**
 * SidebarNavItem — renders a single navigation button in the sidebar.
 * Accepts an active state and click handler; handles active indicator dot.
 */

import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

export function SidebarNavItem({ label, tooltip, Icon, isActive, onClick }) {
  const NavIcon = Icon
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        onClick={onClick}
        tooltip={tooltip}
        className={`rounded-xl h-11 px-3 transition-all duration-200 ${
          isActive
            ? 'bg-primary/10 text-primary font-medium shadow-sm'
            : 'hover:bg-muted/50'
        }`}
      >
        <NavIcon
          className={`h-5 w-5 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7 ${
            isActive ? 'text-primary' : ''
          }`}
        />
        <span className="group-data-[collapsible=icon]:hidden">{label}</span>
        {isActive && (
          <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse group-data-[collapsible=icon]:hidden" />
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
