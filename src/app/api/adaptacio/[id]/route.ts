import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const adaptation = await prisma.adaptation.findUnique({ where: { id } })

  if (!adaptation) {
    return NextResponse.json({ error: "No trobat" }, { status: 404 })
  }

  return NextResponse.json(adaptation)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.adaptation.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
