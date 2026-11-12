import { levelsFor, type MockCustomer, type MockInsurance } from './mock-customer'

// Future flows can add actions here without coupling mutations to chat wording.
export type MockAction =
  | { type: 'set-coverage-level'; coverageId: string; targetCoverageId: string }
  | { type: 'set-coverage-option'; coverageId: string; option: string; enabled: boolean }

export function applyMockAction(customer: MockCustomer, action: MockAction): MockCustomer {
  const next = structuredClone(customer)
  const insurance = next.insurances.find((item) => item.coverageId === action.coverageId)
  if (!insurance) throw new Error('Forsikringen finnes ikke i kundeprofilen.')
  if (insurance.employer) throw new Error('Avtalen styres av arbeidsgiveren din og kan ikke endres her.')
  if (insurance.provider !== 'Gjensidige') {
    throw new Error('Dekningene kan bare endres hos selskapet som leverer forsikringen.')
  }

  switch (action.type) {
    case 'set-coverage-level': {
      const levels = levelsFor(insurance.coverageId)
      if (!levels || !Object.hasOwn(levels, action.targetCoverageId)) {
        throw new Error('Denne dekningsendringen er ikke definert i prototypen ennå.')
      }
      insurance.coverageId = action.targetCoverageId
      insurance.coverage = levels[action.targetCoverageId]
      break
    }
    case 'set-coverage-option':
      if (!insurance.optionalCoverages || !Object.hasOwn(insurance.optionalCoverages, action.option) || typeof action.enabled !== 'boolean') {
        throw new Error('Dette tilvalget er ikke definert i prototypen ennå.')
      }
      if (!action.enabled && insurance.coverages?.some((coverage) => coverage.option === action.option && coverage.required)) {
        throw new Error('Påkrevde dekninger kan ikke slås av.')
      }
      insurance.optionalCoverages[action.option] = action.enabled
      if (insurance.coverageId === 'car-kasko') {
        if (action.option === 'partial' && !action.enabled) insurance.optionalCoverages.collision = false
        if (action.option === 'collision' && action.enabled) insurance.optionalCoverages.partial = true
      }
      insurance.monthlyPriceNok = insuranceMonthlyPrice(insurance)
      break
    default:
      throw new Error('Ukjent endring i kundeprofilen.')
  }
  return next
}

export function insuranceMonthlyPrice(insurance: MockInsurance, options = insurance.optionalCoverages ?? {}) {
  return insurance.coverages
    ? insurance.coverages.reduce((sum, coverage) => sum + (coverage.required || options[coverage.option] ? coverage.monthlyPriceNok : 0), 0)
    : insurance.monthlyPriceNok
}

export function isMockAction(value: unknown): value is MockAction {
  if (!value || typeof value !== 'object') return false
  const action = value as Record<string, unknown>
  if (typeof action.coverageId !== 'string') return false
  return (action.type === 'set-coverage-level' && typeof action.targetCoverageId === 'string')
    || (action.type === 'set-coverage-option' && typeof action.option === 'string' && typeof action.enabled === 'boolean')
}
