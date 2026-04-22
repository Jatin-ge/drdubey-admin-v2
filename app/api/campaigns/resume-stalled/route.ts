import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const STALL_THRESHOLD_MS = 30 * 60 * 1000

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
    const cutoff = new Date(Date.now() - STALL_THRESHOLD_MS)
    const stalled = await db.campaign.findMany({
      where: {
        status: 'SENDING',
        updatedAt: { lt: cutoff },
      },
      select: { id: true },
    })

    const base = getBaseUrl(req)
    for (const c of stalled) {
      fetch(`${base}/api/campaigns/send-chunk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: c.id }),
      }).catch(() => {})
    }

    return NextResponse.json({ resumed: stalled.length })
  } catch (e: any) {
    console.error('[RESUME_STALLED]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
