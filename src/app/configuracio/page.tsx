"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/shared/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AVAILABLE_MODELS } from "@/lib/gemini/models"
import { toast } from "sonner"

interface Settings {
  modelAdaptador: string
  modelAuditor: string
  modelTraductor: string
  modelOrquestrador: string
}

export default function ConfiguracioPage() {
  const [settings, setSettings] = useState<Settings>({
    modelAdaptador: "gemini-2.0-flash",
    modelAuditor: "gemini-2.0-flash",
    modelTraductor: "gemini-2.0-flash",
    modelOrquestrador: "gemini-2.0-flash",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.modelAdaptador) setSettings(data)
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
    if (res.ok) {
      toast.success("Configuració guardada")
    } else {
      toast.error("Error en guardar")
    }
    setLoading(false)
  }

  const MODEL_ROLES = [
    { key: "modelAdaptador" as const, label: "Agent Adaptador", desc: "Genera les adaptacions de text" },
    { key: "modelAuditor" as const, label: "Agent Auditor", desc: "Revisa criteris de Lectura Fàcil" },
    { key: "modelTraductor" as const, label: "Agent Traductor", desc: "Tradueix el text adaptat" },
    { key: "modelOrquestrador" as const, label: "Agent Orquestrador (Xat)", desc: "Gestiona el mode conversacional" },
  ]

  return (
    <>
      <Header />
      <main className="container mx-auto p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Configuració</h1>
        <p className="text-muted-foreground mb-6">
          Selecciona els models de Gemini per a cada agent del sistema.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Models Gemini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {MODEL_ROLES.map((role) => (
              <div key={role.key}>
                <Label>{role.label}</Label>
                <p className="text-xs text-muted-foreground mb-1">{role.desc}</p>
                <Select
                  value={settings[role.key]}
                  onValueChange={(v) =>
                    setSettings({ ...settings, [role.key]: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? "Guardant..." : "Guardar configuració"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
