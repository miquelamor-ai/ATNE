export const DEFAULT_MODELS = {
  adaptador: "gemini-2.5-flash",
  auditor: "gemini-2.5-flash",
  traductor: "gemini-2.5-flash",
  orquestrador: "gemini-2.5-flash",
} as const

export const AVAILABLE_MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (recomanat)" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite (ràpid)" },
] as const
