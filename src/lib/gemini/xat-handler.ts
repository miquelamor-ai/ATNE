import { streamLLM } from "@/lib/llm/client"
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
  const systemPrompt = buildOrquestradorXatPrompt()

  return streamLLM({
    model: modelName,
    systemPrompt,
    messages: input.messages,
    temperature: 0.5,
  })
}
