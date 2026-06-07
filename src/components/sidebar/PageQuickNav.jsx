/**
 * PageQuickNav — renders the contextual anchor-scroll quick-nav links
 * shown below the main nav items when a specific page is active.
 */

export function PageQuickNav({ items }) {
  const handleScrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="mt-3 ml-3 pl-3 border-l-2 border-primary/20 space-y-1 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:pl-0">
      {items.map((item) => {
        const NavIcon = item.Icon
        return (
          <button
            key={item.id}
            onClick={() => handleScrollTo(item.id)}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
          >
            <NavIcon className="h-3.5 w-3.5 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
