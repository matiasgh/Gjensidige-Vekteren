import type { MockCustomer } from './mock-customer'
import type { ChatMessage, MockState } from './mock-state'

// Scripted "bulk i bilen" flow (Figma 26:139). Photo analysis, claims, bookings
// and towing are fixed demo texts: nothing is analysed or sent anywhere real.

export const carDamageKinds = ['damage-start', 'damage-photo-request', 'damage-injured', 'damage-analysis', 'damage-actions', 'damage-confirmation'] as const
export type CarDamageKind = (typeof carDamageKinds)[number]

export const CAR_DAMAGE_FLOW = 'car-damage'
export const DAMAGE_PHOTO_CONTENT = 'Bilde av skaden'
export const MAX_IMAGE_DATA_URL_LENGTH = 1_500_000

export const carDamageTexts = {
  start: 'Å nei. Er alle uskadet? Send meg et bilde av skaden, så ser jeg hva som må gjøres.',
  uninjuredReply: 'Alle er uskadet',
  injuredReply: 'Noen er skadet',
  photoRequest: 'Så bra at alle er uskadet. Send meg et bilde av skaden, så ser jeg hva som må gjøres.',
  injured: 'Ring 113 hvis noen trenger akutt hjelp. Når alle er trygge, kan du sende meg et bilde av skaden, så ser jeg hva som må gjøres.',
  description: 'Jeg ser en bulk på høyre bakdør, rundt 15 cm. Lakken ser hel ut.',
  actions: 'Hva vil du gjøre? Ingenting sendes før du velger.',
  towCalled: 'Ola, bergeren, ringer deg om litt.',
  towCancelled: 'Bestillingen av bilbergning er avbrutt.',
}

export type CarCoverage = {
  vehicle: string
  registrationNumber: string
  kasko: boolean
  roadside: boolean
  deductibleNok: number
}

export const money = (value: number) => `kr ${value.toLocaleString('nb-NO')}`

// Derived from the live demo profile, so the overview's switches change the flow.
export function carCoverage(customer: MockCustomer): CarCoverage | null {
  const car = customer.insurances.find((item) => item.category === 'Bil')
  if (!car) return null
  return {
    vehicle: car.vehicle ?? 'Bilen din',
    registrationNumber: car.registrationNumber ?? '',
    kasko: !!car.optionalCoverages?.collision,
    roadside: !!car.optionalCoverages?.roadside,
    deductibleNok: car.collisionDeductibleNok ?? 0,
  }
}

export function analysisText(coverage: CarCoverage | null) {
  const verdict = coverage?.kasko
    ? `Dette dekkes av kaskoen din. Egenandel er ${money(coverage.deductibleNok)}. Verkstedet bekrefter det endelige tallet. En kaskoskade kan påvirke bonusen din.`
    : 'Du har ikke kasko på bilen, så denne skaden dekkes ikke av bilforsikringen din. Reparasjonen på verkstedet betaler du selv.'
  return `${carDamageTexts.description}\n\n${verdict}`
}

export type Workshop = { id: string; name: string; distance: string; day: string; time: string; estimate: string }

export const workshops: Workshop[] = [
  { id: 'nord', name: 'Bilverksted Nord', distance: '2,1 km', day: 'tirsdag', time: '09:00', estimate: 'kr 14 000 – 16 500' },
  { id: 'storgata', name: 'Storgata Bil & Lakk', distance: '3,4 km', day: 'onsdag', time: '13:00', estimate: 'kr 15 500 – 18 000' },
  { id: 'ostbyen', name: 'Østbyen Karosseri', distance: '5,0 km', day: 'torsdag', time: '08:00', estimate: 'kr 14 500 – 17 000' },
]

export const towOrder = { driver: 'Ola', etaMinutes: 28 }

export type ClaimDetails = { damage: string; when: string; where: string }

export function defaultClaimDetails(now = new Date()): ClaimDetails {
  const time = now.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
  return { damage: 'Bulk, høyre bakdør', when: `I dag kl. ${time}`, where: 'Storgata 12, parkert' }
}

export function claimConfirmation(details: ClaimDetails, coverage: CarCoverage | null, caseNumber: string) {
  const cover = coverage?.kasko
    ? `Skaden dekkes av kaskoen din med egenandel ${money(coverage.deductibleNok)}.`
    : 'Du har ikke kasko, så skaden dekkes ikke av bilforsikringen din.'
  return `Skademeldingen er sendt. Saksnummer ${caseNumber}.\n\nSkade: ${details.damage}\nNår: ${details.when}\nHvor: ${details.where}\n\n${cover}`
}

export function bookingConfirmation(workshop: Workshop, coverage: CarCoverage | null) {
  const cost = coverage?.kasko
    ? `Egenandelen på ${money(coverage.deductibleNok)} betaler du på verkstedet.`
    : `Du har ikke kasko, så du betaler reparasjonen selv (estimert ${workshop.estimate}).`
  return `Timen er booket hos ${workshop.name} ${workshop.day} kl. ${workshop.time}. ${cost}`
}

export function createCaseNumber() {
  return `SK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')}`
}

export function latestDamagePhoto(messages: ChatMessage[]) {
  return [...messages].reverse().find((message) => message.image)?.image
}

// Appends assistant messages to the active conversation. Used by the follow-up
// screens, which persist synchronously before navigating back to /chat.
export function withAssistantMessages(state: MockState, contents: { content: string; kind: CarDamageKind }[]): MockState {
  return {
    ...state,
    conversations: state.conversations.map((item) => item.id === state.activeConversationId
      ? { ...item, messages: [...item.messages, ...contents.map(({ content, kind }) => ({ role: 'assistant' as const, content, kind }))] }
      : item),
  }
}
