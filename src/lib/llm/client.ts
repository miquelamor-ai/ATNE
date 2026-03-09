/**
 * Client LLM unificat — suporta Gemini i OpenRouter (Qwen, Llama, etc.)
 * El proveïdor es detecta automàticament pel nom del model:
 *   - "gemini-*"  → Google Gemini API
 *   - qualsevol altre → OpenRouter (OpenAI-compatible)
 */

import { getGeminiClient } from "@/lib/gemini/client"

const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions"
const SITE_URL = "https://atne.vercel.app"
const SITE_NAME = "AAU - Assistent d'Adaptació Universal"

function detectProvider(model: string): "gemini" | "openrouter" {
  return model.startsWith("gemini") ? "gemini" : "openrouter"
}

function getOpenRouterKey(): string {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error("OPENROUTER_API_KEY no està configurada")
  return key
}

// ─── Crida estàndard (no streaming) ──────────────────────────────────────────

interface CallOptions {
  model: string
  systemPrompt: string
  userMessage: string
  temperature: number
  jsonMode?: boolean
}

export async function callLLM(opts: CallOptions): Promise<string> {
  const provider = detectProvider(opts.model)

  if (provider === "gemini") {
    const client = getGeminiClient()
    const response = await client.models.generateContent({
      model: opts.model,
      contents: opts.userMessage,
      config: {
        systemInstruction: opts.systemPrompt,
        responseMimeType: opts.jsonMode ? "application/json" : undefined,
        temperature: opts.temperature,
      },
    })
    const text = response.text
    if (!text) throw new Error("Resposta buida del model")
    return text
  }

  // OpenRouter
  const body: Record<string, unknown> = {
    model: opts.model,
    messages: [
      { role: "system", content: opts.systemPrompt },
      { role: "user", content: opts.userMessage },
    ],
    temperature: opts.temperature,
  }
  // Nota: els models :free d'OpenRouter no sempre suporten response_format
  // Confiem en les instruccions del sistema per obtenir JSON

  const res = await fetch(OPENROUTER_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getOpenRouterKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": SITE_URL,
      "X-Title": SITE_NAME,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`OpenRouter error ${res.status}: ${JSON.stringify(err)}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content as string | undefined
  if (!text) throw new Error("Resposta buida del model")
  return text
}

// ─── Crida amb streaming (SSE) ────────────────────────────────────────────────

interface StreamOptions {
  model: string
  systemPrompt: string
  messages: { role: "user" | "model"; content: string }[]
  temperature: number
}

export async function streamLLM(opts: StreamOptions): Promise<ReadableStream> {
  const provider = detectProvider(opts.model)
  const encoder = new TextEncoder()

  if (provider === "gemini") {
    const client = getGeminiClient()
    const contents = opts.messages.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.content }],
    }))

    const response = await client.models.generateContentStream({
      model: opts.model,
      contents,
      config: {
        systemInstruction: opts.systemPrompt,
        temperature: opts.temperature,
      },
    })

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: err instanceof Error ? err.message : "Error" })}\n\n`
            )
          )
          controller.close()
        }
      },
    })
  }

  // OpenRouter streaming
  const messages = [
    { role: "system", content: opts.systemPrompt },
    ...opts.messages.map((m) => ({
      role: m.role === "model" ? "assistant" : "user",
      content: m.content,
    })),
  ]

  const res = await fetch(OPENROUTER_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getOpenRouterKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": SITE_URL,
      "X-Title": SITE_NAME,
    },
    body: JSON.stringify({
      model: opts.model,
      messages,
      temperature: opts.temperature,
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`OpenRouter error ${res.status}: ${JSON.stringify(err)}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  return new ReadableStream({
    async start(controller) {
      let buffer = ""
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const data = line.slice(6).trim()
            if (data === "[DONE]") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"))
              controller.close()
              return
            }
            try {
              const json = JSON.parse(data)
              const text = json.choices?.[0]?.delta?.content as string | undefined
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
              }
            } catch {
              // chunk malformat, ignorem
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: err instanceof Error ? err.message : "Error" })}\n\n`
          )
        )
        controller.close()
      }
    },
  })
}
