import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TabsContent } from '@/components/ui/tabs'
import {
  TrendingUp, DollarSign, RefreshCw, Download, BarChart3, Database,
  ChevronDown, ChevronUp
} from 'lucide-react'
import PricingChart from '../../PricingChart'

export function SubMgrPricingTab({
  basePrice,
  setBasePrice,
  handleRefreshGDP,
  isLoadingGDP,
  isLiveData,
  handleExportPricing,
  chartData,
  gdpDataSource,
  pricingTable,
  tiersSummary,
  expandedTier,
  setExpandedTier
}) {
  return (
    <TabsContent value="pricing" className="space-y-6">
      {/* Explanation Card */}
      <Card className="border-border/50 shadow-sm bg-gradient-to-r from-success/5 to-info/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 shrink-0">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">GDP-Based Price Optimization</h3>
              <p className="text-sm text-muted-foreground">
                If your subscription costs <span className="font-mono font-semibold text-foreground">${basePrice.toFixed(2)}</span> in the USA, 
                this tool calculates the recommended price for each country based on their GDP per capita (purchasing power). 
                Lower GDP countries get a discount to make your app accessible, while maintaining fair pricing globally.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Configuration */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle className="text-lg">Base Price (USA)</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Monthly Price in USD</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0.99"
                  value={basePrice}
                  onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                  className="pl-7 text-lg font-semibold"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshGDP}
                disabled={isLoadingGDP}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingGDP ? 'animate-spin' : ''}`} />
                {isLoadingGDP ? 'Loading rates...' : 'Refresh Exchange Rates'}
              </Button>
              {isLiveData && (
                <p className="text-xs text-success mt-2 text-center">
                  ✓ Live exchange rates loaded
                </p>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={handleExportPricing} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="lg:col-span-3 border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Recommended Prices by Country</CardTitle>
                  <CardDescription>
                    Prices adjusted for local purchasing power (GDP per capita)
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PricingChart data={chartData} basePrice={basePrice} />
          </CardContent>
        </Card>
      </div>

      {/* Pricing Table */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Detailed Pricing Recommendations</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              {gdpDataSource}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {pricingTable.map((p) => {
                const discount = Math.round((1 - p.multiplier) * 100)
                
                return (
                  <div 
                    key={p.countryCode} 
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{p.flag || '🌍'}</span>
                      <div>
                        <p className="font-medium">{p.countryName}</p>
                        <p className="text-xs text-muted-foreground">
                          GDP: ${p.gdp?.toLocaleString() || 'N/A'}/capita
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Recommended USD Price */}
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Recommended</p>
                        <p className="font-semibold text-success">
                          ${(p.recommendedPriceUSD || p.price || 0).toFixed(2)}
                        </p>
                      </div>
                      
                      {/* Local Currency Price */}
                      {p.localPriceFormatted && (
                        <div className="text-right min-w-[100px]">
                          <p className="text-sm text-muted-foreground">Local Price</p>
                          <p className="font-semibold">{p.localPriceFormatted}</p>
                        </div>
                      )}
                      
                      {/* Discount Badge */}
                      <Badge 
                        variant="outline" 
                        className={`min-w-[60px] justify-center ${
                          discount > 0 
                            ? 'bg-info/10 text-info border-info/20' 
                            : discount < 0 
                              ? 'bg-warning/10 text-warning border-warning/20'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {discount > 0 ? `-${discount}%` : discount < 0 ? `+${Math.abs(discount)}%` : 'Base'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Tier Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        {['high', 'medium', 'low'].map((tier) => {
          const tierData = tiersSummary.tiers[tier]
          const avgPrice = tier === 'high' ? tiersSummary.stats.avgHigh :
                          tier === 'medium' ? tiersSummary.stats.avgMedium :
                          tiersSummary.stats.avgLow
          const avgDiscount = tier === 'high' ? 0 : tier === 'medium' ? 25 : 50

          return (
            <Card key={tier} className="border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`capitalize ${
                    tier === 'high' ? 'bg-success/10 text-success border-success/20' :
                    tier === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                    'bg-info/10 text-info border-info/20'
                  }`}>
                    {tier === 'high' ? '💰 High GDP' : tier === 'medium' ? '📊 Medium GDP' : '🌍 Low GDP'}
                  </Badge>
                  <span className="text-2xl font-bold">${avgPrice.toFixed(2)}</span>
                </div>
                <CardDescription>
                  {tierData.length} markets • ~{avgDiscount}% {avgDiscount > 0 ? 'discount' : 'base price'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => setExpandedTier(expandedTier === tier ? null : tier)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedTier === tier ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {expandedTier === tier ? 'Hide' : 'Show'} countries
                </button>
                {expandedTier === tier && (
                  <div className="mt-3 space-y-1">
                    {tierData.slice(0, 10).map(p => (
                      <div key={p.countryCode} className="flex items-center justify-between text-sm py-1">
                        <div className="flex items-center gap-2">
                          <span>{p.flag || '🌍'}</span>
                          <span>{p.countryName}</span>
                        </div>
                        <span className="font-mono text-success">${(p.recommendedPriceUSD || p.price || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </TabsContent>
  )
}
