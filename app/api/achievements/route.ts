import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function getUniqueSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  let slug = generateSlug(title)
  let counter = 0

  while (true) {
    const candidate = counter === 0
      ? slug : `${slug}-${counter}`
    const existing = await db.achievement.findFirst({
      where: {
        slug: candidate,
        ...(excludeId
          ? { id: { not: excludeId } }
          : {})
      }
    })
    if (!existing) return candidate
    counter++
  }
}

export async function GET() {
  try {
    const achievements = await db.achievement.findMany({
      orderBy: [
        { isFeatured: 'desc' },
        { featuredOrder: 'asc' },
        { date: 'desc' },
      ]
    })
    return NextResponse.json(achievements)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Achievement GET error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const slug = await getUniqueSlug(body.title)

    const achievement = await db.achievement.create({
      data: {
        title: body.title.trim(),
        slug,
        category: body.category || 'Award',
        date: body.date
          ? new Date(body.date)
          : new Date(),
        description: body.description?.trim() || '',
        imageUrl: body.imageUrl?.trim() || '',
        isFeatured: body.isFeatured === true ||
          body.isFeatured === 'true',
        featuredOrder:
          body.featuredOrder !== undefined &&
          body.featuredOrder !== '' &&
          body.featuredOrder !== null
            ? parseInt(String(body.featuredOrder))
            : null,
        metaTitle: body.metaTitle?.trim() ||
          body.title.trim(),
        metaDescription: body.metaDescription?.trim() || '',
      }
    })

    return NextResponse.json(achievement)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create achievement'
    console.error('Achievement POST error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
