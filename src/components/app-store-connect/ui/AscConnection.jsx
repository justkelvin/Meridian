import { CheckCircle2, AlertCircle, Clock, Link2, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function AscConnection({
  credentials,
  hasStoredKey,
  unlockPassword,
  setUnlockPassword,
  handleUnlockKey,
  isUnlocking,
  unlockError,
  isConnecting,
  canConnect,
  apps,
  handleTestConnection,
  connectionStatus,
  sessionTimeLeft,
  formatTimeLeft
}) {
  return (
    <Card id="asc-connection" className="border-border/50 shadow-sm card-hover scroll-mt-6">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10">
            <Link2 className="h-5 w-5 text-info" />
          </div>
          <div>
            <CardTitle className="text-lg">Connect to App Store</CardTitle>
            <CardDescription>Configure credentials in the sidebar, then connect</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          {credentials.keyId ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Key ID set
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              No Key ID
            </div>
          )}
          {credentials.issuerId ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Issuer ID set
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              No Issuer ID
            </div>
          )}
          {credentials.privateKey ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Private key loaded
            </div>
          ) : hasStoredKey ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-info/10 text-info text-xs font-medium">
              <Clock className="h-3.5 w-3.5" />
              Key encrypted
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              No .p8 key
            </div>
          )}
        </div>
        
        {/* Unlock encrypted key inline */}
        {!credentials.privateKey && hasStoredKey && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-info/5 border border-info/20">
            <Input
              type="password"
              placeholder="Enter password to unlock key..."
              value={unlockPassword}
              onChange={(e) => {
                setUnlockPassword(e.target.value)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlockKey()}
              className="h-9 text-sm flex-1 max-w-[250px]"
            />
            <Button
              size="sm"
              onClick={handleUnlockKey}
              disabled={isUnlocking}
              className="h-9"
            >
              {isUnlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unlock'}
            </Button>
            {unlockError && <span className="text-xs text-destructive">{unlockError}</span>}
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <Button
            onClick={handleTestConnection}
            disabled={isConnecting || !canConnect}
            className={apps.length > 0 ? '' : 'gradient-primary border-0'}
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : apps.length > 0 ? 'Reconnect' : 'Connect to App Store'}
          </Button>
          {connectionStatus && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${connectionStatus.success ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              {connectionStatus.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span className="text-sm font-medium">{connectionStatus.message}</span>
            </div>
          )}
          {sessionTimeLeft > 0 && !credentials.privateKey && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium font-mono">
              <Clock className="h-3.5 w-3.5" />
              {formatTimeLeft(sessionTimeLeft)}
            </div>
          )}
        </div>
        {!canConnect && (
          <p className="text-sm text-muted-foreground px-4 py-3 rounded-lg bg-muted/30 border border-border/50">
            Configure your App Store Connect credentials in the sidebar to get started.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
