/**
 * scriptLoader.js — sequential script loading with deduplication.
 *
 * Extracted from ScreenshotMaker to isolate global script injection
 * into a single, testable utility. Prevents duplicate script tags by
 * checking `document.querySelector` before creating new elements.
 *
 * Usage:
 *   import { loadScript, waitForElement } from './scriptLoader'
 */

/**
 * Loads a script at `src` and resolves when it has loaded.
 * If a script tag with the same src already exists and is marked as loaded,
 * resolves immediately. If the tag exists but hasn't finished loading yet,
 * waits for its load/error events.
 *
 * @param {string} src - absolute or relative URL of the script
 * @returns {Promise<void>}
 */
export const loadScript = (src) => {
  const existing = document.querySelector(`script[src="${src}"]`)

  if (existing) {
    return existing.dataset.loaded === 'true'
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
          existing.addEventListener('load', resolve)
          existing.addEventListener('error', reject)
        })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = false
    script.dataset.loaded = 'false'
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = reject
    document.body.appendChild(script)
  })
}

/**
 * Resolves when an element with the given id exists in the DOM.
 * Uses requestAnimationFrame polling to avoid blocking the thread.
 *
 * @param {string} id - element id to wait for
 * @returns {Promise<void>}
 */
export const waitForElement = (id) => {
  if (document.getElementById(id)) return Promise.resolve()
  return new Promise((resolve) => {
    const tick = () => {
      if (document.getElementById(id)) {
        resolve()
        return
      }
      requestAnimationFrame(tick)
    }
    tick()
  })
}
