import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createAdaptationSchema } from "@/lib/validators"
import { runPipeline } from "@/lib/gemini/pipeline"

export async function GET() {
  const adaptations = await prisma.adaptation.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return NextResponse.json(adaptations)
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = createAdaptationSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { textOriginal, fontText, config, studentMemoryId, classMemoryId, subjectProfileId, temaGenerar } = parsed.data

  try {
    // Executar el pipeline complet
    const result = await runPipeline({
      textOriginal,
      fontText: fontText || "enganxat",
      config: {
        edat: config.edat,
        nivellDificultat: config.nivellDificultat,
        ajuts: config.ajuts,
        traduccio: config.traduccio,
        taulaComparativa: config.taulaComparativa,
        modeMultinivell: config.modeMultinivell,
      },
      studentMemoryId,
      classMemoryId,
      subjectProfileId,
      temaGenerar,
    })

    // Guardar a la BD
    const adaptation = await prisma.adaptation.create({
      data: {
        textOriginal: temaGenerar ? `[GENERAT] Tema: ${temaGenerar}` : textOriginal,
        fontText: temaGenerar ? "generat" : (fontText || "enganxat"),
        edat: config.edat,
        nivellDificultat: config.nivellDificultat,
        ajuts: JSON.stringify(config.ajuts),
        traduccio: config.traduccio,
        taulaComparativa: config.taulaComparativa,
        modeMultinivell: config.modeMultinivell,
        studentMemoryId,
        classMemoryId,
        subjectProfileId,
        textAdaptat: result.textAdaptat,
        textAcces: result.textAcces,
        textEnriquiment: result.textEnriquiment,
        traduccioText: result.traduccioText,
        auditoria: JSON.stringify(result.auditoria),
        taulaComparativaData: result.taulaComparativa
          ? JSON.stringify(result.taulaComparativa)
          : null,
        pictograms: JSON.stringify(result.pictograms),
        glossari: JSON.stringify(result.glossari),
        createdVia: "wizard",
        isPublic: true,
      },
    })

    return NextResponse.json({
      id: adaptation.id,
      result,
    })
  } catch (err) {
    console.error("Error al pipeline:", err)
    return NextResponse.json(
      { error: `Error en el procés d'adaptació: ${err instanceof Error ? err.message : "Desconegut"}` },
      { status: 500 }
    )
  }
}
