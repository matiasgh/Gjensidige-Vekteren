import type { MockInsurance } from './mock-customer'

// Fictitious offers the AI may show by id ("Reise til Thailand", Figma 26:135).
// Every visible field comes from here, never from the model, and the policy is
// only added when Kari presses "Godkjenn og betal" in the app.
export type InsuranceOffer = {
  id: string
  title: string
  product: string
  destination: string
  provider: 'Gjensidige'
  who: string
  period: string
  startLabel: string
  covers: string
  priceNok: number
  priceLabel: string
  policy: MockInsurance
}

export const insuranceOffers: Record<string, InsuranceOffer> = {
  familyTravelThailand: {
    id: 'familyTravelThailand',
    title: 'Familiereise Thailand',
    product: 'Familiereise',
    destination: 'Thailand',
    provider: 'Gjensidige',
    who: 'Kari og 3 barn',
    period: '14. juli – 4. august',
    startLabel: '14. juli',
    covers: 'Sykdom, ulykke, aktiviteter, avbestilling',
    priceNok: 389,
    priceLabel: 'kr 389 engangs',
    policy: {
      type: 'Reiseforsikring',
      category: 'Reise',
      provider: 'Gjensidige',
      coverage: 'Familiereise Thailand, 14. juli – 4. august',
      coverageId: 'travel-family-thailand',
      displayName: 'Familiereise',
      monthlyPriceNok: 0,
      oneTimePriceNok: 389,
      insuredPeople: ['Kari Haugen', 'Barn på 6 år', 'Barn på 9 år', 'Barn på 13 år'],
      includes: ['Sykdom og akutt hjelp, for hele familien', 'Ulykke', 'Aktiviteter som dykking og scooter', 'Avbestilling'],
      note: 'Fiktiv engangsforsikring for demo, kjøpt i chatten. Ikke en reell avtale.',
    },
  },
}

export const getOffer = (offerId: unknown) =>
  typeof offerId === 'string' && Object.hasOwn(insuranceOffers, offerId) ? insuranceOffers[offerId] : undefined

export const isOfferPurchased = (insurances: MockInsurance[], offerId: string) =>
  insurances.some((item) => item.coverageId === insuranceOffers[offerId]?.policy.coverageId)

export const offerForPolicy = (coverageId: string) =>
  Object.values(insuranceOffers).find(({ policy }) => policy.coverageId === coverageId)
