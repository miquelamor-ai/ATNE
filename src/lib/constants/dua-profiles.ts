export const DUA_PROFILES = {
  acces: {
    value: "acces",
    label: "Accés",
    description: "Lectura Fàcil extrema + Apoyo visual + Definicions integrades.",
    color: "bg-blue-100 text-blue-800",
  },
  core: {
    value: "core",
    label: "Core",
    description: "Adaptació estàndard de Lectura Fàcil mantenint rigor curricular.",
    color: "bg-green-100 text-green-800",
  },
  enriquiment: {
    value: "enriquiment",
    label: "Enriquiment (AC)",
    description: "Profundització amb preguntes de pensament crític, vocabulari acadèmic avançat i connexions interdisciplinars.",
    color: "bg-purple-100 text-purple-800",
  },
} as const

export type DuaProfile = keyof typeof DUA_PROFILES
