"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePipeline } from "@/hooks/usePipeline"
import { ComparativeTable } from "@/components/product/ComparativeTable"
import { AdaptedTextView } from "@/components/product/AdaptedTextView"
import { AuditReport } from "@/components/product/AuditReport"
import { GlossaryPanel } from "@/components/product/GlossaryPanel"
import { MultilevelTabs } from "@/components/product/MultilevelTabs"
import { ExportButtons } from "@/components/product/ExportButtons"

export function ProducteStep() {
  const { result, config, reset } = usePipeline()

  if (!result) return null

  const hasMultilevel = result.textAcces || result.textEnriquiment
  // Only show comparative table if there's actual original text (not for generated text)
  const hasComparativeTable =
    result.taulaComparativa &&
    result.taulaComparativa.length > 0 &&
    result.taulaComparativa.some((r) => r.original && r.original.length > 0)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Resultat de l&apos;adaptació</h2>

      <Tabs defaultValue="producte">
        <TabsList>
          <TabsTrigger value="producte">Producte</TabsTrigger>
          {hasComparativeTable && (
            <TabsTrigger value="taula">Taula comparativa</TabsTrigger>
          )}
          <TabsTrigger value="auditoria">Auditoria LF</TabsTrigger>
          {result.glossari.length > 0 && (
            <TabsTrigger value="glossari">Glossari</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="producte" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {hasMultilevel ? "Adaptació Multinivell" : "Text Adaptat"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasMultilevel ? (
                <MultilevelTabs result={result} />
              ) : (
                <AdaptedTextView
                  text={result.textAdaptat}
                  pictograms={result.pictograms}
                />
              )}
            </CardContent>
          </Card>

          {result.traduccioText && (
            <Card>
              <CardHeader>
                <CardTitle>Traducció</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {result.traduccioText}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {hasComparativeTable && (
          <TabsContent value="taula">
            <Card>
              <CardContent className="p-4">
                <ComparativeTable
                  rows={result.taulaComparativa!}
                  showTranslation={!!config.traduccio}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="auditoria">
          <Card>
            <CardContent className="p-4">
              <AuditReport report={result.auditoria} />
            </CardContent>
          </Card>
        </TabsContent>

        {result.glossari.length > 0 && (
          <TabsContent value="glossari">
            <Card>
              <CardContent className="p-4">
                <GlossaryPanel entries={result.glossari} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <div className="flex gap-3 items-center flex-wrap">
        <Button variant="outline" onClick={reset}>
          Nova adaptació
        </Button>
        <ExportButtons result={result} />
      </div>
    </div>
  )
}
