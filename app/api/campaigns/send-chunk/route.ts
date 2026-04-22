import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildTemplatePayload } from '@/lib/wa-template-payload'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

const CHUNK_SIZE = 15

function getBaseUrl(req: Request): string {
  const envBase = process.env.NEXTAUTH_URL
  if (envBase) return envBase
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl}`
  const host = req.headers.get('host') || 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  return `${proto}://${host}`
}

export async function POST(req: Request) {
  try {
    const { campaignId } = await req.json()
    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId required' }, { status: 400 })
    }

    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    })
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status === 'SENT' || campaign.status === 'FAILED') {
      return NextResponse.json({ done: true, status: campaign.status })
    }

    if (campaign.status === 'SCHEDULED') {
      await db.campaign.update({
        where: { id: campaign.id },
        data: { status: 'SENDING' },
      })
    }

    const template = await db.whatsAppTemplate.findUnique({
      where: { id: campaign.templateId },
    })
    if (!template) {
      await db.campaign.update({
        where: { id: campaign.id },
        data: { status: 'FAILED', sentAt: new Date() },
      })
      return NextResponse.json({ done: true, status: 'FAILED', reason: 'Template deleted' })
    }

    const existingLogs = await db.campaignLog.findMany({
      where: { campaignId: campaign.id },
      select: { patientId: true },
    })
    const processedIds = new Set(existingLogs.map(l => l.patientId))
    const remaining = campaign.patientIds.filter(id => !processedIds.has(id))

    if (remaining.length === 0) {
      const totals = await db.campaignLog.groupBy({
        by: ['status'],
        where: { campaignId: campaign.id },
        _count: { status: true },
      })
      const sentCount = totals.find(t => t.status === 'SENT')?._count.status || 0
      const failedCount = totals.find(t => t.status === 'FAILED')?._count.status || 0
      await db.campaign.update({
        where: { id: campaign.id },
        data: { status: 'SENT', sentAt: new Date(), sentCount, failedCount },
      })
      return NextResponse.json({ done: true, status: 'SENT', sentCount, failedCount })
    }

    const batchIds = remaining.slice(0, CHUNK_SIZE)
    const patients = await db.lead.findMany({
      where: { id: { in: batchIds } },
      select: { id: true, name: true, phone: true },
    })
    const patientMap = new Map(patients.map(p => [p.id, p]))

    const PHONE_ID = process.env.WHATSAPP_PHONE_ID
    const TOKEN = process.env.WHATSAPP_API_TOKEN

    for (const patientId of batchIds) {
      const patient = patientMap.get(patientId)
      let status = 'FAILED'
      let errorMsg: string | null = null
      let messageId: string | null = null
      let fullPhone = ''

      try {
        if (!patient) {
          throw new Error('Patient not found')
        }
        if (!patient.phone) {
          throw new Error('No phone number')
        }
        if (!PHONE_ID || !TOKEN) {
          throw new Error('WhatsApp not configured')
        }

        const phone = patient.phone.replace(/\D/g, '').replace(/^0/, '')
        fullPhone = phone.startsWith('91') ? phone : `91${phone}`

        const payload = buildTemplatePayload(
          fullPhone,
          {
            metaName: template.metaName,
            language: campaign.language,
            headerType: template.headerType,
            headerMediaUrl: template.headerMediaUrl,
            headerText: template.headerText,
            buttonsJson: template.buttonsJson,
          },
        )

        const res = await fetch(
          `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        )

        const data = await res.json()

        if (res.ok) {
          status = 'SENT'
          messageId = data.messages?.[0]?.id || null
        } else {
          errorMsg = data.error?.message || 'WhatsApp API error'
        }

        await db.whatsAppMessageLog.create({
          data: {
            leadId: patientId,
            phone: fullPhone,
            templateName: template.metaName || template.name,
            language: campaign.language || 'hi',
            variables: [],
            status,
            messageId,
            errorMsg,
            source: 'campaign',
          },
        }).catch(e => console.error('[MSG_LOG]', e))
      } catch (err: any) {
        status = 'FAILED'
        errorMsg = err.message
      }

      await db.campaignLog.create({
        data: {
          campaignId: campaign.id,
          patientId,
          patientName: patient?.name || '',
          phone: patient?.phone || fullPhone || '',
          status,
          error: errorMsg,
          sentAt: status === 'SENT' ? new Date() : null,
        },
      })

      await new Promise(r => setTimeout(r, 100))
    }

    const totals = await db.campaignLog.groupBy({
      by: ['status'],
      where: { campaignId: campaign.id },
      _count: { status: true },
    })
    const sentCount = totals.find(t => t.status === 'SENT')?._count.status || 0
    const failedCount = totals.find(t => t.status === 'FAILED')?._count.status || 0

    const stillRemaining = remaining.length - batchIds.length
    const done = stillRemaining === 0

    await db.campaign.update({
      where: { id: campaign.id },
      data: {
        sentCount,
        failedCount,
        ...(done ? { status: 'SENT', sentAt: new Date() } : {}),
      },
    })

    if (!done) {
      const base = getBaseUrl(req)
      fetch(`${base}/api/campaigns/send-chunk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id }),
      }).catch(() => {})
      await new Promise(r => setTimeout(r, 500))
    }

    return NextResponse.json({
      processed: batchIds.length,
      remaining: stillRemaining,
      sentCount,
      failedCount,
      done,
    })
  } catch (e: any) {
    console.error('[SEND_CHUNK]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
