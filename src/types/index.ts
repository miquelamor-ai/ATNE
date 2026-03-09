import type { AidOption, TextSource, DifficultyLevel, AgeRange, LanguageCode, SubjectStyle } from "@/lib/constants"

// ============================================
// Configuració d'una adaptació
// ============================================
export interface AdaptationConfig {
  edat: AgeRange
  nivellDificultat: DifficultyLevel
  ajuts: AidOption[]
  traduccio: LanguageCode | null
  taulaComparativa: boolean
  modeMultinivell: boolean
}

// ============================================
// Resultat del pipeline d'adaptació
// ============================================
export interface AdaptationResult {
  textAdaptat: string
  textAcces?: string
  textEnriquiment?: string
  traduccioText?: string
  auditoria: AuditReport
  taulaComparativa?: ComparativeRow[]
  pictograms: PictogramEntry[]
  glossari: GlossaryEntry[]
}

// ============================================
// Informe d'auditoria LF
// ============================================
export interface AuditReport {
  puntuacioGlobal: number // 0-100
  criteris: AuditCriterion[]
  recomanacions: string[]
  passaAuditoria: boolean
}

export interface AuditCriterion {
  id: string // "1.1", "1.2", etc.
  nom: string
  puntuacio: number // 0-100
  observacions: string[]
}

// ============================================
// Taula comparativa
// ============================================
export interface ComparativeRow {
  paragrafIndex: number
  original: string
  adaptat: string
  traduccio?: string
}

// ============================================
// Pictogrames ARASAAC
// ============================================
export interface PictogramEntry {
  sentenceIndex: number
  keyword: string
  arasaacId: number
  imageUrl: string
}

// ============================================
// Glossari
// ============================================
export interface GlossaryEntry {
  terme: string
  definicio: string
}

// ============================================
// Mode Xat
// ============================================
export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  attachments?: ChatAttachment[]
  adaptationResult?: AdaptationResult
}

export interface ChatAttachment {
  type: "file" | "text"
  name: string
  content: string
  mimeType?: string
}

// ============================================
// Pipeline state
// ============================================
export type PipelineStep =
  | "ingesta"
  | "confirmacio"
  | "configuracio"
  | "adaptacio"
  | "auditoria"
  | "feedback"
  | "producte"

export interface PipelineState {
  currentStep: PipelineStep
  textOriginal: string | null
  textConfirmat: boolean
  config: Partial<AdaptationConfig>
  result: AdaptationResult | null
  isLoading: boolean
  error: string | null
  fontText: TextSource | null
}

// ============================================
// Resposta JSON de Gemini (Adaptador)
// ============================================
export interface GeminiAdaptationResponse {
  paragrafs: {
    original: string
    adaptat: string
    keywords: string[]
  }[]
  glossari: GlossaryEntry[]
  textAcces?: string
  textEnriquiment?: string
}

// ============================================
// Resposta JSON de Gemini (Auditor)
// ============================================
export interface GeminiAuditResponse {
  puntuacioGlobal: number
  criteris: {
    id: string
    nom: string
    puntuacio: number
    observacions: string[]
  }[]
  recomanacions: string[]
  passaAuditoria: boolean
  correccions?: string // Text corregit si no passa
}
