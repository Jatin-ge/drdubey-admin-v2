import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const article = await db.article.findUnique({
      where: { id: params.id },
    })
    if (!article) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(article)
  } catch (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const article = await db.article.update({
      where: { id: params.id },
      data: {
        title: body.title,
        journalName: body.journalName || null,
        authors: body.authors || null,
        abstract: body.abstract || null,
        doi: body.doi || null,
        externalUrl: body.externalUrl || null,
        pdfUrl: body.pdfUrl || null,
        publishedDate: body.publishedDate ? new Date(body.publishedDate) : null,
        tags: body.tags || [],
        isPublished: body.isPublished ?? true,
      },
    })
    return NextResponse.json(article)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.article.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete' },
      { status: 500 }
    )
  }
}
