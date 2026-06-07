import { Terminal, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AscLogs({ logs }) {
  return (
    <Card id="asc-logs" className="border-border/50 shadow-sm scroll-mt-6">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted-foreground/10">
            <Terminal className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">Activity Log</CardTitle>
            <CardDescription>Track API calls and events</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 rounded-xl border border-border/50 bg-muted/20">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Terminal className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No activity yet</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 text-sm py-1.5 px-3 rounded-lg transition-colors ${
                    log.type === 'error' ? 'bg-destructive/10' :
                    log.type === 'success' ? 'bg-success/10' :
                    'hover:bg-muted/50'
                  }`}
                >
                  <span className={`mt-0.5 ${
                    log.type === 'error' ? 'text-destructive' :
                    log.type === 'success' ? 'text-success' :
                    'text-muted-foreground'
                  }`}>
                    {log.type === 'error' ? <AlertCircle className="h-4 w-4" /> :
                     log.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> :
                     <Clock className="h-4 w-4" />}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground shrink-0 pt-0.5">{log.timestamp}</span>
                  <span className={`break-all ${
                    log.type === 'error' ? 'text-destructive' :
                    log.type === 'success' ? 'text-success' :
                    'text-foreground'
                  }`}>{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
