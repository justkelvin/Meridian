import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAscUnlock } from '../useAscUnlock'

vi.mock('@/utils/crypto', () => ({
  decrypt: vi.fn().mockImplementation((stored, password) => {
    if (password === 'correct-password') return Promise.resolve({ success: true, data: 'decrypted-key' })
    return Promise.resolve({ success: false })
  })
}))

describe('useAscUnlock', () => {
  const mockOnCredentialsChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('initializes correctly with no stored key', () => {
    const { result } = renderHook(() => useAscUnlock(mockOnCredentialsChange))
    expect(result.current.hasStoredKey).toBe(false)
    expect(result.current.unlockError).toBe('')
    expect(result.current.isUnlocking).toBe(false)
  })

  it('detects stored encrypted key', () => {
    localStorage.setItem('asc-encrypted-p8-key', 'some-encrypted-data')
    const { result } = renderHook(() => useAscUnlock(mockOnCredentialsChange))
    expect(result.current.hasStoredKey).toBe(true)
  })

  it('handles unlock error with empty password', async () => {
    localStorage.setItem('asc-encrypted-p8-key', 'some-data')
    const { result } = renderHook(() => useAscUnlock(mockOnCredentialsChange))
    
    await act(async () => {
      await result.current.handleUnlockKey()
    })

    expect(result.current.unlockError).toBe('Enter password')
  })

  it('handles unlock error with invalid password', async () => {
    localStorage.setItem('asc-encrypted-p8-key', 'some-encrypted-data')
    const { result } = renderHook(() => useAscUnlock(mockOnCredentialsChange))
    
    act(() => {
      result.current.setUnlockPassword('wrong-password')
    })

    await act(async () => {
      await result.current.handleUnlockKey()
    })

    expect(result.current.unlockError).toBe('Wrong password')
    expect(mockOnCredentialsChange).not.toHaveBeenCalled()
  })

  it('handles successful unlock', async () => {
    localStorage.setItem('asc-encrypted-p8-key', 'some-encrypted-data')
    const { result } = renderHook(() => useAscUnlock(mockOnCredentialsChange))
    
    act(() => {
      result.current.setUnlockPassword('correct-password')
    })

    await act(async () => {
      await result.current.handleUnlockKey()
    })

    expect(result.current.unlockError).toBe('')
    expect(mockOnCredentialsChange).toHaveBeenCalledWith(expect.any(Function))
  })
})
