import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const campaigns = await db.campaign.findMany({
      orderBy: { scheduledAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(campaigns)
  } catch (e) {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const campaign = await db.campaign.create({
      data: {
        name: body.name,
        templateId: body.templateId,
        language: body.language || 'hi',
        city: body.city,
        patientIds: body.patientIds,
        patientCount: body.patientIds.length,
        status: 'SCHEDULED',
        scheduledAt: new Date(body.scheduledAt),
      }
    })
    await db.scheduledJob.create({
      data: {
        type: 'CAMPAIGN',
        referenceId: campaign.id,
        scheduledAt: new Date(body.scheduledAt),
        status: 'PENDING',
      }
    })
    return NextResponse.json(campaign)
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    )
  }
}
