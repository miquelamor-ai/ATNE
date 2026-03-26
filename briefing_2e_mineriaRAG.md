# Briefing: Doble Excepcionalitat (2e) — Contingut per al corpus RAG

**Destinació**: repo `mineriaRAG` → corpus de MDs indexats a Supabase (`rag_fje`)
**Fitxers a actualitzar/crear**: `M1_altes-capacitats.md` i `M1_creuament-variables-dependencies.md`
**Data**: 2026-03-25

---

## 1. Contingut a afegir a `M1_altes-capacitats.md`

### Secció nova: Doble excepcionalitat (2e)

La **doble excepcionalitat (2e)** es refereix a alumnes que presenten simultàniament altes capacitats intel·lectuals i una o més condicions associades (dislèxia, TEA, TDAH, trastorn del llenguatge, nouvingut, etc.).

#### Característiques del perfil 2e

- **Emmascarament mutu**: el potencial cognitiu compensa parcialment la dificultat, i la dificultat oculta el potencial. L'alumne pot semblar "normal" i no rebre cap suport.
- **Perfil "verd"**: en sistemes d'alerta per colors, l'alumne 2e queda sovint en verd (sense alerta) perquè les dues condicions es cancel·len estadísticament.
- **Rendiment irregular**: brillant en unes matèries o contextos, molt per sota en d'altres. Gran diferència entre capacitat oral i escrita.
- **Frustració i conducta**: la combinació de capacitat no reconeguda + dificultat no atesa genera frustració, ansietat, perfeccionisme extrem, o conducta disruptiva.
- **Creativitat + dèficit**: estratègies compensatòries úniques i creatives que poden confondre el diagnòstic.

#### Senyals d'alerta 2e

- Rendiment acadèmic molt desigual entre matèries
- Gran diferència entre capacitat oral i escrita
- Frustració o conducta disruptiva en tasques "fàcils"
- Creativitat elevada però poc rendiment en tasques rutinàries
- Ansietat o perfeccionisme extrem
- Idees elaborades que no es reflecteixen en el treball escrit

#### Principis d'intervenció 2e

1. **Identificar ambdues condicions**: no n'hi ha prou amb detectar una; cal buscar activament l'altra.
2. **Prioritzar fortaleses**: usar els punts forts com a via d'accés, no centrar-se exclusivament en el dèficit.
3. **Repte + accessibilitat**: mantenir el repte cognitiu alt (no simplificar el contingut) però adaptar el format a la condició associada.
4. **Flexibilitat avaluativa**: permetre demostrar coneixement per vies alternatives (oral, visual, projectes).
5. **Evitar la "normalització"**: el fet que l'alumne sembli "normal" no vol dir que no necessiti suport.

#### Combinacions específiques

**AC + dislèxia**:
- Contingut complex però format visual/oral accessible
- Rendiment irregular: brillant verbalment, molt per sota en lectura/escriptura
- Pot evitar la lectura per frustració, però té idees elaborades oralment
- Alternatives multisensorials, suport auditiu, mapes conceptuals
- El rendiment pot ser irregular: excel·lent en unes matèries i molt per sota en d'altres

**AC + TEA**:
- Repte cognitiu dins estructura predictible i literal
- L'hiperfocus en àrees d'interès pot ser motor d'aprenentatge extraordinari
- Dificultats en flexibilitat cognitiva i comunicació social
- Aprofitar els interessos com a porta d'entrada + estructura clara + profunditat

**AC + TDAH**:
- Repte intel·lectual amb tasques curtes i variades
- Alta creativitat combinada amb inatenció i baixa tolerància a la frustració
- Necessita variació i novetat per mantenir l'atenció
- La sobredotació pot compensar el TDAH en tasques interessants i fallar en les rutinàries

**AC + nouvingut**:
- Contingut ric amb llengua simplificada i glossari bilingüe complet
- El potencial cognitiu pot quedar completament ocult per la barrera lingüística
- L'alumne pot tenir coneixements avançats en L1 que no pot demostrar en L2
- Permetre expressions en L1, repte conceptual des del dia 1

---

## 2. Contingut a afegir a `M1_creuament-variables-dependencies.md`

### Secció nova: Doble excepcionalitat com a creuament especial

El creuament `altes_capacitats + [qualsevol altra característica]` genera un perfil que s'anomena **doble excepcionalitat (2e)**. A diferència d'altres creuaments, la 2e no és additiva sinó que crea un perfil emergent amb propietats pròpies.

#### Diferència amb altres creuaments

| Creuament normal | Creuament 2e |
|---|---|
| Les necessitats se sumen | Les necessitats interactuen i s'emmascaren |
| Cada condició és visible | Ambdues condicions poden ser invisibles |
| Adaptar = suma de suports | Adaptar = equilibri repte/accessibilitat |
| L'alumne rep atenció per almenys una condició | L'alumne pot no rebre cap atenció |

#### Regla d'adaptació 2e

Quan `altes_capacitats` està actiu amb qualsevol altra característica:
1. **NO simplificar el contingut** — mantenir el repte cognitiu
2. **SÍ adaptar el format** — segons la condició associada
3. **El repte és tan necessari com l'accessibilitat** — un text accessible sense repte desconnecta l'alumne 2e tant com un text complex inaccessible
4. **Prioritzar fortaleses** — les àrees d'interès i talent com a porta d'entrada

#### Variables derivades

- `perfil_2e` (boolean): true quan `altes_capacitats.actiu` + qualsevol altra `.actiu`
- Impacte en `dua`: pot ser Enriquiment amb accessibilitat o Core+ (no Accés pur)
- Impacte en `lf`: la intensitat LF ve de la condició associada, no d'AC
- Impacte en `complements`: s'afegeixen automàticament `bastides` i el complement de la condició associada

---

## 3. Instruccions d'indexació

1. Afegir les seccions anteriors als MDs corresponents dins el corpus
2. Re-executar `index_rag.py` per actualitzar els embeddings a `rag_fje`
3. Re-executar `build_kg.py` per actualitzar el Knowledge Graph:
   - Nou node: `doble_excepcionalitat_2e` (tipus: `perfil`)
   - Noves arestes: `altes_capacitats → 2e`, `dislexia → 2e`, `tea → 2e`, `tdah → 2e`, `nouvingut → 2e`
   - Relació: `genera_perfil_emergent`
4. Verificar que la cerca "doble excepcionalitat" retorna chunks rellevants
