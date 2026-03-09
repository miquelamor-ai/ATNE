import { create } from "zustand"
import type { PipelineState, PipelineStep, AdaptationResult } from "@/types"
import type { TextSource, AidOption, AgeRange, DifficultyLevel, LanguageCode } from "@/lib/constants"

interface PipelineActions {
  setStep: (step: PipelineStep) => void
  setText: (text: string, source: TextSource) => void
  confirmText: () => void
  setEdat: (edat: AgeRange) => void
  setNivell: (nivell: DifficultyLevel) => void
  setAjuts: (ajuts: AidOption[]) => void
  setTraduccio: (lang: LanguageCode | null) => void
  setTaulaComparativa: (val: boolean) => void
  setMultinivell: (val: boolean) => void
  setMemoryIds: (student?: string, classe?: string, subject?: string) => void
  setTemaGenerar: (tema: string) => void
  runAdaptation: () => Promise<void>
  setResult: (result: AdaptationResult) => void
  reset: () => void
}

interface PipelineStore extends PipelineState, PipelineActions {
  studentMemoryId?: string
  classMemoryId?: string
  subjectProfileId?: string
  temaGenerar?: string
}

const initialState: PipelineState = {
  currentStep: "ingesta",
  textOriginal: null,
  textConfirmat: false,
  config: {},
  result: null,
  isLoading: false,
  error: null,
  fontText: null,
}

export const usePipeline = create<PipelineStore>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),
  setText: (text, source) => set({ textOriginal: text, fontText: source }),
  confirmText: () => set({ textConfirmat: true, currentStep: "configuracio" }),
  setEdat: (edat) => set((s) => ({ config: { ...s.config, edat } })),
  setNivell: (nivell) => set((s) => ({ config: { ...s.config, nivellDificultat: nivell } })),
  setAjuts: (ajuts) => set((s) => ({ config: { ...s.config, ajuts } })),
  setTraduccio: (lang) => set((s) => ({ config: { ...s.config, traduccio: lang } })),
  setTaulaComparativa: (val) => set((s) => ({ config: { ...s.config, taulaComparativa: val } })),
  setMultinivell: (val) => set((s) => ({ config: { ...s.config, modeMultinivell: val } })),
  setMemoryIds: (student, classe, subject) =>
    set({ studentMemoryId: student, classMemoryId: classe, subjectProfileId: subject }),
  setTemaGenerar: (tema) => set({ temaGenerar: tema }),

  runAdaptation: async () => {
    const state = get()
    set({ isLoading: true, error: null, currentStep: "adaptacio" })

    try {
      const res = await fetch("/api/adaptacio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textOriginal: state.textOriginal || "",
          fontText: state.fontText,
          config: {
            edat: state.config.edat || "12-14",
            nivellDificultat: state.config.nivellDificultat || "intermedi",
            ajuts: state.config.ajuts || [],
            traduccio: state.config.traduccio || null,
            taulaComparativa: state.config.taulaComparativa ?? true,
            modeMultinivell: state.config.modeMultinivell ?? false,
          },
          studentMemoryId: state.studentMemoryId,
          classMemoryId: state.classMemoryId,
          subjectProfileId: state.subjectProfileId,
          temaGenerar: state.temaGenerar,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error en l'adaptació")
      }

      const data = await res.json()
      set({
        result: data.result,
        currentStep: "producte",
        isLoading: false,
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error desconegut",
        isLoading: false,
        currentStep: "configuracio",
      })
    }
  },

  setResult: (result) => set({ result }),
  reset: () => set({ ...initialState }),
}))
