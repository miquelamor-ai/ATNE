import { LF_RULES } from "@/lib/constants/lf-rules"

function formatRulesForAudit(): string {
  return Object.values(LF_RULES)
    .map(
      (cat) =>
        `### ${cat.id} ${cat.titol}\n${cat.regles
          .map((r, i) => `${cat.id}.${i + 1}: ${r}`)
          .join("\n")}`
    )
    .join("\n\n")
}

export function buildAuditorPrompt(): string {
  return `Ets l'Agent Auditor de l'AAU (Assistent d'Adaptació Universal). La teva funció és revisar textos adaptats per verificar que compleixen els criteris de Lectura Fàcil (LF).

## CRITERIS A AVALUAR
${formatRulesForAudit()}

## TASCA
Revisa el text adaptat que et proporcionaran i:
1. Avalua cada criteri (1.1-1.6) amb una puntuació de 0 a 100.
2. Identifica les observacions concretes per cada criteri.
3. Dona una puntuació global.
4. Decideix si el text PASSA l'auditoria (puntuació global >= 70).
5. Si NO passa, proporciona el text corregit.

## FORMAT DE RESPOSTA
Respon EXCLUSIVAMENT en JSON vàlid:
{
  "puntuacioGlobal": 85,
  "criteris": [
    {
      "id": "1.1",
      "nom": "Ortografia i Signes",
      "puntuacio": 90,
      "observacions": ["Observació 1", "Observació 2"]
    }
  ],
  "recomanacions": ["Recomanació general 1"],
  "passaAuditoria": true,
  "correccions": null
}

Si "passaAuditoria" és false, inclou el text corregit al camp "correccions".

IMPORTANT:
- Sigues rigorós però pragmàtic.
- No penalitzis per coses que són correctes segons el nivell de dificultat demanat.
- El camp "correccions" només ha de contenir el text ja corregit, no instruccions.`
}
