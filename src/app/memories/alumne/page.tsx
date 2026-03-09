"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { StudentMemoryForm } from "@/components/memories/StudentMemoryForm"
import { toast } from "sonner"
import type { StudentMemoryInput } from "@/lib/validators"

interface StudentMemory extends StudentMemoryInput {
  id: string
  createdAt: string
  updatedAt: string
}

export default function AlumnePage() {
  const [memories, setMemories] = useState<StudentMemory[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<StudentMemory | null>(null)

  const fetchMemories = useCallback(async () => {
    const res = await fetch("/api/memories/alumne")
    const data = await res.json()
    setMemories(data)
  }, [])

  useEffect(() => {
    fetchMemories()
  }, [fetchMemories])

  const handleCreate = async (data: StudentMemoryInput) => {
    const res = await fetch("/api/memories/alumne", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success("Perfil d'alumne creat")
      setDialogOpen(false)
      fetchMemories()
    } else {
      toast.error("Error en crear el perfil")
    }
  }

  const handleUpdate = async (data: StudentMemoryInput) => {
    if (!editing) return
    const res = await fetch(`/api/memories/alumne/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success("Perfil actualitzat")
      setEditing(null)
      fetchMemories()
    } else {
      toast.error("Error en actualitzar")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Segur que vols eliminar aquest perfil?")) return
    const res = await fetch(`/api/memories/alumne/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Perfil eliminat")
      fetchMemories()
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Perfils d&apos;Alumnat</h1>
          <p className="text-muted-foreground">
            Gestiona els perfils individuals per personalitzar les adaptacions.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Nou perfil</Button>
      </div>

      {memories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hi ha perfils d&apos;alumnat. Crea&apos;n un per començar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memories.map((m) => (
            <Card key={m.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {m.nom}
                  {m.necessitatsSuport && (
                    <Badge variant="secondary">{m.necessitatsSuport}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {m.paisOrigen && <p>Origen: {m.paisOrigen}</p>}
                {m.llenguaL1 && <p>L1: {m.llenguaL1}</p>}
                {m.nivellMECR && <p>MECR: {m.nivellMECR}</p>}
                {m.alfabetitzacioLlatina && <p>Alfab. llatina: {m.alfabetitzacioLlatina}</p>}
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
            <DialogTitle>Nou perfil d&apos;alumne</DialogTitle>
          </DialogHeader>
          <StudentMemoryForm
            onSubmit={handleCreate}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>
          {editing && (
            <StudentMemoryForm
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
