import type { MockCoverageId } from './mock-coverages.server'

// Only policies in this list are active. Catalogue products are not automatically owned.
export const mockCustomer = {
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
      coverageId: 'car-kasko' satisfies MockCoverageId,
      registrationNumber: 'AB12345',
      collisionDeductibleNok: 6000,
      optionalCoverages: { rentalCar: true, puncture: false },
    },
    {
      type: 'Innboforsikring',
      coverage: 'Innbo Pluss',
      coverageId: 'contents-plus' satisfies MockCoverageId,
      insuredPeople: ['Ola Nordmann', 'Ektefelle', 'Barn på 9 år', 'Barn på 12 år'],
      address: 'Eksempelveien 1, Oslo',
      insuredAmountNok: 2000000,
      deductibleNok: 3000,
      optionalCoverages: { extendedMobileInsurance: false, increasedBicycleTheftLimit: false },
    },
    {
      type: 'Reiseforsikring',
      coverage: 'Reise Pluss',
      coverageId: 'travel-plus' satisfies MockCoverageId,
      insuredGroup: 'Familie',
      insuredPeople: ['Ola Nordmann', 'Ektefelle', 'Barn på 9 år', 'Barn på 12 år'],
      maxTripDays: 70,
      purchasedExtensions: [],
    },
  ],
}
