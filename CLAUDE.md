# ATNE — Adaptador de Textos a Necessitats Educatives

## Projecte
Assistent IA per adaptar textos educatius a les diverses necessitats de l'alumnat
(nouvinguts, dislexia, TEA, altes capacitats). Jesuites Educacio (FJE).

## Usuari
Miquel Amor — expert en pedagogia, NO programador. Comunica't SEMPRE en catala.
Explicacions clares i practiques.

## Stack tecnic (v1 MVP)
- **Backend**: PHP 8.2 + Slim4
- **Frontend**: HTML + JavaScript pur + CSS (ZERO frameworks)
- **LLM**: OpenAI gpt-4.1-mini (Responses API)
- **Base de dades**: MS SQL Server (logging adaptacions)
- **Desplegament**: Azure Web App
- **NO usar**: React, Vue, Next.js, Tailwind, TypeScript, Python

## Credencials (fitxer .env, NO al git)
```
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
MSSQL_HOST=xxx.database.windows.net
MSSQL_DATABASE=...
MSSQL_USERNAME=...
MSSQL_PASSWORD=...
```

## Arquitectura v1 (sense RAG)
El coneixement pedagogic va als fitxers de prompt (editables sense tocar codi).
System prompt dinamic per capes:
1. `base.txt` — regles universals
2. `char_*.txt` — regles per caracteristica (nouvingut, dislexia, TEA, altes_capacitats)
3. `creuaments.txt` — regles quan hi ha multiples caracteristiques
4. Context educatiu (etapa, materia) + parametres (DUA, LF, MECR) + complements
5. `format_sortida.txt` — estructura de la resposta

## Pipeline de l'assistent
1. **Input**: docent enganxa un text
2. **Configuracio** (parametres, NO xat obert):
   - 4 caracteristiques: nouvingut | dislexia | TEA | altes capacitats
   - Etapa: infantil | primaria | ESO | batxillerat | FP
   - Nivell linguistic (MECR): pre-A1 | A1 | A2 | B1 | B2
   - Nivell DUA: Acces | Core | Enriquiment
   - Intensitat Lectura Facil: 1-5
   - Complements: glossari | definicions integrades | esquema visual | bastides
3. **propose_adaptation**: logica PHP que auto-calcula DUA, LF, MECR
4. **Adaptacio**: OpenAI transforma el text usant system prompt dinamic
5. **Log**: guardar a MS SQL (input, params, output, tokens)

## Regles de Lectura Facil (LF)
- Puntuacio: nomes punts i dos punts (no ; ni ...)
- Veu activa sempre, subjecte explicit
- Vocabulari frequent, termes tecnics en negreta amb explicacio
- Una idea per frase
- Imatges/pictogrames a l'esquerra del text
- Dates completes, no numeros romans

## Nivells DUA (multinivell)
- **Acces**: LF extrema + suport visual + definicions integrades
- **Core**: adaptacio estandard mantenint rigor curricular
- **Enriquiment**: profunditzacio + pensament critic + connexio interdisciplinar

## Moduls del corpus (M0-M9)
- M0: Identitat i Missio
- M1: Subjecte (perfils alumnat)
- M2: Metode (metodologies)
- M3: Llengua
- M4: Contingut Curricular
- M5: Tecnopedagogia
- M6: Avaluacio
- M7: Entorn, Convivencia i Familia
- M8: Governanca i Seguretat
- M9: Marc Legal i Normatiu

## Especificacions
- `SPEC_MVP_v1.md` — v1 sense RAG (actual)
- `SPEC_MVP_AZURE.md` — v2 amb RAG (futura)

## Roadmap
- **v1** (actual): system prompt dinamic per capes, sense RAG
- **v2**: afegir RAG amb OpenAI Vector Stores (1 VS per MD del corpus)

## Repo germa (versio anterior Python)
El prototip amb RAG-KG + Supabase + Gemini esta a `miquelamor-ai/ATNE-RAG-KG`.

## Convencions de codi
- PHP 8.2, Slim4, Composer
- Encoding UTF-8 sempre
- .env exclosa del git
