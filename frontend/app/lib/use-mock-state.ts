import { useEffect, useState } from 'react'
import { createDefaultState, isMockState, MOCK_STORAGE_KEY, type MockState } from './mock-state'

export function useMockState() {
  const [state, setState] = useState<MockState | null>(null)
  const [storageError, setStorageError] = useState('')

  useEffect(() => {
    let initial = createDefaultState()
    try {
      const stored = localStorage.getItem(MOCK_STORAGE_KEY)
      if (stored) {
        const parsed: unknown = JSON.parse(stored)
        if (isMockState(parsed)) initial = parsed
        else setStorageError('Lagrede demodata var ugyldige og er tilbakestilt.')
      }
    } catch {
      setStorageError('Kunne ikke lese lagrede demodata. Standardprofilen brukes.')
    }
    setState(initial)
  }, [])

  useEffect(() => {
    if (!state) return
    try {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(state))
    } catch {
      setStorageError('Demodata kunne ikke lagres. Endringer beholdes bare til siden lastes på nytt.')
    }
  }, [state])

  return { state, setState, storageError }
}
