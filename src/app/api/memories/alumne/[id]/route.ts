import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { studentMemorySchema } from "@/lib/validators"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const memory = await prisma.studentMemory.findUnique({ where: { id } })
  if (!memory) {
    return NextResponse.json({ error: "No trobat" }, { status: 404 })
  }
  return NextResponse.json(memory)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const parsed = studentMemorySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const memory = await prisma.studentMemory.update({
    where: { id },
    data: parsed.data,
  })
  return NextResponse.json(memory)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.studentMemory.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
