import { levelsFor, type MockCustomer, type MockInsurance } from './mock-customer'
import { getOffer, isOfferPurchased } from './travel-offer'

// Future flows can add actions here without coupling mutations to chat wording.
export type MockAction =
  | { type: 'set-coverage-level'; coverageId: string; targetCoverageId: string }
  | { type: 'set-coverage-option'; coverageId: string; option: string; enabled: boolean }
  // Only dispatched by the "Godkjenn og betal" button, never by the AI.
  | { type: 'buy-offer'; offerId: string }

export function applyMockAction(customer: MockCustomer, action: MockAction): MockCustomer {
  const next = structuredClone(customer)
  if (action.type === 'buy-offer') {
    const offer = getOffer(action.offerId)
    if (!offer) throw new Error('Forslaget er ikke tilgjengelig.')
    if (isOfferPurchased(next.insurances, offer.id)) throw new Error('Denne forsikringen er allerede lagt til i profilen.')
    next.insurances.push(structuredClone(offer.policy))
    return next
  }
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
        throw new Error('Denne dekningsendringen støttes ikke ennå.')
      }
      insurance.coverageId = action.targetCoverageId
      insurance.coverage = levels[action.targetCoverageId]
      break
    }
    case 'set-coverage-option':
      if (!insurance.optionalCoverages || !Object.hasOwn(insurance.optionalCoverages, action.option) || typeof action.enabled !== 'boolean') {
        throw new Error('Dette tilvalget støttes ikke ennå.')
      }
      if (!action.enabled && insurance.coverages?.some((coverage) => coverage.option === action.option && coverage.required)) {
        throw new Error('Påkrevde dekninger kan ikke slås av.')
      }
      insurance.optionalCoverages[action.option] = action.enabled
      if (insurance.category === 'Reise' && action.option === 'familyTravel') {
        insurance.insuredPeople = action.enabled
          ? [next.name, ...next.family.children.map(({ age }) => `Barn på ${age} år`)]
          : [next.name]
      }
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

/** Actions the AI may return. Purchases are excluded on purpose. */
export function isCoverageAction(value: unknown): value is Exclude<MockAction, { type: 'buy-offer' }> {
  return isMockAction(value) && value.type !== 'buy-offer'
}

export function isMockAction(value: unknown): value is MockAction {
  if (!value || typeof value !== 'object') return false
  const action = value as Record<string, unknown>
  if (action.type === 'buy-offer') return Object.keys(action).length === 2 && !!getOffer(action.offerId)
  if (typeof action.coverageId !== 'string') return false
  return (action.type === 'set-coverage-level' && typeof action.targetCoverageId === 'string')
    || (action.type === 'set-coverage-option' && typeof action.option === 'string' && typeof action.enabled === 'boolean')
}
