"use client"

import { useState } from "react"
import { Header } from "@/components/shared/Header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AGE_RANGES, DIFFICULTY_LEVELS } from "@/lib/constants"

interface SearchResult {
  id: string
  textOriginal: string
  textAdaptat: string | null
  edat: string | null
  nivellDificultat: string | null
  traduccio: string | null
  assignatura: string | null
  tags: string | null
  createdAt: string
}

export default function CercadorPage() {
  const [query, setQuery] = useState("")
  const [edat, setEdat] = useState("")
  const [nivell, setNivell] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    setSearched(true)
    const params = new URLSearchParams()
    if (query) params.set("query", query)
    if (edat) params.set("edat", edat)
    if (nivell) params.set("nivell", nivell)

    const res = await fetch(`/api/adaptacio/search?${params}`)
    const data = await res.json()
    setResults(data.adaptations || [])
    setLoading(false)
  }

  return (
    <>
      <Header />
      <main className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-2">Cercador d&apos;Adaptacions</h1>
        <p className="text-muted-foreground mb-6">
          Cerca adaptacions existents per reutilitzar-les o clonar-les.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca per text, matèria o tags..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Select value={edat} onValueChange={setEdat}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Edat..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="totes">Totes les edats</SelectItem>
              {AGE_RANGES.map((a) => (
                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={nivell} onValueChange={setNivell}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Nivell..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tots">Tots els nivells</SelectItem>
              {DIFFICULTY_LEVELS.map((d) => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Cercant..." : "Cercar"}
          </Button>
        </div>

        {searched && results.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No s&apos;han trobat resultats.
          </p>
        )}

        <div className="space-y-4">
          {results.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {r.assignatura && <Badge>{r.assignatura}</Badge>}
                  {r.edat && <Badge variant="secondary">{r.edat}</Badge>}
                  {r.nivellDificultat && <Badge variant="outline">{r.nivellDificultat}</Badge>}
                </div>
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("ca-ES")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2 line-clamp-2">{r.textOriginal}</p>
                {r.textAdaptat && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    Adaptat: {r.textAdaptat}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/adaptacio/${r.id}`}>Veure</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}
