export const DIFFICULTY_LEVELS = [
  {
    value: "basic",
    label: "Bàsic",
    description: "Lectura Fàcil nivell I (MECR A1-A2). Il·lustracions abundants, text escàs, complexitat molt baixa.",
    mecr: "A1-A2",
    ifla: "I",
  },
  {
    value: "intermedi",
    label: "Intermedi",
    description: "Lectura Fàcil nivell II (MECR B1). Vocabulari quotidià, accions fàcils de seguir, il·lustracions.",
    mecr: "B1",
    ifla: "II",
  },
  {
    value: "avancat",
    label: "Avançat",
    description: "Lectura Fàcil nivell III (MECR B2). Text més llarg, algunes paraules poc usuals.",
    mecr: "B2",
    ifla: "III",
  },
] as const

export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number]["value"]
