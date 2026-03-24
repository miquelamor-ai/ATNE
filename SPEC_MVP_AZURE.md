# ATNE MVP — Especificació tècnica per a migració OpenAI/PHP

**Versió**: 2.1
**Data**: 2026-03-24
**Origen**: Migració del prototip ATNE (Python/Gemini/Supabase) a stack institucional
**Destinatari**: Equip tècnic

---

## 1. Objectiu del MVP

Prova pilot d'un sistema d'adaptació de textos educatius que:
- Permet seleccionar **4 característiques d'alumnat** (nouvingut, dislèxia, TEA, altes capacitats)
- Configura **3 variables d'adaptació** (nivell DUA, intensitat lectura fàcil, nivell MECR)
- Genera **4 complements** (glossari, definicions integrades, esquema visual, bastides)
- Utilitza **vector stores OpenAI separats** (1 per document MD del corpus) amb routing per característica
- Demostra que l'arquitectura escala afegint noves característiques sense tocar el codi central

**NO inclou** (fora d'abast MVP): Knowledge Graph, perfils persistents, historial amb feedback, exportació PDF/DOCX.

---

## 2. Stack tecnològic

| Component | Tecnologia | Detall |
|---|---|---|
| Servidor | Servidor PHP institucional | PHP 8.2+ |
| LLM | OpenAI API (directe) | gpt-4.1-mini (Responses API) |
| Embeddings | OpenAI API (directe) | Gestionat automàticament pels vector stores |
| Vector Store | OpenAI Vector Stores | 1 VS per MD, **endpoint directe** `/v1/vector_stores/{id}/search` |
| Frontend | HTML + JavaScript + CSS | Sense frameworks |
| Configuració | .env | API key OpenAI |

### Nota sobre l'API de cerca
OpenAI té **dues vies** per cercar als vector stores:

| Via | Límit VS per consulta | Ús |
|---|---|---|
| **Assistants API** (`file_search` tool) | **Màxim 2 VS** | Descartada |
| **Endpoint directe** (`/v1/vector_stores/{id}/search`) | **Il·limitat** | **La que usem** |

L'endpoint directe permet fer N crides (una per VS) i combinar resultats al PHP. No té el límit de 2 VS.

### Prerequisits
- Servidor PHP 8.2+ operatiu
- API key OpenAI amb accés a vector stores i Responses API
- Projecte OpenAI configurat amb capacitat de crear vector stores

---

## 3. Arquitectura general

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND (HTML + JS + CSS)                          │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │ Pas 1    │  │ Pas 2    │  │ Pas 3    │  │Pas 4 │ │
│  │ Perfil   │→ │ Text     │→ │ Config   │→ │Resul.│ │
│  └──────────┘  └──────────┘  └──────────┘  └──────┘ │
└──────────────────────┬──────────────────────────────┘
                       │ AJAX (fetch)
                       ▼
┌─────────────────────────────────────────────────────┐
│  BACKEND PHP                                            │
│                                                       │
│  POST /api/propose  → Calcula paràmetres automàtics  │
│  POST /api/adapt    → Pipeline complet (RAG + LLM)   │
│  GET  /api/health   → Verifica connectivitat          │
│                                                       │
│  ┌─────────────┐    ┌──────────────┐                 │
│  │  Routing    │    │  Prompt      │                 │
│  │  Caract.→VS │    │  Builder     │                 │
│  └──────┬──────┘    └──────┬───────┘                 │
│         │                  │                          │
│         ▼                  ▼                          │
│  ┌─────────────┐    ┌──────────────┐                 │
│  │ OpenAI      │    │ OpenAI       │                 │
│  │ Vector      │    │ Responses    │                 │
│  │ Stores      │    │ API          │                 │
│  │ (file_search│    │ (gpt-4.1-   │                 │
│  │  API)       │    │  mini)       │                 │
│  └─────────────┘    └──────────────┘                 │
└─────────────────────────────────────────────────────┘
```

---

## 4. Vector stores del corpus

### Conceptes clau

| Concepte | Què és |
|---|---|
| **Vector store** | Contenidor gestionat per OpenAI que emmagatzema documents amb embeddings. Tu pujes el fitxer MD; OpenAI fa el chunking i l'embedding automàticament. |
| **file_search** | API d'OpenAI per cercar dins d'un o més vector stores. Tu envies una query en text; OpenAI retorna els chunks més rellevants amb un score de similitud. |
| **Routing** | Lògica PHP que decideix quins vector stores consultar segons les característiques d'alumnat seleccionades. |

### Vector stores per al MVP (7 MDs = 7 vector stores)

#### Sempre consultats (obligatoris)
| Vector Store | Document | Contingut |
|---|---|---|
| `vs_dua` | `M2_DUA-principis-pautes.md` | Principis del Disseny Universal per a l'Aprenentatge |
| `vs_lf` | `M3_lectura-facil-comunicacio-clara.md` | Regles de Lectura Fàcil i comunicació clara |

#### Per característica
| Característica | Vector Store | Document |
|---|---|---|
| Nouvingut | `vs_nouvingut` | `M1_alumnat-nouvingut.md` |
| Nouvingut | `vs_acollida` | `M1_acollida-marc-conceptual.md` |
| Dislèxia | `vs_dislexia` | `M1_dislexia-dificultats-lectores.md` |
| TEA | `vs_tea` | `M1_alumnat-TEA.md` |
| Altes capacitats | `vs_altes_cap` | `M1_altes-capacitats.md` |

### Creació dels vector stores (1 sola vegada)

```php
// scripts/create_vector_stores.php

$openaiKey = getenv('OPENAI_API_KEY');

$docs = [
    'vs_dua'        => ['name' => 'ATNE - M2 DUA',              'file' => 'corpus/M2_DUA-principis-pautes.md'],
    'vs_lf'         => ['name' => 'ATNE - M3 Lectura Facil',    'file' => 'corpus/M3_lectura-facil-comunicacio-clara.md'],
    'vs_nouvingut'  => ['name' => 'ATNE - M1 Nouvingut',        'file' => 'corpus/M1_alumnat-nouvingut.md'],
    'vs_acollida'   => ['name' => 'ATNE - M1 Acollida',         'file' => 'corpus/M1_acollida-marc-conceptual.md'],
    'vs_dislexia'   => ['name' => 'ATNE - M1 Dislexia',         'file' => 'corpus/M1_dislexia-dificultats-lectores.md'],
    'vs_tea'        => ['name' => 'ATNE - M1 TEA',              'file' => 'corpus/M1_alumnat-TEA.md'],
    'vs_altes_cap'  => ['name' => 'ATNE - M1 Altes Capacitats', 'file' => 'corpus/M1_altes-capacitats.md'],
];

foreach ($docs as $key => $info) {
    // 1. Crear vector store
    $vs = openaiPost('/vector_stores', ['name' => $info['name']]);
    echo "$key: {$vs['id']}\n";

    // 2. Pujar fitxer
    $file = openaiUploadFile($info['file'], 'assistants');

    // 3. Associar fitxer al vector store
    openaiPost("/vector_stores/{$vs['id']}/files", ['file_id' => $file['id']]);

    // OpenAI fa chunking + embedding automàticament
    echo "  Fitxer pujat. OpenAI processant...\n";
}

// RESULTAT: 7 IDs de vector store per configurar al .env
```

**Sortida esperada:**
```
vs_dua: vs_69c2c82b2f6c8191b70d5a4d4a001028
vs_lf: vs_69c2c83cbb988191b1272b079c989c17
vs_nouvingut: vs_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
vs_acollida: vs_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
vs_dislexia: vs_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
vs_tea: vs_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
vs_altes_cap: vs_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Aquests IDs es guarden al `.env` i no cal tornar a executar l'script.

### Routing: característica → vector stores

```php
// src/config.php — IDs reals dels vector stores creats

const VS_IDS = [
    'dua'        => 'vs_69c2c82b2f6c8191b70d5a4d4a001028',  // M2 DUA (obligatori)
    'lf'         => 'vs_69c2c83cbb988191b1272b079c989c17',  // M3 LF (obligatori)
    'nouvingut'  => 'vs_XXXXXX',  // M1 nouvingut
    'acollida'   => 'vs_XXXXXX',  // M1 acollida
    'dislexia'   => 'vs_XXXXXX',  // M1 dislexia
    'tea'        => 'vs_XXXXXX',  // M1 TEA
    'altes_cap'  => 'vs_XXXXXX',  // M1 altes capacitats
];

const CHAR_TO_VS = [
    'nouvingut'       => ['nouvingut', 'acollida'],
    'dislexia'        => ['dislexia'],
    'tea'             => ['tea'],
    'altes_capacitats' => ['altes_cap'],
];

const MANDATORY_VS = ['dua', 'lf'];
```

Quan l'usuari selecciona característiques, el backend:
1. Reuneix tots els vector store IDs rellevants (mandatory + seleccionats)
2. Fa `file_search` a cada vector store amb el text del docent com a query
3. Filtra per score mínim (≥ 0.40)
4. Injecta els chunks resultants al prompt del LLM

---

## 5. Definició de les 4 característiques

### 5.1. Nouvingut (contextual)

Alumnat d'incorporació tardana amb L1 diferent del català.

**Sub-variables:**

| ID | Etiqueta | Tipus | Opcions |
|---|---|---|---|
| `L1` | Llengua materna | text | Lliure (ex: àrab, urdú, xinès) |
| `alfabet_llati` | Alfabet llatí | select | Sí / No |
| `escolaritzacio_previa` | Escolarització prèvia | select | si / parcial / no |
| `mecr` | Nivell català (MECR) | select | pre-A1 / A1 / A2 / B1 / B2 |

### 5.2. Dislèxia (constitutiva)

Dificultat específica de lectura. Afecta precisió, velocitat i comprensió lectora.

**Sub-variables:** Cap (activació binària).

### 5.3. TEA (constitutiva)

Trastorn de l'Espectre Autista. Afecta comunicació social, literalitat, tolerància a l'ambigüitat.

**Sub-variables:**

| ID | Etiqueta | Tipus | Opcions |
|---|---|---|---|
| `nivell_suport` | Nivell de suport (DSM-5) | select | 1 / 2 / 3 |

### 5.4. Altes capacitats (constitutiva)

Alumnat amb capacitat intel·lectual superior. Necessita repte cognitiu, no simplificació.

**Sub-variables:**

| ID | Etiqueta | Tipus | Opcions |
|---|---|---|---|
| `doble_excepcionalitat` | Doble excepcionalitat | select | No / Sí |

---

## 6. Les 3 variables d'adaptació

### 6.1. Nivell DUA (Accés / Core / Enriquiment)

Determina la **direcció** de l'adaptació:

| Nivell | Descripció | Quan s'aplica |
|---|---|---|
| **Accés** | LF extrema, suport visual màxim, vocabulari molt bàsic | DI sever, TEA nivell 3, Nouvingut pre-A1 sense alfabet llatí |
| **Core** | Adaptació estàndard mantenint rigor curricular | Dislèxia, TEA nivell 1-2, Nouvingut A1+ |
| **Enriquiment** | Complexitat mantinguda + repte cognitiu + connexions interdisciplinars | Altes capacitats (sense doble excepcionalitat) |

### 6.2. Intensitat Lectura Fàcil (1-5)

Controla el grau de simplificació del text:

| Valor | Significat | Qui ho activa |
|---|---|---|
| 1 | Mínima (estructura i claredat) | Altes capacitats |
| 2 | Baixa (defecte) | TDAH, genèric |
| 3 | Moderada (frases curtes, vocab freqüent) | Dislèxia, nouvingut A2 |
| 4 | Alta (molt simplificat) | Nouvingut pre-A1/A1, TEA nivell 2 |
| 5 | Màxima (3-5 paraules/frase) | TEA nivell 3, DI sever |

**Regla**: si múltiples característiques, s'agafa el **màxim**.

### 6.3. Nivell MECR de sortida (pre-A1 a B2)

Complexitat lingüística màxima del text generat:

| Nivell | Restriccions principals |
|---|---|
| **pre-A1** | 3-5 paraules/frase, vocabulari quotidià, present, sense fórmules |
| **A1** | 5-8 paraules/frase, sense subordinades, 3-4 termes tècnics màxim |
| **A2** | 8-12 paraules/frase, coordinades simples, 5-6 termes tècnics |
| **B1** | 12-18 paraules/frase, subordinades simples, connectors |
| **B2** | Fins a 25 paraules/frase, vocabulari acadèmic, adaptació mínima |

**Auto-determinació:**
- Si nouvingut actiu → usar el MECR de l'alumne
- Altrament → defecte per etapa (Infantil=A1, Primària=B1, ESO/Batx/FP=B2)

---

## 7. Lògica de proposta automàtica (`propose_adaptation`)

Quan l'usuari selecciona característiques, el sistema **proposa automàticament** els valors de les 3 variables i els complements. El docent pot modificar-los.

### PHP — Pseudo-codi

```php
function proposeAdaptation(array $chars, array $context): array
{
    $actives = array_keys(array_filter($chars, fn($v) => $v['actiu'] ?? false));

    // -- Helpers --
    $mecr       = $chars['nouvingut']['mecr'] ?? '';
    $teaNivell  = (int)($chars['tea']['nivell_suport'] ?? 1);
    $acDoble    = (bool)($chars['altes_capacitats']['doble_excepcionalitat'] ?? false);
    $etapa      = $context['etapa'] ?? 'ESO';

    // -- Nivell DUA --
    $dua = 'Core';
    if (
        (in_array('tea', $actives) && $teaNivell === 3) ||
        (in_array('nouvingut', $actives) && $mecr === 'pre-A1'
            && !($chars['nouvingut']['alfabet_llati'] ?? true))
    ) {
        $dua = 'Acces';
    } elseif (in_array('altes_capacitats', $actives) && !$acDoble) {
        $dua = 'Enriquiment';
    }

    // -- Intensitat LF --
    $lfFactors = [];
    if (in_array('tea', $actives)) {
        $lfFactors[] = [3 => 5, 2 => 4, 1 => 2][$teaNivell] ?? 2;
    }
    if (in_array('nouvingut', $actives)) {
        $lfFactors[] = ['pre-A1' => 4, 'A1' => 3, 'A2' => 2, 'B1' => 1, 'B2' => 1][$mecr] ?? 3;
    }
    if (in_array('dislexia', $actives)) {
        $lfFactors[] = 3;
    }
    if (in_array('altes_capacitats', $actives)) {
        $lfFactors[] = 1;
    }
    $lf = $lfFactors ? max($lfFactors) : 2;

    // -- MECR sortida --
    $etapaDefaults = [
        'infantil' => 'A1', 'primaria' => 'B1',
        'ESO' => 'B2', 'batxillerat' => 'B2', 'FP' => 'B2',
    ];
    if (in_array('nouvingut', $actives) && $mecr) {
        $mecrSortida = $mecr;
    } else {
        $mecrSortida = $etapaDefaults[$etapa] ?? 'B2';
    }

    // -- Complements automàtics --
    $complements = [
        'glossari'               => true,
        'definicions_integrades' => $dua === 'Acces'
                                    || in_array($mecr, ['pre-A1', 'A1']),
        'esquema_visual'         => !empty(array_intersect(
                                    ['dislexia', 'tea', 'nouvingut'], $actives)),
        'bastides'               => !empty(array_intersect(
                                    ['nouvingut', 'tea', 'dislexia'], $actives)),
    ];

    return [
        'dua'           => $dua,
        'lf'            => $lf,
        'mecr_sortida'  => $mecrSortida,
        'complements'   => $complements,
    ];
}
```

---

## 8. Pipeline d'adaptació (`/api/adapt`)

### Flux complet

```
1. Rebre: text + característiques + variables + complements
2. Routing: determinar quins vector stores consultar (mandatory + per característica)
3. Cerca: file_search a cada vector store amb el text del docent com a query
4. Filtratge: descartar chunks amb score < 0.40
5. Context: muntar el context RAG (top 8 chunks ordenats per score)
6. Prompt: construir system prompt dinàmic
7. LLM: cridar gpt-4.1-mini amb Responses API (system prompt + text original)
8. Resposta: retornar text adaptat + complements
```

### Pas 2-4: Cerca als vector stores amb routing

```php
function searchCorpus(string $text, array $activeChars): string
{
    // 1. Determinar quins vector stores consultar
    $vsKeys = MANDATORY_VS;
    foreach ($activeChars as $char) {
        if (isset(CHAR_TO_VS[$char])) {
            $vsKeys = array_merge($vsKeys, CHAR_TO_VS[$char]);
        }
    }
    $vsKeys = array_unique($vsKeys);

    // 2. Obtenir IDs reals
    $vsIds = array_map(fn($k) => VS_IDS[$k], $vsKeys);

    // 3. Cercar a cada vector store (en paral·lel si es pot, o seqüencial)
    $allChunks = [];
    foreach ($vsIds as $vsId) {
        $results = openaiVectorStoreSearch($vsId, $text, maxResults: 5);
        // $results = { data: [{ score, filename, content: [{ type, text }] }] }

        foreach ($results['data'] as $result) {
            if ($result['score'] >= 0.40) {
                $chunkText = '';
                foreach ($result['content'] as $c) {
                    if ($c['type'] === 'text') $chunkText .= $c['text'];
                }
                $allChunks[] = [
                    'score'    => $result['score'],
                    'filename' => $result['filename'],
                    'text'     => $chunkText,
                ];
            }
        }
    }

    // 4. Ordenar per score descendent i agafar top 8
    usort($allChunks, fn($a, $b) => $b['score'] <=> $a['score']);
    $topChunks = array_slice($allChunks, 0, 8);

    // 5. Muntar context RAG
    $ragParts = [];
    foreach ($topChunks as $chunk) {
        $ragParts[] = "[{$chunk['filename']} | score: {$chunk['score']}]\n{$chunk['text']}";
    }

    return implode("\n\n---\n\n", $ragParts);
}

function openaiVectorStoreSearch(string $vsId, string $query, int $maxResults = 5): array
{
    // POST https://api.openai.com/v1/vector_stores/{vsId}/search
    return httpPost(
        "https://api.openai.com/v1/vector_stores/$vsId/search",
        ['query' => $query, 'max_num_results' => $maxResults],
        headers: [
            'Authorization: Bearer ' . OPENAI_API_KEY,
            'Content-Type: application/json',
            'OpenAI-Beta: assistants=v2',
        ]
    );
}
```

**Nota**: L'ATNE automatitza aquesta crida basant-se en les característiques seleccionades pel docent.

### Pas 6: System prompt dinàmic

El system prompt es construeix en **capes**:

```
BASE (regles fixes)
  + CONTEXT EDUCATIU (etapa, curs, matèria)
  + PERFIL ALUMNE (característiques actives + sub-variables)
  + PARÀMETRES (DUA, LF, MECR)
  + COMPLEMENTS (quins generar)
  + CONTEXT RAG (chunks recuperats dels vector stores)
  + FORMAT SORTIDA (instruccions per secció)
```

### Pas 7: Crida al LLM (Responses API)

```php
function callLLM(string $systemPrompt, string $userText): string
{
    // POST https://api.openai.com/v1/responses
    $response = httpPost('https://api.openai.com/v1/responses', [
        'model' => 'gpt-4.1-mini',
        'input' => [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user',   'content' => "TEXT ORIGINAL A ADAPTAR:\n\n" . $userText],
        ],
    ], headers: [
        'Authorization: Bearer ' . OPENAI_API_KEY,
        'Content-Type: application/json',
    ]);

    // Extreure text de la resposta
    foreach ($response['output'] as $item) {
        if ($item['type'] === 'message') {
            foreach ($item['content'] as $c) {
                if ($c['type'] === 'text') return $c['text'];
            }
        }
    }
    return '';
}
```

**Nota**: Crida estàndard a l'API Responses d'OpenAI.

---

## 9. System prompt complet

### 9.1. BASE (constant)

```
Ets l'assistent ATNE (Adaptador de Textos a Necessitats Educatives)
de Jesuïtes Educació.

REGLA ABSOLUTA — FORMAT:
- Comença amb "## Text adaptat". NO escriguis cap introducció.

REGLES GENERALS:
- Escriu en català
- Mantingues rigor curricular
- Una idea per frase
- Veu activa, subjecte explícit
- Termes tècnics en **negreta** amb explicació entre parèntesis
- Puntuació: punts i dos punts; evitar punt i coma

REGLA CRÍTICA — TERMINOLOGIA:
- MAI substituir terme científic per col·loquial
- PARAULES PROHIBIDES: "cosa", "coses", "allò", "això",
  "el que fa que", "serveix per", "un tipus de"
- Sempre concretar amb terme específic
- AUTOCHECK: revisar que no apareguin paraules prohibides

NIVELLS MECR (restriccions lingüístiques):
- pre-A1: 3-5 paraules/frase, vocabulari quotidià, present
- A1: 5-8 paraules/frase, sense subordinades, 3-4 termes tècnics
- A2: 8-12 paraules/frase, coordinades simples, 5-6 termes
- B1: 12-18 paraules/frase, subordinades simples
- B2: fins 25 paraules/frase, vocabulari acadèmic

REGLES DE CREUAMENT:
- Nouvingut + dislèxia: suport visual + simplificació lingüística simultània
- TEA + text narratiu: explicitar inferències, evitar ambigüitat
- Nouvingut + L2 molt baixa: simplificació lingüística PRIORITÀRIA
- TDAH + text llarg: segmentar en blocs curts amb objectiu per bloc

CÀRREGA COGNITIVA:
- Màxim 2 conceptes nous/paràgraf a pre-A1/A1/A2
- Màxim 3 conceptes nous/paràgraf a B1
```

### 9.2. Capes dinàmiques (construïdes per PHP)

```php
function buildSystemPrompt(
    array $profile,
    array $context,
    array $params,
    string $ragContext
): string {
    $parts = [BASE_SYSTEM_PROMPT];

    // Capa 1: Context educatiu
    $parts[] = "CONTEXT EDUCATIU:
- Etapa: {$context['etapa']}
- Curs: {$context['curs']}
- Matèria: {$context['materia']}";

    // Capa 2: Perfil alumne
    $activeDescs = [];
    $l1 = '';
    foreach ($profile['caracteristiques'] as $key => $val) {
        if (!($val['actiu'] ?? false)) continue;
        $desc = ucfirst(str_replace('_', ' ', $key));
        $subvars = array_filter($val, fn($k) => $k !== 'actiu', ARRAY_FILTER_USE_KEY);
        if ($subvars) {
            $desc .= ' (' . implode(', ', array_map(
                fn($k, $v) => "$k=$v", array_keys($subvars), $subvars
            )) . ')';
        }
        $activeDescs[] = $desc;
        if ($key === 'nouvingut') $l1 = $val['L1'] ?? '';
    }

    $parts[] = "PERFIL DE L'ALUMNE:
- Característiques: " . (implode(', ', $activeDescs) ?: 'Genèric') . "
- Llengua materna (L1): " . ($l1 ?: '(no especificada)');

    // Capa 3: Paràmetres
    $duaDescs = [
        'Acces' => 'LF extrema, suport visual màxim, vocabulari molt bàsic',
        'Core' => 'Adaptació estàndard mantenint rigor curricular',
        'Enriquiment' => 'Repte cognitiu, connexions interdisciplinars',
    ];
    $parts[] = "PARÀMETRES D'ADAPTACIÓ:
- Nivell DUA: {$params['dua']} — {$duaDescs[$params['dua']]}
- Intensitat Lectura Fàcil: {$params['lf']}/5
- Nivell MECR sortida: {$params['mecr_sortida']}";

    // Capa 4: Complements a generar
    $compActius = array_keys(array_filter($params['complements']));
    $parts[] = "COMPLEMENTS A GENERAR:\n" .
        implode("\n", array_map(fn($c) => "- $c", $compActius));

    // Capa 5: Context RAG
    if ($ragContext) {
        $parts[] = "CONEIXEMENT PEDAGÒGIC (corpus FJE):\n$ragContext";
    }

    // Capa 6: Format de sortida
    $parts[] = buildOutputInstructions($params['complements'], $l1);

    return implode("\n\n", $parts);
}
```

### 9.3. Instruccions de sortida per complement

```
## Text adaptat
[SEMPRE] Text complet adaptat. Termes en **negreta** amb definició.

## Glossari
[SI ACTIU] Taula markdown:
| Terme | Traducció ({L1}) | Explicació simple |
Mínim 8-12 termes. Traducció real a la L1 (alfabet original si escau).

## Definicions integrades
[SI ACTIU] Ja integrat al text (definicions entre parèntesis). Sense secció separada.

## Esquema visual
[SI ACTIU] Diagrama en format text amb fletxes (→, ↓), símbols i emojis.
```
ELEMENT A ☀️
  ↓
+ ELEMENT B 💧
  ↓
RESULTAT → PRODUCTE 1 + PRODUCTE 2
```

## Bastides (scaffolding)
[SI ACTIU] 4 blocs:
### Frases model — 3-5 frases incompletes a completar
### Banc de paraules — 8-12 paraules clau
### Suport visual — indicacions de suports (icones, colors)
### Suport L1 — pistes en la L1 per conceptes abstractes (si nouvingut)

## Argumentació pedagògica
[SEMPRE] Justificació de decisions: adaptació lingüística, atenció diversitat,
suport multimodal, gradació cognitiva, rigor curricular. 3-5 punts breus.

## Notes d'auditoria
[SEMPRE] Taula comparativa:
| Aspecte | Original | Adaptat | Motiu |
Màxim 5-6 files.
```

---

## 10. Endpoints API

### `GET /api/health`

Verifica connectivitat amb OpenAI (vector stores + Responses API).

**Resposta:**
```json
{ "ok": true, "vector_stores": true, "responses_api": true }
```

### `POST /api/propose`

Calcula paràmetres d'adaptació automàtics a partir de les característiques seleccionades. **Només lògica PHP, no crida a OpenAI.**

**Request:**
```json
{
  "caracteristiques": {
    "nouvingut": { "actiu": true, "L1": "àrab", "mecr": "A1", "alfabet_llati": false },
    "dislexia": { "actiu": true },
    "tea": { "actiu": false },
    "altes_capacitats": { "actiu": false }
  },
  "context": {
    "etapa": "ESO",
    "curs": "3r",
    "materia": "Biologia"
  }
}
```

**Resposta:**
```json
{
  "dua": "Core",
  "lf": 3,
  "mecr_sortida": "A1",
  "complements": {
    "glossari": true,
    "definicions_integrades": true,
    "esquema_visual": true,
    "bastides": true
  }
}
```

### `POST /api/adapt`

Pipeline complet: cerca RAG (vector stores) + generació LLM (Responses API).

**Request:**
```json
{
  "text": "La fotosíntesi és el procés pel qual les plantes...",
  "profile": {
    "caracteristiques": {
      "nouvingut": { "actiu": true, "L1": "àrab", "mecr": "A1", "alfabet_llati": false },
      "dislexia": { "actiu": true },
      "tea": { "actiu": false },
      "altes_capacitats": { "actiu": false }
    }
  },
  "context": { "etapa": "ESO", "curs": "3r", "materia": "Biologia" },
  "params": {
    "dua": "Core",
    "lf": 3,
    "mecr_sortida": "A1",
    "complements": {
      "glossari": true,
      "definicions_integrades": true,
      "esquema_visual": true,
      "bastides": true
    }
  }
}
```

**Resposta:**
```json
{
  "adapted": "## Text adaptat\n\nLes **plantes** fan el seu menjar...\n\n## Glossari\n\n| Terme | ...",
  "tokens_used": { "input": 1850, "output": 2340 },
  "vs_consulted": ["vs_dua", "vs_lf", "vs_nouvingut", "vs_acollida", "vs_dislexia"],
  "chunks_used": 8
}
```

---

## 11. Abstracció de la capa de cerca

Per facilitar un eventual canvi de proveïdor (ex: migrar a Supabase pgvector), el codi de cerca s'encapsula darrere d'una interfície:

```php
// src/CorpusSearchInterface.php
interface CorpusSearchInterface {
    /**
     * Cerca chunks rellevants per a un text donat, als vector stores indicats.
     * @return array [['score' => float, 'filename' => string, 'text' => string], ...]
     */
    public function search(string $query, array $vsKeys, int $maxResults = 5, float $minScore = 0.40): array;
}

// src/OpenAISearch.php — implementació actual
class OpenAISearch implements CorpusSearchInterface {
    public function search(string $query, array $vsKeys, int $maxResults = 5, float $minScore = 0.40): array
    {
        // Crides a /v1/vector_stores/{id}/search per cada VS
        // Crides individuals a l'endpoint directe
    }
}

// src/SupabaseSearch.php — implementació alternativa (futur, si cal)
class SupabaseSearch implements CorpusSearchInterface {
    public function search(string $query, array $vsKeys, int $maxResults = 5, float $minScore = 0.40): array
    {
        // Genera embedding + query a match_rag_fje() amb filtre source
    }
}
```

La resta del pipeline (`AdaptPipeline`, `PromptBuilder`) només coneix la interfície, no la implementació. Canviar de proveïdor = canviar 1 línia de configuració.

---

## 12. Estructura de fitxers PHP

```
atne-mvp/
├── public/
│   ├── index.html          ← Pàgina principal
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js          ← Lògica frontend
├── src/
│   ├── config.php          ← Variables entorn (.env) + constants VS_IDS, CHAR_TO_VS
│   ├── routes.php          ← Definició endpoints API
│   ├── OpenAIClient.php    ← Client unificat (vector store search + Responses API)
│   ├── ProposalEngine.php  ← Lògica propose_adaptation
│   ├── PromptBuilder.php   ← Construcció system prompt dinàmic
│   ├── AdaptPipeline.php   ← Pipeline complet (search VS → prompt → LLM)
│   └── prompts/
│       └── base.txt        ← System prompt base (constant)
├── scripts/
│   └── create_vector_stores.php  ← Script per crear VS i pujar MDs a OpenAI
├── corpus/                        ← Els 7 fitxers MD (no cal al servidor en producció)
│   ├── M1_alumnat-nouvingut.md
│   ├── M1_acollida-marc-conceptual.md
│   ├── M1_dislexia-dificultats-lectores.md
│   ├── M1_alumnat-TEA.md
│   ├── M1_altes-capacitats.md
│   ├── M2_DUA-principis-pautes.md
│   └── M3_lectura-facil-comunicacio-clara.md
├── .env                    ← Credencials (NO al git)
├── composer.json
└── README.md
```

### `.env`

```
OPENAI_API_KEY=sk-proj-...

# Vector Store IDs (generats per create_vector_stores.php)
VS_DUA=vs_69c2c82b2f6c8191b70d5a4d4a001028
VS_LF=vs_69c2c83cbb988191b1272b079c989c17
VS_NOUVINGUT=vs_XXXXXX
VS_ACOLLIDA=vs_XXXXXX
VS_DISLEXIA=vs_XXXXXX
VS_TEA=vs_XXXXXX
VS_ALTES_CAP=vs_XXXXXX

# Model LLM
OPENAI_MODEL=gpt-4.1-mini
```

---

## 13. Frontend — Interfície simplificada

### Pas 1: Perfil (selecció de característiques)

```
┌─────────────────────────────────────────────────┐
│  ATNE — Adaptador de Textos                      │
│                                                   │
│  Selecciona les característiques de l'alumnat:   │
│                                                   │
│  ┌──────────────┐  ┌──────────────┐              │
│  │ ☐ Nouvingut  │  │ ☐ Dislèxia   │              │
│  │   L1: [____] │  │              │              │
│  │   MECR: [__] │  └──────────────┘              │
│  │   Alfabet: □ │  ┌──────────────┐              │
│  └──────────────┘  │ ☐ TEA        │              │
│  ┌──────────────┐  │   Suport:[_] │              │
│  │ ☐ Altes cap. │  └──────────────┘              │
│  │   Doble ex:□ │                                │
│  └──────────────┘                                │
│                                                   │
│  Context: Etapa [ESO ▼] Matèria [________]       │
│                                                   │
│  [Següent →]                                      │
└─────────────────────────────────────────────────┘
```

### Pas 2: Text original

```
┌─────────────────────────────────────────────────┐
│  Enganxa el text a adaptar:                      │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │                                             │ │
│  │  (textarea)                                 │ │
│  │                                             │ │
│  └─────────────────────────────────────────────┘ │
│  245 paraules                                     │
│                                                   │
│  [Següent →]                                      │
└─────────────────────────────────────────────────┘
```

### Pas 3: Proposta (editable)

```
┌─────────────────────────────────────────────────┐
│  Proposta d'adaptació (basada en: Nouvingut +    │
│  Dislèxia)                                       │
│                                                   │
│  Nivell DUA:    [Core ▼]                         │
│  Lectura Fàcil: [3 — Moderada ▼]                 │
│  MECR sortida:  [A1 ▼]                           │
│                                                   │
│  Complements:                                     │
│  ☑ Glossari                                      │
│  ☑ Definicions integrades                        │
│  ☑ Esquema visual                                │
│  ☑ Bastides                                      │
│                                                   │
│  [ADAPTAR]                                        │
└─────────────────────────────────────────────────┘
```

### Pas 4: Resultat

```
┌─────────────────────────────────────────────────┐
│  ┌──────────────────┐ ┌──────────────────┐      │
│  │ TEXT ORIGINAL     │ │ TEXT ADAPTAT      │      │
│  │                   │ │                   │      │
│  │ La fotosíntesi    │ │ Les plantes fan   │      │
│  │ és el procés...   │ │ el seu menjar...  │      │
│  └──────────────────┘ └──────────────────┘      │
│                                                   │
│  ▼ Glossari                                      │
│  ▼ Esquema visual                                │
│  ▼ Bastides                                      │
│  ► Argumentació pedagògica                       │
│                                                   │
│  [Nova adaptació]                                 │
└─────────────────────────────────────────────────┘
```

---

## 14. Script de creació de vector stores

Per crear els vector stores a OpenAI i pujar-hi els MDs:

```php
// scripts/create_vector_stores.php
// Executar 1 sola vegada. Guardar els IDs resultants al .env.

require_once __DIR__ . '/../src/config.php';

$docs = [
    'vs_dua'       => ['name' => 'ATNE - M2 DUA',              'file' => 'M2_DUA-principis-pautes.md'],
    'vs_lf'        => ['name' => 'ATNE - M3 Lectura Facil',    'file' => 'M3_lectura-facil-comunicacio-clara.md'],
    'vs_nouvingut' => ['name' => 'ATNE - M1 Nouvingut',        'file' => 'M1_alumnat-nouvingut.md'],
    'vs_acollida'  => ['name' => 'ATNE - M1 Acollida',         'file' => 'M1_acollida-marc-conceptual.md'],
    'vs_dislexia'  => ['name' => 'ATNE - M1 Dislexia',         'file' => 'M1_dislexia-dificultats-lectores.md'],
    'vs_tea'       => ['name' => 'ATNE - M1 TEA',              'file' => 'M1_alumnat-TEA.md'],
    'vs_altes_cap' => ['name' => 'ATNE - M1 Altes Capacitats', 'file' => 'M1_altes-capacitats.md'],
];

foreach ($docs as $key => $info) {
    $filepath = __DIR__ . "/../corpus/{$info['file']}";

    // 1. Crear vector store
    $vs = openaiPost('/v1/vector_stores', [
        'name' => $info['name'],
    ]);

    // 2. Pujar fitxer a OpenAI
    $file = openaiUploadFile($filepath, 'assistants');

    // 3. Associar fitxer al vector store (OpenAI fa chunking + embedding)
    openaiPost("/v1/vector_stores/{$vs['id']}/files", [
        'file_id' => $file['id'],
    ]);

    echo "$key = {$vs['id']}\n";
}

echo "\nCopia aquests IDs al .env\n";
```

**Diferència clau vs. el sistema actual**: NO cal programar chunking ni embeddings. OpenAI ho gestiona tot automàticament quan puges el fitxer.

---

## 15. Com escala l'arquitectura

Afegir una nova característica (ex: TDAH) requereix **3 passos**:

### 1. Crear vector store i pujar el MD
```bash
php scripts/create_single_vs.php M1_TDAH.md "ATNE - M1 TDAH"
# Resultat: vs_XXXXXX → afegir al .env
```

### 2. Afegir el routing al backend
```php
// A VS_IDS
'tdah' => 'vs_XXXXXX',

// A CHAR_TO_VS
'tdah' => ['tdah'],
```

### 3. Afegir la UI
```javascript
// A CHARACTERISTICS
tdah: { label: "TDAH", subvars: [] }
```

### 4. Actualitzar les regles de proposta (si cal sub-variables)
```php
// A proposeAdaptation()
if (in_array('tdah', $actives)) {
    $lfFactors[] = 2;
}
```

**Cap canvi al pipeline central, al prompt builder, ni a la cerca.**
Això és el que fa l'arquitectura escalable.

### Escalabilitat a 84 MDs (corpus complet)

| Escenari | Vector stores | Límit OpenAI | Cost emmagatzematge |
|---|---|---|---|
| MVP (7 MDs) | 7 | 10.000 | ~0,02 $/mes |
| Producció (84 MDs) | 84 | 10.000 | ~0,07 $/mes |
| Futur (200+ MDs) | 200+ | 10.000 | ~0,20 $/mes |

---

## 16. Casos de test per validar el MVP

### Test 1: Nouvingut A1 — Text científic
- **Input**: Text de biologia ESO sobre fotosíntesi (~200 paraules)
- **Característiques**: Nouvingut (L1=àrab, MECR=A1, alfabet=no)
- **Esperat**: DUA=Core, LF=3, MECR=A1. Frases de 5-8 paraules, glossari amb traducció àrab, definicions integrades
- **Valida**: routing a vs_nouvingut + vs_acollida + vs_lf + vs_dua

### Test 2: Dislèxia — Text humanístic
- **Input**: Text d'història ESO sobre la revolució francesa (~200 paraules)
- **Característiques**: Dislèxia
- **Esperat**: DUA=Core, LF=3, MECR=B2. Text estructurat, frases curtes, esquema visual
- **Valida**: routing a vs_dislexia + vs_lf + vs_dua

### Test 3: TEA nivell 2 — Text amb metàfores
- **Input**: Text de llengua amb expressions figurades (~150 paraules)
- **Característiques**: TEA (nivell suport=2)
- **Esperat**: DUA=Core, LF=4, MECR=B2. Inferències explícites, estructura predictible
- **Valida**: routing a vs_tea + vs_lf + vs_dua

### Test 4: Altes capacitats — Text senzill
- **Input**: Text de ciències simplificat per primària (~150 paraules)
- **Característiques**: Altes capacitats (doble_excepcionalitat=No)
- **Esperat**: DUA=Enriquiment, LF=1, MECR=B2. Text enriquit amb connexions, repte cognitiu
- **Valida**: routing a vs_altes_cap + vs_lf + vs_dua (direcció oposada: enriquir)

### Test 5: Combinació Nouvingut + Dislèxia
- **Input**: Text de biologia ESO (~200 paraules)
- **Característiques**: Nouvingut (L1=urdú, MECR=A2) + Dislèxia
- **Esperat**: DUA=Core, LF=3 (max de 2 i 3), MECR=A2. Doble suport: visual + lingüístic
- **Valida**: routing múltiple (4 VS de M1 + 2 obligatoris), regla de creuament

### Test 6: TEA nivell 3 (extrem)
- **Input**: Qualsevol text
- **Característiques**: TEA (nivell suport=3)
- **Esperat**: DUA=Accés, LF=5 (màxima). Text ultra-simplificat, pictogrames, bastides
- **Valida**: activació Accés automàtica

---

## 17. Estimació de costos

| Servei | Detall | Cost estimat/mes |
|---|---|---|
| Servidor PHP | Ja existent | 0 EUR |
| OpenAI — Vector Stores | 7 VS × ~3 MB = ~0,02 $/dia | ~0,60 EUR |
| OpenAI — gpt-4.1-mini | ~100 adaptacions/mes × ~4K tokens | ~2-5 EUR |
| **Total MVP** | | **~3-6 EUR/mes** |

### Projecció a escala (800 docents)

```
800 docents × 20% actius = 160 usuaris regulars
160 × 3 adaptacions/setmana = ~2.000 adaptacions/mes

Cost per adaptació:
  VS search (5 crides):     ~0,001 $
  LLM gpt-4.1-mini (6K tok): ~0,005 $
  Total per adaptació:        ~0,006 $
```

| Servei | Detall | Cost estimat/mes |
|---|---|---|
| Servidor PHP | Ja existent | 0 EUR |
| OpenAI — Vector Stores | 7 VS × ~3 MB | ~0,60 EUR |
| OpenAI — gpt-4.1-mini | 2.000 adapt. × ~6K tokens | ~12 EUR |
| **Total 800 docents** | | **~13 EUR/mes** |

### Comparativa amb alternatives

| | OpenAI VS (actual) | Azure AI Search | Supabase pgvector |
|---|---|---|---|
| Infra search | 0,60 EUR/mes | 65 EUR/mes | 0 EUR (free tier) o 25 EUR (Pro) |
| Infra servidor | 0 EUR (ja existent) | 12 EUR/mes | 0 EUR (ja existent) |
| LLM | 12 EUR/mes (gpt-4.1-mini) | 12 EUR/mes (GPT-4o-mini) | 12 EUR/mes (gpt-4.1-mini) |
| Chunking/Embeddings | Automàtic (OpenAI) | Manual (PHP) | Manual (PHP) |
| **Total 800 docents** | **~13 EUR/mes** | **~89 EUR/mes** | **~12-37 EUR/mes** |
| **Complexitat setup** | Baixa | Alta | Mitjana |

### Pla B: Supabase pgvector

Si en algun moment cal migrar fora d'OpenAI Vector Stores, Supabase és l'alternativa natural:
- El prototip ATNE actual ja funciona amb Supabase + pgvector
- S'ha verificat que els preus són assumibles
- L'abstracció `CorpusSearchInterface` (secció 11) permet canviar amb 1 fitxer
- Requereix implementar chunking + embedding manualment (script existent a mineriaRAG)

---

## 18. Checklist d'implementació

- [ ] Preparar els 7 documents MD del corpus (copiar de mineriaRAG)
- [ ] Executar `create_vector_stores.php` per crear els 7 VS a OpenAI
- [ ] Verificar cada VS amb una cerca de prova
- [ ] Guardar els IDs dels VS al `.env`
- [ ] Implementar `GET /api/health`
- [ ] Implementar `POST /api/propose` (lògica PHP pura, sense cridar OpenAI)
- [ ] Implementar `POST /api/adapt` (pipeline: routing → search VS → prompt → LLM)
- [ ] Implementar frontend (4 passos)
- [ ] Executar els 6 casos de test
- [ ] Validar amb docents reals (2-3 textos reals per característiques)

---

## Apèndix A: Correspondència amb el sistema actual

| Component actual (Python) | Equivalent MVP (PHP) |
|---|---|
| `server.py:propose_adaptation()` | `ProposalEngine.php` |
| `server.py:build_system_prompt()` | `PromptBuilder.php` |
| `server.py:run_adaptation()` | `AdaptPipeline.php` |
| `server.py:vector_search()` | `OpenAIClient.php::searchVectorStore()` |
| `server.py:combined_search()` | `OpenAIClient.php::searchMultipleVS()` (sense KG) |
| `server.py:get_mandatory_docs()` | Constants `MANDATORY_VS` + `CHAR_TO_VS` |
| `server.py:embed_query()` | No cal (OpenAI ho gestiona) |
| Supabase `match_rag_fje` | OpenAI vector_stores/{id}/search |
| Gemini `generate_content` | OpenAI Responses API (`/v1/responses`) |
| `ui/app.js` (910 línies) | `public/js/app.js` (~400 línies, simplificat) |

## Apèndix B: Diferències clau respecte al sistema actual

| Aspecte | Sistema actual | MVP OpenAI |
|---|---|---|
| Característiques | 12 | 4 (nouvingut, dislèxia, TEA, altes cap.) |
| Complements | 12 | 4 (glossari, definicions, esquema, bastides) |
| Knowledge Graph | Sí (952 nodes, 2294 arestes) | No (fora d'abast) |
| Cerca | Vector + KG fusió (Supabase) | Vector stores OpenAI amb routing |
| Chunking + Embeddings | Manual (Python) | Automàtic (OpenAI) |
| Perfils persistents | Sí (localStorage + servidor) | No (sessió única) |
| Historial + feedback | Sí (Supabase) | No (fora d'abast) |
| Exportació | PDF + DOCX + TXT | No (fora d'abast) |
| Streaming SSE | Sí | Opcional (resposta directa suficient) |

## Apèndix C: Flux manual vs. automatitzat

L'ATNE MVP **automatitza** un procés que es pot fer manualment en 4 passos:

| Pas manual | Equivalent ATNE (automàtic) |
|---|---|
| Triar quins VS consultar | **Routing automàtic** per característica |
| Cercar i filtrar chunks per score | **Filtratge automàtic** (score ≥ 0.40) |
| Muntar el context i enviar al LLM | **System prompt dinàmic** amb context RAG |
| Llegir i formatar la resposta | **Frontend** amb visualització estructurada |
