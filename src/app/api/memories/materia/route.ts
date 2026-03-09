import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { subjectProfileSchema } from "@/lib/validators"

export async function GET() {
  const profiles = await prisma.subjectProfile.findMany({
    orderBy: { updatedAt: "desc" },
  })
  return NextResponse.json(profiles)
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = subjectProfileSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const profile = await prisma.subjectProfile.create({
    data: parsed.data,
  })
  return NextResponse.json(profile, { status: 201 })
}
