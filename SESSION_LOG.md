# ATNE-FJE (v1 MVP) — Resum de sessió (2026-03-25)

## Repo
- **Local**: `C:\Users\miquel.amor\Documents\GitHub\ATNE-FJE\`
- **Remote origin**: `https://github.com/FundacioJesuitesEducacio/ATNE.git`
- **Branca**: `spec/mvp-migracio-php`
- **Deploy**: Google Cloud Run → `https://atne-fje-1050342211642.europe-west1.run.app`
- **Projecte GCP**: `dreseraios-drive`

## Stack
PHP 8.2 + Slim4 + OpenAI gpt-4.1-mini (Responses API) + Supabase (log) + Cloud Run

## Què s'ha implementat avui

### Arquitectura completa v1 (sense RAG)
El coneixement pedagògic va als fitxers de prompt (editables sense tocar codi).

### Backend PHP (`src/` + `public/index.php`)
- **ProposalEngine.php** — Lògica `propose_adaptation`: calcula automàticament DUA, LF, MECR i complements a partir de les característiques seleccionades
- **PromptBuilder.php** — Construeix system prompt dinàmic per 8 capes (base + char_*.txt + creuaments + context + perfil + params + complements + format)
- **OpenAIClient.php** — Crida OpenAI Responses API (gpt-4.1-mini)
- **AdaptLogger.php** — Log a Supabase via REST API (taula `adaptation_log`)

### Endpoints API
- `GET /api/health` — Verifica OpenAI + Supabase
- `POST /api/propose` — Calcula paràmetres (PHP pur, sense LLM)
- `POST /api/adapt` — Pipeline complet: prompt builder → OpenAI → log → resposta

### 7 fitxers de prompt (`prompts/`)
- `base.txt` — Regles universals (MECR, terminologia, càrrega cognitiva)
- `char_nouvingut.txt` — Regles nouvingut (L1, alfabet, CALP)
- `char_dislexia.txt` — Regles dislèxia (format visual, fatiga lectora)
- `char_tea.txt` — Regles TEA (literalitat, estructura, nivells 1-3)
- `char_altes_capacitats.txt` — Regles AC (enriquiment, doble excepcionalitat)
- `creuaments.txt` — Regles combinació >1 característica
- `format_sortida.txt` — Format de resposta (seccions, taules, complements)

### Frontend (`public/`)
- 4 passos: Perfil → Text → Proposta → Resultat
- 4 característiques: nouvingut, dislèxia, TEA, altes capacitats
- 4 complements: glossari, definicions integrades, esquema visual, bastides
- Cursos i àmbits dinàmics per etapa (FP: CGM/CGS + famílies CF)
- Context docent al sidebar (etapa, curs, àmbit, matèria)

### Infraestructura
- `Dockerfile` — PHP 8.2 CLI + Composer
- `composer.json` — Slim4 + Guzzle + phpdotenv
- `.env.example` — Template de configuració

## Qüestions pendents

### CRÍTIC — Sense això no funciona l'adaptació
- [ ] **API key OpenAI** — Cal crear una nova key a `platform.openai.com` (organització "Fundació Jesuïtes Educació") i configurar-la:
  ```bash
  gcloud run services update atne-fje --region europe-west1 --update-env-vars="OPENAI_API_KEY=sk-proj-LA_KEY"
  ```

### IMPORTANT — Per completar el logging
- [ ] **Crear taula `adaptation_log` a Supabase** — Anar a Supabase Dashboard → SQL Editor:
  ```sql
  CREATE TABLE adaptation_log (
      id              SERIAL PRIMARY KEY,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      text_original   TEXT,
      chars_json      JSONB,
      context_json    JSONB,
      params_json     JSONB,
      text_adapted    TEXT,
      tokens_input    INT,
      tokens_output   INT,
      model           VARCHAR(100),
      duration_ms     INT,
      ip_address      VARCHAR(45)
  );

  ALTER TABLE adaptation_log ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Allow inserts" ON adaptation_log FOR INSERT TO anon WITH CHECK (true);
  CREATE POLICY "Allow reads" ON adaptation_log FOR SELECT TO anon USING (true);
  ```

### PENDENT — Migració futura a Azure
- [ ] Quan l'equip tècnic tingui Azure Web App + MS SQL:
  - Canviar Supabase per MS SQL (5 línies de codi)
  - Desplegar a Azure en lloc de Cloud Run
  - Configurar `.env` amb credencials MS SQL

### MILLORES FUTURES (v2)
- [ ] Afegir RAG amb OpenAI Vector Stores (1 VS per MD del corpus)
- [ ] Perfils persistents d'alumnat
- [ ] Historial amb feedback docent
- [ ] Exportació PDF/DOCX
- [ ] Streaming SSE

## Estructura de fitxers

```
ATNE-FJE/
├── public/
│   ├── index.php          ← Entry point Slim4 (routes)
│   ├── index.html         ← Frontend HTML
│   ├── css/styles.css     ← Estils
│   └── js/app.js          ← Lògica frontend
├── src/
│   ├── ProposalEngine.php ← Lògica propose_adaptation
│   ├── PromptBuilder.php  ← System prompt dinàmic per capes
│   ├── OpenAIClient.php   ← Crida Responses API
│   └── AdaptLogger.php    ← Log a Supabase
├── prompts/               ← EDITABLES SENSE TOCAR CODI
│   ├── base.txt
│   ├── char_nouvingut.txt
│   ├── char_dislexia.txt
│   ├── char_tea.txt
│   ├── char_altes_capacitats.txt
│   ├── creuaments.txt
│   └── format_sortida.txt
├── corpus/                ← Documents pedagògics (7 MDs)
├── SPEC_MVP_v1.md         ← Especificació v1 (sense RAG)
├── SPEC_MVP_AZURE.md      ← Especificació v2 (amb RAG)
├── CLAUDE.md              ← Instruccions projecte (stack PHP)
├── Dockerfile
├── composer.json
├── .env.example
└── .gitignore
```

## Credencials actuals (Cloud Run env vars)

| Variable | Valor | Estat |
|---|---|---|
| `OPENAI_API_KEY` | `pending` | **PENDENT** — cal posar key real |
| `OPENAI_MODEL` | `gpt-4.1-mini` | OK |
| `SUPABASE_URL` | `https://qlftykfqjwaxucoeqcjv.supabase.co` | OK |
| `SUPABASE_ANON_KEY` | `eyJ...` (configurada) | OK |

## Dos projectes en paral·lel

| | ATNE-RAG-KG (personal) | ATNE-FJE (institucional) |
|---|---|---|
| **Carpeta** | `Documents/GitHub/ATNE/` | `Documents/GitHub/ATNE-FJE/` |
| **Repo** | miquelamor-ai/ATNE-RAG-KG | FundacioJesuitesEducacio/ATNE |
| **Branca** | main | spec/mvp-migracio-php |
| **Stack** | Python + Gemini + Supabase (RAG-KG) | PHP Slim4 + OpenAI + Supabase (log) |
| **Deploy** | Cloud Run `atne` | Cloud Run `atne-fje` |
| **URL** | atne-1050342211642.europe-west1.run.app | atne-fje-1050342211642.europe-west1.run.app |
| **Estat** | Complet i funcionant | UI ok, adaptació pendent API key |
