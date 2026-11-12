import type { MockCustomer } from './mock-customer'
import { getOffer, isOfferPurchased } from './travel-offer'

// Structured cards the AI may attach to a reply through `reply_with_blocks`.
// Blocks only carry ids and short texts: coverage lines, offer fields and
// prices are always read from the profile/offer data, and quick replies can
// only trigger a fixed set of app actions (never arbitrary URLs).
export const QUICK_REPLY_ACTIONS = ['open-overview'] as const
export type QuickReplyAction = (typeof QUICK_REPLY_ACTIONS)[number]
export type QuickReplyOption = { label: string; action?: QuickReplyAction }

export type AiBlock =
  | { type: 'coverage-check'; coverageId: string }
  | { type: 'quick-replies'; options: QuickReplyOption[] }
  | { type: 'tip'; title: string; body: string; remindInDays?: number }
  | { type: 'offer'; offerId: string }

export const MAX_BLOCKS = 6
export const MAX_QUICK_REPLIES = 4
const MAX_LABEL = 40
const MAX_TIP_TITLE = 80
const MAX_TIP_BODY = 400
const MAX_REMIND_DAYS = 60

const text = (value: unknown, max: number) => typeof value === 'string' && !!value.trim() && value.length <= max
const hasOnlyKeys = (value: object, required: string[], optional: string[] = []) =>
  required.every((key) => Object.hasOwn(value, key)) && Object.keys(value).every((key) => required.includes(key) || optional.includes(key))

export type BlockContext = {
  /** Customer used to check coverage/offer ids. Omit for stored history (shape check only). */
  customer?: MockCustomer
  /** New replies may not offer something Kari already bought. */
  fresh?: boolean
}

export function coverageCheckItems(customer: MockCustomer, coverageId: string) {
  const insurance = customer.insurances.find((item) => item.coverageId === coverageId)
  const includes = insurance?.coverageSummary?.includes ?? insurance?.includes
  if (!insurance || !includes) return null
  const excludes = insurance.coverageSummary?.excludes ?? insurance.excludes ?? []
  return {
    title: insurance.employer ? `${insurance.displayName} via jobb` : `${insurance.displayName} · ${insurance.provider}`,
    items: [...includes.map((label) => ({ label, covered: true })), ...excludes.map((label) => ({ label, covered: false }))],
  }
}

export function isAiBlock(value: unknown, { customer, fresh = false }: BlockContext = {}): value is AiBlock {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const block = value as Record<string, unknown>
  switch (block.type) {
    case 'coverage-check':
      return hasOnlyKeys(block, ['type', 'coverageId']) && text(block.coverageId, 80)
        && (!customer || !!coverageCheckItems(customer, block.coverageId as string))
    case 'quick-replies':
      return hasOnlyKeys(block, ['type', 'options']) && Array.isArray(block.options)
        && block.options.length > 0 && block.options.length <= MAX_QUICK_REPLIES
        && block.options.every((option) => !!option && typeof option === 'object' && !Array.isArray(option)
          && hasOnlyKeys(option, ['label'], ['action']) && text(option.label, MAX_LABEL)
          && (option.action === undefined || (QUICK_REPLY_ACTIONS as readonly unknown[]).includes(option.action)))
        && new Set(block.options.map((option: QuickReplyOption) => option.label.trim())).size === block.options.length
    case 'tip':
      return hasOnlyKeys(block, ['type', 'title', 'body'], ['remindInDays']) && text(block.title, MAX_TIP_TITLE) && text(block.body, MAX_TIP_BODY)
        && (block.remindInDays === undefined || (Number.isInteger(block.remindInDays) && (block.remindInDays as number) >= 1 && (block.remindInDays as number) <= MAX_REMIND_DAYS))
    case 'offer': {
      if (!hasOnlyKeys(block, ['type', 'offerId'])) return false
      const offer = getOffer(block.offerId)
      return !!offer && !(fresh && customer && isOfferPurchased(customer.insurances, offer.id))
    }
    default:
      return false
  }
}

export function isAiBlockList(value: unknown, context: BlockContext = {}): value is AiBlock[] {
  return Array.isArray(value) && value.length > 0 && value.length <= MAX_BLOCKS
    && value.every((block) => isAiBlock(block, context))
    && value.filter((block: AiBlock) => block.type === 'quick-replies').length <= 1
}

// Short notes so the AI can see in the history which cards it showed earlier.
export function blockNote(block: AiBlock) {
  switch (block.type) {
    case 'coverage-check': return `[Viste dekningssjekk: ${block.coverageId}]`
    case 'quick-replies': return `[Viste svarknapper: ${block.options.map(({ label }) => label).join(' / ')}]`
    case 'tip': return `[Viste tips: ${block.title}${block.remindInDays ? ` (påminnelse om ${block.remindInDays} dager)` : ''}]`
    case 'offer': return `[Viste forslag: ${block.offerId}]`
  }
}

// Models do not always honour the tool schema (Gemini invents block types such
// as "text-card" and attaches open-overview to any button). Keep every block
// that passes validation, fold free-text cards into the message text and drop
// the rest, instead of rejecting the whole reply.
export function sanitizeAiBlocks(value: unknown, context: BlockContext = {}): { blocks: AiBlock[]; extraText: string[] } {
  const blocks: AiBlock[] = []
  const extraText: string[] = []
  for (const raw of Array.isArray(value) ? value : []) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    let block = raw as Record<string, unknown>
    if (block.type === 'quick-replies' && Array.isArray(block.options)) {
      const options = block.options
        .filter((option): option is Record<string, unknown> => !!option && typeof option === 'object' && text((option as Record<string, unknown>).label, MAX_LABEL))
        .map((option) => {
          const label = (option.label as string).trim()
          return option.action === 'open-overview' && /oversikt/i.test(label) ? { label, action: 'open-overview' as const } : { label }
        })
        .filter((option, index, all) => all.findIndex((other) => other.label === option.label) === index)
        .slice(0, MAX_QUICK_REPLIES)
      block = { type: 'quick-replies', options }
    }
    if (isAiBlock(block, context)) {
      if (block.type !== 'quick-replies' || !blocks.some((item) => item.type === 'quick-replies')) blocks.push(block)
      continue
    }
    const body = typeof block.body === 'string' ? block.body : typeof block.text === 'string' ? block.text : undefined
    if (block.type !== 'tip' && block.type !== 'offer' && body?.trim()) extraText.push(body.trim())
  }
  // Quick replies always go last, as in the Figma flow.
  blocks.sort((a, b) => Number(a.type === 'quick-replies') - Number(b.type === 'quick-replies'))
  return { blocks: blocks.slice(-MAX_BLOCKS), extraText }
}
