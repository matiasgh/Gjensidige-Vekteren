type ChatMessage = { role: 'user' | 'assistant'; content: string }

const VEKTEREN_SYSTEM_PROMPT = `Du er Vekteren, Gjensidiges digitale forsikringsassistent.
Svar alltid på norsk, vennlig, kort og tydelig.
Hjelp kunden å forstå forsikring og hva de bør gjøre videre.
Hvis du er usikker, si det, og henvis til gjensidige.no eller kundeservice.`

const error = (message: string, status = 500) => Response.json({ error: message }, { status })

export async function POST(request: Request): Promise<Response> {
  const { AI_API_KEY, AI_MODEL, AI_BASE_URL = 'https://api.openai.com/v1' } = process.env
  if (!AI_API_KEY) return error('AI_API_KEY er ikke satt. Legg den inn i frontend/.env.')
  if (!AI_MODEL) return error('AI_MODEL er ikke satt. Legg den inn i frontend/.env.')

  const { messages } = (await request.json()) as { messages: ChatMessage[] }

  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: 'system', content: VEKTEREN_SYSTEM_PROMPT }, ...messages],
    }),
  })

  if (!response.ok) return error(`AI-leverandøren svarte ${response.status}: ${await response.text()}`, 502)

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] }
  return Response.json({ reply: data.choices?.[0]?.message?.content ?? '' })
}
