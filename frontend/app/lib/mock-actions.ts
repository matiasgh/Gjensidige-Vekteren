import type { MockCustomer } from './mock-customer'

// Future flows can add actions here without coupling mutations to chat wording.
export type MockAction =
  | { type: 'set-coverage-level'; coverageId: string; targetCoverageId: string }
  | { type: 'set-coverage-option'; coverageId: string; option: string; enabled: boolean }

export function applyMockAction(customer: MockCustomer, action: MockAction): MockCustomer {
  const next = structuredClone(customer)
  const insurance = next.insurances.find((item) => item.coverageId === action.coverageId)
  if (!insurance) throw new Error('Forsikringen finnes ikke i kundeprofilen.')
  if (insurance.employer) throw new Error('Avtalen styres av arbeidsgiveren din og kan ikke endres her.')

  switch (action.type) {
    case 'set-coverage-level': {
      const travelLevels: Record<string, string> = { 'travel-standard': 'Reise', 'travel-plus': 'Reise Pluss' }
      if (!Object.hasOwn(travelLevels, insurance.coverageId) || !Object.hasOwn(travelLevels, action.targetCoverageId)) {
        throw new Error('Denne dekningsendringen er ikke definert i prototypen ennå.')
      }
      insurance.coverageId = action.targetCoverageId
      insurance.coverage = travelLevels[action.targetCoverageId]
      break
    }
    case 'set-coverage-option':
      if (!insurance.optionalCoverages || !Object.hasOwn(insurance.optionalCoverages, action.option) || typeof action.enabled !== 'boolean') {
        throw new Error('Dette tilvalget er ikke definert i prototypen ennå.')
      }
      insurance.optionalCoverages[action.option] = action.enabled
      if (insurance.coverageId === 'car-kasko') {
        if (action.option === 'partial' && !action.enabled) insurance.optionalCoverages.collision = false
        if (action.option === 'collision' && action.enabled) insurance.optionalCoverages.partial = true
        insurance.monthlyPriceNok = carMonthlyPrice(insurance.optionalCoverages)
      }
      break
    default:
      throw new Error('Ukjent endring i kundeprofilen.')
  }
  return next
}

// Fictitious prototype prices, not product quotes or real policy levels.
export const carCoverageOptions = [
  { option: 'partial', title: 'Delkasko', price: 70 },
  { option: 'collision', title: 'Kasko', price: 120 },
  { option: 'roadside', title: 'Veihjelp', price: 35 },
  { option: 'rentalCar', title: 'Leiebil', price: 45 },
] as const

export function carMonthlyPrice(options: Record<string, boolean>) {
  return 65 + carCoverageOptions.reduce((sum, { option, price }) => sum + (options[option] ? price : 0), 0)
}

export function isMockAction(value: unknown): value is MockAction {
  if (!value || typeof value !== 'object') return false
  const action = value as Record<string, unknown>
  if (typeof action.coverageId !== 'string') return false
  return (action.type === 'set-coverage-level' && typeof action.targetCoverageId === 'string')
    || (action.type === 'set-coverage-option' && typeof action.option === 'string' && typeof action.enabled === 'boolean')
}
