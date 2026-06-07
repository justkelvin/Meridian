/**
 * AppSidebar — main navigation sidebar.
 *
 * Uses sub-components for nav items, quick-nav links, theme toggle,
 * and the credentials configuration dialog.
 *
 * Exported as a named export to preserve all existing import sites:
 *   import { AppSidebar } from './components/AppSidebar'
 */

import { useState } from 'react'
import { Globe } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { SidebarNavItem } from './sidebar/SidebarNavItem'
import { PageQuickNav } from './sidebar/PageQuickNav'
import { SidebarThemeToggle } from './sidebar/SidebarThemeToggle'
import { ConfigDialog } from './sidebar/ConfigDialog'
import { NAV_ITEMS, ASC_QUICK_NAV, GP_QUICK_NAV } from './sidebar/sidebarConfig'

export function AppSidebar({
  activePage,
  onPageChange,
  providerConfig,
  onProviderConfigChange,
  ascCredentials,
  onAscCredentialsChange,
  gpCredentials,
  onGpCredentialsChange,
}) {
  const [configOpen, setConfigOpen] = useState(false)

  return (
    <>
      <Sidebar variant="inset" collapsible="icon">
        {/* Header */}
        <SidebarHeader className="border-b border-sidebar-border/50 bg-gradient-to-b from-sidebar to-sidebar/80">
          <div className="flex items-center gap-3 px-3 py-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/90 shadow-lg shadow-primary/25 group-data-[collapsible=icon]:hidden">
              <Globe className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-base font-bold tracking-tight">Meridian</span>
              <span className="text-xs text-muted-foreground">App Store &amp; Play Store</span>
            </div>
            <SidebarTrigger className="ml-auto size-8 text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:ml-0" />
          </div>
        </SidebarHeader>

        {/* Navigation */}
        <SidebarContent className="px-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
          <SidebarGroup className="pt-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-2 mb-2">
              Tools
            </SidebarGroupLabel>
            <SidebarGroupContent className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
              <SidebarMenu className="space-y-1 group-data-[collapsible=icon]:items-center">
                {NAV_ITEMS.map((item) =>
                  item.isAction ? (
                    <SidebarNavItem
                      key={item.id}
                      id={item.id}
                      label={item.label}
                      tooltip={item.tooltip}
                      Icon={item.Icon}
                      isActive={false}
                      onClick={() => setConfigOpen(true)}
                    />
                  ) : (
                    <SidebarNavItem
                      key={item.id}
                      id={item.id}
                      label={item.label}
                      tooltip={item.tooltip}
                      Icon={item.Icon}
                      isActive={activePage === item.id}
                      onClick={() => onPageChange(item.id)}
                    />
                  )
                )}
              </SidebarMenu>

              {/* Contextual quick-nav for App Store Connect */}
              {activePage === 'appstore' && <PageQuickNav items={ASC_QUICK_NAV} />}

              {/* Contextual quick-nav for Google Play */}
              {activePage === 'googleplay' && <PageQuickNav items={GP_QUICK_NAV} />}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer — theme switcher */}
        <SidebarFooter className="border-t border-sidebar-border/50 bg-gradient-to-t from-sidebar to-transparent">
          <div className="px-4 py-4 space-y-4 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <SidebarThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Configuration dialog */}
      <ConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        providerConfig={providerConfig}
        onProviderConfigChange={onProviderConfigChange}
        ascCredentials={ascCredentials}
        onAscCredentialsChange={onAscCredentialsChange}
        gpCredentials={gpCredentials}
        onGpCredentialsChange={onGpCredentialsChange}
      />
    </>
  )
}
