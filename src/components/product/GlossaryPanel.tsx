"use client"

import type { GlossaryEntry } from "@/types"

interface Props {
  entries: GlossaryEntry[]
}

export function GlossaryPanel({ entries }: Props) {
  if (entries.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Glossari</h3>
      <dl className="space-y-2">
        {entries.map((entry, i) => (
          <div key={i} className="border rounded-md p-3">
            <dt className="font-medium text-sm">{entry.terme}</dt>
            <dd className="text-sm text-muted-foreground">{entry.definicio}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
