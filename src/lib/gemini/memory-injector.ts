import { prisma } from "@/lib/db"

export async function getAlumneContext(id: string): Promise<string | undefined> {
  const m = await prisma.studentMemory.findUnique({ where: { id } })
  if (!m) return undefined

  const parts: string[] = [`Alumne: ${m.nom}`]
  if (m.paisOrigen) parts.push(`Origen: ${m.paisOrigen}`)
  if (m.llenguaL1) parts.push(`Llengua L1: ${m.llenguaL1}`)
  if (m.alfabetitzacioLlatina) parts.push(`Alfab. llatina: ${m.alfabetitzacioLlatina}`)
  if (m.nivellMECR) parts.push(`Nivell MECR: ${m.nivellMECR}`)
  if (m.necessitatsSuport) parts.push(`Necessitats: ${m.necessitatsSuport}`)
  if (m.notes) parts.push(`Notes: ${m.notes}`)

  return parts.join(". ")
}

export async function getClasseContext(id: string): Promise<string | undefined> {
  const m = await prisma.classMemory.findUnique({ where: { id } })
  if (!m) return undefined

  const parts: string[] = [`Grup: ${m.nom}`]
  if (m.configuracioMultinivell) parts.push("Configuració multinivell activa")
  parts.push(`Suport preferit: ${m.estilSuportPreferit}`)
  if (m.notes) parts.push(`Notes: ${m.notes}`)

  return parts.join(". ")
}

export async function getMateriaContext(id: string): Promise<{
  estilRedaccio: string
  termesIntocables?: string
} | undefined> {
  const m = await prisma.subjectProfile.findUnique({ where: { id } })
  if (!m) return undefined

  return {
    estilRedaccio: m.estilRedaccio,
    termesIntocables: m.termesIntocables ?? undefined,
  }
}
