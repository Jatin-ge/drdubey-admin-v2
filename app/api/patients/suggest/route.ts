import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''
  const field = searchParams.get('field') || 'name'

  if (!query || query.length < 2) {
    return NextResponse.json([])
  }

  try {
    let where: any = {}

    if (field === 'phone') {
      where = {
        phone: { contains: query }
      }
    } else {
      where = {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            phone: { contains: query }
          }
        ]
      }
    }

    const results = await db.lead.findMany({
      where,
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        cities: true,
        surgery: true,
        patientStatus: true,
        age: true,
        gender: true,
        createdAt: true,
      }
    })

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json([])
  }
}
