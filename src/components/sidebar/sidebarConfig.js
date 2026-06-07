/**
 * Static navigation configuration for the app sidebar.
 * Separates data from rendering logic.
 */

import { Languages, Store, Play, Image, DollarSign, Settings, Link2, AppWindow, Layers, TrendingUp, Sparkles, Terminal } from 'lucide-react'

/** Primary tool navigation items */
export const NAV_ITEMS = [
  {
    id: 'xcstrings',
    label: 'XCStrings',
    tooltip: 'XCStrings Translator',
    Icon: Languages,
  },
  {
    id: 'appstore',
    label: 'App Store Connect',
    tooltip: 'App Store Connect',
    Icon: Store,
  },
  {
    id: 'googleplay',
    label: 'Google Play',
    tooltip: 'Google Play Console',
    Icon: Play,
  },
  {
    id: 'screenshots',
    label: 'Screenshots',
    tooltip: 'Screenshot Maker',
    Icon: Image,
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    tooltip: 'Subscription Pricing & Translations',
    Icon: DollarSign,
  },
  {
    id: 'config',
    label: 'Configuration',
    tooltip: 'Configuration',
    Icon: Settings,
    isAction: true, // opens dialog rather than navigates
  },
]

/** Quick-nav anchor items shown below the sidebar when on the App Store Connect page */
export const ASC_QUICK_NAV = [
  { id: 'asc-connection', label: 'Connection', Icon: Link2 },
  { id: 'asc-app-version', label: 'App & Version', Icon: AppWindow },
  { id: 'asc-localizations', label: 'Localizations', Icon: Layers },
  { id: 'asc-aso-keywords', label: 'ASO Keywords', Icon: TrendingUp },
  { id: 'asc-screenshots', label: 'Screenshots', Icon: Image },
  { id: 'asc-translation', label: 'AI Translation', Icon: Sparkles },
  { id: 'asc-logs', label: 'Activity Log', Icon: Terminal },
]

/** Quick-nav anchor items shown below the sidebar when on the Google Play page */
export const GP_QUICK_NAV = [
  { id: 'gp-connection', label: 'Connection', Icon: Link2 },
  { id: 'gp-app', label: 'App Package', Icon: AppWindow },
  { id: 'gp-listings', label: 'Listings', Icon: Layers },
  { id: 'gp-translation', label: 'AI Translation', Icon: Sparkles },
  { id: 'gp-logs', label: 'Activity Log', Icon: Terminal },
]
