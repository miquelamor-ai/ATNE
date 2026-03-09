"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePipeline } from "@/hooks/usePipeline"
import { AGE_RANGES, DIFFICULTY_LEVELS, AIDS_OPTIONS, TRANSLATION_LANGUAGES } from "@/lib/constants"
import type { AidOption, AgeRange, DifficultyLevel, LanguageCode } from "@/lib/constants"

export function ConfiguracioStep() {
  const {
    config, setEdat, setNivell, setAjuts, setTraduccio,
    setTaulaComparativa, setMultinivell, setMemoryIds,
    runAdaptation, setStep, isLoading, error,
  } = usePipeline()

  const [selectedAjuts, setSelectedAjuts] = useState<AidOption[]>(config.ajuts || [])
  const [students, setStudents] = useState<{ id: string; nom: string }[]>([])
  const [classes, setClasses] = useState<{ id: string; nom: string }[]>([])
  const [subjects, setSubjects] = useState<{ id: string; nomAssignatura: string }[]>([])

  useEffect(() => {
    fetch("/api/memories/alumne").then((r) => r.json()).then(setStudents).catch(() => {})
    fetch("/api/memories/classe").then((r) => r.json()).then(setClasses).catch(() => {})
    fetch("/api/memories/materia").then((r) => r.json()).then(setSubjects).catch(() => {})
  }, [])

  const toggleAjut = (ajut: AidOption) => {
    const next = selectedAjuts.includes(ajut)
      ? selectedAjuts.filter((a) => a !== ajut)
      : [...selectedAjuts, ajut]
    setSelectedAjuts(next)
    setAjuts(next)
  }

  const handleRun = () => {
    if (!config.edat || !config.nivellDificultat) return
    runAdaptation()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Pas 3: Configuració</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Q1: Edat */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Edat / Etapa</CardTitle></CardHeader>
          <CardContent>
            <Select value={config.edat || ""} onValueChange={(v) => setEdat(v as AgeRange)}>
              <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
              <SelectContent>
                {AGE_RANGES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Q2: Nivell */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Nivell de dificultat</CardTitle></CardHeader>
          <CardContent>
            <Select value={config.nivellDificultat || ""} onValueChange={(v) => setNivell(v as DifficultyLevel)}>
              <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label} ({d.mecr})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Q3: Ajuts */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Ajuts opcionals</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {AIDS_OPTIONS.map((a) => (
              <label key={a.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAjuts.includes(a.value)}
                  onChange={() => toggleAjut(a.value)}
                  className="rounded"
                />
                <span className="text-sm">{a.label}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Q4: Traducció */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Traducció (opcional)</CardTitle></CardHeader>
          <CardContent>
            <Select value={config.traduccio || "cap"} onValueChange={(v) => setTraduccio(v === "cap" ? null : v as LanguageCode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cap">Sense traducció</SelectItem>
                {TRANSLATION_LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>{l.flag} {l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Q5+Q6: Taula + Multinivell */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Opcions addicionals</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.taulaComparativa ?? true}
                onChange={(e) => setTaulaComparativa(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Taula comparativa (original vs adaptat)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.modeMultinivell ?? false}
                onChange={(e) => setMultinivell(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Mode multinivell (Accés + Core + Enriquiment)</span>
            </label>
          </CardContent>
        </Card>

        {/* Memòries */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Context (opcional)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {students.length > 0 && (
              <div>
                <Label className="text-xs">Alumne</Label>
                <Select onValueChange={(v) => setMemoryIds(v === "cap" ? undefined : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cap">Cap</SelectItem>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {classes.length > 0 && (
              <div>
                <Label className="text-xs">Classe</Label>
                <Select onValueChange={(v) => setMemoryIds(undefined, v === "cap" ? undefined : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cap">Cap</SelectItem>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {subjects.length > 0 && (
              <div>
                <Label className="text-xs">Matèria</Label>
                <Select onValueChange={(v) => setMemoryIds(undefined, undefined, v === "cap" ? undefined : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cap">Cap</SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.nomAssignatura}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep("confirmacio")}>
          Tornar enrere
        </Button>
        <Button
          onClick={handleRun}
          disabled={!config.edat || !config.nivellDificultat || isLoading}
        >
          {isLoading ? "Adaptant..." : "Adaptar text"}
        </Button>
      </div>
    </div>
  )
}
