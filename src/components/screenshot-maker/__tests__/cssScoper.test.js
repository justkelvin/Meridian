import { describe, it, expect } from 'vitest'
import { scopeCss, scopeSelectors } from '../cssScoper'

describe('cssScoper', () => {
  describe('scopeSelectors', () => {
    it('scopes regular selectors', () => {
      expect(scopeSelectors('.my-class, #my-id, div', '.scope')).toBe('.scope .my-class, .scope #my-id, .scope div')
    })

    it('replaces root/html/body with scope', () => {
      expect(scopeSelectors(':root', '.scope')).toBe('.scope')
      expect(scopeSelectors('html', '.scope')).toBe('.scope')
      expect(scopeSelectors('body', '.scope')).toBe('.scope')
    })

    it('prefixes child selectors of html/body', () => {
      expect(scopeSelectors('html .test', '.scope')).toBe('.scope .test')
      expect(scopeSelectors('body .test', '.scope')).toBe('.scope .test')
    })

    it('handles empty selectors', () => {
      expect(scopeSelectors('   ', '.scope')).toBe('')
    })
  })

  describe('scopeCss', () => {
    it('scopes standard CSS rules', () => {
      const raw = '.test { color: red; } div { background: blue; }'
      const scoped = scopeCss(raw, '.my-scope')
      expect(scoped).toBe('.my-scope .test{ color: red; }.my-scope div{ background: blue; }')
    })

    it('leaves @keyframes untouched', () => {
      const raw = '@keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }'
      const scoped = scopeCss(raw, '.my-scope')
      expect(scoped).toBe('@keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }')
    })

    it('recurses into @media queries', () => {
      const raw = '@media (max-width: 600px) { .test { color: red; } }'
      const scoped = scopeCss(raw, '.my-scope')
      expect(scoped).toBe('@media (max-width: 600px){.my-scope .test{ color: red; } }')
    })

    it('recurses into @supports queries', () => {
      const raw = '@supports (display: grid) { .grid { display: grid; } }'
      const scoped = scopeCss(raw, '.my-scope')
      expect(scoped).toBe('@supports (display: grid){.my-scope .grid{ display: grid; } }')
    })

    it('recurses into @layer rules', () => {
      const raw = '@layer base { body { margin: 0; } }'
      const scoped = scopeCss(raw, '.my-scope')
      expect(scoped).toBe('@layer base{.my-scope{ margin: 0; } }')
    })

    it('handles mixed content correctly', () => {
      const raw = `
        body { font-family: sans-serif; }
        @media (min-width: 768px) {
          .container { padding: 2rem; }
        }
        @keyframes slide { from { top: 0; } to { top: 100px; } }
      `
      const scoped = scopeCss(raw, '.my-scope')
      expect(scoped).toContain('.my-scope{ font-family: sans-serif; }')
      expect(scoped).toContain('@media (min-width: 768px){.my-scope .container{ padding: 2rem; }')
      expect(scoped).toContain('@keyframes slide { from { top: 0; } to { top: 100px; } }')
    })
  })
})
