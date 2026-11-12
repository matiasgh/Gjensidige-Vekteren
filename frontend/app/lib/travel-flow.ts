import { coverageCheckItems, type AiBlock } from './chat-blocks'
import type { MockCustomer } from './mock-customer'
import { insuranceOffers, isOfferPurchased } from './travel-offer'

export const TRAVEL_REVIEW_STAGE = 'travel-awaiting-proposal'
export const SHOW_TRAVEL_PROPOSAL = 'Ja, vis meg'
export const DECLINE_TRAVEL_PROPOSAL = 'Ikke nå'

export function travelReviewReply(customer: MockCustomer) {
  const insurance = customer.insurances.find((item) => item.coverageId === 'travel-standard' || item.coverageId === 'travel-plus')
  const offer = insuranceOffers.familyTravelThailand
  if (!insurance || !coverageCheckItems(customer, insurance.coverageId)
    || insurance.optionalCoverages?.familyTravel || isOfferPurchased(customer.insurances, offer.id)) return null
  return {
    reply: 'Reiseforsikringen din gjelder bare deg, ikke barna. Fullstendige avtalevilkår og detaljene for reisen må kontrolleres.',
    blocks: [
      { type: 'coverage-check', coverageId: insurance.coverageId },
      { type: 'quick-replies', options: [{ label: SHOW_TRAVEL_PROPOSAL }, { label: DECLINE_TRAVEL_PROPOSAL }] },
    ] satisfies AiBlock[],
    followUp: 'Jeg ser to ting som bør på plass før du drar. Skal jeg vise dem?',
    travelStage: TRAVEL_REVIEW_STAGE,
    actions: [],
  }
}

export function travelProposalReply(customer: MockCustomer) {
  // Recheck current state: an old conversation must not re-offer bought coverage.
  if (!travelReviewReply(customer)) return { reply: 'Familiedekningen er allerede oppdatert, eller forslaget er ikke tilgjengelig lenger.', actions: [] }
  return {
    reply: 'Her er et praktisk tips og et forslag til ekstra reisedekning. Ingenting kjøpes før du selv godkjenner.',
    blocks: [
      { type: 'tip', title: 'Husk reisevaksine', body: 'Sjekk anbefalte reisevaksiner for Thailand med lege eller vaksinasjonsklinikk før avreise.', remindInDays: 14 },
      { type: 'offer', offerId: 'familyTravelThailand' },
    ] satisfies AiBlock[],
    actions: [],
  }
}
