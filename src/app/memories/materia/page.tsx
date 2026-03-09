"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { SubjectProfileForm } from "@/components/memories/SubjectProfileForm"
import { toast } from "sonner"
import type { SubjectProfileInput } from "@/lib/validators"

interface SubjectProfile extends SubjectProfileInput {
  id: string
  createdAt: string
  updatedAt: string
}

export default function MateriaPage() {
  const [profiles, setProfiles] = useState<SubjectProfile[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SubjectProfile | null>(null)

  const fetchProfiles = useCallback(async () => {
    const res = await fetch("/api/memories/materia")
    const data = await res.json()
    setProfiles(data)
  }, [])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const handleCreate = async (data: SubjectProfileInput) => {
    const res = await fetch("/api/memories/materia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success("Perfil de matèria creat")
      setDialogOpen(false)
      fetchProfiles()
    } else {
      toast.error("Error en crear el perfil")
    }
  }

  const handleUpdate = async (data: SubjectProfileInput) => {
    if (!editing) return
    const res = await fetch(`/api/memories/materia/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success("Perfil actualitzat")
      setEditing(null)
      fetchProfiles()
    } else {
      toast.error("Error en actualitzar")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Segur que vols eliminar aquest perfil?")) return
    const res = await fetch(`/api/memories/materia/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Perfil eliminat")
      fetchProfiles()
    }
  }

  const STYLE_LABELS: Record<string, string> = {
    cientific: "Científic",
    humanistic: "Humanístic",
    linguistic: "Lingüístic",
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Perfils de Matèria</h1>
          <p className="text-muted-foreground">
            Configura les matèries amb els seus termes tècnics i estil de redacció.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Nova matèria</Button>
      </div>

      {profiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hi ha perfils de matèria. Crea&apos;n un per començar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {p.nomAssignatura}
                  <Badge variant="secondary">
                    {STYLE_LABELS[p.estilRedaccio] ?? p.estilRedaccio}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {p.termesIntocables && (
                  <p>Termes: {p.termesIntocables.split("\n").slice(0, 3).join(", ")}...</p>
                )}
                {p.notes && <p className="text-muted-foreground">{p.notes}</p>}
                <div className="flex gap-2 pt-3">
                  <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova matèria</DialogTitle>
          </DialogHeader>
          <SubjectProfileForm
            onSubmit={handleCreate}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar matèria</DialogTitle>
          </DialogHeader>
          {editing && (
            <SubjectProfileForm
              initialData={editing}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
