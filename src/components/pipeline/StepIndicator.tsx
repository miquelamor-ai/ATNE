"use client"

import { cn } from "@/lib/utils"
import type { PipelineStep } from "@/types"

const STEPS: { key: PipelineStep; label: string }[] = [
  { key: "ingesta", label: "Text" },
  { key: "confirmacio", label: "Confirmar" },
  { key: "configuracio", label: "Configurar" },
  { key: "adaptacio", label: "Adaptar" },
  { key: "producte", label: "Resultat" },
]

const stepIndex = (step: PipelineStep) =>
  STEPS.findIndex((s) => s.key === step)

export function StepIndicator({ currentStep }: { currentStep: PipelineStep }) {
  const current = stepIndex(currentStep)

  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
              i < current
                ? "bg-primary text-primary-foreground"
                : i === current
                ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                : "bg-muted text-muted-foreground"
            )}
          >
            {i + 1}
          </div>
          <span
            className={cn(
              "ml-2 text-sm hidden sm:inline",
              i <= current ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            {step.label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "w-8 h-0.5 mx-2",
                i < current ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
