import { getGeminiClient } from "./client"
import { buildOrquestradorXatPrompt } from "./prompts/orquestrador-xat"
import { prisma } from "@/lib/db"

interface ChatInput {
  messages: { role: "user" | "model"; content: string }[]
  model?: string
}

export async function handleChatMessage(input: ChatInput): Promise<ReadableStream> {
  const settings = await prisma.appSettings.findUnique({
    where: { id: "default" },
  })
  const modelName = input.model || settings?.modelOrquestrador || "gemini-2.0-flash"
  const client = getGeminiClient()
  const systemPrompt = buildOrquestradorXatPrompt()

  const contents = input.messages.map((m) => ({
    role: m.role === "user" ? "user" as const : "model" as const,
    parts: [{ text: m.content }],
  }))

  const response = await client.models.generateContentStream({
    model: modelName,
    contents,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.5,
    },
  })

  const encoder = new TextEncoder()

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
