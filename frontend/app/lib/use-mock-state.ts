import { useEffect, useState } from 'react'
import { createDefaultState, isMockState, LEGACY_MOCK_STORAGE_KEYS, migrateLegacyState, MOCK_STORAGE_KEY, type MockState } from './mock-state'

// Writes synchronously, for updates made right before navigating away
// (the hook's effect would not run after the component unmounts).
export function saveMockState(state: MockState): boolean {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(state))
    // Drop older data only once v3 is safely stored.
    for (const key of LEGACY_MOCK_STORAGE_KEYS) localStorage.removeItem(key)
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
      const legacy = stored ? null : LEGACY_MOCK_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find((item) => item !== null)
      if (stored) {
        const parsed: unknown = JSON.parse(stored)
        if (isMockState(parsed)) initial = parsed
        else {
          const migrated = migrateLegacyState(parsed)
          if (migrated) initial = migrated
          else setStorageError('Lagrede demodata var ugyldige og er tilbakestilt.')
        }
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
