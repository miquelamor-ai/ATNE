"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/shared/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ComparativeTable } from "@/components/product/ComparativeTable"
import { AdaptedTextView } from "@/components/product/AdaptedTextView"
import { AuditReport } from "@/components/product/AuditReport"
import { GlossaryPanel } from "@/components/product/GlossaryPanel"
import type { ComparativeRow, PictogramEntry, AuditReport as AuditReportType, GlossaryEntry } from "@/types"

interface AdaptationDetail {
  id: string
  textOriginal: string
  textAdaptat: string | null
  textAcces: string | null
  textEnriquiment: string | null
  traduccioText: string | null
  auditoria: string | null
  taulaComparativaData: string | null
  pictograms: string | null
  glossari: string | null
  edat: string | null
  nivellDificultat: string | null
  traduccio: string | null
  fontText: string | null
  createdVia: string | null
  createdAt: string
}

export default function AdaptacioDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState<AdaptationDetail | null>(null)

  useEffect(() => {
    if (id) {
      fetch(`/api/adaptacio/${id}`)
        .then((r) => r.json())
        .then(setData)
        .catch(() => {})
    }
  }, [id])

  if (!data) {
    return (
      <>
        <Header />
        <main className="container mx-auto p-6 text-center">
          Carregant...
        </main>
      </>
    )
  }

  const auditoria: AuditReportType | null = data.auditoria
    ? JSON.parse(data.auditoria)
    : null
  const taula: ComparativeRow[] | null = data.taulaComparativaData
    ? JSON.parse(data.taulaComparativaData)
    : null
  const pictograms: PictogramEntry[] = data.pictograms
    ? JSON.parse(data.pictograms)
    : []
  const glossari: GlossaryEntry[] = data.glossari
    ? JSON.parse(data.glossari)
    : []

  return (
    <>
      <Header />
      <main className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <h1 className="text-2xl font-bold">Detall d&apos;Adaptació</h1>
          {data.edat && <Badge variant="secondary">{data.edat}</Badge>}
          {data.nivellDificultat && <Badge variant="outline">{data.nivellDificultat}</Badge>}
          {data.createdVia && <Badge>{data.createdVia}</Badge>}
        </div>

        <Tabs defaultValue="adaptat">
          <TabsList>
            <TabsTrigger value="adaptat">Text Adaptat</TabsTrigger>
            <TabsTrigger value="original">Original</TabsTrigger>
            {taula && <TabsTrigger value="taula">Taula</TabsTrigger>}
            {auditoria && <TabsTrigger value="auditoria">Auditoria</TabsTrigger>}
            {glossari.length > 0 && <TabsTrigger value="glossari">Glossari</TabsTrigger>}
          </TabsList>

          <TabsContent value="adaptat">
            <Card>
              <CardContent className="p-4">
                {data.textAdaptat ? (
                  <AdaptedTextView text={data.textAdaptat} pictograms={pictograms} />
                ) : (
                  <p className="text-muted-foreground">Sense text adaptat</p>
                )}
              </CardContent>
            </Card>

            {data.traduccioText && (
              <Card className="mt-4">
                <CardHeader><CardTitle>Traducció</CardTitle></CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm">{data.traduccioText}</pre>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="original">
            <Card>
              <CardContent className="p-4">
                <pre className="whitespace-pre-wrap text-sm">{data.textOriginal}</pre>
              </CardContent>
            </Card>
          </TabsContent>

          {taula && (
            <TabsContent value="taula">
              <Card>
                <CardContent className="p-4">
                  <ComparativeTable rows={taula} showTranslation={!!data.traduccio} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {auditoria && (
            <TabsContent value="auditoria">
              <Card>
                <CardContent className="p-4">
                  <AuditReport report={auditoria} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {glossari.length > 0 && (
            <TabsContent value="glossari">
              <Card>
                <CardContent className="p-4">
                  <GlossaryPanel entries={glossari} />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </>
  )
}
