import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { feedbackSchema } from "@/lib/validators"

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = feedbackSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const adaptation = await prisma.adaptation.update({
    where: { id: parsed.data.adaptationId },
    data: {
      feedbackDocent: parsed.data.feedbackDocent,
      valoracio: parsed.data.valoracio,
    },
  })

  return NextResponse.json(adaptation)
}
