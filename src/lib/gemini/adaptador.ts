import { callLLM } from "@/lib/llm/client"
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

  const text = await callLLM({
    model: opts.model,
    systemPrompt,
    userMessage,
    temperature: 0.3,
    jsonMode: true,
  })

  return JSON.parse(text) as GeminiAdaptationResponse
}
