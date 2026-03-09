import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") || ""
  const assignatura = searchParams.get("assignatura") || undefined
  const edat = searchParams.get("edat") || undefined
  const nivell = searchParams.get("nivell") || undefined
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")

  const where: Record<string, unknown> = {
    isPublic: true,
  }

  if (query) {
    where.OR = [
      { textOriginal: { contains: query } },
      { textAdaptat: { contains: query } },
      { tags: { contains: query } },
      { assignatura: { contains: query } },
    ]
  }
  if (assignatura) where.assignatura = { contains: assignatura }
  if (edat) where.edat = edat
  if (nivell) where.nivellDificultat = nivell

  const [adaptations, total] = await Promise.all([
    prisma.adaptation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        textOriginal: true,
        textAdaptat: true,
        edat: true,
        nivellDificultat: true,
        traduccio: true,
        assignatura: true,
        tags: true,
        createdAt: true,
        fontText: true,
      },
    }),
    prisma.adaptation.count({ where }),
  ])

  return NextResponse.json({
    adaptations,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
