"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { SUBJECT_STYLES } from "@/lib/constants"
import type { SubjectProfileInput } from "@/lib/validators"

interface Props {
  initialData?: SubjectProfileInput & { id?: string }
  onSubmit: (data: SubjectProfileInput) => Promise<void>
  onCancel?: () => void
}

export function SubjectProfileForm({ initialData, onSubmit, onCancel }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<SubjectProfileInput>({
    nomAssignatura: initialData?.nomAssignatura ?? "",
    estilRedaccio: initialData?.estilRedaccio ?? "cientific",
    termesIntocables: initialData?.termesIntocables ?? "",
    notes: initialData?.notes ?? "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(form)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nomAssignatura">Nom de l&apos;assignatura</Label>
        <Input
          id="nomAssignatura"
          value={form.nomAssignatura}
          onChange={(e) => setForm({ ...form, nomAssignatura: e.target.value })}
          placeholder="Ex: Ciències Naturals, Història..."
          required
        />
      </div>

      <div>
        <Label>Estil de redacció</Label>
        <Select
          value={form.estilRedaccio}
          onValueChange={(v) =>
            setForm({ ...form, estilRedaccio: v as "cientific" | "humanistic" | "linguistic" })
          }
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {SUBJECT_STYLES.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                {style.label} - {style.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="termesIntocables">Termes intocables</Label>
        <Textarea
          id="termesIntocables"
          value={form.termesIntocables ?? ""}
          onChange={(e) => setForm({ ...form, termesIntocables: e.target.value })}
          placeholder="Termes que no s'han de simplificar (un per línia)&#10;Ex: fotosíntesi&#10;mitocondri&#10;ADN"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Aquests termes es mantindran i s&apos;explicaran, però no es substituiran per sinònims.
        </p>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes ?? ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Observacions sobre la matèria..."
        />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel·lar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Desant..." : initialData?.id ? "Actualitzar" : "Crear"}
        </Button>
      </div>
    </form>
  )
}
