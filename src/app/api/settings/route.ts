import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { appSettingsSchema } from "@/lib/validators"

export async function GET() {
  let settings = await prisma.appSettings.findUnique({
    where: { id: "default" },
  })

  if (!settings) {
    settings = await prisma.appSettings.create({
      data: { id: "default" },
    })
  }

  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  const body = await request.json()
  const parsed = appSettingsSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const settings = await prisma.appSettings.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: { id: "default", ...parsed.data },
  })

  return NextResponse.json(settings)
}
