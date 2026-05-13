import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { processCampaignChunk } from '@/lib/process-campaign-chunk'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

function getBaseUrl(req: Request): string {
  const envBase = process.env.NEXTAUTH_URL
  if (envBase) return envBase
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl}`
  const host = req.headers.get('host') || 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  return `${proto}://${host}`
}

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, templateId, language, city, patientIds } = body

    if (!templateId) {
      return NextResponse.json({ error: 'templateId required' }, { status: 400 })
    }
    if (!Array.isArray(patientIds) || patientIds.length === 0) {
      return NextResponse.json({ error: 'patientIds required' }, { status: 400 })
    }

    let template = null
    if (OBJECT_ID_RE.test(templateId)) {
      template = await db.whatsAppTemplate.findUnique({ where: { id: templateId } })
    }
    if (!template) {
      template = await db.whatsAppTemplate.findFirst({ where: { metaName: templateId } })
    }
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    if (!template.isApproved) {
      return NextResponse.json({ error: 'Template not approved on Meta' }, { status: 400 })
    }

    const campaign = await db.campaign.create({
      data: {
        name: name || `Send Now - ${new Date().toISOString().slice(0, 10)}`,
        templateId: template.id,
        language: language || 'hi',
        city: city || '',
        patientIds,
        patientCount: patientIds.length,
        status: 'SENDING',
        scheduledAt: new Date(),
      },
    })

    // Process the first chunk INLINE — no auth-blocked self-fetch. This is
    // the core fix: previously we fired an HTTP self-call to send-chunk
    // which was bounced by next-auth middleware, leaving every campaign
    // stuck on SENDING with 0 sent.
    const firstResult = await processCampaignChunk(campaign.id)

    // If more patients remain after the first inline chunk, kick off the
    // background continuation via the dedicated send-chunk route, which
    // now accepts an internal-secret-authenticated call.
    if (!firstResult.done) {
      const secret = process.env.CAMPAIGN_INTERNAL_SECRET
      if (secret) {
        const base = getBaseUrl(req)
        fetch(`${base}/api/campaigns/send-chunk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${secret}`,
          },
          body: JSON.stringify({ campaignId: campaign.id }),
        }).catch(() => {})
        await new Promise(r => setTimeout(r, 500))
      } else {
        console.warn('[SEND_NOW] CAMPAIGN_INTERNAL_SECRET missing — campaign will stall after the first chunk')
      }
    }

    return NextResponse.json({
      campaignId: campaign.id,
      patientCount: campaign.patientCount,
      firstChunk: firstResult,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[SEND_NOW]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
