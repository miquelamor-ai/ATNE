export const SUBJECT_STYLES = [
  {
    value: "cientific",
    label: "Científic",
    description: "Prioritza precisió de dades i descripcions procedimentals.",
  },
  {
    value: "humanistic",
    label: "Humanístic",
    description: "Prioritza narrativa, context i connectors lògics.",
  },
  {
    value: "linguistic",
    label: "Lingüístic",
    description: "Prioritza estructures gramaticals i riquesa de sinònims (si no és LF).",
  },
] as const

export type SubjectStyle = (typeof SUBJECT_STYLES)[number]["value"]
