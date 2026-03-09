export const AGE_RANGES = [
  { value: "4-6", label: "4-6 anys (Infantil)", etapa: "Infantil" },
  { value: "6-8", label: "6-8 anys (Cicle Inicial)", etapa: "Primària" },
  { value: "8-10", label: "8-10 anys (Cicle Mitjà)", etapa: "Primària" },
  { value: "10-12", label: "10-12 anys (Cicle Superior)", etapa: "Primària" },
  { value: "12-14", label: "12-14 anys (1r-2n ESO)", etapa: "Secundària" },
  { value: "14-16", label: "14-16 anys (3r-4t ESO)", etapa: "Secundària" },
  { value: "16-18", label: "16-18 anys (Batxillerat/FP)", etapa: "Postobligatòria" },
  { value: "18+", label: "18+ anys (Adults)", etapa: "Adults" },
] as const

export type AgeRange = (typeof AGE_RANGES)[number]["value"]
