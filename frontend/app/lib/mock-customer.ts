import { carMonthlyPrice } from './mock-actions'

export type MockInsurance = {
  type: string
  coverage: string
  coverageId: string
  provider: string
  monthlyPriceNok: number
  displayName: string
  employer?: string
  vehicle?: string
  renewalDate?: string
  includes?: string[]
  excludes?: string[]
  registrationNumber?: string
  collisionDeductibleNok?: number
  optionalCoverages?: Record<string, boolean>
  insuredPeople?: string[]
  address?: string
  insuredAmountNok?: number
  deductibleNok?: number
  insuredGroup?: string
  maxTripDays?: number
  purchasedExtensions?: string[]
}

export type MockCustomer = {
  name: string
  dataType: string
  residenceCountry: string
  family: {
    maritalStatus: string
    spouse: { relationship: string }
    children: { age: number }[]
  }
  insurances: MockInsurance[]
}

// Only policies in this list are active. Catalogue products are not automatically owned.
export const mockCustomer: MockCustomer = {
  name: 'Kari Arnesen',
  dataType: 'Fiktiv kunde og fiktive avtalevalg for demo, ikke et faktisk forsikringsbevis',
  residenceCountry: 'Norge',
  family: {
    maritalStatus: 'Gift',
    spouse: {
      relationship: 'Ektefelle',
    },
    children: [{ age: 9 }, { age: 12 }],
  },
  insurances: [
    {
      type: 'Bilforsikring',
      coverage: 'Kasko',
      coverageId: 'car-kasko',
      provider: 'Gjensidige',
      displayName: 'Bil',
      monthlyPriceNok: 290,
      vehicle: 'Volvo XC60',
      renewalDate: '1. mars',
      registrationNumber: 'AB12345',
      collisionDeductibleNok: 6000,
      optionalCoverages: { partial: true, collision: true, roadside: true, rentalCar: false, puncture: false },
    },
    {
      type: 'Innboforsikring',
      coverage: 'Innbo Pluss',
      coverageId: 'contents-plus',
      provider: 'Gjensidige',
      displayName: 'Hus og innbo',
      monthlyPriceNok: 410,
      includes: ['Brann- og vannskader på hus og innbo', 'Tyveri og uhellsskader på innbo', 'Ansvar og rettshjelp'],
      insuredPeople: ['Kari Arnesen', 'Ektefelle', 'Barn på 9 år', 'Barn på 12 år'],
      address: 'Eksempelveien 1, Oslo',
      insuredAmountNok: 2000000,
      deductibleNok: 3000,
      optionalCoverages: { extendedMobileInsurance: false, increasedBicycleTheftLimit: false },
    },
    {
      type: 'Reiseforsikring',
      coverage: 'Reise via jobb',
      coverageId: 'travel-work',
      provider: 'Via jobb',
      displayName: 'Reise',
      employer: 'Arnesen Bygg AS',
      monthlyPriceNok: 0,
      insuredGroup: 'Ansatt',
      insuredPeople: ['Kari Arnesen'],
      includes: ['Sykdom og akutt hjelp', 'Bagasje og forsinkelse', 'Avbestilling'],
      excludes: ['Barna dine (ikke med på jobbens avtale)', 'Dykking og andre risikoaktiviteter'],
      maxTripDays: 45,
      purchasedExtensions: [],
    },
    {
      type: 'Barneforsikring', coverage: 'Familie og barn', coverageId: 'child-medium',
      provider: 'Gjensidige', displayName: 'Familie og barn', monthlyPriceNok: 120,
      insuredPeople: ['Barn på 9 år', 'Barn på 12 år'],
      includes: ['Økonomisk støtte ved alvorlig sykdom og ulykke', 'Uførepensjon etter avtalens vilkår', 'Helsehjelp for barna'],
    },
    {
      type: 'Bedriftsforsikring', coverage: 'Bedrift', coverageId: 'business-if',
      provider: 'If', displayName: 'Bedrift', monthlyPriceNok: 80,
      includes: ['Bedriftens utstyr', 'Ansvar i virksomheten'],
    },
  ],
}

export function createDefaultCustomer(): MockCustomer {
  return structuredClone(mockCustomer)
}

// Match the complete seed shape, including policy-specific fields. Stored data
// and request bodies are untrusted; accepting a name and insurance array alone
// would let malformed profiles reach both the UI and the model.
function matchesShape(value: unknown, template: unknown): boolean {
  if (Array.isArray(template)) {
    return Array.isArray(value) && value.every((item, index) => template.length ? matchesShape(item, template[index] ?? template[0]) : typeof item === 'string')
  }
  if (template !== null && typeof template === 'object') {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
    const record = value as Record<string, unknown>
    return Object.keys(record).length === Object.keys(template).length
      && Object.entries(template).every(([key, item]) => Object.hasOwn(record, key) && matchesShape(record[key], item))
  }
  return typeof value === typeof template && (typeof value !== 'number' || Number.isFinite(value))
}

export function isMockCustomer(value: unknown): value is MockCustomer {
  if (!matchesShape(value, mockCustomer)) return false
  const customer = value as MockCustomer
  return customer.insurances.length === mockCustomer.insurances.length
    && customer.insurances.every((insurance, index) => {
      const seed = mockCustomer.insurances[index]
      const levels = seed.coverageId === 'travel-plus'
        ? { 'travel-standard': 'Reise', 'travel-plus': 'Reise Pluss' }
        : { [seed.coverageId]: seed.coverage }
      return insurance.type === seed.type
        && Object.hasOwn(levels, insurance.coverageId)
        && insurance.coverage === levels[insurance.coverageId as keyof typeof levels]
        && insurance.monthlyPriceNok >= 0
        && insurance.provider === seed.provider
        && insurance.employer === seed.employer
        && (!insurance.optionalCoverages?.collision || insurance.optionalCoverages.partial)
        && (insurance.coverageId !== 'car-kasko' || insurance.monthlyPriceNok === carMonthlyPrice(insurance.optionalCoverages!))
    })
}
