import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateChecksum, translateAppStoreContent } from '../appStoreConnectService'
import { translateText } from '../translationService'

vi.mock('../translationService', () => ({
  translateText: vi.fn(),
}))

describe('appStoreConnectService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('calculateChecksum', () => {
    it('returns the MD5 checksum required by App Store Connect uploads', async () => {
      const data = new TextEncoder().encode('hello').buffer

      await expect(calculateChecksum(data)).resolves.toBe('5d41402abc4b2a76b9719d911017c592')
    })
  })

  describe('translateAppStoreContent', () => {
    it('routes Gemini through the shared translation service', async () => {
      translateText.mockResolvedValue('Bonjour')

      const result = await translateAppStoreContent(
        'Hello',
        'fr-FR',
        {
          provider: 'gemini',
          apiKey: 'test-key',
          model: 'gemini-2.5-flash',
        },
        'name'
      )

      expect(result).toEqual({ translation: 'Bonjour', error: null })
      expect(translateText).toHaveBeenCalledWith(
        expect.stringContaining('Translate to French'),
        'en-US',
        'fr-FR',
        {
          provider: 'gemini',
          apiKey: 'test-key',
          model: 'gemini-2.5-flash',
        }
      )
    })
  })
})
