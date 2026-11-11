import { useEffect, useState } from 'react'
import { createDefaultState, isMockState, LEGACY_MOCK_STORAGE_KEY, migrateLegacyState, MOCK_STORAGE_KEY, type MockState } from './mock-state'

// Writes synchronously, for updates made right before navigating away
// (the hook's effect would not run after the component unmounts).
export function saveMockState(state: MockState): boolean {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(state))
    // Drop v1 data only once v2 is safely stored.
    localStorage.removeItem(LEGACY_MOCK_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

export function useMockState() {
  const [state, setState] = useState<MockState | null>(null)
  const [storageError, setStorageError] = useState('')

  useEffect(() => {
    let initial = createDefaultState()
    try {
      const stored = localStorage.getItem(MOCK_STORAGE_KEY)
      const legacy = stored ? null : localStorage.getItem(LEGACY_MOCK_STORAGE_KEY)
      if (stored) {
        const parsed: unknown = JSON.parse(stored)
        if (isMockState(parsed)) initial = parsed
        else setStorageError('Lagrede demodata var ugyldige og er tilbakestilt.')
      } else if (legacy) {
        initial = migrateLegacyState(JSON.parse(legacy)) ?? initial
      }
    } catch {
      setStorageError('Kunne ikke lese lagrede demodata. Standardprofilen brukes.')
    }
    setState(initial)
  }, [])

  useEffect(() => {
    if (!state) return
    if (saveMockState(state)) setStorageError('')
    else setStorageError('Demodata kunne ikke lagres. Endringer beholdes bare til siden lastes på nytt.')
  }, [state])

  return { state, setState, storageError }
}
