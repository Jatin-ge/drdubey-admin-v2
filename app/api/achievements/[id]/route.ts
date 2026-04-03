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

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const achievement = await db.achievement.findUnique({
      where: { id: params.id }
    })
    if (!achievement) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(achievement)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()

    const existing = await db.achievement.findUnique({
      where: { id: params.id }
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    const newTitle = body.title?.trim()
    let slug = existing.slug

    if (newTitle && newTitle !== existing.title) {
      let candidate = generateSlug(newTitle)
      let counter = 0
      while (true) {
        const check = counter === 0
          ? candidate
          : `${candidate}-${counter}`
        const conflict = await db.achievement.findFirst({
          where: {
            slug: check,
            id: { not: params.id }
          }
        })
        if (!conflict) { slug = check; break }
        counter++
      }
    }

    const updated = await db.achievement.update({
      where: { id: params.id },
      data: {
        title: newTitle || existing.title,
        slug,
        category: body.category || existing.category,
        date: body.date
          ? new Date(body.date)
          : existing.date,
        description: body.description?.trim() ??
          existing.description,
        imageUrl: body.imageUrl?.trim() ||
          existing.imageUrl,
        isFeatured: body.isFeatured === true ||
          body.isFeatured === 'true',
        featuredOrder:
          body.featuredOrder !== undefined &&
          body.featuredOrder !== '' &&
          body.featuredOrder !== null
            ? parseInt(String(body.featuredOrder))
            : null,
        metaTitle: body.metaTitle?.trim() ||
          newTitle || existing.metaTitle,
        metaDescription: body.metaDescription?.trim() ??
          existing.metaDescription,
      }
    })

    return NextResponse.json(updated)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update achievement'
    console.error('Achievement PUT error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.achievement.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete achievement'
    console.error('Achievement DELETE error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
