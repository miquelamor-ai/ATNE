"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AuditReport as AuditReportType } from "@/types"

interface Props {
  report: AuditReportType
}

export function AuditReport({ report }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "text-2xl font-bold",
            report.puntuacioGlobal >= 70 ? "text-green-600" : "text-red-600"
          )}
        >
          {report.puntuacioGlobal}/100
        </div>
        <Badge variant={report.passaAuditoria ? "default" : "destructive"}>
          {report.passaAuditoria ? "Aprovat" : "No aprovat"}
        </Badge>
      </div>

      <div className="space-y-3">
        {report.criteris.map((c) => (
          <div key={c.id} className="border rounded-md p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-sm">
                {c.id} {c.nom}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  c.puntuacio >= 70 ? "text-green-600" : "text-red-600"
                )}
              >
                {c.puntuacio}/100
              </span>
            </div>
            {c.observacions.length > 0 && (
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {c.observacions.map((obs, i) => (
                  <li key={i}>- {obs}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {report.recomanacions.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-1">Recomanacions</h4>
          <ul className="text-sm text-muted-foreground space-y-0.5">
            {report.recomanacions.map((r, i) => (
              <li key={i}>- {r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
