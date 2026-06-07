import { Sparkles, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ASC_LOCALES } from '@/services/appStoreConnectService'
import { PROVIDERS } from '@/services/translationService'

export function AscTranslationSettings({
  selectedVersion,
  versionLocalizations,
  aiConfig,
  currentAiModel,
  currentAiApiKey,
  sourceLocale,
  setSourceLocale,
  TRANSLATABLE_FIELDS,
  fieldsToTranslate,
  handleFieldToggle,
  targetLocales,
  availableTargetLocales,
  setTargetLocales,
  existingLocales,
  handleLocaleToggle,
  handleTranslate,
  isTranslating,
  translationProgress,
  translationAlert,
  setTranslationAlert
}) {
  if (!selectedVersion || versionLocalizations.length === 0) return null

  return (
    <Card id="asc-translation" className="border-border/50 shadow-sm scroll-mt-6">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">AI Translation</CardTitle>
            <CardDescription>Auto-translate metadata to other languages</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* AI Provider Info */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
          <span className="text-sm text-muted-foreground">Using:</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background">
            <span className="text-sm font-medium">{PROVIDERS[aiConfig.provider]?.name || aiConfig.provider}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">
              {currentAiModel?.includes('inference-profile/')
                ? currentAiModel.split('/').pop().replace('global.anthropic.', '').replace(/-v\d+:\d+$/, '')
                : currentAiModel || 'No model'}
            </span>
          </div>
          {!currentAiApiKey && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-medium ml-auto">
              <AlertCircle className="h-3.5 w-3.5" />
              Configure API key in sidebar
            </div>
          )}
        </div>

        {/* Source Locale */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Source Language</Label>
          <select
            value={sourceLocale}
            onChange={(e) => setSourceLocale(e.target.value)}
            className="w-full h-10 rounded-lg border border-input bg-background px-4 text-sm font-medium max-w-xs focus:border-primary/50 focus:outline-none transition-colors"
          >
            {versionLocalizations.map(loc => {
              const localeInfo = ASC_LOCALES.find(l => l.code === loc.locale)
              return (
                <option key={loc.locale} value={loc.locale}>
                  {localeInfo?.flag} {localeInfo?.name || loc.locale}
                </option>
              )
            })}
          </select>
        </div>

        {/* Fields to translate */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Fields to Translate</Label>
          <div className="flex flex-wrap gap-2">
            {TRANSLATABLE_FIELDS.map(field => {
              const isSelected = fieldsToTranslate.includes(field.key)
              return (
                <button
                  key={field.key}
                  onClick={() => handleFieldToggle(field.key)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200
                    ${isSelected
                      ? 'border-primary bg-primary/10 text-foreground shadow-sm'
                      : 'border-border/50 bg-background hover:border-border hover:bg-muted/30'
                    }
                  `}
                >
                  <div className={`
                    flex h-4 w-4 items-center justify-center rounded border-2 transition-all
                    ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'}
                  `}>
                    {isSelected && (
                      <svg className="h-2.5 w-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span>{field.label}</span>
                  <span className="text-xs text-muted-foreground">({field.limit})</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Target Locales */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Target Languages</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (targetLocales.length === availableTargetLocales.length) {
                  setTargetLocales([])
                } else {
                  setTargetLocales(availableTargetLocales.map(l => l.code))
                }
              }}
              className="h-9"
            >
              {targetLocales.length === availableTargetLocales.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {availableTargetLocales.map(locale => {
              const exists = existingLocales.includes(locale.code)
              const isSelected = targetLocales.includes(locale.code)
              return (
                <button
                  key={locale.code}
                  onClick={() => handleLocaleToggle(locale.code)}
                  className={`
                    flex items-center gap-2 p-3 rounded-xl border text-left transition-all duration-200
                    ${isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : exists
                        ? 'border-success/30 bg-success/5 hover:border-success/50'
                        : 'border-border/50 bg-background hover:border-border hover:bg-muted/30'
                    }
                  `}
                >
                  <div className={`
                    flex h-4 w-4 items-center justify-center rounded border-2 transition-all
                    ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'}
                  `}>
                    {isSelected && (
                      <svg className="h-2.5 w-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-lg">{locale.flag}</span>
                  <span className="text-sm font-medium flex-1">{locale.name}</span>
                  {exists && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                      <CheckCircle2 className="h-3 w-3" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Translate Button */}
        <Button
          onClick={handleTranslate}
          disabled={isTranslating || !currentAiApiKey || targetLocales.length === 0 || fieldsToTranslate.length === 0}
          className="w-full h-12 text-base font-semibold gradient-primary border-0"
          size="lg"
        >
          {isTranslating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Translate to {targetLocales.length} language{targetLocales.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>

        {/* Progress */}
        {isTranslating && (
          <div className="space-y-4 p-5 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium">Translation in progress</span>
              </div>
              <span className="text-sm font-mono text-muted-foreground">{translationProgress.current} / {translationProgress.total}</span>
            </div>
            <div className="relative h-3 rounded-full bg-background overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full gradient-primary transition-all duration-300"
                style={{ width: `${(translationProgress.current / translationProgress.total) * 100}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{translationProgress.status}</p>
          </div>
        )}

        {/* Translation Complete Alert */}
        {translationAlert.show && (
          <div className={`relative flex items-start gap-3 p-4 rounded-xl border ${translationAlert.success ? 'bg-success/10 border-success/20 text-success' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
            {translationAlert.success ? <CheckCircle2 className="h-5 w-5 mt-0.5" /> : <AlertCircle className="h-5 w-5 mt-0.5" />}
            <div className="flex-1">
              <p className="font-semibold">{translationAlert.success ? 'Success!' : 'Completed with errors'}</p>
              <p className="text-sm opacity-80">{translationAlert.message}</p>
            </div>
            <button
              onClick={() => setTranslationAlert(prev => ({ ...prev, show: false }))}
              className="p-1 rounded-lg hover:bg-background/50 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
