import { create } from "zustand"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatState {
  messages: Message[]
  isStreaming: boolean
  error: string | null
  addUserMessage: (content: string) => void
  sendMessage: (content: string) => Promise<void>
  clear: () => void
}

export const useChat = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  error: null,

  addUserMessage: (content) => {
    const msg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    }
    set((s) => ({ messages: [...s.messages, msg] }))
  },

  sendMessage: async (content: string) => {
    const state = get()

    // Add user message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    // Prepare assistant placeholder
    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    }

    set((s) => ({
      messages: [...s.messages, userMsg, assistantMsg],
      isStreaming: true,
      error: null,
    }))

    try {
      const apiMessages = [...state.messages, userMsg].map((m) => ({
        role: m.role === "user" ? "user" as const : "model" as const,
        content: m.content,
      }))

      const res = await fetch("/api/xat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error de connexió")
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No stream")

      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") break

            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                accumulated += parsed.text
                set((s) => ({
                  messages: s.messages.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: accumulated }
                      : m
                  ),
                }))
              }
              if (parsed.error) {
                throw new Error(parsed.error)
              }
            } catch {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error desconegut",
      })
    } finally {
      set({ isStreaming: false })
    }
  },

  clear: () => set({ messages: [], error: null, isStreaming: false }),
}))
