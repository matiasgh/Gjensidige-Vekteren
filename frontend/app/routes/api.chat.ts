import { chat, type ChatMessage } from '../lib/ai.server'
import type { Route } from './+types/api.chat'

export async function action({ request }: Route.ActionArgs) {
  const { messages } = (await request.json()) as { messages: ChatMessage[] }
  return chat(messages)
}
