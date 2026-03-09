import { NextResponse } from "next/server"
import { searchPictogram } from "@/lib/arasaac/client"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get("keyword")
  const lang = searchParams.get("lang") || "ca"

  if (!keyword) {
    return NextResponse.json(
      { error: "Cal el paràmetre 'keyword'" },
      { status: 400 }
    )
  }

  const result = await searchPictogram(keyword, lang)

  if (!result) {
    return NextResponse.json(
      { error: "Pictograma no trobat" },
      { status: 404 }
    )
  }

  return NextResponse.json(result)
}
