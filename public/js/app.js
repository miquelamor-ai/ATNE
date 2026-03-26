/* ATNE v1 — Frontend (PHP + OpenAI, sense RAG) */

// ── 4 Característiques (v1 MVP) ──────────────────────────────────────────────

const CHARACTERISTICS = {
    nouvingut: {
        label: "Nouvingut",
        subvars: [
            { id: "L1", label: "Llengua materna (L1)", type: "text", placeholder: "Ex: àrab, urdú, xinès..." },
            { id: "alfabet_llati", label: "Alfabet llatí", type: "select",
              options: ["true", "false"], labels: ["Sí", "No"] },
            { id: "escolaritzacio_previa", label: "Escolarització prèvia", type: "select",
              options: ["si", "parcial", "no"] },
            { id: "mecr", label: "Nivell català (MECR)", type: "select",
              options: ["pre-A1", "A1", "A2", "B1", "B2"] },
        ]
    },
    dislexia: {
        label: "Dislèxia",
        subvars: [
            { id: "tipus_dislexia", label: "Tipus (ruta afectada)", type: "select",
              options: ["fonologica", "superficial", "mixta"] },
            { id: "grau", label: "Grau de severitat", type: "select",
              options: ["lleu", "moderat", "sever"] },
            { id: "tipografia_adaptada", label: "Tipografia adaptada", type: "select",
              options: ["false", "true"], labels: ["No", "Sí"] },
            { id: "columnes_estretes", label: "Columnes estretes (màx. 44 car.)", type: "select",
              options: ["false", "true"], labels: ["No", "Sí"] },
        ]
    },
    tea: {
        label: "TEA",
        subvars: [
            { id: "nivell_suport", label: "Nivell suport (DSM-5)", type: "select",
              options: ["1", "2", "3"] },
        ]
    },
    altes_capacitats: { label: "Altes capacitats", subvars: [] },
};

const COMPLEMENTS = {
    glossari: "Glossari de termes clau",
    definicions_integrades: "Definicions integrades al text",
    esquema_visual: "Esquema / resum visual",
    bastides: "Bastides (scaffolding guiat)",
};

// ── Opcions dinàmiques per etapa ──────────────────────────────────────────────

const CURSOS_PER_ETAPA = {
    infantil: [
        { value: "P3", label: "P3" }, { value: "P4", label: "P4" }, { value: "P5", label: "P5" },
    ],
    primaria: [
        { value: "1r", label: "1r" }, { value: "2n", label: "2n" },
        { value: "3r", label: "3r" }, { value: "4t", label: "4t" },
        { value: "5e", label: "5è" }, { value: "6e", label: "6è" },
    ],
    ESO: [
        { value: "1r", label: "1r" }, { value: "2n", label: "2n" },
        { value: "3r", label: "3r" }, { value: "4t", label: "4t" },
    ],
    batxillerat: [
        { value: "1r", label: "1r" }, { value: "2n", label: "2n" },
    ],
    FP: [
        { value: "1r_CGM", label: "1r CGM" }, { value: "2n_CGM", label: "2n CGM" },
        { value: "1r_CGS", label: "1r CGS" }, { value: "2n_CGS", label: "2n CGS" },
    ],
};

const AMBITS_PER_ETAPA = {
    infantil: [
        { value: "descoberta_entorn", label: "Descoberta de l'entorn" },
        { value: "comunicacio_llenguatges", label: "Comunicació i llenguatges" },
        { value: "creixement_personal", label: "Creixement personal" },
    ],
    primaria: [
        { value: "cientific", label: "Científic" }, { value: "humanistic", label: "Humanístic" },
        { value: "linguistic", label: "Lingüístic" }, { value: "artistic", label: "Artístic" },
    ],
    ESO: [
        { value: "cientific", label: "Científic" }, { value: "humanistic", label: "Humanístic" },
        { value: "linguistic", label: "Lingüístic" }, { value: "artistic", label: "Artístic" },
    ],
    batxillerat: [
        { value: "cientific", label: "Científic" }, { value: "humanistic", label: "Humanístic" },
        { value: "linguistic", label: "Lingüístic" }, { value: "artistic", label: "Artístic" },
    ],
    FP: [
        { value: "admin_gestio", label: "Administració i gestió" },
        { value: "comerc_marketing", label: "Comerç i màrqueting" },
        { value: "electricitat_electronica", label: "Electricitat i electrònica" },
        { value: "fabricacio_mecanica", label: "Fabricació mecànica" },
        { value: "hoteleria_turisme", label: "Hoteleria i turisme" },
        { value: "imatge_personal", label: "Imatge personal" },
        { value: "informatica_comunicacions", label: "Informàtica i comunicacions" },
        { value: "sanitat", label: "Sanitat" },
        { value: "serveis_socioculturals", label: "Serveis socioculturals i a la comunitat" },
        { value: "activitats_fisiques", label: "Activitats físiques i esportives" },
    ],
};

// ── Estat ─────────────────────────────────────────────────────────────────────

const state = { step: 1, adaptedText: "", originalText: "" };

// ── Inicialització ────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    renderCharGrid();
    renderComplementGrid();
    loadContextFromStorage();
    updateEtapaSelects();
    checkHealth();
    bindEvents();
});

// ── Health check ──────────────────────────────────────────────────────────────

async function checkHealth() {
    try {
        const resp = await fetch("/api/health");
        const data = await resp.json();
        document.getElementById("dot-openai").className = "health-dot " + (data.openai ? "ok" : "err");
        document.getElementById("dot-db").className = "health-dot " + (data.database ? "ok" : "err");
    } catch {
        document.getElementById("dot-openai").className = "health-dot err";
        document.getElementById("dot-db").className = "health-dot err";
    }
}

// ── Selects dinàmics per etapa ────────────────────────────────────────────────

function updateEtapaSelects() {
    const etapa = document.getElementById("ctx-etapa").value;
    const cursSelect = document.getElementById("ctx-curs");
    const cursos = CURSOS_PER_ETAPA[etapa] || [];
    cursSelect.innerHTML = cursos.map(c => `<option value="${c.value}">${c.label}</option>`).join("");

    const ambitSelect = document.getElementById("ctx-ambit");
    const ambits = AMBITS_PER_ETAPA[etapa] || [];
    ambitSelect.innerHTML = ambits.map(a => `<option value="${a.value}">${a.label}</option>`).join("");

    const ambitLabel = document.querySelector('label[for="ctx-ambit"]');
    if (ambitLabel) ambitLabel.textContent = etapa === "FP" ? "Família professional" : "Àmbit";
}

// ── Navegació ─────────────────────────────────────────────────────────────────

function goToStep(n) {
    state.step = n;
    document.querySelectorAll(".step-tab").forEach(tab =>
        tab.classList.toggle("active", parseInt(tab.dataset.step) === n));
    document.querySelectorAll(".step-panel").forEach(panel =>
        panel.classList.toggle("active", panel.id === `step-${n}`));
    if (n === 3) requestProposal();
}

// ── Render característiques ───────────────────────────────────────────────────

function renderCharGrid() {
    const grid = document.getElementById("char-grid");
    grid.innerHTML = "";
    for (const [key, char] of Object.entries(CHARACTERISTICS)) {
        const div = document.createElement("div");
        div.className = "char-item";
        div.dataset.key = key;

        let subvarsHTML = "";
        if (char.subvars.length > 0) {
            const rows = char.subvars.map(sv => {
                if (sv.type === "select") {
                    const opts = sv.options.map((o, i) => {
                        const label = sv.labels ? sv.labels[i] : o;
                        return `<option value="${o}">${label}</option>`;
                    }).join("");
                    return `<div class="subvar-row"><label>${sv.label}</label>
                        <select data-char="${key}" data-var="${sv.id}">${opts}</select></div>`;
                } else {
                    return `<div class="subvar-row"><label>${sv.label}</label>
                        <input type="text" data-char="${key}" data-var="${sv.id}"
                               placeholder="${sv.placeholder || ''}"></div>`;
                }
            }).join("");
            subvarsHTML = `<div class="char-subvars">${rows}</div>`;
        }

        div.innerHTML = `<label><input type="checkbox" data-char="${key}"> ${char.label}</label>${subvarsHTML}`;
        const cb = div.querySelector('input[type="checkbox"]');
        cb.addEventListener("change", () => {
            div.classList.toggle("checked", cb.checked);
            check2eAlert();
        });
        grid.appendChild(div);
    }
}

// ── Render complements ────────────────────────────────────────────────────────

function renderComplementGrid() {
    const grid = document.getElementById("complement-grid");
    grid.innerHTML = "";
    for (const [key, label] of Object.entries(COMPLEMENTS)) {
        grid.innerHTML += `<label class="complement-item" id="comp-${key}">
            <input type="checkbox" data-comp="${key}"> ${label}</label>`;
    }
}

// ── Recollir dades ────────────────────────────────────────────────────────────

function collectChars() {
    const chars = {};
    for (const key of Object.keys(CHARACTERISTICS)) {
        const cb = document.querySelector(`input[type="checkbox"][data-char="${key}"]`);
        const entry = { actiu: cb.checked };
        if (cb.checked) {
            document.querySelectorAll(`[data-char="${key}"][data-var]`).forEach(el => {
                let val = el.value;
                if (val === "true") val = true;
                else if (val === "false") val = false;
                entry[el.dataset.var] = val;
            });
        }
        chars[key] = entry;
    }
    return chars;
}

function collectContext() {
    return {
        etapa: document.getElementById("ctx-etapa").value,
        curs: document.getElementById("ctx-curs").value,
        ambit: document.getElementById("ctx-ambit").value,
        materia: document.getElementById("ctx-materia").value,
    };
}

function collectParams() {
    const complements = {};
    document.querySelectorAll("input[data-comp]").forEach(cb => {
        complements[cb.dataset.comp] = cb.checked;
    });
    return {
        dua: document.getElementById("param-dua").value,
        lf: parseInt(document.getElementById("param-lf").value),
        mecr_sortida: document.getElementById("param-mecr").value,
        complements,
    };
}

// ── Persistir context ─────────────────────────────────────────────────────────

function saveContextToStorage() {
    localStorage.setItem("atne_fje_context", JSON.stringify(collectContext()));
}

function loadContextFromStorage() {
    try {
        const ctx = JSON.parse(localStorage.getItem("atne_fje_context"));
        if (!ctx) return;
        if (ctx.etapa) {
            document.getElementById("ctx-etapa").value = ctx.etapa;
            updateEtapaSelects();
        }
        if (ctx.curs) document.getElementById("ctx-curs").value = ctx.curs;
        if (ctx.ambit) document.getElementById("ctx-ambit").value = ctx.ambit;
        if (ctx.materia) document.getElementById("ctx-materia").value = ctx.materia;
    } catch { /* ignore */ }
}

// ── Proposta ──────────────────────────────────────────────────────────────────

async function requestProposal() {
    const chars = collectChars();
    const context = collectContext();
    try {
        const resp = await fetch("/api/propose", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ caracteristiques: chars, context }),
        });
        const proposal = await resp.json();
        applyProposal(proposal, chars);
    } catch (e) { console.error("Error proposta:", e); }
}

function applyProposal(proposal, chars) {
    document.getElementById("param-dua").value = proposal.dua || "Core";
    document.getElementById("param-lf").value = proposal.lf || 2;
    document.getElementById("param-mecr").value = proposal.mecr_sortida || "B2";

    const comps = proposal.complements || {};
    for (const [key, active] of Object.entries(comps)) {
        const cb = document.querySelector(`input[data-comp="${key}"]`);
        if (cb) {
            cb.checked = active;
            cb.closest(".complement-item")?.classList.toggle("auto", active);
        }
    }

    const actives = Object.entries(chars)
        .filter(([_, v]) => v.actiu)
        .map(([k]) => CHARACTERISTICS[k]?.label || k);
    document.getElementById("proposal-basis").textContent =
        actives.length > 0 ? `Basat en: ${actives.join(" + ")}` : "Perfil genèric";

    show2eProposalBlock(chars);
}

// ── Adaptació ─────────────────────────────────────────────────────────────────

async function runAdaptation() {
    const text = document.getElementById("input-text").value;
    if (!text.trim()) { alert("Cal introduir un text a adaptar."); return; }

    const chars = collectChars();
    const context = collectContext();
    const params = collectParams();
    state.originalText = text;

    const btn = document.getElementById("btn-adapt");
    const progressArea = document.getElementById("progress-area");
    const progressSteps = document.getElementById("progress-steps");

    btn.disabled = true;
    btn.textContent = "Adaptant...";
    progressArea.classList.add("active");
    progressSteps.innerHTML = '<div class="progress-step active"><div class="spinner"></div>Enviant a OpenAI (gpt-4.1-mini)...</div>';

    try {
        const resp = await fetch("/api/adapt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, caracteristiques: chars, context, params }),
        });
        const data = await resp.json();

        if (data.adapted) {
            state.adaptedText = data.adapted;
            progressSteps.innerHTML = '<div class="progress-step done">Adaptació completada!</div>';
            showResult();
        } else {
            progressSteps.innerHTML = '<div class="progress-step" style="color:var(--err);">Error: resposta buida</div>';
        }
    } catch (e) {
        progressSteps.innerHTML = `<div class="progress-step" style="color:var(--err);">Error: ${e.message}</div>`;
    }

    btn.disabled = false;
    btn.textContent = "ADAPTAR";
}

// ── Mostrar resultat ──────────────────────────────────────────────────────────

function showResult() {
    document.getElementById("result-original").textContent = state.originalText;

    const sections = parseAdaptedSections(state.adaptedText);
    document.getElementById("result-adapted").innerHTML = formatMarkdown(sections.main || state.adaptedText);

    const compDiv = document.getElementById("result-complements");
    compDiv.innerHTML = "";
    for (const [title, content] of Object.entries(sections.complements)) {
        const isAudit = title.toLowerCase().includes("auditoria") || title.toLowerCase().includes("argumentació");
        compDiv.innerHTML += `<details class="complement-card" ${isAudit ? "" : "open"}>
            <summary class="complement-header"><span class="complement-title">${title}</span></summary>
            <div class="complement-body">${formatMarkdown(content)}</div></details>`;
    }

    goToStep(4);
}

function parseAdaptedSections(text) {
    const result = { main: "", complements: {} };
    const parts = text.split(/^## /m);
    if (parts.length <= 1) { result.main = text; return result; }

    for (const part of parts) {
        if (!part.trim()) continue;
        const nlIdx = part.indexOf("\n");
        const title = nlIdx > -1 ? part.slice(0, nlIdx).trim() : part.trim();
        const body = nlIdx > -1 ? part.slice(nlIdx + 1).trim() : "";

        if (title.toLowerCase().includes("text adaptat")) result.main = body;
        else if (title.toLowerCase().includes("auditoria")) result.complements["Notes d'auditoria"] = body;
        else result.complements[title] = body;
    }

    if (!result.main) result.main = text;
    return result;
}

function formatMarkdown(text) {
    if (!text) return "";
    return text
        .replace(/^### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^\|(.+)\|$/gm, (match) => {
            if (/^\|[\s\-:|]+\|$/.test(match)) return '';
            const cells = match.split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map(c => c.trim());
            return '<tr>' + cells.map(c => `<td>${inlineMd(c)}</td>`).join('') + '</tr>';
        })
        .replace(/(<tr>.*<\/tr>\n?)+/gs, '<div class="table-wrapper"><table class="md-table">$&</table></div>')
        .replace(/^[*\-] (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/gs, '<ul class="md-list">$&</ul>')
        .replace(/^(?!<[hultd])(.*\S.*)$/gm, '<p>$1</p>')
        .replace(/<p><\/p>/g, '')
        .split('\n').map(l => inlineMd(l)).join('\n');
}

function inlineMd(t) {
    return t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
}

// ── Word count ────────────────────────────────────────────────────────────────

function updateWordCount() {
    const text = document.getElementById("input-text").value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById("word-count").textContent = `${words} paraules`;
}

// ── Doble excepcionalitat (2e) ────────────────────────────────────────────────

function check2eAlert() {
    const acChecked = document.querySelector('input[type="checkbox"][data-char="altes_capacitats"]')?.checked;
    const otherChars = Object.keys(CHARACTERISTICS).filter(k => k !== 'altes_capacitats');
    const otherActive = otherChars.some(k =>
        document.querySelector(`input[type="checkbox"][data-char="${k}"]`)?.checked
    );

    let alertDiv = document.getElementById("alert-2e");
    if (acChecked && otherActive) {
        if (!alertDiv) {
            alertDiv = document.createElement("div");
            alertDiv.id = "alert-2e";
            alertDiv.className = "alert-2e";
            alertDiv.innerHTML = `
                <strong>Perfil 2e detectat — Doble excepcionalitat</strong>
                <p>Has seleccionat altes capacitats combinada amb una altra condició.
                Això és el que es coneix com a <strong>doble excepcionalitat (2e)</strong>:
                un perfil propi on el potencial i les dificultats s'emmascaren mútuament.
                L'alumne pot semblar "normal" quan internament lluita amb reptes i avorriment alhora.</p>
                <p>L'adaptació mantindrà el <strong>repte cognitiu alt</strong> però amb el
                <strong>format adaptat</strong> a la condició associada.</p>
            `;
            document.getElementById("char-grid").after(alertDiv);
        }
    } else if (alertDiv) {
        alertDiv.remove();
    }
}

function show2eProposalBlock(chars) {
    let block = document.getElementById("proposal-2e");
    const acActive = chars.altes_capacitats?.actiu;
    const otherChars = Object.keys(CHARACTERISTICS).filter(k => k !== 'altes_capacitats');
    const otherActives = otherChars.filter(k => chars[k]?.actiu);

    if (acActive && otherActives.length > 0) {
        const comboLabels = otherActives.map(k => CHARACTERISTICS[k]?.label || k);
        const comboDesc = {
            dislexia: "contingut complex però format visual/oral accessible. El rendiment pot ser irregular: brillant en unes matèries i molt per sota en d'altres.",
            tea: "repte cognitiu dins estructura predictible i literal. L'hiperfocus en àrees d'interès pot ser motor d'aprenentatge.",
            nouvingut: "contingut ric amb llengua simplificada i glossari complet. El potencial cognitiu pot quedar ocult per la barrera lingüística.",
        };
        const descriptions = otherActives.map(k => comboDesc[k] || "adaptar format mantenint repte.").join(" ");

        if (!block) {
            block = document.createElement("div");
            block.id = "proposal-2e";
            block.className = "proposal-card proposal-2e";
            const proposalCards = document.querySelectorAll(".proposal-card");
            if (proposalCards.length > 0) {
                proposalCards[proposalCards.length - 1].after(block);
            }
        }
        block.innerHTML = `
            <h3>Perfil detectat: Doble excepcionalitat (2e)</h3>
            <p><strong>AC + ${comboLabels.join(" + ")}</strong>: ${descriptions}</p>
            <p class="info-2e">El potencial i les dificultats es poden emmascarar mútuament:
            l'alumne pot semblar "normal" quan internament el seu perfil requereix atenció específica.
            L'adaptació manté el repte cognitiu alt amb format adaptat.</p>
        `;
        block.style.display = "block";
    } else if (block) {
        block.style.display = "none";
    }
}

// ── Events ────────────────────────────────────────────────────────────────────

function bindEvents() {
    document.querySelectorAll(".step-tab").forEach(tab =>
        tab.addEventListener("click", () => goToStep(parseInt(tab.dataset.step))));

    document.getElementById("btn-next-2").addEventListener("click", () => goToStep(2));
    document.getElementById("btn-next-3").addEventListener("click", () => goToStep(3));
    document.getElementById("btn-adapt").addEventListener("click", runAdaptation);
    document.getElementById("input-text").addEventListener("input", updateWordCount);

    document.getElementById("ctx-etapa").addEventListener("change", () => {
        updateEtapaSelects();
        saveContextToStorage();
    });
    ["ctx-curs", "ctx-ambit", "ctx-materia"].forEach(id =>
        document.getElementById(id).addEventListener("change", saveContextToStorage));
}
