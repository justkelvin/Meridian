import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Image,
  Languages,
  Lock,
  Play,
  Store,
  TrendingUp,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'

const productAreas = [
  {
    icon: Languages,
    label: 'XCStrings',
    text: 'Translate, review, and export Xcode string catalogs.',
  },
  {
    icon: Store,
    label: 'App Store Connect',
    text: 'Localize listings, metadata, keywords, and screenshots.',
  },
  {
    icon: Play,
    label: 'Google Play',
    text: 'Manage Play Store listings with the same AI workflow.',
  },
  {
    icon: Image,
    label: 'Screenshots',
    text: 'Build store-ready localized screenshot sets.',
  },
]

const workflowSteps = [
  'Import localization files or connect a store account',
  'Translate with your configured AI provider',
  'Review protected terms, metadata, and screenshots',
  'Export or publish localized assets',
]

export default function LandingPage({ onLaunch }) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="absolute left-0 right-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Languages className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Localizer</p>
              <p className="mt-1 text-xs text-muted-foreground">
                App localization workspace
              </p>
            </div>
          </div>
          <ThemeToggle variant="compact" />
        </div>
      </header>

      <main>
        <section className="relative isolate flex min-h-[86svh] items-center overflow-hidden border-b border-border/60 pt-24">
          <img
            src="/appscreen/img/screenshot-generator.png"
            alt="Screenshot localization workflow preview"
            className="absolute inset-y-20 right-[-32rem] z-0 hidden w-[78rem] max-w-none rounded-l-2xl border border-border/60 object-cover opacity-40 shadow-2xl shadow-foreground/10 lg:block dark:opacity-28"
          />
          <div className="absolute inset-0 z-0 bg-[linear-gradient(90deg,var(--background)_0%,color-mix(in_srgb,var(--background)_94%,transparent)_42%,color-mix(in_srgb,var(--background)_62%,transparent)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 z-0 h-32 bg-[linear-gradient(180deg,transparent,var(--background))]" />

          <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(24rem,0.76fr)] lg:px-10">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
                <Lock className="h-3.5 w-3.5 text-success" />
                Local-first tools for release localization
              </div>
              <h1 className="max-w-4xl text-5xl font-bold leading-[1.02] tracking-normal text-foreground sm:text-6xl lg:text-7xl">
                Localizer
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                A focused workspace for translating app strings, store
                listings, subscription metadata, and localized screenshots
                across App Store Connect and Google Play.
              </p>
              <div className="mt-9">
                <Button size="lg" onClick={onLaunch} className="h-12 px-6">
                  Open Localizer
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative block lg:hidden">
              <img
                src="/appscreen/img/screenshot-generator.png"
                alt="Screenshot localization workflow preview"
                className="aspect-[4/3] w-full rounded-2xl border border-border/60 object-cover shadow-xl"
              />
            </div>
          </div>
        </section>

        <section className="bg-background px-5 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                Built for the release workflow
              </p>
              <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-normal">
                Keep localization work in one operational workspace.
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {productAreas.map((area) => {
                const Icon = area.icon
                return (
                  <div
                    key={area.label}
                    className="rounded-xl border border-border/60 bg-card p-5 shadow-sm"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <h3 className="font-semibold">{area.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {area.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 bg-muted/30 px-5 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-normal">
                  From source strings to store assets
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                  Localizer keeps API keys and uploaded credentials session
                  scoped while giving release teams the controls they need for
                  protected words, AI providers, and export-ready outputs.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {workflowSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-4 rounded-xl border border-border/60 bg-background p-4 shadow-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Step {index + 1}
                    </p>
                    <p className="mt-1 text-sm font-medium">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-border/60 px-5 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>XCStrings, store metadata, screenshots, and subscriptions</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
