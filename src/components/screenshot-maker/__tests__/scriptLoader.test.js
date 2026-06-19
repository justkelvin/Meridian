import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { loadScript, waitForElement } from '../scriptLoader'

describe('scriptLoader', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('loadScript', () => {
    it('creates and appends script if not exists', () => {
      const src = 'https://example.com/test.js'
      const promise = loadScript(src)
      
      const script = document.querySelector(`script[src="${src}"]`)
      expect(script).not.toBeNull()
      expect(script.dataset.loaded).toBe('false')
      
      // Simulate script load
      script.onload()
      
      return promise.then(() => {
        expect(script.dataset.loaded).toBe('true')
      })
    })

    it('resolves immediately if script already loaded', async () => {
      const src = 'https://example.com/test.js'
      const script = document.createElement('script')
      script.src = src
      script.dataset.loaded = 'true'
      document.body.appendChild(script)

      await expect(loadScript(src)).resolves.toBeUndefined()
    })

    it('waits for load if script exists but not loaded', async () => {
      const src = 'https://example.com/test.js'
      const script = document.createElement('script')
      script.src = src
      script.dataset.loaded = 'false'
      document.body.appendChild(script)

      let resolved = false
      const promise = loadScript(src).then(() => { resolved = true })
      
      expect(resolved).toBe(false)
      
      script.dispatchEvent(new Event('load'))
      await promise
      expect(resolved).toBe(true)
    })
  })

  describe('waitForElement', () => {
    it('resolves immediately if element exists', async () => {
      const div = document.createElement('div')
      div.id = 'my-element'
      document.body.appendChild(div)

      await expect(waitForElement('my-element')).resolves.toBeUndefined()
    })

    it('waits for element to appear', async () => {
      let resolved = false
      const promise = waitForElement('my-element').then(() => { resolved = true })
      
      expect(resolved).toBe(false)
      
      // Fast forward some time without element
      vi.advanceTimersByTime(50)
      expect(resolved).toBe(false)
      
      // Add element
      const div = document.createElement('div')
      div.id = 'my-element'
      document.body.appendChild(div)
      
      // Fast forward again to trigger requestAnimationFrame callback (mocked by vi.useFakeTimers)
      vi.advanceTimersByTime(20)
      
      // In jsdom with fake timers, requestAnimationFrame might need multiple ticks
      // or we can just await the promise
      
      // Manually trigger the requestAnimationFrame if it is polyfilled or just wait
      await promise
      expect(resolved).toBe(true)
    })
  })
})
