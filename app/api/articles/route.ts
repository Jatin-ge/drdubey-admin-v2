import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const articles = await db.article.findMany({
      orderBy: { publishedDate: 'desc' },
    })
    return NextResponse.json(articles)
  } catch (error) {
    console.log('[ARTICLES_GET]', error)
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const article = await db.article.create({
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
    console.log('[ARTICLES_POST]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create' },
      { status: 500 }
    )
  }
}
