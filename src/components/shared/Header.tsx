"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "Inici" },
  { href: "/xat", label: "Xat" },
  { href: "/adaptacio", label: "Avançat" },
  { href: "/cercador", label: "Cercador" },
  { href: "/memories", label: "Memòries" },
  { href: "/configuracio", label: "Configuració" },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="mr-8 font-bold text-lg">
          AAU
        </Link>
        <nav className="flex gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-colors",
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
