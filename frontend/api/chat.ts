import { openai } from '@ai-sdk/openai'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'

const VEKTEREN_SYSTEM_PROMPT = `Du er Vekteren, Gjensidiges digitale forsikringsassistent.
Svar alltid på norsk, vennlig, kort og tydelig.
Hjelp kunden å forstå forsikring og hva de bør gjøre videre.
Hvis du er usikker, si det, og henvis til gjensidige.no eller kundeservice.`

export async function POST(request: Request): Promise<Response> {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: 'OPENAI_API_KEY is not set' }, { status: 500 })
  }

  const { messages } = (await request.json()) as { messages: UIMessage[] }

  const result = streamText({
    model: openai(process.env.OPENAI_MODEL ?? 'gpt-4.1-mini'),
    system: VEKTEREN_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
