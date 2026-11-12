import { carDamageKinds, MAX_IMAGE_DATA_URL_LENGTH, type CarDamageKind } from './car-damage'
import { isAiBlockList, type AiBlock } from './chat-blocks'
import { createDefaultCustomer, isMockCustomer, mockCustomer, type MockCustomer } from './mock-customer'
import { insuranceMonthlyPrice } from './mock-actions'
import { getOffer } from './travel-offer'

export const OFFER_APPROVED_KIND = 'offer-approved'
export type ChatMessageKind = CarDamageKind | typeof OFFER_APPROVED_KIND
/** Stored with Kari's "Godkjent" message; the receipt card is rendered from it. */
export type OfferReceipt = { offerId: string; reminderSet: boolean }

// `image` is a downscaled JPEG data URL kept only in the browser; `kind` marks
// scripted flow messages so the chat can render their buttons; `blocks` are the
// validated cards of a `reply_with_blocks` answer; `receipt` belongs to an
// approved offer. All are optional, so stored v2 conversations remain valid.
export type ChatMessage = { role: 'user' | 'assistant'; content: string; image?: string; kind?: ChatMessageKind; blocks?: AiBlock[]; receipt?: OfferReceipt }
export type Reminder = { title: string; dueDate: string }
/** The text-only shape accepted by /api/chat. */
/** The text shape accepted by /api/chat; assistant messages may carry the cards they showed. */
export type ApiChatMessage = { role: 'user' | 'assistant'; content: string; blocks?: AiBlock[] }
export type MockConversation = { id: string; messages: ChatMessage[] }
// Priorities are the step 3 chips plus anything the customer wrote there.
export type OnboardingState = { completed: boolean; priorities: string[] }
export type MockState = {
  version: 3
  customer: MockCustomer
  conversations: MockConversation[]
  activeConversationId: string
  onboarding: OnboardingState
  // Demo reminders ("Minn meg på om 2 uker"); nothing is ever notified.
  reminders: Reminder[]
}

export const MOCK_STORAGE_KEY = 'vekteren.mock-state.v3'
/** Older keys, newest first. They are migrated once and removed after v3 is stored. */
export const LEGACY_MOCK_STORAGE_KEYS = ['vekteren.mock-state.v2', 'vekteren.mock-state.v1']
export const MAX_REMINDERS = 50
export const MAX_PRIORITIES = 20
export const MAX_PRIORITY_LENGTH = 500

export function createConversation(): MockConversation {
  return { id: crypto.randomUUID(), messages: [] }
}

export function createDefaultOnboarding(): OnboardingState {
  return { completed: false, priorities: [] }
}

export function createDefaultState(): MockState {
  const conversation = createConversation()
  return { version: 3, customer: createDefaultCustomer(), conversations: [conversation], activeConversationId: conversation.id, onboarding: createDefaultOnboarding(), reminders: [] }
}

export function addDays(days: number, from = new Date()) {
  const date = new Date(from)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const isReceipt = (value: unknown): value is OfferReceipt => !!value && typeof value === 'object'
  && Object.keys(value).length === 2 && !!getOffer((value as OfferReceipt).offerId) && typeof (value as OfferReceipt).reminderSet === 'boolean'

export function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false
  const message = value as Record<string, unknown>
  return (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string' && !!message.content.trim()
    && (message.image === undefined || (typeof message.image === 'string' && message.image.startsWith('data:image/') && message.image.length <= MAX_IMAGE_DATA_URL_LENGTH))
    && (message.kind === undefined || message.kind === OFFER_APPROVED_KIND || (carDamageKinds as readonly unknown[]).includes(message.kind))
    && (message.blocks === undefined || (message.role === 'assistant' && isAiBlockList(message.blocks)))
    && (message.receipt === undefined || (message.role === 'user' && message.kind === OFFER_APPROVED_KIND && isReceipt(message.receipt)))
}

export function isApiChatMessage(value: unknown): value is ApiChatMessage {
  return isChatMessage(value) && Object.keys(value).every((key) => key === 'role' || key === 'content' || key === 'blocks')
}

export const receiptLines = (receipt: OfferReceipt) => ['Kvittering sendt på e-post', 'Oversikten din er oppdatert', ...(receipt.reminderSet ? ['Påminnelse om vaksine er satt'] : [])]

// Images never leave the browser: the AI only gets a short note that a photo was sent.
// Receipts become short notes; cards are sent along as structured blocks.
export function toApiMessages(messages: ChatMessage[], firstName: string): ApiChatMessage[] {
  return messages.map(({ role, content, image, blocks, receipt }) => {
    if (image) return { role, content: `[${firstName} sendte et bilde av skaden]` }
    const offer = receipt && getOffer(receipt.offerId)
    if (receipt && offer) return { role, content: `[${firstName} godkjente ${offer.title}. Appen viste kvitteringen: ${offer.title} er lagt til i demoprofilen, ${receiptLines(receipt).join(', ').toLowerCase()}.]` }
    // The server replays cards as reply_with_blocks tool calls, so the model keeps using the tool.
    return blocks ? { role, content, blocks } : { role, content }
  })
}

export function isReminderList(value: unknown): value is Reminder[] {
  return Array.isArray(value) && value.length <= MAX_REMINDERS && value.every((item) => !!item && typeof item === 'object'
    && Object.keys(item).length === 2 && typeof item.title === 'string' && !!item.title.trim() && item.title.length <= 200
    && typeof item.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.dueDate))
}

export function isPriorityList(value: unknown): value is string[] {
  return Array.isArray(value) && value.length <= MAX_PRIORITIES
    && value.every((item) => typeof item === 'string' && !!item.trim() && item.length <= MAX_PRIORITY_LENGTH)
}

function isOnboardingState(value: unknown): value is OnboardingState {
  if (!value || typeof value !== 'object') return false
  const onboarding = value as Record<string, unknown>
  return Object.keys(onboarding).length === 2 && typeof onboarding.completed === 'boolean' && isPriorityList(onboarding.priorities)
}

function hasValidConversations(state: Pick<MockState, 'conversations' | 'activeConversationId'>) {
  return Array.isArray(state.conversations) && state.conversations.length > 0
    && state.conversations.every((conversation) => conversation && typeof conversation.id === 'string'
      && Array.isArray(conversation.messages) && conversation.messages.every(isChatMessage))
    && new Set(state.conversations.map(({ id }) => id)).size === state.conversations.length
    && state.conversations.some(({ id }) => id === state.activeConversationId)
}

export function isMockState(value: unknown): value is MockState {
  if (!value || typeof value !== 'object') return false
  const state = value as MockState
  return state.version === 3 && isMockCustomer(state.customer) && hasValidConversations(state) && isOnboardingState(state.onboarding) && isReminderList(state.reminders)
}

// v2 had the USA trip seed. Keep Kari's saved policy choices, but refresh the
// trip, the gap analysis and the travel summary that the Thailand flow relies on.
function refreshTripSeed(customer: MockCustomer): MockCustomer | null {
  const refreshed = {
    ...customer,
    plannedTrips: structuredClone(mockCustomer.plannedTrips),
    gapAnalysis: structuredClone(mockCustomer.gapAnalysis),
    insurances: customer.insurances.map((insurance, index) => insurance?.coverageId === 'travel-work' ? structuredClone(mockCustomer.insurances[index]) : insurance),
  }
  return isMockCustomer(refreshed) ? refreshed : null
}

// Enrich pre-toggle Kari profiles and refresh the trip seed without dropping saved
// choices. Other incompatible profiles fall back to the shared seed, retaining
// conversations, onboarding and (from v3) reminders.
export function migrateLegacyState(value: unknown): MockState | null {
  if (!value || typeof value !== 'object') return null
  const legacy = value as { version?: unknown; customer?: MockCustomer; conversations: MockConversation[]; activeConversationId: string; onboarding?: unknown; reminders?: unknown }
  if ((legacy.version !== 1 && legacy.version !== 2 && legacy.version !== 3) || !hasValidConversations(legacy)) return null
  const next = {
    ...createDefaultState(),
    conversations: legacy.conversations,
    activeConversationId: legacy.activeConversationId,
    onboarding: isOnboardingState(legacy.onboarding) ? legacy.onboarding : createDefaultOnboarding(),
    reminders: isReminderList(legacy.reminders) ? legacy.reminders : [],
  }
  if (legacy.version !== 1 && Array.isArray(legacy.customer?.insurances)) {
    const customer = structuredClone(legacy.customer)
    customer.insurances = customer.insurances.map((insurance, index) => {
      const seed = next.customer.insurances[index]
      if (!insurance || typeof insurance !== 'object' || !seed?.coverages || insurance.coverages) return insurance
      const upgraded = { ...insurance, coverages: seed.coverages, optionalCoverages: { ...seed.optionalCoverages, ...insurance.optionalCoverages } }
      if (seed.coverageId === 'building') delete upgraded.note
      upgraded.monthlyPriceNok = insuranceMonthlyPrice(upgraded)
      return upgraded
    })
    const migrated = legacy.version === 2 ? refreshTripSeed(customer) : isMockCustomer(customer) ? customer : null
    if (migrated) next.customer = migrated
  }
  return next
}
