import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function MemoriesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Memòries de Context</h1>
      <p className="text-muted-foreground mb-8">
        Les memòries permeten personalitzar les adaptacions segons el perfil de l&apos;alumnat,
        el grup classe i la matèria. Aquesta informació s&apos;injecta al context de l&apos;agent per
        millorar la qualitat de les adaptacions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/memories/alumne">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle>Alumnat</CardTitle>
              <CardDescription>
                Perfils individuals: origen, llengua L1, nivell MECR, necessitats de suport.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gestiona els perfils d&apos;alumnes per personalitzar les adaptacions.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/memories/classe">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle>Classes</CardTitle>
              <CardDescription>
                Grups classe: configuració multinivell, estil de suport preferit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Defineix les característiques de cada grup classe.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/memories/materia">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle>Matèries</CardTitle>
              <CardDescription>
                Perfils de matèria: estil de redacció, termes intocables.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configura les matèries amb els seus termes tècnics i estil.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
