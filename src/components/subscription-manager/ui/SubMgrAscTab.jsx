import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { TabsContent } from '@/components/ui/tabs'
import {
  DollarSign, AlertCircle, Loader2, RefreshCw, Link2, Package, 
  Edit3, Save, Clock, Lock
} from 'lucide-react'
import { SUBSCRIPTION_PERIOD_NAMES, SUBSCRIPTION_STATES } from '@/services/subscriptionService'
import { ASC_LOCALES } from '@/services/appStoreConnectService'

export function SubMgrAscTab({
  hasBasicCredentials,
  hasCredentials,
  hasStoredKey,
  unlockPassword,
  setUnlockPassword,
  handleUnlockKey,
  isUnlocking,
  unlockError,
  sessionTimeLeft,
  handleConnect,
  formatTimeLeft,
  isLoading,
  hasPrivateKey,
  isConnected,
  apps,
  handleAppSelect,
  selectedApp,
  subscriptionGroups,
  handleGroupSelect,
  selectedGroup,
  subscriptions,
  handleSubscriptionSelect,
  selectedSubscription,
  subscriptionDetail,
  handleEditLocale,
  handleAddLocalization,
  editingLocale,
  setEditingLocale,
  editForm,
  setEditForm,
  handleSaveLocalization,
  isSaving,
  showPriceComparison,
  basePrice,
  currentPrices,
  priceRecommendations,
  handleUpdatePrice,
  isLoadingPrices,
  handleLoadPrices
}) {
  return (
    <TabsContent value="asc" className="space-y-6">
      {!hasBasicCredentials ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10 mb-4">
                <AlertCircle className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-lg font-semibold mb-2">App Store Connect Not Configured</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Configure your App Store Connect credentials in the sidebar to manage your subscriptions directly.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !hasCredentials && hasStoredKey ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-info/10 mb-4">
                <Lock className="h-8 w-8 text-info" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Unlock Your Private Key</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Your .p8 key is encrypted. Enter your password to unlock it.
              </p>
              <div className="flex items-center gap-2 w-full max-w-sm">
                <Input
                  type="password"
                  placeholder="Enter password..."
                  value={unlockPassword}
                  onChange={(e) => {
                    setUnlockPassword(e.target.value)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlockKey()}
                  className="flex-1"
                />
                <Button onClick={handleUnlockKey} disabled={isUnlocking}>
                  {isUnlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unlock'}
                </Button>
              </div>
              {unlockError && <p className="text-sm text-destructive mt-2">{unlockError}</p>}
              {sessionTimeLeft > 0 && (
                <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-success/10 text-success text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Session active: {formatTimeLeft(sessionTimeLeft)}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleConnect}
                    className="ml-2"
                  >
                    Use Session
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : !hasCredentials ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10 mb-4">
                <AlertCircle className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Private Key Required</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Upload your .p8 private key in the sidebar to connect to App Store Connect.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !isConnected ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Link2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect to App Store Connect</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Fetch your subscription groups and manage localizations directly from here.
              </p>
              <div className="flex items-center gap-3">
                <Button onClick={handleConnect} disabled={isLoading} size="lg">
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Connecting...</>
                  ) : (
                    <><Link2 className="h-4 w-4 mr-2" />Connect</>
                  )}
                </Button>
                {sessionTimeLeft > 0 && !hasPrivateKey && (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-success/10 text-success text-sm font-mono">
                    <Clock className="h-4 w-4" />
                    {formatTimeLeft(sessionTimeLeft)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Apps List */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Apps</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleConnect} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-1">
                  {apps.map(app => (
                    <button
                      key={app.id}
                      onClick={() => handleAppSelect(app)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                        selectedApp?.id === app.id
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      {app.iconUrl ? (
                        <img src={app.iconUrl} alt="" className="w-8 h-8 rounded-lg" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{app.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{app.bundleId}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Subscription Groups */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Subscription Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {!selectedApp ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Select an app first</p>
                ) : subscriptionGroups.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No subscription groups found</p>
                ) : (
                  <div className="space-y-1">
                    {subscriptionGroups.map(group => (
                      <button
                        key={group.id}
                        onClick={() => handleGroupSelect(group)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          selectedGroup?.id === group.id
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <p className="text-sm font-medium">{group.referenceName}</p>
                        <p className="text-xs text-muted-foreground">
                          {group.subscriptions?.length || 0} subscriptions • {group.localizations?.length || 0} locales
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>


          {/* Subscriptions */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {!selectedGroup ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Select a group first</p>
                ) : subscriptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No subscriptions found</p>
                ) : (
                  <div className="space-y-1">
                    {subscriptions.map(sub => {
                      const stateInfo = SUBSCRIPTION_STATES[sub.state] || { label: sub.state, color: 'gray' }
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleSubscriptionSelect(sub)}
                          className={`w-full p-3 rounded-lg text-left transition-colors ${
                            selectedSubscription?.id === sub.id
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">{sub.name}</p>
                            <Badge variant="outline" className={`text-xs bg-${stateInfo.color}-500/10 text-${stateInfo.color}-500 border-${stateInfo.color}-500/20`}>
                              {stateInfo.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {sub.productId} • {SUBSCRIPTION_PERIOD_NAMES[sub.subscriptionPeriod] || sub.subscriptionPeriod}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Subscription Detail & Localizations */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Localizations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {!subscriptionDetail ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Select a subscription</p>
                ) : (
                  <div className="space-y-2">
                    {subscriptionDetail.localizations.map(loc => {
                      const localeInfo = ASC_LOCALES.find(l => l.code === loc.locale)
                      return (
                        <div
                          key={loc.id}
                          className="p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{localeInfo?.flag || '🌐'}</span>
                              <span className="text-sm font-medium">{localeInfo?.name || loc.locale}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLocale(loc)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm font-medium truncate">{loc.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{loc.description || 'No description'}</p>
                        </div>
                      )
                    })}
                    
                    {/* Add new locale button */}
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">Add localization:</p>
                      <div className="flex flex-wrap gap-1">
                        {ASC_LOCALES.filter(l => !subscriptionDetail.localizations.find(loc => loc.locale === l.code))
                          .slice(0, 6)
                          .map(locale => (
                            <Button
                              key={locale.code}
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleAddLocalization(locale.code)}
                              disabled={isLoading}
                            >
                              {locale.flag} {locale.code}
                            </Button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Localization Modal */}
      {editingLocale && (
        <Card className="border-primary/50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Edit {ASC_LOCALES.find(l => l.code === editingLocale.locale)?.name || editingLocale.locale}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setEditingLocale(null)}>×</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Display Name (max 30 chars)</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                maxLength={30}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (max 45 chars)</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                maxLength={45}
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveLocalization} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditingLocale(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Comparison Section */}
      {isConnected && selectedSubscription && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div>
                  <CardTitle className="text-lg">Price Optimization</CardTitle>
                  <CardDescription>
                    Compare current prices with GDP-based recommendations
                  </CardDescription>
                </div>
              </div>
              <Button 
                onClick={handleLoadPrices} 
                disabled={isLoadingPrices}
                variant="outline"
                size="sm"
              >
                {isLoadingPrices ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</>
                ) : (
                  <><RefreshCw className="h-4 w-4 mr-2" />Refresh</>
                )}
              </Button>
            </div>
          </CardHeader>
          
          {showPriceComparison && (
            <CardContent>
              {/* US Base Price Info */}
              <div className="mb-4 p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🇺🇸</span>
                    <span className="font-medium">Base Price (USA)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-success">${basePrice.toFixed(2)}</span>
                    {currentPrices.length === 0 && (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        Using default
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentPrices.length > 0 
                    ? `${currentPrices.length} territories with prices configured`
                    : 'No prices found in ASC. Showing recommendations based on default price.'}
                </p>
              </div>

              {/* Price Comparison Table */}
              {priceRecommendations && priceRecommendations.length > 0 ? (
                <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {priceRecommendations
                    .filter(p => p.countryCode !== 'US')
                    .map((p) => {
                      const priceDiff = p.currentPriceUSD 
                        ? ((p.currentPriceUSD - p.recommendedPriceUSD) / p.recommendedPriceUSD * 100).toFixed(0)
                        : null
                      const isOverpriced = priceDiff && parseFloat(priceDiff) > 15
                      const isUnderpriced = priceDiff && parseFloat(priceDiff) < -15
                      const isOptimal = priceDiff && Math.abs(parseFloat(priceDiff)) <= 15

                      return (
                        <div 
                          key={p.countryCode} 
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            isOverpriced ? 'border-warning/30 bg-warning/5' :
                            isUnderpriced ? 'border-info/30 bg-info/5' :
                            isOptimal ? 'border-success/30 bg-success/5' :
                            'border-border/50 hover:bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{p.flag || '🌍'}</span>
                            <div>
                              <p className="font-medium">{p.countryName}</p>
                              <p className="text-xs text-muted-foreground">
                                GDP: ${p.gdp?.toLocaleString()}/capita • {p.territory}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {/* Current Price */}
                            <div className="text-right min-w-[90px]">
                              <p className="text-xs text-muted-foreground">Current</p>
                              {p.currentPriceLocal ? (
                                <>
                                  <p className="font-semibold">${p.currentPriceUSD?.toFixed(2)}</p>
                                  <p className="text-xs text-muted-foreground">{p.symbol}{p.currentPriceLocal.toFixed(2)}</p>
                                  {p.scheduledDate && (
                                    <p className="text-xs text-primary flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {p.symbol}{p.scheduledPrice} on {p.scheduledDate}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <p className="text-muted-foreground text-sm">Not set</p>
                              )}
                            </div>

                            {/* Arrow */}
                            <div className="text-muted-foreground">→</div>

                            {/* Recommended Price */}
                            <div className="text-right min-w-[90px]">
                              <p className="text-xs text-muted-foreground">Recommended</p>
                              <p className="font-semibold text-success">
                                ${p.recommendedPriceUSD.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">{p.localPriceFormatted}</p>
                            </div>

                            {/* Status Badge */}
                            <Badge 
                              variant="outline" 
                              className={`min-w-[80px] justify-center ${
                                !p.currentPriceUSD ? 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20' :
                                isOverpriced ? 'bg-warning/10 text-warning border-warning/20' :
                                isUnderpriced ? 'bg-info/10 text-info border-info/20' :
                                'bg-success/10 text-success border-success/20'
                              }`}
                            >
                              {!p.currentPriceUSD ? 'No price' :
                               isOverpriced ? `+${priceDiff}% high` :
                               isUnderpriced ? `${priceDiff}% low` :
                               '✓ Optimal'}
                            </Badge>

                            {/* Update Button */}
                            {(!p.currentPriceUSD || isOverpriced || isUnderpriced) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdatePrice(p.territory, p.localPrice, p.symbol)}
                                disabled={isLoadingPrices}
                                className="min-w-[70px]"
                              >
                                {isLoadingPrices ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  'Update'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No pricing recommendations available.</p>
                  <p className="text-sm mt-2">Try adjusting the base price above.</p>
                </div>
              )}

              {/* Summary */}
              {priceRecommendations && priceRecommendations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-success/10">
                  <p className="text-2xl font-bold text-success">
                    {priceRecommendations.filter(p => {
                      if (!p.currentPriceUSD || p.countryCode === 'US') return false
                      const diff = Math.abs((p.currentPriceUSD - p.recommendedPriceUSD) / p.recommendedPriceUSD * 100)
                      return diff <= 15
                    }).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Optimal</p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <p className="text-2xl font-bold text-warning">
                    {priceRecommendations.filter(p => {
                      if (!p.currentPriceUSD || p.countryCode === 'US') return false
                      const diff = (p.currentPriceUSD - p.recommendedPriceUSD) / p.recommendedPriceUSD * 100
                      return diff > 15
                    }).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Overpriced</p>
                </div>
                <div className="p-3 rounded-lg bg-muted-foreground/10">
                  <p className="text-2xl font-bold text-muted-foreground">
                    {priceRecommendations.filter(p => !p.currentPriceUSD && p.countryCode !== 'US').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Not Set</p>
                </div>
              </div>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </TabsContent>
  )
}
