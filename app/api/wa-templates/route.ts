import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const templates = await db.whatsAppTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(templates)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('WA Template GET error:', msg)
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      )
    }

    const template = await db.whatsAppTemplate.create({
      data: {
        name: body.name.trim(),
        nameHi: body.nameHi?.trim() || null,
        category: body.category || 'UTILITY',
        language: body.language || 'hi',
        bodyEn: body.bodyEn?.trim() || '',
        bodyHi: body.bodyHi?.trim() || '',
        variables: Array.isArray(body.variables) ? body.variables : [],
        metaName: body.metaName?.trim() || null,
        isApproved: body.isApproved === true,
        isActive: true,
      }
    })

    return NextResponse.json(template)

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create template'
    console.error('WA Template POST error:', msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
