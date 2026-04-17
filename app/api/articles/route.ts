import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ZodError } from 'zod'
import { ArticleSchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const articles = await db.article.findMany({
      orderBy: { publishedDate: 'desc' },
      take: 100,
    })
    return NextResponse.json(articles)
  } catch (error) {
    console.error('[ARTICLES_GET]', error)
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    const raw = await req.json()
    const body = ArticleSchema.parse(raw)
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
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[ARTICLES_POST]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create' },
      { status: 500 }
    )
  }
}
