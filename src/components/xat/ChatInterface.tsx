"use client"

import { useRef, useEffect } from "react"
import { useChat } from "@/hooks/useChat"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import { FileUploader } from "@/components/shared/FileUploader"
import { Button } from "@/components/ui/button"

export function ChatInterface() {
  const { messages, isStreaming, error, sendMessage, clear } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleFileExtracted = (text: string) => {
    sendMessage(`He pujat un fitxer amb el següent contingut:\n\n${text}`)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">Hola! Soc l&apos;AADA</h3>
            <p className="mb-4">
              Puc ajudar-te a adaptar textos educatius o a generar-ne de nous.
            </p>
            <div className="flex flex-col gap-2 items-center text-sm">
              <p>Pots:</p>
              <ul className="text-left space-y-1">
                <li>- Enganxar un text per adaptar</li>
                <li>- Pujar un fitxer PDF o DOCX</li>
                <li>- Demanar-me que generi un text sobre un tema</li>
              </ul>
            </div>

            <div className="mt-8 max-w-md mx-auto">
              <FileUploader onTextExtracted={handleFileExtracted} />
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}

        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start mb-4">
            <div className="bg-muted rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-2 bg-destructive/10 text-destructive p-2 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2 mb-2">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clear}>
              Nova conversa
            </Button>
          )}
        </div>
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  )
}
