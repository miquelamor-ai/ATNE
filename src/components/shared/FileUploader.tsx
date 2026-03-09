"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Props {
  onTextExtracted: (text: string, source: string) => void
  disabled?: boolean
}

const ACCEPTED_TYPES = ".pdf,.docx,.txt"

export function FileUploader({ onTextExtracted, disabled }: Props) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/ingesta", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Error en processar el fitxer")
        return
      }

      toast.success(`Fitxer processat: ${data.charCount} caràcters extrets`)
      const source = file.name.endsWith(".pdf")
        ? "pdf"
        : file.name.endsWith(".docx")
        ? "docx"
        : "enganxat"
      onTextExtracted(data.text, source)
    } catch {
      toast.error("Error de connexió")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed rounded-lg p-8 text-center transition-colors hover:border-primary/50"
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
        className="hidden"
        disabled={disabled || uploading}
      />
      <p className="text-muted-foreground mb-3">
        Arrossega un fitxer aquí o fes clic per seleccionar
      </p>
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
      >
        {uploading ? "Processant..." : "Seleccionar fitxer"}
      </Button>
      <p className="text-xs text-muted-foreground mt-2">
        Formats acceptats: PDF, DOCX, TXT
      </p>
    </div>
  )
}
