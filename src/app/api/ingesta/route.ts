import { NextResponse } from "next/server"
import { extractText, isSupported } from "@/lib/ingesta"

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json(
      { error: "Cap fitxer rebut" },
      { status: 400 }
    )
  }

  if (!isSupported(file.type)) {
    return NextResponse.json(
      { error: `Format no suportat: ${file.type}. Acceptem PDF, DOCX i TXT.` },
      { status: 400 }
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const text = await extractText(buffer, file.type)

    if (!text || text.length === 0) {
      return NextResponse.json(
        { error: "No s'ha pogut extreure text del fitxer." },
        { status: 422 }
      )
    }

    return NextResponse.json({
      text,
      fileName: file.name,
      mimeType: file.type,
      charCount: text.length,
    })
  } catch (err) {
    console.error("Error d'ingesta:", err)
    return NextResponse.json(
      { error: "Error en processar el fitxer." },
      { status: 500 }
    )
  }
}
