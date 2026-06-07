/**
 * App.jsx — root entry point.
 *
 * ProductAppShell wires together the app-level state (provider config,
 * ASC/GP credentials, active page), renders the sidebar + header shell,
 * and delegates to page-level components.
 *
 * XCStrings workflow state and handlers live in the useXCStrings hook.
 * The XCStrings UI lives in XCStringsPage.
 * All other pages (AppStoreConnect, GooglePlayConnect, SubscriptionManager,
 * ScreenshotMaker) are imported as self-contained components.
 */

import { useState, useMemo, useEffect } from 'react'
import { Toaster } from 'sonner'
import LandingPage from './components/LandingPage'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { PROVIDERS } from './services/translationService'
import AppStoreConnect from './components/AppStoreConnect'
import GooglePlayConnect from './components/GooglePlayConnect'
import { AppSidebar } from './components/AppSidebar'
import ScreenshotMaker from './components/ScreenshotMaker'
import SubscriptionManager from './components/SubscriptionManager'
import { XCStringsPage } from './app/XCStringsPage'
import { useXCStrings } from './app/hooks/useXCStrings'
import {
  PROVIDER_CONFIG_KEY,
  ASC_CONFIG_KEY,
  ACTIVE_PAGE_KEY,
} from './app/constants'
import {
  Languages, Store, Sparkles, CheckCircle2, AlertCircle,
  Shield, Image, DollarSign, Play,
} from 'lucide-react'

// ── Page metadata (title / description / icon shown in the header) ──────────

const PAGE_META = {
  xcstrings: { title: 'XCStrings', description: 'Translate and edit string catalogs', Icon: Languages },
  appstore: { title: 'App Store Connect', description: 'Manage metadata, keywords, screenshots, and translations', Icon: Store },
  googleplay: { title: 'Google Play', description: 'Localize store listings through the Play Developer API', Icon: Play },
  screenshots: { title: 'Screenshots', description: 'Create localized app store screenshot assets', Icon: Image },
  subscriptions: { title: 'Subscriptions', description: 'Generate pricing and subscription localizations', Icon: DollarSign },
}

// ── ProductAppShell ──────────────────────────────────────────────────────────

function ProductAppShell() {
  // Navigation
  const [activePage, setActivePage] = useState(
    () => localStorage.getItem(ACTIVE_PAGE_KEY) || 'xcstrings'
  )
  useEffect(() => { localStorage.setItem(ACTIVE_PAGE_KEY, activePage) }, [activePage])

  // AI Provider config
  const [providerConfig, setProviderConfig] = useState(() => {
    const saved = localStorage.getItem(PROVIDER_CONFIG_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.apiKey && !parsed.apiKeys) {
          parsed.apiKeys = { [parsed.provider]: parsed.apiKey }
          delete parsed.apiKey
        }
        const provider = PROVIDERS[parsed.provider] ? parsed.provider : 'openai'
        return {
          provider,
          apiKeys: parsed.apiKeys || {},
          models: parsed.models || {},
          region: parsed.region || 'us-east-1',
          endpoint: parsed.endpoint || '',
          serviceTier: parsed.serviceTier || 'auto',
        }
      } catch { /* ignore */ }
    }
    return { provider: 'openai', apiKeys: {}, models: {}, region: 'us-east-1', endpoint: '', serviceTier: 'auto' }
  })
  useEffect(() => {
    localStorage.setItem(PROVIDER_CONFIG_KEY, JSON.stringify(providerConfig))
  }, [providerConfig])

  // ASC credentials (privateKey not persisted — only keyId / issuerId)
  const [ascCredentials, setAscCredentials] = useState(() => {
    const saved = localStorage.getItem(ASC_CONFIG_KEY)
    let creds = { keyId: '', issuerId: '', privateKey: '' }
    if (saved) { try { creds = JSON.parse(saved) } catch { /* ignore */ } }
    return creds
  })
  useEffect(() => {
    const toSave = { keyId: ascCredentials.keyId, issuerId: ascCredentials.issuerId, privateKey: '' }
    localStorage.setItem(ASC_CONFIG_KEY, JSON.stringify(toSave))
  }, [ascCredentials.keyId, ascCredentials.issuerId])

  // Google Play credentials (not persisted)
  const [gpCredentials, setGpCredentials] = useState({ serviceAccountJson: '' })

  // XCStrings workflow state & handlers
  const xcState = useXCStrings(providerConfig)

  // Screenshot payload derived from XCStrings data
  const screenshotLocalizationPayload = useMemo(() => {
    const { stats, xcstringsData } = xcState
    if (!xcstringsData) return null
    const baseLang = xcstringsData.sourceLanguage || 'en'
    const fromStats = stats?.languages?.length ? stats.languages : []
    const screenshotLanguages = Array.from(new Set(fromStats.length ? fromStats : [baseLang]))
    if (!screenshotLanguages.length) return null
    return {
      languages: screenshotLanguages,
      headlinesByLang: {},
      subheadlinesByLang: {},
      applyToAll: true,
    }
  }, [xcState])

  // Header metadata
  const currentApiKey = providerConfig.apiKeys[providerConfig.provider] || ''
  const currentPageMeta = PAGE_META[activePage] || PAGE_META.xcstrings
  const PageIcon = currentPageMeta.Icon
  const providerName = PROVIDERS[providerConfig.provider]?.name || 'AI Provider'
  const ascReady = ascCredentials.keyId && ascCredentials.issuerId && ascCredentials.privateKey
  const gpReady = !!gpCredentials?.serviceAccountJson

  return (
    <div className="min-h-svh bg-background">
      <Toaster position="top-right" richColors closeButton />
      <SidebarProvider>
        <AppSidebar
          activePage={activePage}
          onPageChange={setActivePage}
          providerConfig={providerConfig}
          onProviderConfigChange={setProviderConfig}
          ascCredentials={ascCredentials}
          onAscCredentialsChange={setAscCredentials}
          gpCredentials={gpCredentials}
          onGpCredentialsChange={setGpCredentials}
        />
        <SidebarInset>
          {/* ── Header ────────────────────────────────────────────────────── */}
          <header className="sticky top-0 z-20 flex min-h-16 items-center gap-4 border-b border-border/50 bg-background/80 px-6 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <PageIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold tracking-tight text-foreground">
                  {currentPageMeta.title}
                </h1>
                <p className="hidden truncate text-sm text-muted-foreground sm:block">
                  {currentPageMeta.description}
                </p>
              </div>
            </div>
            <div className="ml-auto flex min-w-0 items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground md:flex">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="max-w-36 truncate">{providerName}</span>
              </div>
              <div className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium lg:flex ${
                currentApiKey ? 'border-success/20 bg-success/10 text-success' : 'border-warning/20 bg-warning/10 text-warning'
              }`}>
                {currentApiKey ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                <span>{currentApiKey ? 'AI ready' : 'AI key needed'}</span>
              </div>
              <div className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground xl:flex">
                <Store className={ascReady ? 'h-3.5 w-3.5 text-success' : 'h-3.5 w-3.5'} />
                <Play className={gpReady ? 'h-3.5 w-3.5 text-success' : 'h-3.5 w-3.5'} />
                <span>Store credentials</span>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary sm:flex">
                <Shield className="h-3.5 w-3.5" />
                <span>Local-first</span>
              </div>
            </div>
          </header>

          {/* ── Main content ──────────────────────────────────────────────── */}
          <main className="flex-1 p-6 md:p-8 lg:p-10">
            <div className={`mx-auto space-y-8 ${activePage === 'screenshots' ? 'w-full max-w-none' : 'max-w-6xl'}`}>

              {activePage === 'appstore' && (
                <AppStoreConnect
                  credentials={ascCredentials}
                  onCredentialsChange={setAscCredentials}
                  aiConfig={providerConfig}
                />
              )}

              {activePage === 'googleplay' && (
                <GooglePlayConnect
                  credentials={gpCredentials}
                  onCredentialsChange={setGpCredentials}
                  aiConfig={providerConfig}
                />
              )}

              {/* Screenshots — kept mounted (hidden) to preserve bridge state */}
              <div className={activePage === 'screenshots' ? 'space-y-6' : 'hidden'}>
                <ScreenshotMaker
                  localizationPayload={screenshotLocalizationPayload}
                  aiConfig={providerConfig}
                  active={activePage === 'screenshots'}
                />
              </div>

              {activePage === 'subscriptions' && (
                <SubscriptionManager
                  aiConfig={providerConfig}
                  ascCredentials={ascCredentials}
                  onCredentialsChange={setAscCredentials}
                />
              )}

              {activePage === 'xcstrings' && (
                <XCStringsPage
                  providerConfig={providerConfig}
                  xcState={xcState}
                />
              )}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

// ── App root ─────────────────────────────────────────────────────────────────

function App() {
  const [isAppOpen, setIsAppOpen] = useState(false)
  if (!isAppOpen) {
    return <LandingPage onLaunch={() => setIsAppOpen(true)} />
  }
  return <ProductAppShell />
}

export default App
