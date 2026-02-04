// ==============================
// CONFIGURAÇÃO DAS ATIVIDADES
// ==============================
const activities = [
  { key: "A1", label: "Atividade 1", name: "Revisor de e-mails" },
  { key: "A2", label: "Atividade 2", name: "Agente de IA" },
  { key: "A3", label: "Atividade 3", name: "Projeto Lovable" },
  { key: "A4", label: "Atividade 4", name: "Projeto VBA" },
];

// ==============================
// LINKS DAS ENTREGAS (EDITE AQUI)
// ------------------------------
// COMO PREENCHER:
// Adicione o nome exato do participante (como está no data.json) e a URL para cada atividade.
//
// EXEMPLO:
// "Luiz Escobar": {
//    A1: "https://docs.google.com/...",
//    A4: "https://github.com/..." 
// },
//
// ==============================
const SUBMISSION_LINKS = {
  // CLIQUE ABAIXO E ADICIONE SEUS LINKS:

  "Pedro Queiroz": {
    A1: "https://geosegbar.sharepoint.com/:t:/s/TecnologiadaInformao/IQDxFHLdKUwmSrjsJCajjYyGAS0gWeWjkaU9uMecvpW1VQA?e=hXNIGV",
    A2: "",
    A3: "",
    A4: "https://geosegbar.sharepoint.com/:f:/s/TecnologiadaInformao/IgCiEjeb47ZiTJxX6ALPAY7jAaRxdgjmIHMgIl2i-UttHv8?e=UqEAqo",
  },
  "Kawan Alves": {
    A1: "https://geosegbar.sharepoint.com/:t:/s/TecnologiadaInformao/IQBUEaoLwRKdQpm0Zlkn61SMAQt6f--46MiTyeCIygri60Q?e=1pcgbQ",
    A2: "",
    A3: "",
    A4: "",
  },
  "Fernanda Mazzini": {
    A1: "https://geosegbar.sharepoint.com/:t:/s/TecnologiadaInformao/IQCwXwkghjBgQ6hlKCHLSpDXASN-g_fTfd4oNSzRuNHOOFU?e=aFXuSp",
    A2: "",
    A3: "",
    A4: "",
  },
  "Giovani Calça": {
    A1: "https://geosegbar.sharepoint.com/:t:/s/TecnologiadaInformao/IQBx9L6vWY_gQqwvS24z09BJAf7VKRfbBjWDsHtbCgthGEU?e=xcJDAo",
    A2: "",
    A3: "",
    A4: "",
  },
  "Josislene Paulino": {
    A1: "",
    A2: "https://segurhub-eaqtecf9.manus.space/",
    A3: "",
    A4: "",
  },
  "Pedro Nogueira": {
    A1: "",
    A2: "",
    A3: "https://ai-workshop-pedro-h-nogueira.lovable.app/",
    A4: "",
  },
};

// Se você preferir OCULTAR o ícone quando não houver link, troque para false.
const SHOW_DISABLED_LINK_ICON = true;

// ==============================
// STATE / HELPERS
// ==============================
const state = {
  // filter removed
};

let rawData = [];

// Enforce dark mode always
document.documentElement.setAttribute("data-theme", "dark");
localStorage.removeItem("theme");

const el = (id) => document.getElementById(id);

function safeText(v) {
  return (v === null || v === undefined) ? "" : String(v);
}

function did(p, aKey) {
  return p[aKey] !== null && p[aKey] !== undefined;
}

function countDone(p) {
  return activities.map(a => p[a.key]).filter(v => v !== null && v !== undefined).length;
}

function totalDeliveries(data) {
  return data.reduce((acc, p) => acc + countDone(p), 0);
}

function medal(pos) {
  return "🏅";
}

function getSubmissionUrl(participantName, activityKey) {
  return (SUBMISSION_LINKS?.[participantName]?.[activityKey] || "").trim();
}

function buildActivityRanking(data, activityKey) {
  return data
    .filter(p => did(p, activityKey))
    .map(p => ({ name: p.name, pos: p[activityKey] }))
    .sort((a, b) => a.pos - b.pos);
}

// ==============================
// MODAL
// ==============================
function openModal({ participantName, activityKey, activityName, url }) {
  const modal = el("linkModal");
  const title = el("modalTitle");
  const sub = el("modalSub");
  const link = el("modalLink");
  const empty = el("modalEmpty");

  title.textContent = participantName;
  sub.textContent = `${activityName} (${activityKey})`;

  if (url) {
    link.href = url;
    link.textContent = "Abrir entrega ↗";
    link.hidden = false;
    empty.hidden = true;
  } else {
    link.hidden = true;
    empty.hidden = false;
  }

  modal.classList.add("isOpen");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  const modal = el("linkModal");
  modal.classList.remove("isOpen");
  modal.setAttribute("aria-hidden", "true");
}

function bindModalEvents() {
  const modal = el("linkModal");
  const closeBtn = el("modalClose");

  closeBtn?.addEventListener("click", closeModal);

  modal?.addEventListener("click", (e) => {
    const target = e.target;
    if (target?.dataset?.close === "1") closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

// ==============================
// RENDER
// ==============================
function renderKpis(allData) {
  const participants = allData.length;
  const deliveries = totalDeliveries(allData);

  el("kpiParticipants").textContent = participants;
  el("kpiParticipantsSub").textContent = "total geral";

  el("kpiDeliveries").textContent = deliveries;

  const allDone = allData.filter(p => countDone(p) === activities.length).length;
  el("kpiAllDone").textContent = allDone;

  const avg = participants ? (deliveries / participants) : 0;
  el("kpiAvg").textContent = avg.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function renderActivities(allData) {
  const grid = el("activitiesGrid");
  grid.innerHTML = "";

  // 1. Destaque: Primeira atividade (A1) -> col-span-12, mostra top 4
  if (activities.length > 0) {
    const a1 = activities[0];
    const ranking = buildActivityRanking(allData, a1.key);
    const total = ranking.length;

    // Top 4 apenas
    const top4 = ranking.slice(0, 4);

    const card = document.createElement("div");
    card.className = "card activityCard col-span-12"; // Full width

    // A1: Horizontal list, items with vertical content
    const rows = top4.length
      ? top4.map((r, idx) => renderRankRow(r, idx, a1, true, true)).join("")
      : `<div class="small">Ninguém realizou esta atividade ainda.</div>`;

    card.innerHTML = `
      <div class="activityHead">
        <div>
          <div class="name">${a1.label}</div>
          <div class="meta">${a1.name}</div>
        </div>
      </div>
      <div class="rankList horizontal">
        ${rows}
      </div>
    `;
    grid.appendChild(card);
  }

  // 2. Outras atividades (A2..A4) -> col-span-3, mostra top 1
  const others = activities.slice(1);
  others.forEach(a => {
    const ranking = buildActivityRanking(allData, a.key);
    const total = ranking.length;
    // Top 1
    const top1 = ranking.slice(0, 1);

    const card = document.createElement("div");
    card.className = "card activityCard col-span-3";

    // A2-A4: Centered list, items with vertical content
    const rows = top1.length
      ? top1.map((r, idx) => renderRankRow(r, idx, a, false, true)).join("")
      : `<div class="small" style="text-align:center">Ninguém realizou esta atividade ainda.</div>`;

    card.innerHTML = `
      <div class="activityHead">
         <div>
          <div class="name">${a.label}</div>
          <div class="meta">${a.name}</div>
        </div>
      </div>
      <div class="rankList centered">
        ${rows}
      </div>
    `;
    grid.appendChild(card);
  });

  // 3. Card final: "Colaboradores 4/4" -> col-span-3
  // Mostra quem fez tudo
  const allDone = allData.filter(p => countDone(p) === activities.length);
  const allDoneCard = document.createElement("div");
  allDoneCard.className = "card activityCard col-span-3";

  const allDoneRows = allDone.length
    ? allDone.map(p => `
        <div class="rankRow static-row center-content">
           <div class="rankLeft">
             <div class="podium">🌟</div>
             <div class="rankName">${safeText(p.name)}</div>
           </div>
        </div>
      `).join("")
    : `<div class="small">Ninguém completou 4/4 ainda.</div>`;

  allDoneCard.innerHTML = `
      <div class="activityHead">
        <div>
          <div class="name">Engajamento Total</div>
          <div class="meta">Entregaram tudo!</div>
        </div>
      </div>
      <div class="rankList">
        ${allDoneRows}
      </div>
  `;
  grid.appendChild(allDoneCard);
}

// showPosText: exibe texto "Campeão" ou "Xº lugar"
// isVertical: força layout com podium em cima do nome (classe .vertical-content)
function renderRankRow(r, idx, activity, showPosText = false, isVertical = false, isCentered = false) {
  const url = getSubmissionUrl(r.name, activity.key);
  const hasUrl = Boolean(url);

  // Removido botão de link explícito pois o card inteiro será clicável

  return `
    <div class="rankRow ${isVertical ? "vertical-content" : ""} ${isCentered ? "center-content" : ""}"
          data-participant="${encodeURIComponent(r.name)}"
          data-activity="${activity.key}"
          data-activity-name="${encodeURIComponent(activity.name)}"
          data-url="${encodeURIComponent(url)}">
      <div class="rankLeft">
        <div class="podium">${medal(r.pos)}</div>
        <div>
          <div class="rankName">${safeText(r.name)}</div>
        </div>
      </div>
    </div>
  `;
}

function renderParticipantsTable() {
  const body = el("participantsBody");
  body.innerHTML = "";

  // Filter removed: Show all data
  let displayData = rawData;

  // ordenar por quantidade feitas (4/4 -> 0/4) e depois nome
  const sorted = [...displayData].sort((p1, p2) => {
    const c1 = countDone(p1);
    const c2 = countDone(p2);
    if (c1 !== c2) return c2 - c1;
    return p1.name.localeCompare(p2.name, "pt-BR");
  });

  /* Updated Check Icon */
  const check = `
    <div class="status-icon success-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
  `;
  const dash = "—";

  sorted.forEach((p) => {
    const doneCount = countDone(p);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight:900;">${safeText(p.name)}</td>
      <td class="center"><span class="badge"><span class="dot dot3"></span> ${doneCount}/4</span></td>
      <td class="center">${did(p, "A1") ? check : dash}</td>
      <td class="center">${did(p, "A2") ? check : dash}</td>
      <td class="center">${did(p, "A3") ? check : dash}</td>
      <td class="center">${did(p, "A4") ? check : dash}</td>
    `;

    body.appendChild(tr);
  });

  el("rowCount").innerHTML = `<span class="dot dot1"></span> Exibindo: ${sorted.length}`;
}

// ==============================
// INTERAÇÕES
// ==============================
function bindRankClicks() {
  // Event delegation: funciona mesmo depois de re-render
  el("activitiesGrid")?.addEventListener("click", (e) => {
    const target = e.target;

    // Se clicou no botão e ele está desabilitado, não faz nada.
    const linkBtn = target?.closest?.(".linkBtn");
    if (linkBtn && (linkBtn.classList.contains("disabled") || linkBtn.getAttribute("aria-disabled") === "true")) {
      return;
    }

    const row = target?.closest?.(".rankRow");
    if (!row) return;

    // Se for linha estática (ex: 4/4), ignora clique
    if (row.classList.contains("static-row")) return;

    const participantName = decodeURIComponent(row.dataset.participant || "");
    const activityKey = row.dataset.activity || "";
    const activityName = decodeURIComponent(row.dataset.activityName || "");
    const url = decodeURIComponent(row.dataset.url || "");

    // Removido check de url: abre modal sempre
    openModal({ participantName, activityKey, activityName, url });
  });
}

// ==============================
// LOAD
// ==============================
async function load() {
  // A data/hora foi removida (pílula #asOf é mantida apenas por layout)
  const asOf = el("asOf");
  if (asOf) asOf.textContent = "";

  const res = await fetch("./data.json", { cache: "no-store" });
  rawData = await res.json(); // Store permanently

  renderKpis(rawData);
  renderActivities(rawData);
  renderParticipantsTable(); // Uses rawData & state

  // bindFilter removed
  bindModalEvents();
  bindRankClicks();
}

load();
