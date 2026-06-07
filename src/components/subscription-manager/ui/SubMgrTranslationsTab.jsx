import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { TabsContent } from '@/components/ui/tabs'
import {
  Sparkles, Globe, AlertCircle, CheckCircle2, Loader2, TrendingUp, Download
} from 'lucide-react'
import { SUBSCRIPTION_TEMPLATES } from '@/services/subscriptionTranslationService'
import { SUBSCRIPTION_PERIODS } from '@/services/subscriptionPricingService'
import { SUPPORTED_LANGUAGES } from '@/services/translationService'

export function SubMgrTranslationsTab({
  applyTemplate,
  subscriptionName,
  setSubscriptionName,
  subscriptionDescription,
  setSubscriptionDescription,
  selectedPeriods,
  togglePeriod,
  selectedLocales,
  toggleLocale,
  setSelectedLocales,
  currentApiKey,
  handleGenerateTranslations,
  isTranslating,
  localizations,
  selectedSubscription,
  handlePushToASC,
  isLoading,
  translationProgress,
  handleExportJSON,
  handleExportASC
}) {
  return (
    <TabsContent value="translations" className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Subscription Metadata</CardTitle>
                <CardDescription>Configure your subscription details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Quick Templates</Label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(SUBSCRIPTION_TEMPLATES).map(key => (
                  <Button key={key} variant="outline" size="sm" onClick={() => applyTemplate(key)} className="capitalize">
                    {key}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={subscriptionName}
                onChange={(e) => setSubscriptionName(e.target.value)}
                placeholder="Premium"
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground">{subscriptionName.length}/30 characters</p>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={subscriptionDescription}
                onChange={(e) => setSubscriptionDescription(e.target.value)}
                placeholder="Unlock all premium features"
                maxLength={45}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">{subscriptionDescription.length}/45 characters</p>
            </div>

            <div className="space-y-2">
              <Label>Subscription Periods</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(SUBSCRIPTION_PERIODS).map(([key, period]) => (
                  <div
                    key={key}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedPeriods.includes(key) ? 'border-primary/50 bg-primary/5' : 'border-border/50 hover:border-border'
                    }`}
                    onClick={() => togglePeriod(key)}
                  >
                    <Checkbox checked={selectedPeriods.includes(key)} onCheckedChange={() => togglePeriod(key)} />
                    <span className="text-sm">{period.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10">
                <Globe className="h-5 w-5 text-info" />
              </div>
              <div>
                <CardTitle className="text-lg">Target Languages</CardTitle>
                <CardDescription>Select languages for translation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_LANGUAGES.map(lang => (
                  <div
                    key={lang.code}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedLocales.includes(lang.code) ? 'border-primary/50 bg-primary/5' : 'border-border/50 hover:border-border'
                    }`}
                    onClick={() => toggleLocale(lang.code)}
                  >
                    <Checkbox checked={selectedLocales.includes(lang.code)} onCheckedChange={() => toggleLocale(lang.code)} />
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm">{lang.name}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <span className="text-sm text-muted-foreground">{selectedLocales.length} selected</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedLocales(SUPPORTED_LANGUAGES.map(l => l.code))}>All</Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedLocales([])}>Clear</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Button */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              {!currentApiKey ? (
                <div className="flex items-center gap-2 text-warning">
                  <AlertCircle className="h-5 w-5" />
                  <span>Configure your AI provider in the sidebar</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Ready: {selectedPeriods.length} periods × {selectedLocales.length} languages</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="lg"
                onClick={handleGenerateTranslations}
                disabled={!currentApiKey || isTranslating || selectedLocales.length === 0 || selectedPeriods.length === 0}
              >
                {isTranslating ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Translating...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" />Generate</>
                )}
              </Button>
              {localizations && selectedSubscription && (
                <Button size="lg" variant="outline" onClick={handlePushToASC} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                  Push to ASC
                </Button>
              )}
            </div>
          </div>
          {isTranslating && (
            <div className="mt-4 space-y-2">
              <Progress value={(translationProgress.current / translationProgress.total) * 100} />
              <p className="text-sm text-muted-foreground text-center">{translationProgress.current} / {translationProgress.total}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {localizations && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Generated Localizations</CardTitle>
                <CardDescription>
                  {Object.keys(localizations.subscriptions).length} periods × {Object.keys(localizations.subscriptions[Object.keys(localizations.subscriptions)[0]] || {}).length} languages
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportJSON}>
                  <Download className="h-4 w-4 mr-2" />JSON
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportASC}>
                  <Download className="h-4 w-4 mr-2" />ASC
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {Object.entries(localizations.subscriptions).map(([period, translations]) => (
                  <div key={period} className="p-4 rounded-lg border border-border/50">
                    <h4 className="font-medium mb-3 capitalize">{period}</h4>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(translations).map(([locale, fields]) => (
                        <div key={locale} className="p-3 rounded-lg bg-muted/30">
                          <Badge variant="outline" className="mb-2">{locale}</Badge>
                          <p className="font-medium text-sm">{fields.displayName}</p>
                          <p className="text-xs text-muted-foreground">{fields.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  )
}
