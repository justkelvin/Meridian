import { Image } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ASC_LOCALES } from '@/services/appStoreConnectService'

export function AscEditDialog({ editDialog, setEditDialog, handleSaveEdit }) {
  return (
    <Dialog open={editDialog.open} onOpenChange={(open) => !open && setEditDialog({ ...editDialog, open: false })}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Localization</DialogTitle>
          <DialogDescription>
            {ASC_LOCALES.find(l => l.code === editDialog.locale)?.flag}{' '}
            {ASC_LOCALES.find(l => l.code === editDialog.locale)?.name || editDialog.locale}
          </DialogDescription>
        </DialogHeader>
        {editDialog.localization && editDialog.type === 'version' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Description (max 4000 chars)</Label>
              <Textarea
                value={editDialog.localization.description}
                onChange={(e) => setEditDialog(prev => ({
                  ...prev,
                  localization: { ...prev.localization, description: e.target.value }
                }))}
                rows={6}
                maxLength={4000}
              />
              <span className="text-xs text-muted-foreground">
                {editDialog.localization.description?.length || 0}/4000
              </span>
            </div>
            <div className="space-y-2">
              <Label>What's New (max 4000 chars)</Label>
              <Textarea
                value={editDialog.localization.whatsNew}
                onChange={(e) => setEditDialog(prev => ({
                  ...prev,
                  localization: { ...prev.localization, whatsNew: e.target.value }
                }))}
                rows={4}
                maxLength={4000}
              />
              <span className="text-xs text-muted-foreground">
                {editDialog.localization.whatsNew?.length || 0}/4000
              </span>
            </div>
            <div className="space-y-2">
              <Label>Promotional Text (max 170 chars)</Label>
              <Textarea
                value={editDialog.localization.promotionalText}
                onChange={(e) => setEditDialog(prev => ({
                  ...prev,
                  localization: { ...prev.localization, promotionalText: e.target.value }
                }))}
                rows={2}
                maxLength={170}
              />
              <span className="text-xs text-muted-foreground">
                {editDialog.localization.promotionalText?.length || 0}/170
              </span>
            </div>
            <div className="space-y-2">
              <Label>Keywords (max 100 chars, comma-separated)</Label>
              <Input
                value={editDialog.localization.keywords}
                onChange={(e) => setEditDialog(prev => ({
                  ...prev,
                  localization: { ...prev.localization, keywords: e.target.value }
                }))}
                maxLength={100}
              />
              <span className="text-xs text-muted-foreground">
                {editDialog.localization.keywords?.length || 0}/100
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Support URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/support"
                  value={editDialog.localization.supportUrl || ''}
                  onChange={(e) => setEditDialog(prev => ({
                    ...prev,
                    localization: { ...prev.localization, supportUrl: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Marketing URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={editDialog.localization.marketingUrl || ''}
                  onChange={(e) => setEditDialog(prev => ({
                    ...prev,
                    localization: { ...prev.localization, marketingUrl: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>
        )}
        {editDialog.localization && editDialog.type === 'appInfo' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>App Name (max 30 chars)</Label>
              <Input
                value={editDialog.localization.name}
                onChange={(e) => setEditDialog(prev => ({
                  ...prev,
                  localization: { ...prev.localization, name: e.target.value }
                }))}
                maxLength={30}
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle (max 30 chars)</Label>
              <Input
                value={editDialog.localization.subtitle}
                onChange={(e) => setEditDialog(prev => ({
                  ...prev,
                  localization: { ...prev.localization, subtitle: e.target.value }
                }))}
                maxLength={30}
              />
            </div>
            <div className="space-y-2">
              <Label>Privacy Policy URL</Label>
              <Input
                type="url"
                placeholder="https://example.com/privacy"
                value={editDialog.localization.privacyPolicyUrl}
                onChange={(e) => setEditDialog(prev => ({
                  ...prev,
                  localization: { ...prev.localization, privacyPolicyUrl: e.target.value }
                }))}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditDialog({ ...editDialog, open: false })}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit}>
            Save to App Store Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AscCreateVersionDialog({ createVersionDialog, setCreateVersionDialog, handleCreateVersion, selectedApp }) {
  return (
    <Dialog open={createVersionDialog.open} onOpenChange={(open) => !open && setCreateVersionDialog(prev => ({ ...prev, open: false }))}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create New Version</DialogTitle>
          <DialogDescription>
            Create a new App Store version for {selectedApp?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Version Number</Label>
            <Input
              placeholder="1.0.0"
              value={createVersionDialog.versionString}
              onChange={(e) => setCreateVersionDialog(prev => ({ ...prev, versionString: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Platform</Label>
            <select
              value={createVersionDialog.platform}
              onChange={(e) => setCreateVersionDialog(prev => ({ ...prev, platform: e.target.value }))}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="IOS">iOS</option>
              <option value="MAC_OS">macOS</option>
              <option value="TV_OS">tvOS</option>
              <option value="VISION_OS">visionOS</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setCreateVersionDialog({ open: false, versionString: '', platform: 'IOS', isCreating: false })}
            disabled={createVersionDialog.isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateVersion}
            disabled={createVersionDialog.isCreating || !createVersionDialog.versionString.trim()}
          >
            {createVersionDialog.isCreating ? 'Creating...' : 'Create Version'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AscScreenshotPreviewDialog({ screenshotPreview, setScreenshotPreview }) {
  return (
    <Dialog open={screenshotPreview.open} onOpenChange={(open) => !open && setScreenshotPreview({ open: false, screenshot: null, locale: '', deviceType: '' })}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[900px] max-h-[90vh] p-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-black/40 border-white/20 text-white">
                {screenshotPreview.locale}
              </Badge>
              <Badge variant="outline" className="bg-black/40 border-white/20 text-white">
                {screenshotPreview.deviceType}
              </Badge>
            </div>
            <button
              onClick={() => setScreenshotPreview({ open: false, screenshot: null, locale: '', deviceType: '' })}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Image */}
          <div className="flex items-center justify-center bg-black/95 min-h-[60vh]">
            {screenshotPreview.screenshot?.imageAsset?.templateUrl ? (
              <img
                src={screenshotPreview.screenshot.imageAsset.templateUrl
                  .replace('{w}', '1200')
                  .replace('{h}', '2400')
                  .replace('{f}', 'png')}
                alt={screenshotPreview.screenshot.fileName}
                className="max-h-[85vh] w-auto object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-white/50 py-20">
                <Image className="h-16 w-16 mb-4" />
                <p>Image not available</p>
              </div>
            )}
          </div>

          {/* Footer with filename */}
          {screenshotPreview.screenshot?.fileName && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white/80 text-sm text-center truncate">
                {screenshotPreview.screenshot.fileName}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
