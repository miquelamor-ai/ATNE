"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdaptedTextView } from "./AdaptedTextView"
import type { AdaptationResult } from "@/types"

interface Props {
  result: AdaptationResult
}

export function MultilevelTabs({ result }: Props) {
  return (
    <Tabs defaultValue="core">
      <TabsList>
        {result.textAcces && <TabsTrigger value="acces">Accés</TabsTrigger>}
        <TabsTrigger value="core">Core</TabsTrigger>
        {result.textEnriquiment && <TabsTrigger value="enriquiment">Enriquiment</TabsTrigger>}
      </TabsList>

      {result.textAcces && (
        <TabsContent value="acces">
          <div className="p-4 bg-blue-50 rounded-md">
            <AdaptedTextView text={result.textAcces} pictograms={result.pictograms} />
          </div>
        </TabsContent>
      )}

      <TabsContent value="core">
        <AdaptedTextView text={result.textAdaptat} pictograms={result.pictograms} />
      </TabsContent>

      {result.textEnriquiment && (
        <TabsContent value="enriquiment">
          <div className="p-4 bg-purple-50 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">{result.textEnriquiment}</pre>
          </div>
        </TabsContent>
      )}
    </Tabs>
  )
}
