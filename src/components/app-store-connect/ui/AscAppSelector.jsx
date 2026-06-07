import { AppWindow, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function AscAppSelector({
  apps,
  selectedApp,
  handleAppSelect,
  isLoadingApps,
  versions,
  selectedVersion,
  handleVersionSelect,
  isLoadingVersions,
  setCreateVersionDialog
}) {
  if (apps.length === 0) return null

  return (
    <Card id="asc-app-version" className="border-border/50 shadow-sm card-hover scroll-mt-6">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          {selectedApp?.iconUrl ? (
            <img 
              src={selectedApp.iconUrl} 
              alt={selectedApp.name}
              className="h-10 w-10 rounded-xl shadow-sm"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <AppWindow className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <CardTitle className="text-lg">Select App & Version</CardTitle>
            <CardDescription>Choose which app version to translate</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">App</Label>
            <select
              value={selectedApp?.id || ''}
              onChange={(e) => handleAppSelect(e.target.value)}
              disabled={isLoadingApps}
              className="w-full h-10 rounded-lg border border-input bg-background px-4 text-sm font-medium focus:border-primary/50 focus:outline-none transition-colors"
            >
              <option value="">Select an app...</option>
              {apps.map(app => (
                <option key={app.id} value={app.id}>
                  {app.name} ({app.bundleId})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Version</Label>
            <div className="flex gap-2">
              <select
                value={selectedVersion?.id || ''}
                onChange={(e) => handleVersionSelect(e.target.value)}
                disabled={isLoadingVersions || !selectedApp}
                className="flex-1 h-10 rounded-lg border border-input bg-background px-4 text-sm font-medium focus:border-primary/50 focus:outline-none transition-colors"
              >
                <option value="">Select a version...</option>
                {versions.map(version => (
                  <option key={version.id} value={version.id}>
                    v{version.versionString} ({version.platform}) - {version.state}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateVersionDialog(prev => ({ ...prev, open: true }))}
                disabled={!selectedApp}
                className="h-10 w-10 p-0"
                title="Create new version"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
