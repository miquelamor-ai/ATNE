"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUploader } from "@/components/shared/FileUploader"
import { usePipeline } from "@/hooks/usePipeline"

export function IngestaStep() {
  const { setText, setTemaGenerar, setStep } = usePipeline()
  const [pastedText, setPastedText] = useState("")
  const [tema, setTema] = useState("")

  const handlePaste = () => {
    if (pastedText.trim()) {
      setText(pastedText.trim(), "enganxat")
      setStep("confirmacio")
    }
  }

  const handleFileExtracted = (text: string, source: string) => {
    setText(text, source as "pdf" | "docx")
    setStep("confirmacio")
  }

  const handleGenerate = () => {
    if (tema.trim()) {
      setTemaGenerar(tema.trim())
      setText("", "generat")
      setStep("configuracio")
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Pas 1: Introdueix el text</h2>
      <Tabs defaultValue="enganxar">
        <TabsList>
          <TabsTrigger value="enganxar">Enganxar text</TabsTrigger>
          <TabsTrigger value="fitxer">Pujar fitxer</TabsTrigger>
          <TabsTrigger value="generar">Generar text</TabsTrigger>
        </TabsList>

        <TabsContent value="enganxar" className="space-y-4">
          <Textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Enganxa aquí el text que vols adaptar..."
            className="min-h-[200px]"
          />
          <Button onClick={handlePaste} disabled={!pastedText.trim()}>
            Continuar
          </Button>
        </TabsContent>

        <TabsContent value="fitxer">
          <FileUploader onTextExtracted={handleFileExtracted} />
        </TabsContent>

        <TabsContent value="generar" className="space-y-4">
          <div>
            <Label htmlFor="tema">Tema per generar</Label>
            <Input
              id="tema"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ex: El sistema solar, La fotosíntesi, La Revolució Francesa..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              L&apos;assistent generarà un text educatiu adaptat sobre aquest tema.
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={!tema.trim()}>
            Generar i adaptar
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
