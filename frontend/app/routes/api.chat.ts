import { chat } from '../lib/ai.server'
import { isMockCustomer } from '../lib/mock-customer'
import { isApiChatMessage, isPriorityList } from '../lib/mock-state'
import type { Route } from './+types/api.chat'

export async function action({ request }: Route.ActionArgs) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Ugyldig forespørsel.' }, { status: 400 })
  }
  if (!body || !Array.isArray(body.messages) || !body.messages.length
    || !body.messages.every(isApiChatMessage) || body.messages.at(-1).role !== 'user'
    || !isMockCustomer(body.customer)
    || (body.priorities !== undefined && !isPriorityList(body.priorities))) {
    return Response.json({ error: 'Forespørselen må inneholde en gyldig samtale og kundeprofil.' }, { status: 400 })
  }
  return chat(body.messages, body.customer, body.priorities ?? [])
}
