import { callLLM } from "@/lib/llm/client"
import { buildAuditorPrompt } from "./prompts/auditor"
import type { GeminiAuditResponse } from "@/types"

interface AuditarOptions {
  textAdaptat: string
  textOriginal: string
  nivellDificultat: string
  model: string
}

export async function auditar(opts: AuditarOptions): Promise<GeminiAuditResponse> {
  const systemPrompt = buildAuditorPrompt()

  const userMessage = `## Text Original
${opts.textOriginal}

## Text Adaptat (nivell: ${opts.nivellDificultat})
${opts.textAdaptat}

Revisa si el text adaptat compleix els criteris de Lectura Fàcil.`

  const text = await callLLM({
    model: opts.model,
    systemPrompt,
    userMessage,
    temperature: 0.1,
    jsonMode: true,
  })

  return JSON.parse(text) as GeminiAuditResponse
}
