/**
 * useAscUnlock — encapsulates the encrypted private key unlock workflow.
 *
 * Both AppStoreConnect and SubscriptionManager share identical logic for:
 *   1. Checking whether a stored encrypted key exists
 *   2. Prompting for a password to decrypt it
 *   3. Writing the decrypted key back into credentials state
 *
 * This hook centralises that behaviour to eliminate the duplication.
 *
 * @param {function} onCredentialsChange - state setter for credentials (same signature as ASC/Sub callbacks)
 * @returns {{ hasStoredKey, unlockPassword, setUnlockPassword, isUnlocking, unlockError, handleUnlockKey }}
 */

import { useState } from 'react'
import { decrypt } from '@/utils/crypto'
import { ENCRYPTED_KEY_STORAGE } from './constants'

export function useAscUnlock(onCredentialsChange) {
  const [hasStoredKey] = useState(() => {
    if (typeof window === 'undefined') return false
    return !!window.localStorage.getItem(ENCRYPTED_KEY_STORAGE)
  })
  const [unlockPassword, setUnlockPassword] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState('')

  const handleUnlockKey = async () => {
    if (!unlockPassword) {
      setUnlockError('Enter password')
      return
    }

    const stored = localStorage.getItem(ENCRYPTED_KEY_STORAGE)
    if (!stored) {
      setUnlockError('No stored key found')
      return
    }

    setIsUnlocking(true)
    setUnlockError('')

    const result = await decrypt(stored, unlockPassword)

    if (result.success) {
      onCredentialsChange((prev) => ({ ...prev, privateKey: result.data }))
      setUnlockPassword('')
    } else {
      setUnlockError('Wrong password')
    }

    setIsUnlocking(false)
  }

  return {
    hasStoredKey,
    unlockPassword,
    setUnlockPassword,
    isUnlocking,
    unlockError,
    handleUnlockKey,
  }
}
