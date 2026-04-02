import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'

export async function PUT(
  req: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const { stage } = await req.json()
    await db.lead.update({
      where: { id: params.patientId },
      data: { pipelineStage: stage }
    })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    )
  }
}
