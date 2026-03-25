# Notes d'aprenentatge: RAG i Knowledge Graph
> Documentació del projecte ATNE — Jesuïtes Educació  
> Generat en sessió d'aprenentatge amb Claude · Març 2025

---

## 1. RAG clàssic

### Funcionament bàsic
1. Els documents es trossegen en **chunks** (fragments de text)
2. Cada chunk es **vectoritza** (converteix en vector numèric d'embeddings)
3. Els vectors es guarden en una **base vectorial** (ex: Supabase, Pinecone, ChromaDB)
4. Quan arriba una consulta, es vectoritza i es cerca per similitud

### Tipus de cerca
- **Semàntica** — similitud de vectors/embeddings (captura significat)
- **Sparse retrieval** (BM25, TF-IDF) — paraules clau exactes
- **Híbrida** — combina les dues anteriors (millors resultats en general)
- **Reranking** — pas posterior per reordenar chunks amb un model més precís (cross-encoder)

### Limitació clau
La informació relacionada pot estar **dispersa en chunks diferents** i mai es troba junta en una sola cerca.

---

## 2. Knowledge Graph (KG)

### Diferència fonamental amb RAG
En comptes de chunks, extreu **entitats** (nodes) i **relacions** entre elles. Ha transcendit els documents originals — un cop construït el graf, els documents ja no importen. **Només importen les relacions.**

### Estructura bàsica
```
(Marie Curie) --DESCOBRÍ--> (Radi)
(Marie Curie) --TREBALLÀ_A--> (París)
(Radioactivitat) --INVESTIGADA_PER--> (Marie Curie)
```
- **Node** = una entitat concreta (una per concepte)
- **Relació** = el vincle entre dos nodes (bidireccional)
- Els nodes no "contenen" altres nodes — els **apunten** mitjançant relacions

### Vectors en KG
Cada node té el seu propi **vector** construït a partir de la seva descripció + les seves relacions. Matemàticament idèntic als vectors de RAG, però el text d'entrada és diferent:

| | Text d'entrada al model d'embedding |
|---|---|
| RAG | Un chunk de 500 paraules de text en brut |
| KG | Nom del node + descripció + llista de relacions |

**Avantatge:** el vector del node captura connexions semàntiques implícites (ex: "radioactiu" troba `Marie Curie` sense que aparegui la paraula exacta).

### Reptes de construcció
- **Entity resolution** — "Marie Curie", "M. Curie" i "Madame Curie" han de fusionar-se en un sol node (es resol amb similitud vectorial entre noms)

---

## 3. Els tres tipus de KG

### GraphRAG (Microsoft)
- Genera el graf **automàticament** passant tots els documents per un LLM
- Crea **comunitats** (grups de nodes molt interconnectats) amb resums pre-generats
- Permet dos tipus de cerca:
  - **Local Search** — segueix relacions de node en node (exemple: director → pel·lícula → actor)
  - **Global Search** — consulta resums de comunitats per preguntes globals ("de quins temes parla el corpus?")
- **Limitació:** car de construir i difícil de mantenir si s'afegeixen documents nous (s'ha de refer tot el graf)

### LightRAG
- Processa cada document **de forma independent i incremental**
- Quan afegeixes un document nou, només reprocesses aquell document
- Les relacions entre documents es descobreixen parcialment al moment de la cerca
- **Avantatge:** fàcil de mantenir corpus creixents
- **Limitació:** la cerca és lleugerament més lenta per la connexió de grafs locals al vol. *Nota: fan més cerques que construccions, per tant cal tenir-ho en compte en producció (LightRAG ho mitiga amb pre-computació parcial)*

### Graf controlat manual (Neo4j / Supabase)
- Les entitats i relacions les **defineixes tu** — el LLM és opcional
- Control total sobre el domini
- **Trade-off:** guanyes precisió, perds escalabilitat
- Ideal quan: corpus estable, domini especialitzat, comunitats ja conegudes
- Implementació: Neo4j (base de dades de grafs dedicada) o Supabase/PostgreSQL (com al projecte ATNE)

---

## 4. Quan usar cada tipus

| Situació | Recomanació |
|---|---|
| Corpus enorme i desorganitzat, comunitats desconegudes | GraphRAG |
| Corpus creixent, documents nous freqüents | LightRAG |
| Domini especialitzat, terminologia controlada, corpus estable | Graf manual |
| **Corpus pedagògic ignasià (~70 docs, mòduls M0-M9)** | **Graf manual ✓** |

**Per al projecte ATNE:** les comunitats ja estan pre-definides pels mòduls (M0=identitat, M1=diversitat, M2=metodologies...). GraphRAG no aportaria valor addicional.

---

## 5. Implementació ATNE

### Stack tècnic
- Backend: **FastAPI** (Python)
- LLM: **Gemini** (Google, embeddings 768d)
- Base de dades: **Supabase** (vectors + graf)
- Frontend: HTML/JS

### Arquitectura RAG+KG del `server.py`

#### RAG vectorial
```python
def embed_query(text): → vector 768d amb Gemini
def vector_search(query, top_k=30): → cerca semàntica a Supabase
```

#### KG
```python
def kg_expand_concept(concepte, max_hops=2): → expandeix conceptes via relacions
def kg_search_documents(concepts): → puntua documents per distància al graf
```
La puntuació KG decau amb la distància: `increment = 1.0 / distancia`

#### Cerca combinada (hybrid scoring)
```python
def combined_search(query, top_k=8):
    # Si té vector + KG:  0.4 × vector + 0.4 × KG + 0.2
    # Si només KG:        0.3 + 0.4 × KG
    # Si només vector:    0.5 × vector
```

#### Documents obligatoris per perfil
```python
def get_mandatory_docs(characteristics):
    # Sempre: DUA + Lectura Fàcil
    # Si TDAH actiu: + M1_TDAH.md
    # Si TEA actiu:  + M1_alumnat-TEA.md
    # ... (per cada necessitat educativa)
```
Aquests documents s'inclouen **independentment de la cerca** — blinda la Relevance per perfils coneguts.

---

## 6. Avaluació i mètriques

### Les 5 mètriques fonamentals (framework RAGAS)

| Mètrica | Pregunta | En ATNE |
|---|---|---|
| **Faithfulness** | L'output compleix les instruccions rebudes? | El text adaptat té títols, negretes, frases curtes per TDAH? |
| **Relevance** | Les instruccions eren correctes per al perfil? | S'han aplicat criteris TDAH i no TEA? *Blindada per `get_mandatory_docs()`* |
| **Context Preservation** | Es manté el contingut original? | El text adaptat conserva el rigor curricular? |
| **Retrieval Precision** | Dels documents recuperats, quants eren rellevants? | **La més crítica per ATNE** — documents addicionals útils per al context? |
| **Retrieval Recall** | Dels documents rellevants existents, quants s'han recuperat? | No s'han perdut documents importants? |

### Arquitectura d'avaluació recomanada (3 capes)

| Capa | Qui avalua | Quan | Per a què |
|---|---|---|---|
| **Feedback humà** | Docents reals | Espontani (botó Dolenta/Regular/Bona) | Casos extrems |
| **Agent sintètic** | LLM-as-a-judge | En batch, en diferit | Millorar el sistema |
| **Mètriques automàtiques** | Codi | Cada adaptació | Monitoratge (qualitat aparent) |

### Distinció important
- **Mètriques de forma** (automàtiques) — nombre de títols, frases curtes, negretes → mesuren *qualitat aparent*
- **Mètriques de fons** (LLM-as-a-judge) — cohesió, coherència pedagògica, adequació al perfil → mesuren *qualitat real*

### Agent avaluador (LLM-as-a-judge)
Inputs necessaris:
1. Perfil declarat de l'alumne
2. Text original
3. Text adaptat
4. Criteris d'adaptació aplicats

Estratègies:
- **Estratègia A (Faithfulness)** — rep els criteris passats al LLM i comprova si l'output els compleix
- **Estratègia B (Relevance)** — coneix els criteris per perfil i comprova si s'han aplicat els correctes

---

## 7. 🅿️ Parking Lot — Millores pendents ATNE

| # | Millora | Impacte | Mètrica |
|---|---|---|---|
| 1 | Ampliar `KEYWORD_MAP` amb vocabulari ignasià del M0 (missió, cura personalis, magis, carisma...) | Alt | Retrieval Precision |
| 2 | Ponderar nodes per centralitat — `Missió i valors` com a hub principal | Mitjà | Retrieval Precision |
| 3 | Implementar agent avaluador sintètic (LLM-as-a-judge) en batch | Alt | Totes |

---

*Document en construcció — s'anirà actualitzant a mesura que avanci l'aprenentatge.*
