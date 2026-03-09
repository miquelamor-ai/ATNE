import { z } from "zod"

// ============================================
// Validadors de Memòries
// ============================================
export const studentMemorySchema = z.object({
  nom: z.string().min(1, "El nom és obligatori"),
  paisOrigen: z.string().optional(),
  llenguaL1: z.string().optional(),
  alfabetitzacioLlatina: z.enum(["si", "no", "proces"]).optional(),
  nivellMECR: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
  necessitatsSuport: z.enum(["NEE", "AltesCapacitats", "Nouvingut"]).optional().nullable(),
  notes: z.string().optional(),
})

export const classMemorySchema = z.object({
  nom: z.string().min(1, "El nom del grup és obligatori"),
  configuracioMultinivell: z.boolean().default(false),
  estilSuportPreferit: z.enum(["visual", "textual", "mixt"]).default("mixt"),
  notes: z.string().optional(),
})

export const subjectProfileSchema = z.object({
  nomAssignatura: z.string().min(1, "El nom de l'assignatura és obligatori"),
  estilRedaccio: z.enum(["cientific", "humanistic", "linguistic"]).default("cientific"),
  termesIntocables: z.string().optional(), // JSON string
  notes: z.string().optional(),
})

// ============================================
// Validador de Configuració d'Adaptació
// ============================================
export const adaptationConfigSchema = z.object({
  edat: z.string().min(1, "L'edat és obligatòria"),
  nivellDificultat: z.enum(["basic", "intermedi", "avancat"]),
  ajuts: z.array(z.enum(["definicions", "exemples", "esquema"])).default([]),
  traduccio: z.string().nullable().default(null),
  taulaComparativa: z.boolean().default(true),
  modeMultinivell: z.boolean().default(false),
})

// ============================================
// Validador d'Adaptació (API)
// ============================================
export const createAdaptationSchema = z.object({
  textOriginal: z.string().default(""),
  fontText: z.enum(["enganxat", "pdf", "docx", "drive", "generat"]).optional(),
  config: adaptationConfigSchema,
  studentMemoryId: z.string().optional(),
  classMemoryId: z.string().optional(),
  subjectProfileId: z.string().optional(),
  temaGenerar: z.string().optional(),
}).refine(
  (data) => data.textOriginal.length > 0 || (data.temaGenerar && data.temaGenerar.length > 0),
  { message: "Cal un text original o un tema per generar", path: ["textOriginal"] }
)

// ============================================
// Validador de Feedback
// ============================================
export const feedbackSchema = z.object({
  adaptationId: z.string().min(1),
  feedbackDocent: z.string().optional(),
  valoracio: z.number().min(1).max(5).optional(),
})

// ============================================
// Validador de Cerca
// ============================================
export const searchAdaptationsSchema = z.object({
  query: z.string().optional(),
  assignatura: z.string().optional(),
  edat: z.string().optional(),
  nivellDificultat: z.string().optional(),
  traduccio: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
})

// ============================================
// Validador de Settings
// ============================================
export const appSettingsSchema = z.object({
  modelAdaptador: z.string().default("gemini-2.0-flash"),
  modelAuditor: z.string().default("gemini-2.0-flash"),
  modelTraductor: z.string().default("gemini-2.0-flash"),
  modelOrquestrador: z.string().default("gemini-2.0-flash"),
})

// Types inferits
export type StudentMemoryInput = z.infer<typeof studentMemorySchema>
export type ClassMemoryInput = z.infer<typeof classMemorySchema>
export type SubjectProfileInput = z.infer<typeof subjectProfileSchema>
export type AdaptationConfigInput = z.infer<typeof adaptationConfigSchema>
export type CreateAdaptationInput = z.infer<typeof createAdaptationSchema>
export type FeedbackInput = z.infer<typeof feedbackSchema>
export type SearchAdaptationsInput = z.infer<typeof searchAdaptationsSchema>
export type AppSettingsInput = z.infer<typeof appSettingsSchema>
