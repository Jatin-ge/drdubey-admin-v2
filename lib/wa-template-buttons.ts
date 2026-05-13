// Button types we expose in the admin form. Meta supports more (FLOW,
// CATALOG, COPY_CODE, OTP), but we only surface the three that are
// useful for an orthopedic clinic right now.
export type ButtonType = 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER'

// Shape stored in DB as buttonsJson and sent to Meta. Uses snake_case
// `phone_number` to match Meta's API and what extractButtonsJson()
// in lib/wa-template-payload.ts writes when syncing from Meta — so a
// button created in our form is indistinguishable from one Meta sent
// us, and the send pipeline already handles it correctly.
export interface TemplateButton {
  type: ButtonType
  text: string
  url?: string
  phone_number?: string
}

export const MAX_BUTTONS = 10
export const MAX_URL_BUTTONS = 2
export const MAX_PHONE_BUTTONS = 1
export const MAX_BUTTON_TEXT = 25

const E164 = /^\+[1-9]\d{6,14}$/

type ValidationResult =
  | { ok: true }
  | { ok: false; error: string }

export function validateButtons(buttons: TemplateButton[]): ValidationResult {
  if (!Array.isArray(buttons)) {
    return { ok: false, error: 'Buttons must be an array' }
  }
  if (buttons.length > MAX_BUTTONS) {
    return { ok: false, error: `Maximum ${MAX_BUTTONS} buttons allowed` }
  }

  let urlCount = 0
  let phoneCount = 0

  for (let i = 0; i < buttons.length; i++) {
    const b = buttons[i]
    const label = `Button ${i + 1}`

    if (!b || typeof b !== 'object') {
      return { ok: false, error: `${label}: invalid object` }
    }
    if (!['QUICK_REPLY', 'URL', 'PHONE_NUMBER'].includes(b.type)) {
      return { ok: false, error: `${label}: unsupported type "${b.type}"` }
    }
    if (!b.text || !b.text.trim()) {
      return { ok: false, error: `${label}: text is required` }
    }
    if (b.text.length > MAX_BUTTON_TEXT) {
      return { ok: false, error: `${label}: text exceeds ${MAX_BUTTON_TEXT} characters` }
    }

    if (b.type === 'URL') {
      urlCount++
      if (urlCount > MAX_URL_BUTTONS) {
        return { ok: false, error: `Maximum ${MAX_URL_BUTTONS} URL buttons allowed` }
      }
      const url = b.url?.trim()
      if (!url) {
        return { ok: false, error: `${label}: URL is required` }
      }
      try {
        new URL(url)
      } catch {
        return { ok: false, error: `${label}: invalid URL` }
      }
    }

    if (b.type === 'PHONE_NUMBER') {
      phoneCount++
      if (phoneCount > MAX_PHONE_BUTTONS) {
        return { ok: false, error: `Maximum ${MAX_PHONE_BUTTONS} phone button allowed` }
      }
      const phone = b.phone_number?.trim()
      if (!phone) {
        return { ok: false, error: `${label}: phone number is required` }
      }
      if (!E164.test(phone)) {
        return { ok: false, error: `${label}: phone must be E.164 format (e.g. +918955373205)` }
      }
    }
  }

  return { ok: true }
}

// Safe parse — returns [] on any failure so callers don't need try/catch.
export function parseButtonsJson(s?: string | null): TemplateButton[] {
  if (!s) return []
  try {
    const parsed = JSON.parse(s)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (b): b is TemplateButton =>
        b &&
        typeof b.type === 'string' &&
        typeof b.text === 'string'
    )
  } catch {
    return []
  }
}

// Serialize for storage. Strips fields that don't apply to the type so
// we never write {type:'QUICK_REPLY', url:'...'} into the DB.
export function serializeButtons(buttons: TemplateButton[]): string {
  const clean = buttons.map(b => {
    const out: TemplateButton = { type: b.type, text: b.text.trim() }
    if (b.type === 'URL' && b.url) out.url = b.url.trim()
    if (b.type === 'PHONE_NUMBER' && b.phone_number) {
      out.phone_number = b.phone_number.trim()
    }
    return out
  })
  return JSON.stringify(clean)
}

// Meta-shape BUTTONS component, or null when there are no buttons (so the
// caller can decide whether to include it in the components array).
export function buildButtonsComponent(buttons: TemplateButton[]) {
  if (!buttons.length) return null
  return {
    type: 'BUTTONS',
    buttons: buttons.map(b => {
      if (b.type === 'URL') {
        return { type: 'URL', text: b.text, url: b.url }
      }
      if (b.type === 'PHONE_NUMBER') {
        return { type: 'PHONE_NUMBER', text: b.text, phone_number: b.phone_number }
      }
      return { type: 'QUICK_REPLY', text: b.text }
    }),
  }
}
