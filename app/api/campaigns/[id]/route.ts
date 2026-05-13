import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await db.campaign.findUnique({
      where: { id: params.id },
      include: { logs: { orderBy: { createdAt: 'asc' } } },
    })
    if (!campaign) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Derive live lifecycle counts from CampaignLog rows. The Campaign
    // table's sentCount/failedCount columns are written at send time and
    // don't track webhook-driven upgrades (DELIVERED, READ), so the
    // dashboard would otherwise stay stuck on the moment-of-sending view.
    let sent = 0       // Meta accepted — covers SENT + DELIVERED + READ
    let delivered = 0  // reached device (status DELIVERED or READ)
    let read = 0       // recipient opened (status READ)
    let failed = 0
    for (const l of campaign.logs) {
      const s = (l.status || '').toUpperCase()
      if (s === 'FAILED') failed++
      else if (s === 'READ') { read++; delivered++; sent++ }
      else if (s === 'DELIVERED') { delivered++; sent++ }
      else if (s === 'SENT') sent++
    }

    return NextResponse.json({
      ...campaign,
      // Override the static columns with the live derived counts so the
      // UI doesn't have to know about the two-source quirk.
      sentCount: sent,
      failedCount: failed,
      deliveredCount: delivered,
      readCount: read,
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.campaign.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
