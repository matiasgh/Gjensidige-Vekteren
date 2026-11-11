import { carMonthlyPrice } from './mock-actions'
export type InsuranceProvider = 'Gjensidige' | 'If' | 'Via jobb – Arnesen Bygg AS'
export type InsuranceCategory = 'Hus og innbo' | 'Bil' | 'Reise' | 'Familie og barn' | 'Bedrift'

// Third-party and business policies have no catalogue entry; this fictional summary is their only source.
export type CoverageSummary = { basis: string; includes: string[]; excludes: string[] }

export type OptionalCoverageDetail = { description: string; annualPremiumNok: number; claimsMade: number; overlap: string }

export type MockInsurance = {
  type: string
  category: InsuranceCategory
  provider: InsuranceProvider
  coverage: string
  coverageId: string
  monthlyPriceNok: number
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
  optionalCoverageDetails?: Record<string, OptionalCoverageDetail>
  insuredPeople?: string[]
  address?: string
  insuredAmountNok?: number
  deductibleNok?: number
  purchasedExtensions?: string[]
  company?: string
  note?: string
}

export type GapFinding = { title: string; reason: string; actionLabel: string }

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
  // Vekter'n's earlier, non-binding assessment shown to the customer during onboarding.
  gapAnalysis: GapFinding[]
}

const fictionalSummary = 'Fiktivt, forenklet sammendrag for demo – ikke reelle vilkår fra selskapet'

// Only policies in this list are active. Catalogue products are not automatically owned.
export const mockCustomer: MockCustomer = {
  name: 'Kari Haugen',
  firstName: 'Kari',
  dataType: 'Fiktiv kunde og fiktive avtalevalg for demo, ikke et faktisk forsikringsbevis',
  residenceCountry: 'Norge',
  home: { type: 'Enebolig', address: 'Furuvegen 14, 2318 Hamar (Innlandet)', builtYear: 1962, ownership: 'Selveier' },
  family: { maritalStatus: 'Enslig forsørger', children: [{ age: 6 }, { age: 9 }, { age: 13 }] },
  employment: {
    employer: 'Arnesen Bygg AS',
    role: 'Prosjektleder',
    ownCompany: { name: 'Haugen Interiør AS', description: 'Lite enkeltmannsdrevet interiørfirma ved siden av jobben', employees: 0 },
  },
  plannedTrips: [{ destination: 'USA', period: 'Juli', travellers: ['Kari Haugen', 'Barn på 6 år', 'Barn på 9 år', 'Barn på 13 år'] }],
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
      optionalCoverages: { rotAndPestAddon: false },
      note: 'Tillegget for råtesopp og skadeinsekter er ikke valgt',
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
      insuredPeople: ['Kari Haugen', 'Barn på 6 år', 'Barn på 9 år', 'Barn på 13 år'],
      address: 'Furuvegen 14, 2318 Hamar',
      insuredAmountNok: 1500000,
      deductibleNok: 3000,
      optionalCoverages: { extendedMobileInsurance: false, increasedBicycleTheftLimit: false, pestControlAddon: true },
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
      coverageId: 'car-kasko',
      displayName: 'Bil',
      monthlyPriceNok: 290,
      vehicle: 'Volvo XC60',
      renewalDate: '1. mars',
      collisionDeductibleNok: 6000,
      optionalCoverages: { partial: true, collision: true, roadside: true, rentalCar: false, puncture: false },
      coverageSummary: {
        basis: fictionalSummary,
        includes: ['Ansvar ved skade på andre', 'Brann, tyveri og glass', 'Kollisjon og hærverk på egen bil', 'Veihjelp i Norge'],
        excludes: ['Leiebil ved skade', 'Bagasje og personlige ting i bilen'],
      },
    },
    {
      type: 'Reiseforsikring',
      category: 'Reise',
      coverageId: 'travel-work',
      displayName: 'Reise',
      employer: 'Arnesen Bygg AS',
      monthlyPriceNok: 0,
      maxTripDays: 45,
      provider: 'Via jobb – Arnesen Bygg AS',
      coverage: 'Kollektiv reiseforsikring for ansatte',
      insuredPeople: ['Kari Haugen'],
      coverageSummary: {
        basis: fictionalSummary,
        includes: ['Sykdom og akutt hjelp på reise, for Kari', 'Bagasje og forsinkelse, for Kari', 'Gjelder både jobbreiser og fritidsreiser'],
        excludes: ['Barn og øvrig familie', 'Aktiviteter som dykking og scooter', 'Avbestilling av fritidsreiser'],
      },
    },
    {
      type: 'Barneforsikring',
      category: 'Familie og barn',
      provider: 'Gjensidige',
      coverage: 'Barneforsikring – Medium',
      coverageId: 'child-medium',
      displayName: 'Familie og barn',
      monthlyPriceNok: 120,
      includes: ['Økonomisk støtte ved alvorlig sykdom og ulykke', 'Uførepensjon etter avtalens vilkår', 'Helsehjelp for barna'],
      insuredPeople: ['Barn på 6 år', 'Barn på 9 år', 'Barn på 13 år'],
    },
    {
      type: 'Bedriftsforsikring',
      category: 'Bedrift',
      provider: 'Gjensidige',
      coverage: 'Småbedrift',
      company: 'Haugen Interiør AS',
      coverageId: 'business',
      displayName: 'Bedrift',
      monthlyPriceNok: 80,
      coverageSummary: {
        basis: fictionalSummary,
        includes: ['Ansvar overfor kunder', 'Utstyr og varer på eget lager', 'Rettshjelp ved tvist med kunder'],
        excludes: ['Avbruddstap', 'Ansatte (firmaet har ingen ansatte)', 'Yrkesskade'],
      },
    },
  ],
  gapAnalysis: [
    {
      title: 'Råte er ikke dekket',
      reason: 'Huset er fra 1962, og råteskader er blant de dyreste skadene for hus på din alder. Jeg anbefaler en råtesjekk.',
      actionLabel: 'Se godkjente håndverkere',
    },
    {
      title: 'Barna mangler på reise',
      reason: 'Jobbens reiseforsikring dekker bare deg. Familien er ikke med til USA i juli.',
      actionLabel: 'Se hva det koster',
    },
    {
      title: 'Du betaler for noe du ikke trenger',
      reason: 'Innboforsikringen har et tillegg du aldri har brukt og som huset ditt allerede dekker. Du kan fjerne det.',
      actionLabel: 'Se hva du sparer',
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
    return Object.keys(record).length === Object.keys(template).length
      && Object.entries(template).every(([key, item]) => Object.hasOwn(record, key) && matchesShape(record[key], item))
  }
  return typeof value === typeof template && (typeof value !== 'number' || Number.isFinite(value))
}

export function isMockCustomer(value: unknown): value is MockCustomer {
  if (!matchesShape(value, mockCustomer)) return false
  const customer = value as MockCustomer
  return customer.insurances.length === mockCustomer.insurances.length
    && customer.gapAnalysis.length === mockCustomer.gapAnalysis.length
    && customer.insurances.every((insurance, index) => {
      const seed = mockCustomer.insurances[index]
      if (insurance.type !== seed.type || insurance.category !== seed.category || insurance.provider !== seed.provider) return false
      if (insurance.employer !== seed.employer || insurance.monthlyPriceNok < 0) return false
      if (insurance.coverageId === 'car-kasko' && (insurance.monthlyPriceNok !== carMonthlyPrice(insurance.optionalCoverages!) || (insurance.optionalCoverages!.collision && !insurance.optionalCoverages!.partial))) return false
      const levels = levelsFor(seed.coverageId) ?? (seed.coverageId === undefined ? undefined : { [seed.coverageId]: seed.coverage })
      if (!levels) return insurance.coverage === seed.coverage
      return insurance.coverageId !== undefined && Object.hasOwn(levels, insurance.coverageId) && insurance.coverage === levels[insurance.coverageId]
    })
}
