import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Meta WhatsApp webhook handler.
//
// GET — used once during webhook registration. Meta sends ?hub.mode=subscribe
// &hub.verify_token=<your-token>&hub.challenge=<random>; we must echo back
// the challenge if the verify_token matches our env-configured one.
//
// POST — receives every event subscribed to ("messages" field) including
// delivery status updates (sent / delivered / read / failed). We use these
// to upgrade the status on WhatsAppMessageLog rows. Without this handler,
// our DB only knows "Meta accepted the request" (SENT), not whether the
// recipient device actually received the message.

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || ''
const APP_SECRET = process.env.WHATSAPP_APP_SECRET || ''

// Order matters: status events arrive in time order from Meta (sent, then
// delivered, then read). We only "upgrade" the local status — never downgrade
// — so an out-of-order webhook doesn't flip READ back to DELIVERED.
const STATUS_RANK: Record<string, number> = {
  SENT: 1,
  DELIVERED: 2,
  READ: 3,
  FAILED: 4, // failed wins regardless of order
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token && token === VERIFY_TOKEN) {
    return new NextResponse(challenge || '', { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

// Verifies Meta's X-Hub-Signature-256 header. If WHATSAPP_APP_SECRET is
// not configured we let the request through (logged), since signature
// verification is optional but recommended.
function verifySignature(rawBody: string, signatureHeader: string | null) {
  if (!APP_SECRET) {
    console.warn('[WA_WEBHOOK] WHATSAPP_APP_SECRET not set — signature not verified')
    return true
  }
  if (!signatureHeader) return false
  const expected =
    'sha256=' +
    crypto.createHmac('sha256', APP_SECRET).update(rawBody, 'utf8').digest('hex')
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expected),
    )
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  const sig = req.headers.get('x-hub-signature-256')

  if (!verifySignature(rawBody, sig)) {
    return new NextResponse('Bad signature', { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new NextResponse('Bad JSON', { status: 400 })
  }

  try {
    await processWebhook(payload)
  } catch (e) {
    // Log but always return 200 — Meta will retry on non-2xx and we'd
    // rather not get flooded with retries for a transient DB issue.
    console.error('[WA_WEBHOOK] processing error:', e)
  }

  return NextResponse.json({ ok: true })
}

interface MetaStatus {
  id: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp?: string
  recipient_id?: string
  errors?: Array<{ code?: number; title?: string; message?: string }>
}

interface MetaWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      field?: string
      value?: {
        statuses?: MetaStatus[]
      }
    }>
  }>
}

async function processWebhook(payload: unknown) {
  const p = payload as MetaWebhookPayload
  const entries = p.entry ?? []
  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'messages') continue
      const statuses = change.value?.statuses ?? []
      for (const s of statuses) {
        await applyStatusUpdate(s)
      }
    }
  }
}

async function applyStatusUpdate(s: MetaStatus) {
  if (!s.id || !s.status) return
  const newStatus = s.status.toUpperCase()
  const newRank = STATUS_RANK[newStatus] ?? 0
  if (!newRank) return

  // Find the matching log row by messageId (the wamid we stored on send).
  const row = await db.whatsAppMessageLog.findFirst({
    where: { messageId: s.id },
    select: { id: true, status: true },
  })
  if (!row) return

  const currentRank = STATUS_RANK[row.status?.toUpperCase() || ''] ?? 0
  // Don't downgrade. FAILED always wins.
  if (newStatus !== 'FAILED' && newRank <= currentRank) return

  const errorMsg =
    newStatus === 'FAILED'
      ? s.errors?.[0]?.message ||
        s.errors?.[0]?.title ||
        `Failed (code ${s.errors?.[0]?.code ?? '?'})`
      : undefined

  await db.whatsAppMessageLog.update({
    where: { id: row.id },
    data: {
      status: newStatus,
      ...(errorMsg ? { errorMsg } : {}),
    },
  })
}
