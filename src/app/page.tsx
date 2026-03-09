import Link from "next/link"
import { Header } from "@/components/shared/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold mb-4">
            Assistent d&apos;Adaptació Universal
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Eina per adaptar textos educatius seguint criteris de{" "}
            <strong>Lectura Fàcil</strong> i{" "}
            <strong>Disseny Universal per a l&apos;Aprenentatge (DUA)</strong>,
            amb suport de <strong>Programació Multinivell</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle>Mode Xat</CardTitle>
              <CardDescription>
                Interfície conversacional. Explica què necessites i l&apos;assistent
                et guia pas a pas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Ideal per a ús ràpid i intuïtiu. Pots enganxar text, pujar
                fitxers o demanar que es generi contingut sobre un tema.
              </p>
              <Link href="/xat">
                <Button className="w-full">Obrir Xat</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle>Mode Avançat</CardTitle>
              <CardDescription>
                Wizard pas a pas amb configuració detallada de totes les variables.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Més control sobre l&apos;adaptació. Configura edat, nivell, ajuts,
                traducció, multinivell i context de memòries.
              </p>
              <Link href="/adaptacio">
                <Button variant="outline" className="w-full">Obrir Mode Avançat</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
          <Link href="/cercador">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <h3 className="font-medium">Cercador</h3>
                <p className="text-xs text-muted-foreground">
                  Troba adaptacions existents
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/memories">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <h3 className="font-medium">Memòries</h3>
                <p className="text-xs text-muted-foreground">
                  Alumnat, classes i matèries
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/historial">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <h3 className="font-medium">Historial</h3>
                <p className="text-xs text-muted-foreground">
                  Adaptacions anteriors
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </>
  )
}
