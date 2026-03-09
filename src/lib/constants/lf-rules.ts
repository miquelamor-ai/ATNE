/**
 * Regles de Lectura Fàcil (LF)
 * Basat en: Manual lectura-fácil-métodos (García Muñoz, 2012)
 *           Guia de comunicació clara (Generalitat de Catalunya)
 *           IFLA Guidelines for Easy-to-Read Materials
 */

export const LF_RULES = {
  ortografia: {
    id: "1.1",
    titol: "Ortografia i Signes",
    regles: [
      "Punt com a signe fonamental de separació. Preferir punt i a part de línia.",
      "Evitar punt i coma (;) i punts suspensius (...).",
      "Dos punts per introduir qui parla i catàfores.",
      "Evitar corxets i signes poc habituals (%, &, /).",
      "Parèntesis → millor ressaltar en negreta i explicar al marge.",
      "Cometes només excepcionalment.",
      "Números sempre en xifra. Quantitats grans: arrodonir o usar 'molts/alguns/diversos'.",
      "Dates completes amb nom del dia.",
      "Evitar números romans.",
    ],
  },
  gramatica: {
    id: "1.2",
    titol: "Gramàtica",
    regles: [
      "Veu activa sempre. Evitar passiva.",
      "Subjecte explícit (NO elidir). Repetir subjecte abans que usar pronom.",
      "Evitar futur, subjuntiu, condicional i formes compostes (excepte literatura).",
      "Perífrasis: només deure (obligació), voler, saber, poder.",
      "Oracions simples curtes: S+V+C.",
      "Evitar oracions complexes coordinades i subordinades.",
      "Es poden acceptar copulatives i adversatives.",
      "Subordinades causals, finals, condicionals, temporals i comparatives amb nexes simples (perquè, per, si, quan).",
      "Evitar incisos que trenquin la continuïtat narrativa.",
      "Imperatiu acceptat en contextos clars.",
    ],
  },
  lexic: {
    id: "1.3",
    titol: "Lèxic",
    regles: [
      "Vocabulari d'ús freqüent.",
      "Paraules difícils: ressaltar en negreta i explicar al marge o glossari.",
      "Evitar abreviatures, acrònims, sigles (excepte molt conegudes).",
      "Verbs d'acció, evitar nominalitzacions.",
      "Evitar metàfores, metonímies, sentit figurat (excepte expressions comunes).",
      "Evitar dobles negacions.",
      "Evitar adverbis acabats en -ment (excepte freqüents).",
      "Una sola paraula per cada concepte (evitar sinònims per al mateix referent).",
    ],
  },
  estil: {
    id: "1.4",
    titol: "Estil i Estructura",
    regles: [
      "Una idea per frase.",
      "Frases de menys de 30 paraules.",
      "Mantenir ordre cronològic.",
      "Temes rellevants per a la persona.",
      "Evitar llenguatge infantil per a adults.",
      "Estil positiu.",
      "Títols curts i explicatius.",
      "Contingut dividit en seccions amb títols entenedors.",
      "Enumeracions en format de llista amb vinyetes.",
    ],
  },
  disseny: {
    id: "1.5",
    titol: "Disseny i Maquetació",
    regles: [
      "Text alineat a l'esquerra.",
      "Títols curts. Molt espai en blanc.",
      "No dividir paraules amb guió a final de línia.",
      "Pictogrames/imatges a l'esquerra del text.",
      "Font llegible (recomanada: Atkinson Hyperlegible, 12-18pt).",
      "Suficient contrast (fons blanc, text negre).",
      "Interlineat ampli.",
    ],
  },
  literalitat: {
    id: "1.6",
    titol: "Literalitat i Rigor",
    regles: [
      "Contingut original preservat íntegrament en la seva essència pedagògica.",
      "Prohibit inventar informació (no al·lucinacions).",
      "Anonimitzar dades personals.",
      "L'adaptació és una recreació, no una simple síntesi ni selecció de paràgrafs.",
    ],
  },
} as const

export const LF_LEVELS = [
  {
    nivel: "I",
    mecr: "A1-A2",
    label: "Bàsic",
    descripció: "Il·lustracions abundants, text escàs, complexitat molt baixa. 500-1.200 paraules lèxiques.",
  },
  {
    nivel: "II",
    mecr: "B1",
    label: "Intermedi",
    descripció: "Vocabulari quotidià, accions fàcils de seguir, il·lustracions.",
  },
  {
    nivel: "III",
    mecr: "B2",
    label: "Avançat",
    descripció: "Text més llarg, algunes paraules poc usuals, sentit figurat ocasional.",
  },
] as const
