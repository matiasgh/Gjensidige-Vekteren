import { createDefaultCustomer, isMockCustomer, type MockCustomer } from './mock-customer'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }
export type MockConversation = { id: string; messages: ChatMessage[] }
export type MockState = {
  version: 2
  customer: MockCustomer
  conversations: MockConversation[]
  activeConversationId: string
}

export const MOCK_STORAGE_KEY = 'vekteren.mock-state.v1'
// Reuse the storage slot, but reset v1's unrelated customer through version 2 validation.

export function createConversation(): MockConversation {
  return { id: crypto.randomUUID(), messages: [] }
}

export function createDefaultState(): MockState {
  const conversation = createConversation()
  return { version: 2, customer: createDefaultCustomer(), conversations: [conversation], activeConversationId: conversation.id }
}

export function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false
  const message = value as Record<string, unknown>
  return (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string' && !!message.content.trim()
}

export function isMockState(value: unknown): value is MockState {
  if (!value || typeof value !== 'object') return false
  const state = value as MockState
  return state.version === 2 && isMockCustomer(state.customer)
    && Array.isArray(state.conversations) && state.conversations.length > 0
    && state.conversations.every((conversation) => conversation && typeof conversation.id === 'string'
      && Array.isArray(conversation.messages) && conversation.messages.every(isChatMessage))
    && new Set(state.conversations.map(({ id }) => id)).size === state.conversations.length
    && state.conversations.some(({ id }) => id === state.activeConversationId)
}
