"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ClassMemoryForm } from "@/components/memories/ClassMemoryForm"
import { toast } from "sonner"
import type { ClassMemoryInput } from "@/lib/validators"

interface ClassMemory extends ClassMemoryInput {
  id: string
  createdAt: string
  updatedAt: string
}

export default function ClassePage() {
  const [memories, setMemories] = useState<ClassMemory[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ClassMemory | null>(null)

  const fetchMemories = useCallback(async () => {
    const res = await fetch("/api/memories/classe")
    const data = await res.json()
    setMemories(data)
  }, [])

  useEffect(() => {
    fetchMemories()
  }, [fetchMemories])

  const handleCreate = async (data: ClassMemoryInput) => {
    const res = await fetch("/api/memories/classe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success("Grup classe creat")
      setDialogOpen(false)
      fetchMemories()
    } else {
      toast.error("Error en crear el grup")
    }
  }

  const handleUpdate = async (data: ClassMemoryInput) => {
    if (!editing) return
    const res = await fetch(`/api/memories/classe/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success("Grup actualitzat")
      setEditing(null)
      fetchMemories()
    } else {
      toast.error("Error en actualitzar")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Segur que vols eliminar aquest grup?")) return
    const res = await fetch(`/api/memories/classe/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Grup eliminat")
      fetchMemories()
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Grups Classe</h1>
          <p className="text-muted-foreground">
            Defineix els grups classe i la seva configuració de suport.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Nou grup</Button>
      </div>

      {memories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hi ha grups classe. Crea&apos;n un per començar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memories.map((m) => (
            <Card key={m.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {m.nom}
                  {m.configuracioMultinivell && (
                    <Badge variant="secondary">Multinivell</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>Suport: {m.estilSuportPreferit}</p>
                {m.notes && <p className="text-muted-foreground">{m.notes}</p>}
                <div className="flex gap-2 pt-3">
                  <Button size="sm" variant="outline" onClick={() => setEditing(m)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(m.id)}>
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
            <DialogTitle>Nou grup classe</DialogTitle>
          </DialogHeader>
          <ClassMemoryForm
            onSubmit={handleCreate}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar grup</DialogTitle>
          </DialogHeader>
          {editing && (
            <ClassMemoryForm
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
