import { describe, it, expect } from 'vitest'
import {
  parseXCStrings,
  generateXCStrings,
  getTranslationStats,
  getMissingTranslations,
  addTranslation
} from '../xcstringsParser'

describe('xcstringsParser', () => {
  describe('parseXCStrings', () => {
    it('parses valid minimal JSON and adds defaults', () => {
      const json = '{}'
      const parsed = parseXCStrings(json)
      expect(parsed).toEqual({
        sourceLanguage: 'en',
        version: '1.0',
        strings: {}
      })
    })

    it('retains existing data', () => {
      const json = JSON.stringify({
        sourceLanguage: 'fr',
        version: '1.1',
        strings: { hello: {} }
      })
      const parsed = parseXCStrings(json)
      expect(parsed.sourceLanguage).toBe('fr')
      expect(parsed.version).toBe('1.1')
      expect(parsed.strings).toHaveProperty('hello')
    })

    it('throws error on invalid JSON', () => {
      expect(() => parseXCStrings('invalid json')).toThrow(/Failed to parse \.xcstrings file/)
    })
  })

  describe('generateXCStrings', () => {
    it('generates formatted JSON with sorted keys', () => {
      const data = {
        strings: {
          zeta: {},
          alpha: {
            localizations: {
              es: { stringUnit: { value: 'hola' } },
              de: { stringUnit: { value: 'hallo' } }
            }
          }
        }
      }
      const json = generateXCStrings(data)
      const parsed = JSON.parse(json)
      
      const keys = Object.keys(parsed.strings)
      expect(keys[0]).toBe('alpha')
      expect(keys[1]).toBe('zeta')
      
      const locKeys = Object.keys(parsed.strings.alpha.localizations)
      expect(locKeys[0]).toBe('de')
      expect(locKeys[1]).toBe('es')
    })
  })

  describe('getTranslationStats', () => {
    it('returns correct statistics', () => {
      const data = {
        sourceLanguage: 'en',
        strings: {
          hello: {
            localizations: {
              es: { stringUnit: { value: 'hola' } }
            }
          },
          world: {
            localizations: {
              es: { stringUnit: { value: 'mundo' } },
              fr: { stringUnit: { value: 'monde' } }
            }
          }
        }
      }
      const stats = getTranslationStats(data, ['it'])
      
      expect(stats.totalStrings).toBe(2)
      expect(stats.languages).toContain('es')
      expect(stats.languages).toContain('fr')
      expect(stats.translationCounts.es).toBe(2)
      expect(stats.translationCounts.fr).toBe(1)
      expect(stats.missingCounts.fr).toBe(1)
      expect(stats.translationCounts.it).toBe(0)
      expect(stats.missingCounts.it).toBe(2)
    })
  })

  describe('getMissingTranslations', () => {
    it('finds missing translations for target languages', () => {
      const data = {
        strings: {
          hello: {
            localizations: {
              en: { stringUnit: { value: 'hello' } },
              es: { stringUnit: { value: 'hola' } }
            }
          },
          world: {}
        }
      }
      const missing = getMissingTranslations(data, ['es', 'fr'])
      
      expect(missing).toHaveProperty('hello')
      expect(missing.hello.missingLanguages).toEqual(['fr'])
      expect(missing.hello.englishText).toBe('hello')
      
      expect(missing).toHaveProperty('world')
      expect(missing.world.missingLanguages).toEqual(['es', 'fr'])
      expect(missing.world.englishText).toBe('world') // falls back to key
    })
  })

  describe('addTranslation', () => {
    it('adds translation correctly', () => {
      const data = {
        strings: {
          hello: {}
        }
      }
      
      const updated = addTranslation(data, 'hello', 'es', 'hola')
      expect(updated.strings.hello.localizations.es.stringUnit.value).toBe('hola')
      expect(updated.strings.hello.localizations.es.stringUnit.state).toBe('translated')
    })
  })
})
