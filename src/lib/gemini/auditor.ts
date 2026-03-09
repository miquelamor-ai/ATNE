import { getGeminiClient } from "./client"
import { buildAuditorPrompt } from "./prompts/auditor"
import type { GeminiAuditResponse } from "@/types"

interface AuditarOptions {
  textAdaptat: string
  textOriginal: string
  nivellDificultat: string
  model: string
}

export async function auditar(opts: AuditarOptions): Promise<GeminiAuditResponse> {
  const client = getGeminiClient()
  const systemPrompt = buildAuditorPrompt()

  const userMessage = `## Text Original
${opts.textOriginal}

## Text Adaptat (nivell: ${opts.nivellDificultat})
${opts.textAdaptat}

Revisa si el text adaptat compleix els criteris de Lectura Fàcil.`

  const response = await client.models.generateContent({
    model: opts.model,
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  })

  const text = response.text
  if (!text) throw new Error("Resposta buida de l'auditor")

  return JSON.parse(text) as GeminiAuditResponse
}
