/**
 * ScreenshotMaker — mounts the Appscreen HTML/CSS/JS tool inside a scoped div.
 *
 * Script loading and CSS scoping logic are extracted into focused utilities:
 *   - ./screenshot-maker/scriptLoader   (loadScript, waitForElement)
 *   - ./screenshot-maker/cssScoper      (scopeCss)
 *
 * The component itself is responsible only for React lifecycle coordination:
 *   - injecting static HTML once on mount
 *   - sequentially loading external scripts (deduplication handled by loader)
 *   - calling AppscreenBridge lifecycle methods at the right times
 *   - syncing localization/AI config payloads
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import appscreenHtml from '@/appscreen/appscreen.html?raw'
import appscreenCss from '@/appscreen/appscreen.css?raw'
import { scopeCss } from './screenshot-maker/cssScoper'
import { loadScript, waitForElement } from './screenshot-maker/scriptLoader'

const SCRIPT_URLS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
  '/appscreen/llm.js',
  '/appscreen/language-utils.js',
  '/appscreen/magical-titles.js',
  '/appscreen/three-renderer.js',
  '/appscreen/app.js',
]

export default function ScreenshotMaker({ localizationPayload, aiConfig, active }) {
  const [scriptsLoaded, setScriptsLoaded] = useState(false)
  const initializedRef = useRef(false)
  const rootRef = useRef(null)

  // Scope the appscreen CSS once — avoids re-computation on every render
  const scopedCss = useMemo(() => scopeCss(appscreenCss, '.appscreen-root'), [])

  // Derive the AI payload expected by AppscreenBridge from the provider config
  const aiPayload = useMemo(() => {
    if (!aiConfig) return null
    const provider = aiConfig.provider || 'openai'
    const apiKey = aiConfig.apiKeys?.[provider] || ''
    const model = aiConfig.models?.[provider] || ''
    if (!apiKey && !model) return null
    const endpoint = provider === 'azure' ? aiConfig.endpoint : undefined
    return { apiKey, model, provider, endpoint }
  }, [aiConfig])

  // Inject static HTML once on first mount
  useEffect(() => {
    if (!rootRef.current) return
    if (!rootRef.current.innerHTML) {
      rootRef.current.innerHTML = appscreenHtml
    }
  }, [])

  // Load external scripts sequentially; deduplicated by loadScript
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (window.__appscreenScriptsLoaded) {
        setScriptsLoaded(true)
        return
      }
      for (const src of SCRIPT_URLS) {
        await loadScript(src)
      }
      if (!cancelled) {
        window.__appscreenScriptsLoaded = true
        setScriptsLoaded(true)
      }
    }

    load().catch((error) => {
      console.error('Failed to load screenshot maker scripts', error)
    })

    return () => {
      cancelled = true
    }
  }, [])

  // Initialize AppscreenBridge once all scripts are ready
  useEffect(() => {
    if (!scriptsLoaded || initializedRef.current) return

    const init = async () => {
      await waitForElement('file-input')
      if (window.AppscreenBridge?.init) {
        window.AppscreenBridge.init()
        initializedRef.current = true
      }
    }

    init().catch((error) => {
      console.error('Failed to init screenshot maker', error)
    })
  }, [scriptsLoaded])

  // Mount the bridge when scripts are ready
  useEffect(() => {
    if (!scriptsLoaded) return
    if (window.AppscreenBridge?.mount) {
      window.AppscreenBridge.mount()
    }
  }, [scriptsLoaded])

  // Re-sync bridge when tab becomes active
  useEffect(() => {
    if (!active || !scriptsLoaded) return
    const kick = () => {
      if (window.AppscreenBridge?.mount) {
        window.AppscreenBridge.mount()
      }
      if (window.AppscreenBridge?.syncLocalizationData && localizationPayload) {
        window.AppscreenBridge.syncLocalizationData(localizationPayload)
      }
      if (window.AppscreenBridge?.syncAiConfig && aiPayload) {
        window.AppscreenBridge.syncAiConfig(aiPayload)
      }
    }
    requestAnimationFrame(kick)
  }, [active, scriptsLoaded, localizationPayload, aiPayload])

  // Keep localization data in sync
  useEffect(() => {
    if (!scriptsLoaded || !localizationPayload) return
    if (window.AppscreenBridge?.syncLocalizationData) {
      window.AppscreenBridge.syncLocalizationData(localizationPayload)
    }
  }, [scriptsLoaded, localizationPayload])

  // Keep AI config in sync
  useEffect(() => {
    if (!scriptsLoaded || !aiPayload) return
    if (window.AppscreenBridge?.syncAiConfig) {
      window.AppscreenBridge.syncAiConfig(aiPayload)
    }
  }, [scriptsLoaded, aiPayload])

  return (
    <div className="space-y-4">
      <style
        dangerouslySetInnerHTML={{
          __html: `${scopedCss}\n.appscreen-root{\n  --bg-primary: var(--background);\n  --bg-secondary: var(--card);\n  --bg-tertiary: var(--muted);\n  --border-color: var(--border);\n  --text-primary: var(--foreground);\n  --text-secondary: var(--muted-foreground);\n  --accent: var(--primary);\n  --accent-hover: var(--primary);\n  width: 100%;\n}\n.appscreen-root .app-container{\n  width: 100%;\n  max-width: none;\n}\n`
        }}
      />
      <div ref={rootRef} className="appscreen-root w-full" />
    </div>
  )
}
