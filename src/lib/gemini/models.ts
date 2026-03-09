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
  { value: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B · gratuït", provider: "openrouter" as const },
  { value: "mistralai/mistral-small-3.1-24b-instruct:free", label: "Mistral Small 3.1 24B · gratuït", provider: "openrouter" as const },
  { value: "google/gemma-3-27b-it:free", label: "Gemma 3 27B · gratuït", provider: "openrouter" as const },
  { value: "qwen/qwen3-coder:free", label: "Qwen3 Coder · gratuït", provider: "openrouter" as const },
  { value: "openrouter/free", label: "OpenRouter Auto (millor gratuït disponible)", provider: "openrouter" as const },
]
