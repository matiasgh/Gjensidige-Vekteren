import { insuranceMonthlyPrice } from './mock-actions'
import { insuranceOffers } from './travel-offer'
export type InsuranceProvider = 'Gjensidige' | 'If' | 'Storebrand'
export type InsuranceCategory = 'Hus og innbo' | 'Bil' | 'Reise' | 'Barneforsikring' | 'Livsforsikring' | 'Uføreforsikring'

// Third-party policy summaries describe fictional demo agreements, not provider terms.
export type CoverageSummary = { basis: string; includes: string[]; excludes: string[] }

export type OptionalCoverageDetail = { description: string; annualPremiumNok: number; claimsMade: number; overlap: string }

// Fictitious prices and user-specific advice; a future service can supply tip per user.
export type PolicyCoverage = { option: string; title: string; monthlyPriceNok: number; description?: string; required?: boolean; tip?: string }

export type MockInsurance = {
  type: string
  category: InsuranceCategory
  provider: InsuranceProvider
  coverage: string
  coverageId: string
  monthlyPriceNok: number
  // One-off price for single-trip policies bought in the chat; they add nothing to the monthly total.
  oneTimePriceNok?: number
  displayName: string
  employer?: string
  vehicle?: string
  renewalDate?: string
  includes?: string[]
  excludes?: string[]
  coverageSummary?: CoverageSummary
  collisionDeductibleNok?: number
  maxTripDays?: number
  registrationNumber?: string
  optionalCoverages?: Record<string, boolean>
  coverages?: PolicyCoverage[]
  optionalCoverageDetails?: Record<string, OptionalCoverageDetail>
  insuredPeople?: string[]
  address?: string
  insuredAmountNok?: number
  deductibleNok?: number
  purchasedExtensions?: string[]
  company?: string
  note?: string
}

export type MockCustomer = {
  name: string
  firstName: string
  dataType: string
  residenceCountry: string
  home: { type: string; address: string; builtYear: number; ownership: string }
  family: { maritalStatus: string; children: { age: number }[] }
  employment: {
    employer: string
    role: string
    ownCompany: { name: string; description: string; employees: number }
  }
  plannedTrips: { destination: string; period: string; travellers: string[] }[]
  insurances: MockInsurance[]
}

const fictionalSummary = 'Fiktivt, forenklet sammendrag for demo – ikke reelle vilkår fra selskapet'

// Only policies in this list are active. Catalogue products are not automatically owned.
export const mockCustomer: MockCustomer = {
  name: 'Lisbeth Haugen',
  firstName: 'Lisbeth',
  dataType: 'Fiktiv kunde og fiktive avtalevalg for demo, ikke et faktisk forsikringsbevis',
  residenceCountry: 'Norge',
  home: { type: 'Enebolig', address: 'Furuvegen 14, 2318 Hamar (Innlandet)', builtYear: 1962, ownership: 'Selveier' },
  family: { maritalStatus: 'Enslig forsørger', children: [{ age: 6 }, { age: 9 }, { age: 13 }] },
  employment: {
    employer: 'Arnesen Bygg AS',
    role: 'Prosjektleder',
    ownCompany: { name: 'Haugen Interiør AS', description: 'Lite enkeltmannsdrevet interiørfirma ved siden av jobben', employees: 0 },
  },
  plannedTrips: [{ destination: 'Thailand', period: '14. juli – 4. august (3 uker)', travellers: ['Lisbeth Haugen', 'Barn på 6 år', 'Barn på 9 år', 'Barn på 13 år'] }],
  insurances: [
    {
      type: 'Husforsikring',
      category: 'Hus og innbo',
      provider: 'Gjensidige',
      coverage: 'Hus',
      coverageId: 'building',
      displayName: 'Hus',
      monthlyPriceNok: 250,
      includes: ['Brann-, vann- og naturskader på bygningen', 'Bekjempelse av mus og rotter', 'Ansvar og rettshjelp'],
      address: 'Furuvegen 14, 2318 Hamar',
      optionalCoverages: { buildingDamage: true, rodents: true, liability: true, rotAndPestAddon: false },
      coverages: [
        { option: 'buildingDamage', title: 'Brann, vann og naturskader', monthlyPriceNok: 190, description: 'Skader på bygningen' },
        { option: 'rodents', title: 'Bekjempelse av mus og rotter', monthlyPriceNok: 35 },
        { option: 'liability', title: 'Ansvar og rettshjelp', monthlyPriceNok: 25 },
        { option: 'rotAndPestAddon', title: 'Råtesopp og skadeinsekter', monthlyPriceNok: 55, tip: 'Huset er fra 1962, og råteskader er blant de dyreste skadene for hus på din alder – vurder å slå på dekningen.' },
      ],
    },
    {
      type: 'Innboforsikring',
      category: 'Hus og innbo',
      provider: 'Gjensidige',
      coverage: 'Innbo Pluss',
      coverageId: 'contents-plus',
      displayName: 'Innbo',
      monthlyPriceNok: 160,
      includes: ['Brann- og vannskader på innbo', 'Tyveri og uhellsskader på innbo', 'Ansvar og rettshjelp'],
      insuredPeople: ['Lisbeth Haugen', 'Barn på 6 år', 'Barn på 9 år', 'Barn på 13 år'],
      address: 'Furuvegen 14, 2318 Hamar',
      insuredAmountNok: 1500000,
      deductibleNok: 3000,
      optionalCoverages: { contentsDamage: true, theftAndAccidents: true, liability: true, extendedMobileInsurance: false, increasedBicycleTheftLimit: false, pestControlAddon: true },
      coverages: [
        { option: 'contentsDamage', title: 'Brann og vannskader', monthlyPriceNok: 55, description: 'Skader på innbo' },
        { option: 'theftAndAccidents', title: 'Tyveri og uhell', monthlyPriceNok: 40 },
        { option: 'liability', title: 'Ansvar og rettshjelp', monthlyPriceNok: 20 },
        { option: 'extendedMobileInsurance', title: 'Utvidet mobilforsikring', monthlyPriceNok: 25 },
        { option: 'increasedBicycleTheftLimit', title: 'Økt grense for sykkeltyveri', monthlyPriceNok: 20 },
        { option: 'pestControlAddon', title: 'Bekjempelse av mus og rotter', monthlyPriceNok: 45, tip: 'Du har aldri brukt tillegget, og huset dekker allerede mus og rotter – vurder å slå det av.' },
      ],
      optionalCoverageDetails: {
        pestControlAddon: {
          description: 'Fiktivt demotillegg: bekjempelse av mus og rotter i boligen',
          annualPremiumNok: 540,
          claimsMade: 0,
          overlap: 'Husforsikringen dekker allerede bekjempelse av mus og rotter',
        },
      },
    },
    {
      type: 'Bilforsikring',
      category: 'Bil',
      provider: 'If',
      coverage: 'Kasko',
      registrationNumber: 'EL 48213',
      coverageId: 'car-if-kasko',
      displayName: 'Bil',
      monthlyPriceNok: 290,
      vehicle: 'Volvo XC60',
      renewalDate: '1. mars',
      collisionDeductibleNok: 6000,
      coverageSummary: {
        basis: fictionalSummary,
        includes: ['Ansvar', 'Brann, tyveri og glasskade', 'Kollisjon og utforkjøring', 'Veihjelp'],
        excludes: ['Leiebil', 'Punkteringsdekning'],
      },
      optionalCoverages: { liability: true, partial: true, collision: true, roadside: true, rentalCar: false, puncture: false },
      coverages: [
        { option: 'liability', title: 'Ansvar', monthlyPriceNok: 65, required: true },
        { option: 'partial', title: 'Delkasko', monthlyPriceNok: 70 },
        { option: 'collision', title: 'Kasko', monthlyPriceNok: 120 },
        { option: 'roadside', title: 'Veihjelp', monthlyPriceNok: 35, tip: 'Du har ikke brukt veihjelp på 3 år, men den koster bare kr 35 i måneden – behold den.' },
        { option: 'rentalCar', title: 'Leiebil', monthlyPriceNok: 45 },
        { option: 'puncture', title: 'Punkteringsdekning', monthlyPriceNok: 20 },
      ],
    },
    {
      type: 'Reiseforsikring',
      category: 'Reise',
      coverageId: 'travel-standard',
      displayName: 'Reise',
      monthlyPriceNok: 100,
      maxTripDays: 70,
      provider: 'Gjensidige',
      coverage: 'Reise',
      insuredPeople: ['Lisbeth Haugen'],
      optionalCoverages: { travelMedical: true, baggageAndDelay: true, cancellation: true, familyTravel: false },
      coverages: [
        { option: 'travelMedical', title: 'Sykdom og akutt hjelp på reise', monthlyPriceNok: 50 },
        { option: 'baggageAndDelay', title: 'Bagasje og forsinkelse', monthlyPriceNok: 30 },
        { option: 'cancellation', title: 'Avbestilling', monthlyPriceNok: 20 },
        { option: 'familyTravel', title: 'Familiedekning', monthlyPriceNok: 60, description: 'Utvider demoavtalen til Lisbeth og de tre barna', tip: 'Reiseforsikringen gjelder bare deg. Vurder familiedekning før turen til Thailand.' },
      ],
      coverageSummary: {
        basis: fictionalSummary,
        includes: ['Sykdom og akutt hjelp, for deg', 'Bagasje og forsinkelse', 'Avbestilling'],
        excludes: ['Barna er ikke med'],
      },
    },
    {
      type: 'Barneforsikring',
      category: 'Barneforsikring',
      provider: 'Gjensidige',
      coverage: 'Barneforsikring – Medium',
      coverageId: 'child-medium',
      displayName: 'Barneforsikring',
      monthlyPriceNok: 120,
      includes: ['Økonomisk støtte ved alvorlig sykdom og ulykke', 'Uførepensjon etter avtalens vilkår', 'Helsehjelp for barna'],
      insuredPeople: ['Barn på 6 år', 'Barn på 9 år', 'Barn på 13 år'],
      optionalCoverages: { illnessAndAccidents: true, disabilityPension: true, healthCare: true },
      coverages: [
        { option: 'illnessAndAccidents', title: 'Alvorlig sykdom og ulykke', monthlyPriceNok: 50, description: 'Økonomisk støtte til barna' },
        { option: 'disabilityPension', title: 'Uførepensjon', monthlyPriceNok: 45, description: 'Etter avtalens vilkår' },
        { option: 'healthCare', title: 'Helsehjelp', monthlyPriceNok: 25, description: 'Helsehjelp for barna' },
      ],
    },
    {
      type: 'Livsforsikring',
      category: 'Livsforsikring',
      provider: 'Storebrand',
      coverage: 'Livsforsikring via jobb',
      coverageId: 'life-work-storebrand',
      displayName: 'Livsforsikring',
      employer: 'Arnesen Bygg AS',
      monthlyPriceNok: 0,
      insuredPeople: ['Lisbeth Haugen'],
      coverageSummary: {
        basis: fictionalSummary,
        includes: ['Engangsutbetaling til etterlatte ved dødsfall etter avtalens vilkår'],
        excludes: ['Uførhet', 'Barna har ikke egen livsforsikring i denne avtalen'],
      },
    },
    {
      type: 'Uføreforsikring',
      category: 'Uføreforsikring',
      provider: 'Storebrand',
      coverage: 'Uføreforsikring via jobb',
      coverageId: 'disability-work-storebrand',
      displayName: 'Uføreforsikring',
      employer: 'Arnesen Bygg AS',
      monthlyPriceNok: 0,
      insuredPeople: ['Lisbeth Haugen'],
      coverageSummary: {
        basis: fictionalSummary,
        includes: ['Økonomisk støtte ved arbeidsuførhet etter avtalens vilkår'],
        excludes: ['Engangsutbetaling til etterlatte ved dødsfall', 'Barna er ikke med i denne avtalen'],
      },
    },
  ],
}

// Coverage levels the demo can switch between, per product family (names match the catalogue).
export const coverageLevels: Record<string, string>[] = [
  { building: 'Hus', 'building-plus': 'Hus Pluss' },
  { 'child-basis': 'Barneforsikring – Basis', 'child-medium': 'Barneforsikring – Medium', 'child-plus': 'Barneforsikring – Pluss' },
  { 'travel-standard': 'Reise', 'travel-plus': 'Reise Pluss' },
]

// Labels for the boolean optionalCoverages the demo can toggle.
export const optionLabels: Record<string, string> = {
  partial: 'Delkasko', collision: 'Kasko', roadside: 'Veihjelp', rentalCar: 'Leiebil', puncture: 'Punkteringsdekning',
  rotAndPestAddon: 'Tillegg for råtesopp og skadeinsekter',
  extendedMobileInsurance: 'Utvidet mobilforsikring',
  increasedBicycleTheftLimit: 'Økt grense for sykkeltyveri',
  pestControlAddon: 'Tillegg for bekjempelse av mus og rotter',
  buildingDamage: 'Brann, vann og naturskader', rodents: 'Bekjempelse av mus og rotter', liability: 'Ansvar og rettshjelp',
  contentsDamage: 'Brann og vannskader på innbo', theftAndAccidents: 'Tyveri og uhell',
  illnessAndAccidents: 'Alvorlig sykdom og ulykke', disabilityPension: 'Uførepensjon', healthCare: 'Helsehjelp',
  travelMedical: 'Sykdom og akutt hjelp på reise', baggageAndDelay: 'Bagasje og forsinkelse', cancellation: 'Avbestilling', familyTravel: 'Familiedekning',
}

export const levelsFor = (coverageId: string | undefined) =>
  coverageId === undefined ? undefined : coverageLevels.find((levels) => Object.hasOwn(levels, coverageId))

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
    const isCoverage = Object.hasOwn(template, 'option') && Object.hasOwn(template, 'monthlyPriceNok')
    const entries = Object.entries(template).filter(([key]) => !isCoverage || key !== 'tip')
    const keys = Object.keys(record).filter((key) => !isCoverage || key !== 'tip')
    return keys.length === entries.length
      && (!isCoverage || record.tip === undefined || typeof record.tip === 'string')
      && entries.every(([key, item]) => Object.hasOwn(record, key) && matchesShape(record[key], item))
  }
  return typeof value === typeof template && (typeof value !== 'number' || Number.isFinite(value))
}

function isDeepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false
  const keys = Object.keys(a)
  return keys.length === Object.keys(b).length && keys.every((key) => Object.hasOwn(b, key) && isDeepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
}

// Policies bought from a known offer are appended after the seed policies and
// must match that offer exactly (once each), so stored data cannot invent policies.
const offerPolicies = Object.values(insuranceOffers).map(({ policy }) => policy)

export function isMockCustomer(value: unknown): value is MockCustomer {
  if (!value || typeof value !== 'object' || !Array.isArray((value as MockCustomer).insurances)) return false
  const all = (value as MockCustomer).insurances
  const seedCount = mockCustomer.insurances.length
  const bought = all.slice(seedCount)
  if (all.length < seedCount || !bought.every((policy) => offerPolicies.some((offer) => isDeepEqual(policy, offer)))
    || new Set(bought.map((policy) => policy.coverageId)).size !== bought.length) return false
  if (!matchesShape({ ...value, insurances: all.slice(0, seedCount) }, mockCustomer)) return false
  const customer = value as MockCustomer
  return customer.insurances.slice(0, seedCount).every((insurance, index) => {
      const seed = mockCustomer.insurances[index]
      if (insurance.type !== seed.type || insurance.category !== seed.category || insurance.provider !== seed.provider) return false
      if (insurance.employer !== seed.employer || insurance.monthlyPriceNok < 0) return false
      if (insurance.coverages) {
        if (insurance.coverages.length !== seed.coverages?.length || insurance.coverages.some((coverage, index) => {
          const expected = seed.coverages![index]
          return coverage.option !== expected.option || coverage.title !== expected.title
            || coverage.monthlyPriceNok !== expected.monthlyPriceNok || coverage.required !== expected.required
        })) return false
        if (insurance.monthlyPriceNok !== insuranceMonthlyPrice(insurance)) return false
        if (insurance.coverages.some((coverage) => coverage.required && !insurance.optionalCoverages?.[coverage.option])) return false
      }
      if (insurance.coverageId === 'car-kasko' && insurance.optionalCoverages!.collision && !insurance.optionalCoverages!.partial) return false
      const levels = levelsFor(seed.coverageId) ?? (seed.coverageId === undefined ? undefined : { [seed.coverageId]: seed.coverage })
      if (!levels) return insurance.coverage === seed.coverage
      return insurance.coverageId !== undefined && Object.hasOwn(levels, insurance.coverageId) && insurance.coverage === levels[insurance.coverageId]
    })
}
