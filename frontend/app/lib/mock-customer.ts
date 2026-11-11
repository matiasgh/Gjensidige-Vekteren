export type MockInsurance = {
  type: string
  coverage: string
  coverageId: string
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
  name: 'Ola Nordmann',
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
      registrationNumber: 'AB12345',
      collisionDeductibleNok: 6000,
      optionalCoverages: { rentalCar: true, puncture: false },
    },
    {
      type: 'Innboforsikring',
      coverage: 'Innbo Pluss',
      coverageId: 'contents-plus',
      insuredPeople: ['Ola Nordmann', 'Ektefelle', 'Barn på 9 år', 'Barn på 12 år'],
      address: 'Eksempelveien 1, Oslo',
      insuredAmountNok: 2000000,
      deductibleNok: 3000,
      optionalCoverages: { extendedMobileInsurance: false, increasedBicycleTheftLimit: false },
    },
    {
      type: 'Reiseforsikring',
      coverage: 'Reise Pluss',
      coverageId: 'travel-plus',
      insuredGroup: 'Familie',
      insuredPeople: ['Ola Nordmann', 'Ektefelle', 'Barn på 9 år', 'Barn på 12 år'],
      maxTripDays: 70,
      purchasedExtensions: [],
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
    })
}
