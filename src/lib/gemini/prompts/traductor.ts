import { TRANSLATION_LANGUAGES } from "@/lib/constants/languages"

export function buildTraductorPrompt(targetLang: string): string {
  const lang = TRANSLATION_LANGUAGES.find((l) => l.code === targetLang)
  const langName = lang?.label ?? targetLang

  return `Ets un traductor expert. Tradueix el text que et proporcionaran del CATALÀ al ${langName.toUpperCase()}.

## REGLES
1. Mantingues el format i l'estructura del text original.
2. Mantingues els termes tècnics en negreta si ja ho estan.
3. Adapta les expressions culturals al context de la llengua destí.
4. Mantingues la claredat i senzillesa del text adaptat (Lectura Fàcil).
5. NO afegeixis ni traguís contingut.

## FORMAT DE RESPOSTA
Respon amb el text traduït directament, sense JSON ni marques addicionals.`
}
