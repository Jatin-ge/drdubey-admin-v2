import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'

const STAGES = [
  'Enquiry',
  'Consultation Scheduled',
  'Consultation Done',
  'Surgery Scheduled',
  'Surgery Done',
  'Recovery',
  'Follow-Up Complete',
  'Discharged',
]

export async function GET() {
  try {
    const patients = await db.lead.findMany({
      where: {
        pipelineStage: { not: null }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        cities: true,
        surgery: true,
        patientStatus: true,
        pipelineStage: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })

    const grouped = STAGES.reduce((acc, stage) => {
      acc[stage] = patients.filter(
        p => p.pipelineStage === stage
      )
      return acc
    }, {} as Record<string, typeof patients>)

    return NextResponse.json({ stages: STAGES, grouped })
  } catch (e) {
    return NextResponse.json({
      stages: STAGES,
      grouped: {}
    })
  }
}
