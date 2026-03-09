"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MECR_LEVELS, ALFABETITZACIO_OPTIONS, NECESSITATS_SUPORT_OPTIONS } from "@/lib/constants"
import type { StudentMemoryInput } from "@/lib/validators"

interface Props {
  initialData?: StudentMemoryInput & { id?: string }
  onSubmit: (data: StudentMemoryInput) => Promise<void>
  onCancel?: () => void
}

export function StudentMemoryForm({ initialData, onSubmit, onCancel }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<StudentMemoryInput>({
    nom: initialData?.nom ?? "",
    paisOrigen: initialData?.paisOrigen ?? "",
    llenguaL1: initialData?.llenguaL1 ?? "",
    alfabetitzacioLlatina: initialData?.alfabetitzacioLlatina ?? undefined,
    nivellMECR: initialData?.nivellMECR ?? undefined,
    necessitatsSuport: initialData?.necessitatsSuport ?? undefined,
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
        <Label htmlFor="nom">Nom o identificador</Label>
        <Input
          id="nom"
          value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          placeholder="Ex: Alumne 1, Fatima..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="paisOrigen">País d&apos;origen</Label>
          <Input
            id="paisOrigen"
            value={form.paisOrigen ?? ""}
            onChange={(e) => setForm({ ...form, paisOrigen: e.target.value })}
            placeholder="Ex: Marroc, Ucraïna..."
          />
        </div>
        <div>
          <Label htmlFor="llenguaL1">Llengua materna (L1)</Label>
          <Input
            id="llenguaL1"
            value={form.llenguaL1 ?? ""}
            onChange={(e) => setForm({ ...form, llenguaL1: e.target.value })}
            placeholder="Ex: Àrab, Urdú..."
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Alfabetització llatina</Label>
          <Select
            value={form.alfabetitzacioLlatina ?? ""}
            onValueChange={(v) =>
              setForm({ ...form, alfabetitzacioLlatina: v as "si" | "no" | "proces" })
            }
          >
            <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
            <SelectContent>
              {ALFABETITZACIO_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Nivell MECR</Label>
          <Select
            value={form.nivellMECR ?? ""}
            onValueChange={(v) => setForm({ ...form, nivellMECR: v as typeof form.nivellMECR })}
          >
            <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
            <SelectContent>
              {MECR_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Necessitats de suport</Label>
          <Select
            value={form.necessitatsSuport ?? ""}
            onValueChange={(v) =>
              setForm({ ...form, necessitatsSuport: v as typeof form.necessitatsSuport })
            }
          >
            <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
            <SelectContent>
              {NECESSITATS_SUPORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes ?? ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Observacions addicionals..."
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
