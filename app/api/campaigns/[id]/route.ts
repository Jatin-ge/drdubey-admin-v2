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
      include: { logs: true }
    })
    return NextResponse.json(campaign)
  } catch (e) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.campaign.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    )
  }
}
