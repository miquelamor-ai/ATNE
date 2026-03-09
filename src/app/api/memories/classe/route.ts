import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { classMemorySchema } from "@/lib/validators"

export async function GET() {
  const memories = await prisma.classMemory.findMany({
    orderBy: { updatedAt: "desc" },
  })
  return NextResponse.json(memories)
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = classMemorySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const memory = await prisma.classMemory.create({
    data: parsed.data,
  })
  return NextResponse.json(memory, { status: 201 })
}
