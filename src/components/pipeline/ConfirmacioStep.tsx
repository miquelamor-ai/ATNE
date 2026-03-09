"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { usePipeline } from "@/hooks/usePipeline"

export function ConfirmacioStep() {
  const { textOriginal, confirmText, setStep } = usePipeline()

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Pas 2: Confirma el text</h2>
      <p className="text-muted-foreground">
        Revisa que el text s&apos;ha extret correctament abans de continuar.
      </p>

      <Card>
        <CardContent className="p-4">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed">
            {textOriginal}
          </pre>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep("ingesta")}>
          Tornar enrere
        </Button>
        <Button onClick={confirmText}>
          Text correcte, continuar
        </Button>
      </div>
    </div>
  )
}
