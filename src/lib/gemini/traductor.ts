import { getGeminiClient } from "./client"
import { buildTraductorPrompt } from "./prompts/traductor"

interface TraduirOptions {
  text: string
  targetLang: string
  model: string
}

export async function traduir(opts: TraduirOptions): Promise<string> {
  const client = getGeminiClient()
  const systemPrompt = buildTraductorPrompt(opts.targetLang)

  const response = await client.models.generateContent({
    model: opts.model,
    contents: opts.text,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.2,
    },
  })

  const text = response.text
  if (!text) throw new Error("Resposta buida del traductor")

  return text.trim()
}
