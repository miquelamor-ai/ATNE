"use client"

import type { ComparativeRow } from "@/types"

interface Props {
  rows: ComparativeRow[]
  showTranslation?: boolean
}

export function ComparativeTable({ rows, showTranslation }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted">
            <th className="border p-2 text-left font-medium w-8">#</th>
            <th className="border p-2 text-left font-medium">Original</th>
            <th className="border p-2 text-left font-medium">Adaptat</th>
            {showTranslation && (
              <th className="border p-2 text-left font-medium">Traducció</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.paragrafIndex} className="hover:bg-muted/50">
              <td className="border p-2 text-muted-foreground">{row.paragrafIndex + 1}</td>
              <td className="border p-2">{row.original}</td>
              <td className="border p-2">{row.adaptat}</td>
              {showTranslation && (
                <td className="border p-2">{row.traduccio || "-"}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
