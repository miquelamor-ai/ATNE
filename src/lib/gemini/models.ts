export const DEFAULT_MODELS = {
  adaptador: "gemini-2.5-flash",
  auditor: "gemini-2.5-flash",
  traductor: "gemini-2.5-flash",
  orquestrador: "gemini-2.5-flash",
} as const

export const AVAILABLE_MODELS = [
  // ── Google Gemini (requereix GEMINI_API_KEY) ──────────────────────────────
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (recomanat)", provider: "gemini" as const },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "gemini" as const },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "gemini" as const },
  { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite", provider: "gemini" as const },
  // ── OpenRouter gratuïts (requereix OPENROUTER_API_KEY) ───────────────────
  { value: "qwen/qwen3-235b-a22b:free", label: "Qwen3 235B · gratuït", provider: "openrouter" as const },
  { value: "qwen/qwen3-30b-a3b:free", label: "Qwen3 30B · gratuït", provider: "openrouter" as const },
  { value: "meta-llama/llama-4-maverick:free", label: "Llama 4 Maverick · gratuït", provider: "openrouter" as const },
  { value: "deepseek/deepseek-r1:free", label: "DeepSeek R1 · gratuït", provider: "openrouter" as const },
  { value: "google/gemini-2.0-flash-exp:free", label: "Gemini 2.0 Flash Exp · gratuït", provider: "openrouter" as const },
]
