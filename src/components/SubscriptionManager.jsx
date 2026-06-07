import { useState, useMemo, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  DollarSign, Globe, TrendingUp, Sparkles, Download, Languages,
  ChevronDown, ChevronUp, BarChart3, CheckCircle2, AlertCircle, 
  Loader2, RefreshCw, Link2, Package, Edit3, Save, Database, Clock, Lock
} from 'lucide-react'
import {
  GDP_PER_CAPITA,
  generatePricingTable,
  getPricingTiersSummary,
  SUBSCRIPTION_PERIODS,
  generatePricingRecommendations,
  fetchExchangeRates
} from '@/services/subscriptionPricingService'
import {
  SUBSCRIPTION_TEMPLATES,
  generateSubscriptionLocalizations,
  exportSubscriptionLocalizations,
  exportForAppStoreConnect
} from '@/services/subscriptionTranslationService'
import {
  listSubscriptionGroups,
  getSubscriptionsInGroup,
  getSubscription,
  createSubscriptionLocalization,
  updateSubscriptionLocalization,
  getSubscriptionPricesWithDetails,
  getAvailablePricePoints,
  setSubscriptionPrice,
  deleteSubscriptionPrice,
  SUBSCRIPTION_PERIOD_NAMES,
  SUBSCRIPTION_STATES
} from '@/services/subscriptionService'
import { listApps, ASC_LOCALES, hasValidToken, getTokenTimeLeft } from '@/services/appStoreConnectService'
import { SUPPORTED_LANGUAGES } from '@/services/translationService'
import PricingChart from './PricingChart'
import { useAscUnlock } from './app-store-connect/useAscUnlock'
import { SubMgrAscTab } from './subscription-manager/ui/SubMgrAscTab'
import { SubMgrPricingTab } from './subscription-manager/ui/SubMgrPricingTab'
import { SubMgrTranslationsTab } from './subscription-manager/ui/SubMgrTranslationsTab'


export default function SubscriptionManager({ aiConfig, ascCredentials, onCredentialsChange }) {
  // ASC Connection state
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apps, setApps] = useState([])
  const [selectedApp, setSelectedApp] = useState(null)
  const [subscriptionGroups, setSubscriptionGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [subscriptions, setSubscriptions] = useState([])
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [subscriptionDetail, setSubscriptionDetail] = useState(null)
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0)

  // Encrypted key unlock (shared logic extracted to hook)
  const { hasStoredKey, unlockPassword, setUnlockPassword, isUnlocking, unlockError, handleUnlockKey } = useAscUnlock(onCredentialsChange)

  // Timer for session countdown
  useEffect(() => {
    const updateTimer = () => {
      if (ascCredentials?.keyId && ascCredentials?.issuerId) {
        setSessionTimeLeft(getTokenTimeLeft(ascCredentials.keyId, ascCredentials.issuerId))
      }
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [ascCredentials?.keyId, ascCredentials?.issuerId])

  // Format seconds to mm:ss
  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Pricing state
  const [basePrice, setBasePrice] = useState(9.99)
  const [selectedCountries] = useState(['US', 'GB', 'DE', 'FR', 'JP', 'BR', 'IN'])
  const [pricingOptions] = useState({
    minMultiplier: 0.3,
    maxMultiplier: 1.2,
    roundToNice: true
  })

  // Translation state
  const [subscriptionName, setSubscriptionName] = useState('Premium')
  const [subscriptionDescription, setSubscriptionDescription] = useState('Unlock all premium features')
  const [selectedPeriods, setSelectedPeriods] = useState(['monthly', 'annual'])
  const [selectedLocales, setSelectedLocales] = useState(['fr', 'es', 'de', 'ja'])
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationProgress, setTranslationProgress] = useState({ current: 0, total: 0 })
  const [localizations, setLocalizations] = useState(null)

  // Edit state for ASC subscriptions
  const [editingLocale, setEditingLocale] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [isSaving, setIsSaving] = useState(false)

  // Pricing comparison state
  const [currentPrices, setCurrentPrices] = useState([])
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)
  const [showPriceComparison, setShowPriceComparison] = useState(false)
  const [priceRecommendations, setPriceRecommendations] = useState(null)

  // UI state
  const [expandedTier, setExpandedTier] = useState('high')
  const [activeTab, setActiveTab] = useState('asc')
  const [error, setError] = useState(null)

  // Live GDP data state
  const [liveGDPData, setLiveGDPData] = useState(null)
  const [gdpDataSource, setGdpDataSource] = useState('IMF Estimates (2023)')
  const [isLoadingGDP, setIsLoadingGDP] = useState(false)
  const [isLiveData, setIsLiveData] = useState(false)

  // Check if ASC credentials are available (either private key or valid cached token)
  const hasPrivateKey = ascCredentials?.privateKey && ascCredentials?.privateKey.trim() !== ''
  const hasCachedToken = ascCredentials?.keyId && ascCredentials?.issuerId && hasValidToken(ascCredentials.keyId, ascCredentials.issuerId)
  const hasCredentials = ascCredentials?.keyId && ascCredentials?.issuerId && (hasPrivateKey || hasCachedToken)
  const hasBasicCredentials = ascCredentials?.keyId && ascCredentials?.issuerId

  // Fetch live exchange rates and generate pricing recommendations
  const handleRefreshGDP = useCallback(async () => {
    setIsLoadingGDP(true)
    try {
      const result = await generatePricingRecommendations(basePrice, pricingOptions)
      setLiveGDPData(result.recommendations)
      setGdpDataSource(result.exchangeRatesAvailable ? 'Live Exchange Rates' : 'Cached Data')
      setIsLiveData(result.exchangeRatesAvailable && !result.exchangeRatesCached)
    } catch (err) {
      console.error('Failed to fetch pricing data:', err)
      setError('Failed to fetch live exchange rates. Using cached data.')
    } finally {
      setIsLoadingGDP(false)
    }
  }, [basePrice, pricingOptions])

  // Load apps when credentials are available
  const handleConnect = async () => {
    if (!hasCredentials) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const appsList = await listApps(ascCredentials)
      setApps(appsList)
      setIsConnected(true)
    } catch (err) {
      setError(err.message)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Load subscription groups when app is selected
  const handleAppSelect = async (app) => {
    setSelectedApp(app)
    setSelectedGroup(null)
    setSubscriptions([])
    setSelectedSubscription(null)
    setSubscriptionDetail(null)
    setIsLoading(true)
    setError(null)

    try {
      const groups = await listSubscriptionGroups(ascCredentials, app.id)
      setSubscriptionGroups(groups)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Load subscriptions when group is selected
  const handleGroupSelect = async (group) => {
    setSelectedGroup(group)
    setSelectedSubscription(null)
    setSubscriptionDetail(null)
    setIsLoading(true)
    setError(null)

    try {
      const subs = await getSubscriptionsInGroup(ascCredentials, group.id)
      setSubscriptions(subs)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Load subscription details
  const handleSubscriptionSelect = async (sub) => {
    setSelectedSubscription(sub)
    setIsLoading(true)
    setError(null)
    setShowPriceComparison(false)
    setCurrentPrices([])
    setPriceRecommendations(null)

    try {
      const detail = await getSubscription(ascCredentials, sub.id)
      setSubscriptionDetail(detail)
      // Pre-fill translation form
      const enLoc = detail.localizations.find(l => l.locale.startsWith('en'))
      if (enLoc) {
        setSubscriptionName(enLoc.name || detail.name)
        setSubscriptionDescription(enLoc.description || '')
      }
      
      // Auto-load prices
      await loadPricesForSubscription(sub.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Load prices for a subscription (reusable)
  const loadPricesForSubscription = async (subscriptionId) => {
    setIsLoadingPrices(true)
    
    try {
      // Fetch current prices and exchange rates in parallel
      const [prices, exchangeResult] = await Promise.all([
        getSubscriptionPricesWithDetails(ascCredentials, subscriptionId),
        fetchExchangeRates()
      ])
      
      console.log('Fetched prices:', prices)
      setCurrentPrices(prices)

      // Find US price as base (territory is 2-letter code like 'US')
      const usPrice = prices.find(p => p.territory === 'US')
      console.log('US Price:', usPrice)
      
      // Use US price if available, otherwise use the basePrice state or first available price
      let basePriceUSD = basePrice
      if (usPrice && usPrice.customerPrice) {
        basePriceUSD = parseFloat(usPrice.customerPrice)
        setBasePrice(basePriceUSD)
      } else if (prices.length > 0 && prices[0].customerPrice) {
        basePriceUSD = parseFloat(prices[0].customerPrice)
        setBasePrice(basePriceUSD)
      }
      
      // Generate GDP recommendations
      const recommendations = await generatePricingRecommendations(basePriceUSD)
      console.log('GDP recommendations:', recommendations)
      
      // Get exchange rates for conversion
      const rates = exchangeResult.rates || {}
      
      // Map current prices to recommendations
      // Prices are in local currency, need to convert to USD for comparison
      const comparisonData = recommendations.recommendations.map(rec => {
        const currentPrice = prices.find(p => p.territory === rec.countryCode)
        
        // Convert local price to USD using exchange rate
        let currentPriceUSD = null
        let currentPriceLocal = null
        
        if (currentPrice?.customerPrice) {
          currentPriceLocal = parseFloat(currentPrice.customerPrice)
          const exchangeRate = rates[rec.currency] || 1
          // Convert from local currency to USD (divide by rate)
          currentPriceUSD = exchangeRate > 0 ? currentPriceLocal / exchangeRate : currentPriceLocal
        }
        
        // Check for scheduled future price
        const futurePrice = prices.find(p => 
          p.territory === rec.countryCode && 
          p.startDate && 
          new Date(p.startDate) > new Date()
        )
        
        return {
          ...rec,
          territory: rec.countryCode,
          currentPriceUSD, // Price converted to USD for comparison
          currentPriceLocal, // Original price in local currency
          currentCurrency: rec.currency,
          hasPriceSet: !!currentPrice,
          scheduledPrice: futurePrice ? parseFloat(futurePrice.customerPrice) : null,
          scheduledDate: futurePrice?.startDate || null
        }
      })

      console.log('Comparison data:', comparisonData)
      setPriceRecommendations(comparisonData)
      setShowPriceComparison(true)
    } catch (err) {
      console.error('Error loading prices:', err)
      // Don't set error - prices are optional, show recommendations anyway
      const recommendations = await generatePricingRecommendations(basePrice)
      setPriceRecommendations(recommendations.recommendations.map(rec => ({
        ...rec,
        territory: rec.countryCode,
        currentPriceUSD: null,
        currentPriceLocal: null,
        currentCurrency: null,
        hasPriceSet: false
      })))
      setShowPriceComparison(true)
    } finally {
      setIsLoadingPrices(false)
    }
  }

  // Refresh prices manually
  const handleLoadPrices = async () => {
    if (!selectedSubscription) return
    await loadPricesForSubscription(selectedSubscription.id)
  }

  // Update price for a territory
  const handleUpdatePrice = async (territory, recommendedLocalPrice, currencySymbol) => {
    if (!selectedSubscription) return
    
    setIsLoadingPrices(true)

    try {
      // Convert ISO2 to ISO3 for App Store Connect API
      const iso3Territory = ISO2_TO_ISO3[territory] || territory
      
      // Check if there's already a future price for this territory and delete it
      const existingPrices = currentPrices.filter(p => 
        p.territory === territory && p.startDate && new Date(p.startDate) > new Date()
      )
      for (const existingPrice of existingPrices) {
        await deleteSubscriptionPrice(ascCredentials, existingPrice.id)
      }
      
      // Get available price points for this territory
      const pricePoints = await getAvailablePricePoints(ascCredentials, selectedSubscription.id, [iso3Territory])
      
      // Find the smallest price point >= recommended price (round up)
      const targetPrice = recommendedLocalPrice
      let bestPoint = null

      for (const pp of pricePoints) {
        const ppPrice = parseFloat(pp.customerPrice)
        // Only consider price points >= target
        if (ppPrice >= targetPrice) {
          if (!bestPoint || ppPrice < parseFloat(bestPoint.customerPrice)) {
            bestPoint = pp
          }
        }
      }

      // If no price point >= target, take the highest available
      if (!bestPoint && pricePoints.length > 0) {
        bestPoint = pricePoints.reduce((max, pp) => 
          parseFloat(pp.customerPrice) > parseFloat(max.customerPrice) ? pp : max
        , pricePoints[0])
      }

      if (bestPoint) {
        const result = await setSubscriptionPrice(ascCredentials, selectedSubscription.id, bestPoint.id)
        toast.success(`Price scheduled for ${territory}`, {
          description: `${currencySymbol}${bestPoint.customerPrice} starting ${result.startDate}`
        })
        // Refresh prices
        await handleLoadPrices()
      } else {
        toast.error(`No suitable price point found for ${territory}`)
      }
    } catch (err) {
      toast.error('Failed to update price', { description: err.message })
    } finally {
      setIsLoadingPrices(false)
    }
  }


  // Edit localization
  const handleEditLocale = (loc) => {
    setEditingLocale(loc)
    setEditForm({ name: loc.name || '', description: loc.description || '' })
  }

  // Save localization
  const handleSaveLocalization = async () => {
    if (!editingLocale || !selectedSubscription) return
    
    setIsSaving(true)
    setError(null)

    try {
      await updateSubscriptionLocalization(ascCredentials, editingLocale.id, editForm)
      // Refresh subscription detail
      const detail = await getSubscription(ascCredentials, selectedSubscription.id)
      setSubscriptionDetail(detail)
      setEditingLocale(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Add new localization
  const handleAddLocalization = async (locale) => {
    if (!selectedSubscription) return
    
    setIsLoading(true)
    setError(null)

    try {
      await createSubscriptionLocalization(
        ascCredentials,
        selectedSubscription.id,
        locale,
        subscriptionName,
        subscriptionDescription
      )
      // Refresh subscription detail
      const detail = await getSubscription(ascCredentials, selectedSubscription.id)
      setSubscriptionDetail(detail)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate pricing table (use live data if available)
  const pricingTable = useMemo(() => {
    if (liveGDPData && liveGDPData.length > 0) {
      return liveGDPData
    }
    return generatePricingTable(basePrice, pricingOptions)
  }, [basePrice, pricingOptions, liveGDPData])

  const selectedPricing = useMemo(() => {
    return pricingTable.filter(p => selectedCountries.includes(p.countryCode))
  }, [pricingTable, selectedCountries])

  const tiersSummary = useMemo(() => {
    return getPricingTiersSummary(basePrice)
  }, [basePrice])

  const chartData = useMemo(() => {
    return selectedPricing.map(p => ({
      country: p.countryCode,
      name: p.countryName,
      price: p.price,
      gdpRatio: p.gdpRatio,
      tier: p.tier
    }))
  }, [selectedPricing])

  const togglePeriod = (period) => {
    setSelectedPeriods(prev =>
      prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]
    )
  }

  const toggleLocale = (locale) => {
    setSelectedLocales(prev =>
      prev.includes(locale) ? prev.filter(l => l !== locale) : [...prev, locale]
    )
  }

  const applyTemplate = (templateKey) => {
    const template = SUBSCRIPTION_TEMPLATES[templateKey]
    if (template) {
      setSubscriptionName(template.displayName)
      setSubscriptionDescription(template.description)
    }
  }


  // Generate AI translations
  const handleGenerateTranslations = async () => {
    const currentApiKey = aiConfig?.apiKeys?.[aiConfig?.provider]
    if (!currentApiKey) {
      setError('Please configure your AI provider in the sidebar first')
      return
    }

    setIsTranslating(true)
    setTranslationProgress({ current: 0, total: selectedLocales.length * selectedPeriods.length * 2 })

    try {
      const config = {
        baseName: subscriptionName,
        baseDescription: subscriptionDescription,
        periods: selectedPeriods,
        targetLocales: selectedLocales
      }

      const fullAiConfig = {
        provider: aiConfig.provider,
        apiKey: currentApiKey,
        model: aiConfig.models?.[aiConfig.provider] || 'gpt-4o-mini',
        region: aiConfig.region
      }

      const results = await generateSubscriptionLocalizations(
        config,
        fullAiConfig,
        setTranslationProgress
      )

      setLocalizations(results)
    } catch (err) {
      setError(`Translation failed: ${err.message}`)
    } finally {
      setIsTranslating(false)
    }
  }

  // Push translations to ASC
  const handlePushToASC = async () => {
    if (!localizations || !selectedSubscription) return
    
    setIsLoading(true)
    setError(null)
    let successCount = 0

    try {
      // For each generated locale, create or update
      for (const locale of selectedLocales) {
        const ascLocale = ASC_LOCALES.find(l => l.code.startsWith(locale) || l.code === locale)?.code || locale
        const translation = localizations.subscriptions?.monthly?.[locale]
        
        if (!translation) continue

        const existingLoc = subscriptionDetail?.localizations.find(l => l.locale === ascLocale)
        
        if (existingLoc) {
          await updateSubscriptionLocalization(ascCredentials, existingLoc.id, {
            name: translation.displayName,
            description: translation.description
          })
        } else {
          await createSubscriptionLocalization(
            ascCredentials,
            selectedSubscription.id,
            ascLocale,
            translation.displayName,
            translation.description
          )
        }
        successCount++
      }

      // Refresh
      const detail = await getSubscription(ascCredentials, selectedSubscription.id)
      setSubscriptionDetail(detail)
      setError(null)
      alert(`Successfully pushed ${successCount} localizations to App Store Connect!`)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Export functions
  const handleExportJSON = () => {
    if (!localizations) return
    const json = exportSubscriptionLocalizations(localizations)
    downloadFile(json, 'subscription-localizations.json', 'application/json')
  }

  const handleExportASC = () => {
    if (!localizations) return
    const data = exportForAppStoreConnect(localizations)
    const json = JSON.stringify(data, null, 2)
    downloadFile(json, 'asc-subscriptions.json', 'application/json')
  }

  const handleExportPricing = () => {
    const csv = generatePricingCSV()
    downloadFile(csv, 'subscription-pricing.csv', 'text/csv')
  }

  const generatePricingCSV = () => {
    const headers = ['Country', 'Code', 'Currency', 'Tier', 'GDP Ratio', 'Price']
    const rows = selectedPricing.map(p => [
      p.countryName, p.countryCode, p.currency, p.tier, p.gdpRatio.toFixed(2), p.price.toFixed(2)
    ])
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const currentApiKey = aiConfig?.apiKeys?.[aiConfig?.provider] || ''


  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl gradient-card border border-border/50 p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-success/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-success to-success/90 shadow-lg">
                <DollarSign className="h-6 w-6 text-success-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Subscriptions</h1>
                <p className="text-sm text-muted-foreground">Pricing & Translations</p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-xl">
              Manage your App Store subscriptions, optimize pricing based on GDP, and generate localized metadata.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center px-4 py-3 rounded-xl bg-background/50 border border-border/50">
              <div className="text-2xl font-bold text-success">{Object.keys(GDP_PER_CAPITA).length}</div>
              <div className="text-xs text-muted-foreground">Markets</div>
            </div>
            <div className="text-center px-4 py-3 rounded-xl bg-background/50 border border-border/50">
              <div className="text-2xl font-bold text-primary">{subscriptionGroups.length || '-'}</div>
              <div className="text-xs text-muted-foreground">Groups</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="asc" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            App Store Connect
          </TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            GDP Pricing
          </TabsTrigger>
          <TabsTrigger value="translations" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
            <Languages className="h-4 w-4" />
            AI Translations
          </TabsTrigger>
        </TabsList>


        {/* ASC Tab */}
        <SubMgrAscTab
          hasBasicCredentials={hasBasicCredentials}
          hasCredentials={hasCredentials}
          hasStoredKey={hasStoredKey}
          unlockPassword={unlockPassword}
          setUnlockPassword={setUnlockPassword}
          handleUnlockKey={handleUnlockKey}
          isUnlocking={isUnlocking}
          unlockError={unlockError}
          sessionTimeLeft={sessionTimeLeft}
          handleConnect={handleConnect}
          formatTimeLeft={formatTimeLeft}
          isLoading={isLoading}
          hasPrivateKey={hasPrivateKey}
          isConnected={isConnected}
          apps={apps}
          handleAppSelect={handleAppSelect}
          selectedApp={selectedApp}
          subscriptionGroups={subscriptionGroups}
          handleGroupSelect={handleGroupSelect}
          selectedGroup={selectedGroup}
          subscriptions={subscriptions}
          handleSubscriptionSelect={handleSubscriptionSelect}
          selectedSubscription={selectedSubscription}
          subscriptionDetail={subscriptionDetail}
          handleEditLocale={handleEditLocale}
          handleAddLocalization={handleAddLocalization}
          editingLocale={editingLocale}
          setEditingLocale={setEditingLocale}
          editForm={editForm}
          setEditForm={setEditForm}
          handleSaveLocalization={handleSaveLocalization}
          isSaving={isSaving}
          showPriceComparison={showPriceComparison}
          basePrice={basePrice}
          currentPrices={currentPrices}
          priceRecommendations={priceRecommendations}
          handleUpdatePrice={handleUpdatePrice}
          isLoadingPrices={isLoadingPrices}
          handleLoadPrices={handleLoadPrices}
        />

        {/* Pricing Tab */}
        <SubMgrPricingTab
          basePrice={basePrice}
          setBasePrice={setBasePrice}
          handleRefreshGDP={handleRefreshGDP}
          isLoadingGDP={isLoadingGDP}
          isLiveData={isLiveData}
          handleExportPricing={handleExportPricing}
          chartData={chartData}
          gdpDataSource={gdpDataSource}
          pricingTable={pricingTable}
          tiersSummary={tiersSummary}
          expandedTier={expandedTier}
          setExpandedTier={setExpandedTier}
        />


        {/* Translations Tab */}
        <SubMgrTranslationsTab
          applyTemplate={applyTemplate}
          subscriptionName={subscriptionName}
          setSubscriptionName={setSubscriptionName}
          subscriptionDescription={subscriptionDescription}
          setSubscriptionDescription={setSubscriptionDescription}
          selectedPeriods={selectedPeriods}
          togglePeriod={togglePeriod}
          selectedLocales={selectedLocales}
          toggleLocale={toggleLocale}
          setSelectedLocales={setSelectedLocales}
          currentApiKey={currentApiKey}
          handleGenerateTranslations={handleGenerateTranslations}
          isTranslating={isTranslating}
          localizations={localizations}
          selectedSubscription={selectedSubscription}
          handlePushToASC={handlePushToASC}
          isLoading={isLoading}
          translationProgress={translationProgress}
          handleExportJSON={handleExportJSON}
          handleExportASC={handleExportASC}
        />
      </Tabs>
    </div>
  )
}
