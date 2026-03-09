"use client"

import { Header } from "@/components/shared/Header"
import { StepIndicator } from "@/components/pipeline/StepIndicator"
import { IngestaStep } from "@/components/pipeline/IngestaStep"
import { ConfirmacioStep } from "@/components/pipeline/ConfirmacioStep"
import { ConfiguracioStep } from "@/components/pipeline/ConfiguracioStep"
import { ProducteStep } from "@/components/pipeline/ProducteStep"
import { usePipeline } from "@/hooks/usePipeline"

export default function AdaptacioPage() {
  const { currentStep, isLoading } = usePipeline()

  return (
    <>
      <Header />
      <main className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-2">Mode Avançat</h1>
        <p className="text-muted-foreground mb-6">
          Segueix el flux pas a pas per configurar i executar l&apos;adaptació del text.
        </p>

        <StepIndicator currentStep={currentStep} />

        {currentStep === "ingesta" && <IngestaStep />}
        {currentStep === "confirmacio" && <ConfirmacioStep />}
        {currentStep === "configuracio" && <ConfiguracioStep />}
        {currentStep === "adaptacio" && isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">
              Adaptant el text... Això pot trigar uns segons.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              L&apos;agent adaptador genera el text, l&apos;auditor el revisa, i es busquen els pictogrames.
            </p>
          </div>
        )}
        {currentStep === "producte" && <ProducteStep />}
      </main>
    </>
  )
}
