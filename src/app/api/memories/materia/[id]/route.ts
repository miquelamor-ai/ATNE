import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { subjectProfileSchema } from "@/lib/validators"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const profile = await prisma.subjectProfile.findUnique({ where: { id } })
  if (!profile) {
    return NextResponse.json({ error: "No trobat" }, { status: 404 })
  }
  return NextResponse.json(profile)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const parsed = subjectProfileSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const profile = await prisma.subjectProfile.update({
    where: { id },
    data: parsed.data,
  })
  return NextResponse.json(profile)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.subjectProfile.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
