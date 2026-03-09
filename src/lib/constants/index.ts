export * from "./languages"
export * from "./age-ranges"
export * from "./difficulty-levels"
export * from "./dua-profiles"
export * from "./subject-styles"
export * from "./lf-rules"

export const AIDS_OPTIONS = [
  { value: "definicions", label: "Definicions" },
  { value: "exemples", label: "Exemples" },
  { value: "esquema", label: "Esquema visual" },
] as const

export type AidOption = (typeof AIDS_OPTIONS)[number]["value"]

export const TEXT_SOURCES = [
  { value: "enganxat", label: "Text enganxat" },
  { value: "pdf", label: "Fitxer PDF" },
  { value: "docx", label: "Fitxer DOCX" },
  { value: "drive", label: "Google Drive" },
  { value: "generat", label: "Generat per IA" },
] as const

export type TextSource = (typeof TEXT_SOURCES)[number]["value"]

export const ALFABETITZACIO_OPTIONS = [
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
  { value: "proces", label: "En procés" },
] as const

export const NECESSITATS_SUPORT_OPTIONS = [
  { value: "NEE", label: "Necessitats Educatives Especials (NEE)" },
  { value: "AltesCapacitats", label: "Altes Capacitats" },
  { value: "Nouvingut", label: "Alumnat Nouvingut" },
] as const

export const MECR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const
export type MecrLevel = (typeof MECR_LEVELS)[number]
