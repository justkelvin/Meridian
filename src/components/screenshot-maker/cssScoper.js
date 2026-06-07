/**
 * cssScoper.js — scopes arbitrary CSS to a given selector prefix.
 *
 * Extracted from ScreenshotMaker to keep the component focused on React concerns.
 * Handles @keyframes, @media, @supports, @container, @layer, and regular rules.
 *
 * Usage:
 *   import { scopeCss } from './cssScoper'
 *   const scoped = scopeCss(rawCss, '.my-root')
 */

/**
 * Rewrites a comma-separated selector string so every selector is prefixed
 * with the given scope string. :root / html / body are replaced by the scope.
 *
 * @param {string} selectors - comma-separated CSS selectors
 * @param {string} scope     - selector prefix to prepend (e.g. '.appscreen-root')
 * @returns {string}
 */
export const scopeSelectors = (selectors, scope) => {
  return selectors.split(',').map((selector) => {
    const trimmed = selector.trim()
    if (!trimmed) return ''
    if (trimmed === ':root' || trimmed === 'html' || trimmed === 'body') return scope
    if (trimmed.startsWith('html')) return trimmed.replace(/^html/, scope)
    if (trimmed.startsWith('body')) return trimmed.replace(/^body/, scope)
    return `${scope} ${trimmed}`
  }).join(', ')
}

/**
 * Extracts the complete CSS block (selector + {…}) starting at startIndex.
 *
 * @param {string} css
 * @param {number} startIndex
 * @returns {{ header: string, body: string, endIndex: number } | null}
 */
const extractBlock = (css, startIndex) => {
  const openIndex = css.indexOf('{', startIndex)
  if (openIndex === -1) return null
  let depth = 0
  for (let i = openIndex; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1
    if (css[i] === '}') depth -= 1
    if (depth === 0) {
      return {
        header: css.slice(startIndex, openIndex).trim(),
        body: css.slice(openIndex + 1, i),
        endIndex: i + 1,
      }
    }
  }
  return null
}

/**
 * Scopes all CSS rules inside the given CSS string to the given selector.
 * At-rules (@keyframes, @media, @supports, @container, @layer) are handled
 * correctly — keyframes are left untouched, others recurse.
 *
 * @param {string} css   - raw CSS text
 * @param {string} scope - selector to scope rules to
 * @returns {string}     - scoped CSS text
 */
export const scopeCss = (css, scope) => {
  let i = 0
  let output = ''

  while (i < css.length) {
    const nextBrace = css.indexOf('{', i)
    const nextAt = css.indexOf('@', i)

    if (nextAt !== -1 && (nextBrace === -1 || nextAt < nextBrace)) {
      const block = extractBlock(css, nextAt)
      if (!block) {
        output += css.slice(i)
        break
      }

      const { header } = block

      if (
        header.startsWith('@keyframes') ||
        header.startsWith('@-webkit-keyframes') ||
        header.startsWith('@-moz-keyframes') ||
        header.startsWith('@-o-keyframes')
      ) {
        // Leave keyframe blocks unchanged — names must not be scoped
        output += css.slice(nextAt, block.endIndex)
        i = block.endIndex
        continue
      }

      if (
        header.startsWith('@media') ||
        header.startsWith('@supports') ||
        header.startsWith('@container') ||
        header.startsWith('@layer')
      ) {
        // Recurse into container at-rules
        output += `${header}{${scopeCss(block.body, scope)}}`
        i = block.endIndex
        continue
      }

      output += css.slice(nextAt, block.endIndex)
      i = block.endIndex
      continue
    }

    if (nextBrace === -1) {
      output += css.slice(i)
      break
    }

    const selectorText = css.slice(i, nextBrace).trim()
    const block = extractBlock(css, i)
    if (!block) break
    if (selectorText) {
      output += `${scopeSelectors(selectorText, scope)}{${block.body}}`
    }
    i = block.endIndex
  }

  return output
}
