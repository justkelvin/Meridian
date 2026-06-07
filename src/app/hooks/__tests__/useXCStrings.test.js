import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useXCStrings } from '../useXCStrings'
import * as xcstringsParser from '@/utils/xcstringsParser'
import * as translationService from '@/services/translationService'

// Mock dependencies
vi.mock('@/utils/xcstringsParser')
vi.mock('@/services/translationService', () => ({
  SUPPORTED_LANGUAGES: [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' }
  ],
  PROVIDERS: {},
  DEFAULT_CONCURRENT_REQUESTS: 2,
  DEFAULT_TEXTS_PER_BATCH: 5,
  translateStrings: vi.fn(),
  testApiConnection: vi.fn(),
}))
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn()
  }
}))

describe('useXCStrings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  const mockProviderConfig = {
    provider: 'openai',
    apiKeys: { openai: 'test-key' },
    models: { openai: 'gpt-4o' }
  }

  it('initializes with default values', () => {
    const { result } = renderHook(() => useXCStrings(mockProviderConfig))
    
    expect(result.current.xcstringsData).toBeNull()
    expect(result.current.isTranslating).toBe(false)
    expect(result.current.selectedLanguages.length).toBe(0)
    expect(result.current.protectedWords).toContain('MyAppName')
  })

  it('handles protected words management', () => {
    const { result } = renderHook(() => useXCStrings(mockProviderConfig))
    
    act(() => {
      result.current.setNewProtectedWord('BrandName')
    })
    
    act(() => {
      result.current.addProtectedWord()
    })
    
    expect(result.current.protectedWords).toContain('BrandName')

    act(() => {
      result.current.removeProtectedWord('BrandName')
    })
    expect(result.current.protectedWords).not.toContain('BrandName')
  })

  it('updates search query', () => {
    const { result } = renderHook(() => useXCStrings(mockProviderConfig))
    
    act(() => {
      result.current.setSearchQuery('hello')
    })
    expect(result.current.searchQuery).toBe('hello')
  })
})
