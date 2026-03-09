import { getGeminiClient } from "./client"
import { buildAdaptadorPrompt } from "./prompts/adaptador"
import type { GeminiAdaptationResponse } from "@/types"

interface AdaptarOptions {
  textOriginal: string
  edat: string
  nivellDificultat: string
  ajuts: string[]
  estilRedaccio?: string
  termesIntocables?: string
  alumneContext?: string
  classeContext?: string
  modeMultinivell: boolean
  model: string
  temaGenerar?: string
}

export async function adaptar(opts: AdaptarOptions): Promise<GeminiAdaptationResponse> {
  const client = getGeminiClient()
  const systemPrompt = buildAdaptadorPrompt({
    edat: opts.edat,
    nivellDificultat: opts.nivellDificultat,
    ajuts: opts.ajuts,
    estilRedaccio: opts.estilRedaccio,
    termesIntocables: opts.termesIntocables,
    alumneContext: opts.alumneContext,
    classeContext: opts.classeContext,
    modeMultinivell: opts.modeMultinivell,
    temaGenerar: opts.temaGenerar,
  })

  const userMessage = opts.temaGenerar
    ? `Genera un text educatiu sobre: "${opts.temaGenerar}"`
    : `Adapta el següent text:\n\n${opts.textOriginal}`

  const response = await client.models.generateContent({
    model: opts.model,
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  })

  const text = response.text
  if (!text) throw new Error("Resposta buida de Gemini")

  return JSON.parse(text) as GeminiAdaptationResponse
}
