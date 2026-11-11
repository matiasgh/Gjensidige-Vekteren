import type { MockCoverageId } from './mock-coverages.server'

export type InsuranceProvider = 'Gjensidige' | 'If' | 'Via jobb – Arnesen Bygg AS'

export type InsuranceCategory = 'Hus og innbo' | 'Bil' | 'Reise' | 'Familie og barn' | 'Bedrift'

// Third-party and business policies have no catalogue entry; this fictional summary is their only source.
type CoverageSummary = { basis: string; includes: string[]; excludes: string[] }

type Insurance = {
  type: string
  category: InsuranceCategory
  provider: InsuranceProvider
  coverage: string
  coverageId?: MockCoverageId
  coverageSummary?: CoverageSummary
  [detail: string]: unknown
}

type GapFinding = { title: string; reason: string; actionLabel: string }

const fictionalSummary = 'Fiktivt, forenklet sammendrag for demo – ikke reelle vilkår fra selskapet'

// Only policies in this list are active. Catalogue products are not automatically owned.
export const mockCustomer = {
  name: 'Kari Haugen',
  firstName: 'Kari',
  dataType: 'Fiktiv kunde og fiktive avtalevalg for demo, ikke et faktisk forsikringsbevis',
  residenceCountry: 'Norge',
  home: {
    type: 'Enebolig',
    address: 'Furuvegen 14, 2318 Hamar (Innlandet)',
    builtYear: 1962,
    ownership: 'Selveier',
  },
  family: {
    maritalStatus: 'Enslig forsørger',
    children: [{ age: 6 }, { age: 9 }, { age: 13 }],
  },
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
      address: 'Furuvegen 14, 2318 Hamar',
      purchasedExtensions: [],
      note: 'Råtesopp- og skadeinsekttillegget er ikke valgt, og avtalen er ikke Hus Pluss',
    },
    {
      type: 'Innboforsikring',
      category: 'Hus og innbo',
      provider: 'Gjensidige',
      coverage: 'Innbo Pluss',
      coverageId: 'contents-plus',
      insuredPeople: ['Kari Haugen', 'Barn på 6 år', 'Barn på 9 år', 'Barn på 13 år'],
      address: 'Furuvegen 14, 2318 Hamar',
      insuredAmountNok: 1500000,
      deductibleNok: 3000,
      optionalCoverages: {
        extendedMobileInsurance: false,
        increasedBicycleTheftLimit: false,
        pestControlAddon: {
          selected: true,
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
      coverageSummary: {
        basis: fictionalSummary,
        includes: ['Ansvar ved skade på andre', 'Brann, tyveri og glass', 'Kollisjon og hærverk på egen bil', 'Veihjelp i Norge'],
        excludes: ['Leiebil ved skade', 'Bagasje og personlige ting i bilen'],
      },
    },
    {
      type: 'Reiseforsikring',
      category: 'Reise',
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
      insuredPeople: ['Barn på 6 år', 'Barn på 9 år', 'Barn på 13 år'],
    },
    {
      type: 'Bedriftsforsikring',
      category: 'Bedrift',
      provider: 'Gjensidige',
      coverage: 'Småbedrift',
      company: 'Haugen Interiør AS',
      coverageSummary: {
        basis: fictionalSummary,
        includes: ['Ansvar overfor kunder', 'Utstyr og varer på eget lager', 'Rettshjelp ved tvist med kunder'],
        excludes: ['Avbruddstap', 'Ansatte (firmaet har ingen ansatte)', 'Yrkesskade'],
      },
    },
  ] satisfies Insurance[] as Insurance[],
  // Vekter'n's earlier, non-binding assessment shown to the customer during onboarding.
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
  ] satisfies GapFinding[],
}
