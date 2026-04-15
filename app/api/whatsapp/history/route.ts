import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const skip = (page - 1) * limit

  try {
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (search) {
      where.OR = [
        { phone: { contains: search } },
        { templateName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [messages, total, sentCount, failedCount] = await Promise.all([
      db.whatsAppMessageLog.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit,
      }),
      db.whatsAppMessageLog.count({ where }),
      db.whatsAppMessageLog.count({ where: { status: 'SENT' } }),
      db.whatsAppMessageLog.count({ where: { status: 'FAILED' } }),
    ])

    // Enrich with patient names where we have leadIds
    const leadIds = messages
      .filter(m => m.leadId)
      .map(m => m.leadId as string)

    let leadMap: Record<string, string> = {}
    if (leadIds.length > 0) {
      const leads = await db.lead.findMany({
        where: { id: { in: leadIds } },
        select: { id: true, name: true },
      })
      leadMap = Object.fromEntries(leads.map(l => [l.id, l.name]))
    }

    const enriched = messages.map(m => ({
      ...m,
      patientName: m.leadId ? leadMap[m.leadId] || null : null,
    }))

    return NextResponse.json({
      messages: enriched,
      total,
      sentCount,
      failedCount,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[WA_HISTORY]', error)
    return NextResponse.json({
      messages: [],
      total: 0,
      sentCount: 0,
      failedCount: 0,
      page: 1,
      totalPages: 0,
    })
  }
}
