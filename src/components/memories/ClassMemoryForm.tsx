"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ClassMemoryInput } from "@/lib/validators"

interface Props {
  initialData?: ClassMemoryInput & { id?: string }
  onSubmit: (data: ClassMemoryInput) => Promise<void>
  onCancel?: () => void
}

export function ClassMemoryForm({ initialData, onSubmit, onCancel }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<ClassMemoryInput>({
    nom: initialData?.nom ?? "",
    configuracioMultinivell: initialData?.configuracioMultinivell ?? false,
    estilSuportPreferit: initialData?.estilSuportPreferit ?? "mixt",
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
        <Label htmlFor="nom">Nom del grup</Label>
        <Input
          id="nom"
          value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          placeholder="Ex: 1r ESO A, 3r Primària B..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Estil de suport preferit</Label>
          <Select
            value={form.estilSuportPreferit}
            onValueChange={(v) =>
              setForm({ ...form, estilSuportPreferit: v as "visual" | "textual" | "mixt" })
            }
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="visual">Visual</SelectItem>
              <SelectItem value="textual">Textual</SelectItem>
              <SelectItem value="mixt">Mixt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.configuracioMultinivell}
              onChange={(e) =>
                setForm({ ...form, configuracioMultinivell: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm">Configuració multinivell activa</span>
          </label>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes ?? ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Observacions sobre el grup..."
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
