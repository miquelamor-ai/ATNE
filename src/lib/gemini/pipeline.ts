import { adaptar } from "./adaptador"
import { auditar } from "./auditor"
import { traduir } from "./traductor"
import { getAlumneContext, getClasseContext, getMateriaContext } from "./memory-injector"
import { searchPictograms } from "@/lib/arasaac/client"
import { prisma } from "@/lib/db"
import type {
  AdaptationResult,
  ComparativeRow,
  PictogramEntry,
  AuditReport,
} from "@/types"

interface PipelineInput {
  textOriginal: string
  fontText: string
  config: {
    edat: string
    nivellDificultat: string
    ajuts: string[]
    traduccio: string | null
    taulaComparativa: boolean
    modeMultinivell: boolean
  }
  studentMemoryId?: string
  classMemoryId?: string
  subjectProfileId?: string
  temaGenerar?: string
}

interface PipelineModels {
  adaptador: string
  auditor: string
  traductor: string
}

async function getModels(): Promise<PipelineModels> {
  const settings = await prisma.appSettings.findUnique({
    where: { id: "default" },
  })
  return {
    adaptador: settings?.modelAdaptador ?? "gemini-2.0-flash",
    auditor: settings?.modelAuditor ?? "gemini-2.0-flash",
    traductor: settings?.modelTraductor ?? "gemini-2.0-flash",
  }
}

export async function runPipeline(input: PipelineInput): Promise<AdaptationResult> {
  const models = await getModels()

  // 1. Injectar context de memòries
  const alumneContext = input.studentMemoryId
    ? await getAlumneContext(input.studentMemoryId)
    : undefined
  const classeContext = input.classMemoryId
    ? await getClasseContext(input.classMemoryId)
    : undefined
  const materiaContext = input.subjectProfileId
    ? await getMateriaContext(input.subjectProfileId)
    : undefined

  // 2. ADAPTACIÓ
  const adaptacioResult = await adaptar({
    textOriginal: input.textOriginal,
    edat: input.config.edat,
    nivellDificultat: input.config.nivellDificultat,
    ajuts: input.config.ajuts,
    estilRedaccio: materiaContext?.estilRedaccio,
    termesIntocables: materiaContext?.termesIntocables,
    alumneContext,
    classeContext,
    modeMultinivell: input.config.modeMultinivell,
    model: models.adaptador,
    temaGenerar: input.temaGenerar,
  })

  const textAdaptat = adaptacioResult.paragrafs
    .map((p) => p.adaptat)
    .join("\n\n")

  // 3. AUDITORIA
  const auditResult = await auditar({
    textAdaptat,
    textOriginal: input.textOriginal || textAdaptat,
    nivellDificultat: input.config.nivellDificultat,
    model: models.auditor,
  })

  // 4. CORRECCIÓ (si no passa auditoria)
  let textFinal = textAdaptat
  if (!auditResult.passaAuditoria && auditResult.correccions) {
    textFinal = auditResult.correccions
  }

  // 5. PICTOGRAMES ARASAAC
  const allKeywords = adaptacioResult.paragrafs.flatMap((p, i) =>
    p.keywords.map((kw) => ({ sentenceIndex: i, keyword: kw }))
  )
  const pictogramResults = await searchPictograms(
    allKeywords.map((k) => k.keyword)
  )
  const pictograms: PictogramEntry[] = allKeywords
    .map((k) => {
      const found = pictogramResults.find(
        (pr) => pr.keyword === k.keyword
      )
      if (!found) return null
      return {
        sentenceIndex: k.sentenceIndex,
        keyword: k.keyword,
        arasaacId: found.arasaacId,
        imageUrl: found.imageUrl,
      }
    })
    .filter((p): p is PictogramEntry => p !== null)

  // 6. TRADUCCIÓ (si demanada)
  let traduccioText: string | undefined
  if (input.config.traduccio) {
    traduccioText = await traduir({
      text: textFinal,
      targetLang: input.config.traduccio,
      model: models.traductor,
    })
  }

  // 7. TAULA COMPARATIVA
  let taulaComparativa: ComparativeRow[] | undefined
  if (input.config.taulaComparativa) {
    taulaComparativa = adaptacioResult.paragrafs.map((p, i) => ({
      paragrafIndex: i,
      original: p.original,
      adaptat: p.adaptat,
      traduccio: traduccioText
        ? traduccioText.split("\n\n")[i] || ""
        : undefined,
    }))
  }

  // Build audit report
  const auditoria: AuditReport = {
    puntuacioGlobal: auditResult.puntuacioGlobal,
    criteris: auditResult.criteris,
    recomanacions: auditResult.recomanacions,
    passaAuditoria: auditResult.passaAuditoria,
  }

  return {
    textAdaptat: textFinal,
    textAcces: adaptacioResult.textAcces,
    textEnriquiment: adaptacioResult.textEnriquiment,
    traduccioText,
    auditoria,
    taulaComparativa,
    pictograms,
    glossari: adaptacioResult.glossari,
  }
}
