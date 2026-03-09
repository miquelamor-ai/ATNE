import type { AdaptationResult } from "@/types"

export function generateTxt(result: AdaptationResult): string {
  const lines: string[] = []

  lines.push("=== TEXT ADAPTAT ===")
  lines.push("")
  lines.push(result.textAdaptat)
  lines.push("")

  if (result.textAcces) {
    lines.push("=== NIVELL ACCÉS ===")
    lines.push("")
    lines.push(result.textAcces)
    lines.push("")
  }

  if (result.textEnriquiment) {
    lines.push("=== NIVELL ENRIQUIMENT ===")
    lines.push("")
    lines.push(result.textEnriquiment)
    lines.push("")
  }

  if (result.traduccioText) {
    lines.push("=== TRADUCCIÓ ===")
    lines.push("")
    lines.push(result.traduccioText)
    lines.push("")
  }

  if (result.glossari.length > 0) {
    lines.push("=== GLOSSARI ===")
    lines.push("")
    for (const entry of result.glossari) {
      lines.push(`${entry.terme}: ${entry.definicio}`)
    }
    lines.push("")
  }

  return lines.join("\n")
}
