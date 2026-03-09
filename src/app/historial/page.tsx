"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/shared/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Adaptation {
  id: string
  textOriginal: string
  edat: string | null
  nivellDificultat: string | null
  fontText: string | null
  createdVia: string | null
  createdAt: string
}

export default function HistorialPage() {
  const [adaptations, setAdaptations] = useState<Adaptation[]>([])

  useEffect(() => {
    fetch("/api/adaptacio")
      .then((r) => r.json())
      .then(setAdaptations)
      .catch(() => {})
  }, [])

  return (
    <>
      <Header />
      <main className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-2">Historial d&apos;Adaptacions</h1>
        <p className="text-muted-foreground mb-6">
          Totes les adaptacions realitzades.
        </p>

        {adaptations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Encara no s&apos;ha fet cap adaptació.
              <div className="mt-4">
                <Link href="/xat">
                  <Button>Començar al Xat</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {adaptations.map((a) => (
              <Card key={a.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.edat && <Badge variant="secondary">{a.edat}</Badge>}
                    {a.nivellDificultat && <Badge variant="outline">{a.nivellDificultat}</Badge>}
                    {a.createdVia && <Badge>{a.createdVia}</Badge>}
                    {a.fontText && <Badge variant="secondary">{a.fontText}</Badge>}
                  </div>
                  <CardTitle className="text-sm font-normal text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString("ca-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-2">{a.textOriginal}</p>
                  <div className="mt-3">
                    <Link href={`/adaptacio/${a.id}`}>
                      <Button size="sm" variant="outline">Veure detall</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
