import { carDamageKinds, MAX_IMAGE_DATA_URL_LENGTH, type CarDamageKind } from './car-damage'
import { createDefaultCustomer, isMockCustomer, type MockCustomer } from './mock-customer'

// `image` is a downscaled JPEG data URL kept only in the browser; `kind` marks
// scripted flow messages so the chat can render their buttons. Both are optional,
// so stored v2 conversations remain valid.
export type ChatMessage = { role: 'user' | 'assistant'; content: string; image?: string; kind?: CarDamageKind }
/** The text-only shape accepted by /api/chat. */
export type ApiChatMessage = { role: 'user' | 'assistant'; content: string }
export type MockConversation = { id: string; messages: ChatMessage[] }
// Priorities are the step 3 chips plus anything the customer wrote there.
export type OnboardingState = { completed: boolean; priorities: string[] }
export type MockState = {
  version: 2
  customer: MockCustomer
  conversations: MockConversation[]
  activeConversationId: string
  onboarding: OnboardingState
}

export const MOCK_STORAGE_KEY = 'vekteren.mock-state.v2'
export const LEGACY_MOCK_STORAGE_KEY = 'vekteren.mock-state.v1'
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
  return { version: 2, customer: createDefaultCustomer(), conversations: [conversation], activeConversationId: conversation.id, onboarding: createDefaultOnboarding() }
}

export function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false
  const message = value as Record<string, unknown>
  return (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string' && !!message.content.trim()
    && (message.image === undefined || (typeof message.image === 'string' && message.image.startsWith('data:image/') && message.image.length <= MAX_IMAGE_DATA_URL_LENGTH))
    && (message.kind === undefined || (carDamageKinds as readonly unknown[]).includes(message.kind))
}

export function isApiChatMessage(value: unknown): value is ApiChatMessage {
  return isChatMessage(value) && Object.keys(value).every((key) => key === 'role' || key === 'content')
}

// Images never leave the browser: the AI only gets a short note that a photo was sent.
export function toApiMessages(messages: ChatMessage[], firstName: string): ApiChatMessage[] {
  return messages.map(({ role, content, image }) => ({ role, content: image ? `[${firstName} sendte et bilde av skaden]` : content }))
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
  return state.version === 2 && isMockCustomer(state.customer) && hasValidConversations(state) && isOnboardingState(state.onboarding)
}

// Previous branches used different customer shapes. Keep valid conversations
// and onboarding preferences, but replace incompatible policy data with the shared seed.
export function migrateLegacyState(value: unknown): MockState | null {
  if (!value || typeof value !== 'object') return null
  const legacy = value as { version?: unknown; conversations: MockConversation[]; activeConversationId: string; onboarding?: unknown }
  if ((legacy.version !== 1 && legacy.version !== 2) || !hasValidConversations(legacy)) return null
  return { ...createDefaultState(), conversations: legacy.conversations, activeConversationId: legacy.activeConversationId, onboarding: isOnboardingState(legacy.onboarding) ? legacy.onboarding : createDefaultOnboarding() }
}
