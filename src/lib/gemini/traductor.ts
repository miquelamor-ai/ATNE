import { callLLM } from "@/lib/llm/client"
import { buildTraductorPrompt } from "./prompts/traductor"

interface TraduirOptions {
  text: string
  targetLang: string
  model: string
}

export async function traduir(opts: TraduirOptions): Promise<string> {
  const systemPrompt = buildTraductorPrompt(opts.targetLang)

  const text = await callLLM({
    model: opts.model,
    systemPrompt,
    userMessage: opts.text,
    temperature: 0.2,
    jsonMode: false,
  })

  return text.trim()
}
