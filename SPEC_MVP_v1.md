# ATNE MVP v1 — Especificació tècnica (sense RAG)

**Versió**: 1.0
**Data**: 2026-03-25
**Origen**: Migració del prototip ATNE (Python/Gemini/Supabase) a stack institucional
**Destinatari**: Equip tècnic

---

## 1. Objectiu

Prova pilot d'un sistema d'adaptació de textos educatius **sense RAG ni KG**.
El coneixement pedagògic va directament als fitxers de prompt (editables sense tocar codi).

- **4 característiques d'alumnat**: nouvingut, dislèxia, TEA, altes capacitats
- **3 variables d'adaptació**: nivell DUA, intensitat lectura fàcil, nivell MECR
- **4 complements**: glossari, definicions integrades, esquema visual, bastides
- **System prompt dinàmic** per capes que s'activen segons la selecció
- Demostra que el flux funciona i que l'LLM genera adaptacions útils amb només prompt engineering

**NO inclou** (fora d'abast v1): RAG (vector stores), Knowledge Graph, perfils persistents, historial amb feedback, exportació PDF/DOCX.

**Roadmap**:
- **v1** (actual): system prompt dinàmic, sense RAG
- **v2**: afegir RAG amb OpenAI Vector Stores (1 VS per MD del corpus)

---

## 2. Stack tecnològic

| Component | Tecnologia | Detall |
|---|---|---|
| Servidor | Azure Web App | PHP 8.2+ amb Slim4 |
| LLM | OpenAI API | gpt-4.1-mini (Responses API) |
| Base de dades | MS SQL Server | Logging d'adaptacions |
| Frontend | HTML + JavaScript + CSS | Sense frameworks |
| Configuració | .env | API key OpenAI, connexió MS SQL |

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
                       │ fetch (AJAX)
                       ▼
┌─────────────────────────────────────────────────────┐
│  BACKEND PHP (Slim4)                                 │
│                                                       │
│  POST /api/propose  → Calcula paràmetres (PHP pur)  │
│  POST /api/adapt    → Prompt dinàmic → OpenAI        │
│  GET  /api/health   → Verifica connectivitat         │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Proposal     │  │ Prompt       │  │ OpenAI    │ │
│  │ Engine       │  │ Builder      │  │ Client    │ │
│  │ (PHP pur)    │  │ (capes des   │  │ (Responses│ │
│  │              │  │  de fitxers) │  │  API)     │ │
│  └──────────────┘  └──────┬───────┘  └───────────┘ │
│                           │                          │
│                    ┌──────┴───────┐                  │
│                    │ prompts/     │                  │
│                    │ base.txt     │                  │
│                    │ char_*.txt   │                  │
│                    │ creuaments   │                  │
│                    │ format.txt   │                  │
│                    └──────────────┘                  │
│                                                       │
│  ┌──────────────┐                                    │
│  │ MS SQL       │ ← Log: text, params, resultat     │
│  └──────────────┘                                    │
└─────────────────────────────────────────────────────┘
```

**Clau**: a la v1, **no hi ha vector stores ni embedding**. Tot el coneixement pedagògic va als fitxers `prompts/*.txt`, que són editables sense tocar codi PHP.

---

## 4. Definició de les 4 característiques

### 4.1. Nouvingut (contextual)

Alumnat d'incorporació tardana amb L1 diferent del català.

**Sub-variables:**

| ID | Etiqueta | Tipus | Opcions |
|---|---|---|---|
| `L1` | Llengua materna | text | Lliure (ex: àrab, urdú, xinès) |
| `alfabet_llati` | Alfabet llatí | select | Sí / No |
| `escolaritzacio_previa` | Escolarització prèvia | select | si / parcial / no |
| `mecr` | Nivell català (MECR) | select | pre-A1 / A1 / A2 / B1 / B2 |

### 4.2. Dislèxia (constitutiva)

Dificultat específica de lectura. Afecta precisió, velocitat i comprensió lectora.

**Sub-variables:** Cap (activació binària).

### 4.3. TEA (constitutiva)

Trastorn de l'Espectre Autista. Afecta comunicació social, literalitat, tolerància a l'ambigüitat.

**Sub-variables:**

| ID | Etiqueta | Tipus | Opcions |
|---|---|---|---|
| `nivell_suport` | Nivell de suport (DSM-5) | select | 1 / 2 / 3 |

### 4.4. Altes capacitats (constitutiva)

Alumnat amb capacitat intel·lectual superior. Necessita repte cognitiu, no simplificació.

**Sub-variables:**

| ID | Etiqueta | Tipus | Opcions |
|---|---|---|---|
| `doble_excepcionalitat` | Doble excepcionalitat | select | No / Sí |

---

## 5. Les 3 variables d'adaptació

### 5.1. Nivell DUA (Accés / Core / Enriquiment)

| Nivell | Descripció | Quan s'aplica |
|---|---|---|
| **Accés** | LF extrema, suport visual màxim, vocabulari molt bàsic | TEA nivell 3, Nouvingut pre-A1 sense alfabet llatí |
| **Core** | Adaptació estàndard mantenint rigor curricular | Dislèxia, TEA nivell 1-2, Nouvingut A1+ |
| **Enriquiment** | Complexitat mantinguda + repte cognitiu + connexions interdisciplinars | Altes capacitats (sense doble excepcionalitat) |

### 5.2. Intensitat Lectura Fàcil (1-5)

| Valor | Significat | Qui ho activa |
|---|---|---|
| 1 | Mínima (estructura i claredat) | Altes capacitats |
| 2 | Baixa (defecte) | Genèric |
| 3 | Moderada (frases curtes, vocab freqüent) | Dislèxia, nouvingut A2 |
| 4 | Alta (molt simplificat) | Nouvingut pre-A1/A1, TEA nivell 2 |
| 5 | Màxima (3-5 paraules/frase) | TEA nivell 3 |

**Regla**: si múltiples característiques, s'agafa el **màxim**.

### 5.3. Nivell MECR de sortida (pre-A1 a B2)

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

## 6. Lògica de proposta automàtica (`propose_adaptation`)

Quan l'usuari selecciona característiques, el sistema **proposa automàticament** els valors de les 3 variables i els complements. El docent pot modificar-los.

```php
function proposeAdaptation(array $chars, array $context): array
{
    $actives = array_keys(array_filter($chars, fn($v) => $v['actiu'] ?? false));

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

## 7. Pipeline d'adaptació (`/api/adapt`)

### Flux complet (v1, sense RAG)

```
1. Rebre: text + característiques + variables + complements + context
2. Prompt Builder: construir system prompt dinàmic per capes (fitxers .txt)
3. LLM: cridar gpt-4.1-mini amb Responses API
4. Log: guardar a MS SQL (input, params, output, tokens)
5. Resposta: retornar text adaptat + complements
```

### Pas 2: Prompt Builder (la clau de la v1)

```php
function buildSystemPrompt(
    array $chars,
    array $params,
    array $context
): string {
    $promptsDir = __DIR__ . '/../prompts';

    // CAPA 1: Base (sempre)
    $parts = [file_get_contents("$promptsDir/base.txt")];

    // CAPA 2: Regles per característica activa
    $actives = array_keys(array_filter($chars, fn($v) => $v['actiu'] ?? false));
    foreach ($actives as $char) {
        $file = "$promptsDir/char_{$char}.txt";
        if (file_exists($file)) {
            $parts[] = file_get_contents($file);
        }
    }

    // CAPA 3: Regles de creuament (si >1 característica)
    if (count($actives) > 1) {
        $parts[] = file_get_contents("$promptsDir/creuaments.txt");
    }

    // CAPA 4: Context educatiu
    $parts[] = "CONTEXT EDUCATIU:
- Etapa: {$context['etapa']}
- Matèria: {$context['materia']}";

    // CAPA 5: Perfil alumne
    $activeDescs = [];
    $l1 = '';
    foreach ($chars as $key => $val) {
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

    // CAPA 6: Paràmetres d'adaptació
    $duaDescs = [
        'Acces' => 'LF extrema, suport visual màxim, vocabulari molt bàsic',
        'Core' => 'Adaptació estàndard mantenint rigor curricular',
        'Enriquiment' => 'Repte cognitiu, connexions interdisciplinars',
    ];
    $parts[] = "PARÀMETRES D'ADAPTACIÓ:
- Nivell DUA: {$params['dua']} — {$duaDescs[$params['dua']]}
- Intensitat Lectura Fàcil: {$params['lf']}/5
- Nivell MECR sortida: {$params['mecr_sortida']}";

    // CAPA 7: Complements a generar
    $compActius = array_keys(array_filter($params['complements']));
    $parts[] = "COMPLEMENTS A GENERAR:\n" .
        implode("\n", array_map(fn($c) => "- $c", $compActius));

    // CAPA 8: Format de sortida
    $parts[] = file_get_contents("$promptsDir/format_sortida.txt");

    return implode("\n\n", $parts);
}
```

### Pas 3: Crida al LLM

```php
function callLLM(string $systemPrompt, string $userText): array
{
    $response = httpPost('https://api.openai.com/v1/responses', [
        'model' => getenv('OPENAI_MODEL') ?: 'gpt-4.1-mini',
        'input' => [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user',   'content' => "TEXT ORIGINAL A ADAPTAR:\n\n" . $userText],
        ],
    ], headers: [
        'Authorization: Bearer ' . getenv('OPENAI_API_KEY'),
        'Content-Type: application/json',
    ]);

    $text = '';
    foreach ($response['output'] as $item) {
        if ($item['type'] === 'message') {
            foreach ($item['content'] as $c) {
                if ($c['type'] === 'text') $text .= $c['text'];
            }
        }
    }

    return [
        'text'   => $text,
        'usage'  => $response['usage'] ?? [],
    ];
}
```

---

## 8. Fitxers de prompt (el coneixement pedagògic)

Cada fitxer conté instruccions destil·lades dels MDs del corpus. Són editables per pedagogs sense tocar codi.

### 8.1. `prompts/base.txt` — Regles universals

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
- Puntuació: punts i dos punts. Evitar punt i coma i punts suspensius.

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

CÀRREGA COGNITIVA:
- Màxim 2 conceptes nous/paràgraf a pre-A1/A1/A2
- Màxim 3 conceptes nous/paràgraf a B1
```

### 8.2. `prompts/char_nouvingut.txt`

```
PERFIL: ALUMNAT NOUVINGUT

Context: L'alumnat nouvingut s'incorpora al sistema educatiu des d'un altre país,
amb una L1 diferent del català i un procés d'adquisició lingüística en curs.

REGLES D'ADAPTACIÓ:
- La simplificació lingüística és PRIORITÀRIA sobre el rigor terminològic
  quan el MECR és pre-A1 o A1
- Terme tècnic en negreta + definició en 3-4 paraules
- Si L1 coneguda: glossari bilingüe (terme en català + traducció real a la L1,
  en alfabet original si escau)
- Si alfabet no llatí: suport visual reforçat, tipografia més gran, menys text per pàgina
- Si escolarització prèvia parcial o nul·la: bastides cognitives bàsiques,
  no només lingüístiques. Exemples concrets quotidians.
- Evitar metàfores culturalment específiques
- Connectar amb experiències universals (família, natura, cos humà)

BARRERA PRINCIPAL: lingüística. L'alumne pot tenir una capacitat cognitiva alta
que queda oculta per la barrera de la llengua. MAI confondre dificultat lingüística
amb dificultat intel·lectual.

FORTALESES A APROFITAR:
- Plurilingüisme (la L1 és un recurs, no un obstacle)
- Resiliència i capacitat d'adaptació
- Noves perspectives culturals
```

### 8.3. `prompts/char_dislexia.txt`

```
PERFIL: ALUMNAT AMB DISLÈXIA

Context: La dislèxia és una dificultat específica de lectura d'origen neurobiològic.
Afecta la precisió, velocitat i fluïdesa lectora. NO és un problema d'intel·ligència.

REGLES D'ADAPTACIÓ:
- Frases curtes i estructura sintàctica simple (SVO: subjecte-verb-complement)
- Evitar subordinades encadenades
- Vocabulari freqüent; termes tècnics en negreta amb definició al costat
- Una idea per frase, una frase per línia
- Evitar textos densos: espai blanc generós entre paràgrafs
- Estructura visual clara: títols, subtítols, llistes, numeració
- Evitar exercicis de còpia o lectura extensiva
- Oferir canal oral/visual com a complement al text escrit

FORMAT VISUAL:
- Paràgrafs curts (3-4 línies màxim)
- Suport visual per a cada concepte clau (esquema, diagrama)
- Negreta per termes clau (guia l'ull, redueix l'esforç de descodificació)

BARRERA PRINCIPAL: el processament fonològic i la descodificació lectora.
La fatiga lectora s'acumula ràpidament.

FORTALESES:
- Pensament visual i espacial sovint superior
- Creativitat i resolució de problemes per vies no convencionals
- Capacitat cognitiva intacta — adaptar el format, no el contingut
```

### 8.4. `prompts/char_tea.txt`

```
PERFIL: ALUMNAT AMB TEA (Trastorn de l'Espectre Autista)

Context: El TEA afecta la comunicació social, els patrons de comportament i el
processament de la informació. L'espectre és molt ampli (nivell 1 a 3 DSM-5).

REGLES D'ADAPTACIÓ:
- Estructura predictible i fixa: sempre el mateix format, mateixa seqüència
- Instruccions molt clares, literals i explícites
- Evitar TOTA ambigüitat: mai "una mica", "de vegades", "podria ser"
- Evitar metàfores, ironia, doble sentit i llenguatge figurat
- Si el text original té metàfores: explicitar-les literalment
  ("Plovia a bots i barrals" → "Plovia molt fort")
- Una instrucció per frase. No agrupar instruccions.
- Anticipar cada secció: "Ara llegiràs sobre X. Després contestaràs Y."

PER NIVELL DE SUPORT:
- Nivell 1: estructura clara + literalitat + evitar ambigüitat
- Nivell 2: tot l'anterior + frases molt curtes + suport visual obligatori
- Nivell 3: tot l'anterior + LF extrema (3-5 paraules/frase) +
  pictogrames + descompondre cada tasca en passos mínims

BARRERA PRINCIPAL: comunicació social, literalitat, tolerància a l'ambigüitat.
Dificultat per inferir, deduir o llegir entre línies.

FORTALESES:
- Memòria mecànica excel·lent (dades, seqüències, patrons)
- Atenció al detall superior
- Integració visoespacial
- Interessos profunds que poden ser motor d'aprenentatge
- Pensament sistemàtic i lògic
```

### 8.5. `prompts/char_altes_capacitats.txt`

```
PERFIL: ALUMNAT AMB ALTES CAPACITATS

Context: Alumnat amb capacitat cognitiva superior. NO necessita simplificació:
necessita REPTE, profunditat i connexions interdisciplinars.
La direcció és ENRIQUIR, no simplificar.

REGLES D'ADAPTACIÓ:
- NO simplificar el vocabulari ni les frases
- NO eliminar complexitat — AFEGIR-NE
- Mantenir tots els termes tècnics amb la seva riquesa
- Afegir connexions interdisciplinars explícites:
  "Aquesta reacció química també explica per què el cel és blau"
- Afegir preguntes de pensament crític:
  "Què passaria si les plantes no fessin fotosíntesi?"
- Proposar extensions i aprofundiments
- Evitar repetició i redundància (provoca desconnexió per avorriment)

SI DOBLE EXCEPCIONALITAT (AC + altra condició):
- Mantenir el repte cognitiu ALT
- PERÒ adaptar el FORMAT a la condició associada
  (ex: AC + dislèxia = contingut complex però format visual/oral;
   AC + TEA = repte dins estructura predictible i literal)

BARRERA PRINCIPAL: avorriment per falta de repte. L'alumne es desconnecta
si el text és massa simple o repetitiu.

FORTALESES:
- Raonament abstracte, agilitat mental, creativitat
- Motivació intrínseca per temes que els interessen
- Pensament crític i autocrític
- Capacitat de treball independent
```

### 8.6. `prompts/creuaments.txt` — Regles de combinació

```
REGLES DE CREUAMENT (quan hi ha >1 característica activa):

Les necessitats NO són la suma de condicions individuals. Les condicions
interactuen i generen necessitats que cap de les dues aïlladament no produiria.

NOUVINGUT + DISLÈXIA:
- La fatiga lectora s'amplifica (dislèxia) + la L2 sobrecarrega el processament
- Reduir densitat visual: menys text per pàgina, més espai blanc
- Frases molt curtes (5-8 paraules com a A1, no com a opció sinó com a necessitat)
- El glossari ha de ser visual/oral, no només textual
- No dependre de lectura autònoma: canal oral com a suport principal
- Suport visual fort: esquemes, pictogrames, diagrames

NOUVINGUT + TEA:
- Doble barrera: lingüística + comunicació social
- Estructura molt rígida i predictible + llengua molt simplificada
- Instruccions literals I lingüísticament simples
- El suport visual serveix dues funcions: guia l'estructura (TEA) + supleix la llengua (nouvingut)

DISLÈXIA + TEA:
- Format visual i estructura predictible obligatoris
- Frases curtes + literals + sense ambigüitat
- Suport visual doble funció: guia descodificació (dislèxia) + explicita estructura (TEA)

ALTES CAPACITATS + QUALSEVOL ALTRA:
- Mantenir SEMPRE el repte cognitiu
- Adaptar el FORMAT, no el CONTINGUT
- AC + nouvingut: contingut ric, llengua simplificada + glossari complet
- AC + dislèxia: contingut complex, format visual/oral accessible
- AC + TEA: repte dins estructura predictible i literal

REGLA GENERAL DE CONFLICTE:
- Si dues condicions demanen direccions oposades (simplificar vs enriquir),
  PRIORITZAR l'accessibilitat (que l'alumne pugui accedir al text)
  i DESPRÉS afegir repte dins del format accessible.
- La intensitat LF es calcula com el MÀXIM de les intensitats individuals.
```

### 8.7. `prompts/format_sortida.txt`

```
FORMAT DE SORTIDA — Genera TOTES les seccions indicades.

## Text adaptat
[SEMPRE] Text complet adaptat. Termes en **negreta** amb definició entre parèntesis.

## Glossari
[SI ACTIU] Taula markdown:
| Terme | Traducció ({L1}) | Explicació simple |
Mínim 8-12 termes. Traducció real a la L1 (alfabet original si escau).
Si no hi ha L1, ometre la columna de traducció.

## Definicions integrades
[SI ACTIU] Ja integrades al text (entre parèntesis). No generar secció separada.

## Esquema visual
[SI ACTIU] Diagrama en format text amb fletxes i símbols:
```
ELEMENT A
  ↓
+ ELEMENT B
  ↓
RESULTAT → PRODUCTE 1 + PRODUCTE 2
```

## Bastides (scaffolding)
[SI ACTIU] 4 blocs:
### Frases model — 3-5 frases incompletes a completar
### Banc de paraules — 8-12 paraules clau
### Suport visual — indicacions de suports (icones, colors)
### Suport L1 — pistes en la L1 per conceptes abstractes (si nouvingut actiu)

## Argumentació pedagògica
[SEMPRE] Justificació de les decisions d'adaptació. 3-5 punts breus.

## Notes d'auditoria
[SEMPRE] Taula comparativa:
| Aspecte | Original | Adaptat | Motiu |
Màxim 5-6 files.
```

---

## 9. Endpoints API

### `GET /api/health`

Verifica connectivitat amb OpenAI i MS SQL.

**Resposta:**
```json
{ "ok": true, "openai": true, "database": true }
```

### `POST /api/propose`

Calcula paràmetres d'adaptació automàtics. **Només lògica PHP, no crida a OpenAI.**

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

Pipeline complet: construir prompt dinàmic + cridar LLM.

**Request:**
```json
{
  "text": "La fotosíntesi és el procés pel qual les plantes...",
  "caracteristiques": {
    "nouvingut": { "actiu": true, "L1": "àrab", "mecr": "A1", "alfabet_llati": false },
    "dislexia": { "actiu": true },
    "tea": { "actiu": false },
    "altes_capacitats": { "actiu": false }
  },
  "context": { "etapa": "ESO", "materia": "Biologia" },
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
  "adapted": "## Text adaptat\n\nLes **plantes** fan el seu menjar...",
  "tokens_used": { "input": 1850, "output": 2340 }
}
```

---

## 10. Logging a MS SQL

### Taula `adaptation_log`

```sql
CREATE TABLE adaptation_log (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    created_at      DATETIME2 DEFAULT GETDATE(),
    -- Input
    text_original   NVARCHAR(MAX),
    chars_json      NVARCHAR(MAX),    -- JSON de les característiques
    context_json    NVARCHAR(MAX),    -- JSON del context educatiu
    params_json     NVARCHAR(MAX),    -- JSON dels paràmetres (DUA, LF, MECR)
    -- Output
    text_adapted    NVARCHAR(MAX),
    tokens_input    INT,
    tokens_output   INT,
    model           NVARCHAR(100),
    -- Metadata
    duration_ms     INT,
    ip_address      NVARCHAR(45)
);
```

Cada adaptació es guarda automàticament. Serveix per:
- Mesurar l'ús real
- Analitzar quines combinacions de característiques es demanen més
- Comparar qualitat entre versions del prompt
- Base per a un futur sistema de feedback docent

---

## 11. Estructura de fitxers

```
atne-mvp/
├── public/
│   ├── index.php              ← Entry point Slim4
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js             ← Lògica frontend (~400 línies)
├── src/
│   ├── Config.php             ← .env + constants
│   ├── Routes.php             ← GET /health, POST /propose, POST /adapt
│   ├── ProposalEngine.php     ← Lògica propose_adaptation (PHP pur)
│   ├── PromptBuilder.php      ← Munta system prompt dinàmic per capes
│   ├── OpenAIClient.php       ← Crida Responses API
│   └── AdaptLogger.php        ← Guarda a MS SQL
├── prompts/                   ← EDITABLES SENSE TOCAR CODI
│   ├── base.txt               ← Regles universals
│   ├── char_nouvingut.txt     ← Regles nouvingut
│   ├── char_dislexia.txt      ← Regles dislèxia
│   ├── char_tea.txt           ← Regles TEA
│   ├── char_altes_capacitats.txt  ← Regles altes capacitats
│   ├── creuaments.txt         ← Regles combinació >1 característica
│   └── format_sortida.txt     ← Instruccions format de resposta
├── .env
├── composer.json
└── web.config                 ← Configuració Azure Web App (IIS)
```

### `.env`

```
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4.1-mini

DB_HOST=xxx.database.windows.net
DB_NAME=atne
DB_USER=atne_app
DB_PASS=...
```

---

## 12. Frontend — Interfície simplificada

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
│  [← Enrere]  [Següent →]                         │
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
│  [← Enrere]  [ADAPTAR]                           │
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
│  ► Notes d'auditoria                             │
│                                                   │
│  [Nova adaptació]                                 │
└─────────────────────────────────────────────────┘
```

---

## 13. Casos de test

### Test 1: Nouvingut A1 — Text científic
- **Input**: Text de biologia ESO sobre fotosíntesi (~200 paraules)
- **Característiques**: Nouvingut (L1=àrab, MECR=A1, alfabet=no)
- **Esperat**: DUA=Core, LF=3, MECR=A1. Frases de 5-8 paraules, glossari amb traducció àrab
- **Valida**: prompt char_nouvingut.txt s'activa, regles MECR A1 aplicades

### Test 2: Dislèxia — Text humanístic
- **Input**: Text d'història ESO sobre la revolució francesa (~200 paraules)
- **Característiques**: Dislèxia
- **Esperat**: DUA=Core, LF=3, MECR=B2. Text estructurat, frases curtes, esquema visual
- **Valida**: prompt char_dislexia.txt s'activa, format visual aplicat

### Test 3: TEA nivell 2 — Text amb metàfores
- **Input**: Text de llengua amb expressions figurades (~150 paraules)
- **Característiques**: TEA (nivell suport=2)
- **Esperat**: DUA=Core, LF=4, MECR=B2. Metàfores explicitades, estructura fixa
- **Valida**: prompt char_tea.txt s'activa, literalitat aplicada

### Test 4: Altes capacitats — Text senzill
- **Input**: Text de ciències simplificat per primària (~150 paraules)
- **Característiques**: Altes capacitats (doble_excepcionalitat=No)
- **Esperat**: DUA=Enriquiment, LF=1, MECR=B2. Text enriquit, connexions, repte
- **Valida**: prompt char_altes_capacitats.txt s'activa, direcció oposada (enriquir)

### Test 5: Combinació Nouvingut + Dislèxia
- **Input**: Text de biologia ESO (~200 paraules)
- **Característiques**: Nouvingut (L1=urdú, MECR=A2) + Dislèxia
- **Esperat**: DUA=Core, LF=3, MECR=A2. Doble suport visual + lingüístic
- **Valida**: creuaments.txt s'activa, regles de combinació aplicades

### Test 6: TEA nivell 3 (extrem)
- **Input**: Qualsevol text
- **Característiques**: TEA (nivell suport=3)
- **Esperat**: DUA=Accés, LF=5. Text ultra-simplificat, passos mínims
- **Valida**: activació Accés automàtica, LF màxima

---

## 14. Estimació de costos

| Servei | Detall | Cost estimat/mes |
|---|---|---|
| Azure Web App | Ja existent | 0 EUR |
| MS SQL | Ja existent | 0 EUR |
| OpenAI — gpt-4.1-mini | ~100 adaptacions/mes (pilot) × ~6K tokens | ~2-5 EUR |
| **Total MVP** | | **~2-5 EUR/mes** |

### Projecció a escala (800 docents)

```
800 docents × 20% actius = 160 usuaris regulars
160 × 3 adaptacions/setmana = ~2.000 adaptacions/mes

Cost per adaptació:
  LLM gpt-4.1-mini (6K tokens):  ~0,005 $
  Total per adaptació:             ~0,005 $
```

| Servei | Detall | Cost estimat/mes |
|---|---|---|
| Azure Web App | Ja existent | 0 EUR |
| MS SQL | Ja existent | 0 EUR |
| OpenAI — gpt-4.1-mini | 2.000 adaptacions × ~6K tokens | ~10 EUR |
| **Total 800 docents** | | **~10 EUR/mes** |

**Nota**: la v1 és **més barata** que la v2 amb RAG perquè no hi ha cost de vector stores ni d'embedding queries.

---

## 15. Com escala l'arquitectura

Afegir una nova característica (ex: TDAH) requereix **3 passos**:

### 1. Crear el fitxer de prompt
```
prompts/char_tdah.txt ← Escriu les regles d'adaptació per TDAH
```

### 2. Afegir la UI
```javascript
// A CHARACTERISTICS
tdah: { label: "TDAH", subvars: [] }
```

### 3. Actualitzar les regles de proposta (si cal sub-variables)
```php
if (in_array('tdah', $actives)) {
    $lfFactors[] = 2;
}
```

**Cap canvi al pipeline central, al prompt builder, ni a l'OpenAI Client.**
El PromptBuilder detecta automàticament que existeix `prompts/char_tdah.txt` i el carrega.

---

## 16. Roadmap cap a v2 (RAG)

Quan la v1 estigui validada, afegir RAG és **una sola capa addicional** al prompt:

```
v1:  base + char_X.txt + creuaments + params + context + format
v2:  base + char_X.txt + creuaments + params + context + CHUNKS_RAG + format
                                                         ↑
                                              S'insereix aquí
```

Canvis necessaris per a v2:
1. Crear vector stores a OpenAI (script `create_vector_stores.php`)
2. Afegir `OpenAISearch.php` (cerca als VS)
3. Inserir una capa `RAG_CONTEXT` al `PromptBuilder.php`
4. Afegir routing `CHAR_TO_VS` al `Config.php`

**Tot l'altre (frontend, propose, format, logging) queda idèntic.**

---

## 17. Checklist d'implementació

- [ ] Configurar Azure Web App amb PHP 8.2 + Slim4
- [ ] Configurar accés a MS SQL (taula `adaptation_log`)
- [ ] Configurar API key OpenAI al `.env`
- [ ] Crear els 7 fitxers de prompt (`prompts/`)
- [ ] Implementar `GET /api/health`
- [ ] Implementar `POST /api/propose` (lògica PHP pura)
- [ ] Implementar `POST /api/adapt` (prompt builder + OpenAI)
- [ ] Implementar frontend (4 passos)
- [ ] Executar els 6 casos de test
- [ ] Validar amb docents reals (2-3 textos reals per característica)

---

## Apèndix A: Correspondència amb el sistema actual

| Component actual (Python) | Equivalent v1 (PHP) |
|---|---|
| `server.py:propose_adaptation()` | `ProposalEngine.php` |
| `server.py:build_system_prompt()` | `PromptBuilder.php` (des de fitxers .txt) |
| `server.py:run_adaptation()` | `Routes.php` → `PromptBuilder` → `OpenAIClient` |
| `server.py:vector_search()` | **No aplica (v1 sense RAG)** |
| `server.py:combined_search()` | **No aplica (v1 sense RAG)** |
| `server.py:get_mandatory_docs()` | Fitxers `base.txt` + `creuaments.txt` (sempre carregats) |
| Gemini `generate_content` | OpenAI Responses API (`/v1/responses`) |
| `ui/app.js` (910 línies) | `public/js/app.js` (~400 línies, simplificat) |

## Apèndix B: Diferències v1 vs sistema actual vs v2 futura

| Aspecte | Sistema actual | v1 (sense RAG) | v2 futura (amb RAG) |
|---|---|---|---|
| Característiques | 12 | 4 | 4+ (escalable) |
| Complements | 12 | 4 | 4+ |
| Knowledge Graph | Sí | No | No (pendent) |
| Cerca vectorial | Supabase pgvector | **No** | OpenAI Vector Stores |
| Coneixement pedagògic | RAG chunks | **Fitxers .txt al prompt** | RAG chunks + fitxers .txt |
| Perfils persistents | Sí | No | Futur |
| Historial + feedback | Sí | Log MS SQL (sense feedback) | Futur |
| Exportació | PDF + DOCX + TXT | No | Futur |
| Streaming SSE | Sí | No (resposta directa) | Opcional |
| **Stack** | Python + Gemini + Supabase | **PHP Slim4 + OpenAI + MS SQL** | PHP Slim4 + OpenAI + VS + MS SQL |
