export const TRANSLATION_LANGUAGES = [
  { code: "es", label: "Castellà", flag: "🇪🇸" },
  { code: "en", label: "Anglès", flag: "🇬🇧" },
  { code: "ar", label: "Àrab", flag: "🇸🇦" },
  { code: "ber", label: "Amazic", flag: "ⵣ" },
  { code: "ur", label: "Urdú", flag: "🇵🇰" },
  { code: "hi", label: "Hindustànic", flag: "🇮🇳" },
  { code: "bn", label: "Bengalí", flag: "🇧🇩" },
  { code: "pa", label: "Panjabi", flag: "🇮🇳" },
  { code: "ps", label: "Paixtu", flag: "🇦🇫" },
  { code: "tl", label: "Filipí", flag: "🇵🇭" },
  { code: "zh", label: "Mandarí", flag: "🇨🇳" },
  { code: "yue", label: "Cantonès", flag: "🇭🇰" },
  { code: "ru", label: "Rus", flag: "🇷🇺" },
  { code: "uk", label: "Ucraïnès", flag: "🇺🇦" },
  { code: "ro", label: "Romanès", flag: "🇷🇴" },
] as const

export type LanguageCode = (typeof TRANSLATION_LANGUAGES)[number]["code"]
