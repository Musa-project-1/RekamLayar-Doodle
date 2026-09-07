// ============================================================
// history.js - Riwayat rekaman (daftar & render)
// ============================================================
import { loadHistory, saveHistory, clearHistory } from "./settings.js";
import { get } from "./dom.js";
import { formatBytes, escapeHtml } from "./utils.js";

export function renderHistory(filter = "", search = "") {
  const list = get("history-list");
  if (!list) return;
  const items = loadHistory();
  const filtered = items.filter((it) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (it.title || "").toLowerCase().includes(q) ||
      (it.source || "").toLowerCase().includes(q);
    const matchFilter = !filter || filter === "all" || it.type === filter;
    return matchSearch && matchFilter;
  });

  list.innerHTML = "";
  if (filtered.length === 0) {
    list.innerHTML =
      `<div class="col-span-full text-center py-10 text-slate-500 text-sm">` +
      `Belum ada rekaman yang cocok.</div>`;
    return;
  }

  filtered.forEach((it) => {
    const card = document.createElement("div");
    card.className =
      "glass-panel rounded-xl p-4 flex flex-col gap-2 border border-white/5";
    const time = new Date(it.timestamp).toLocaleString("id-ID");
    card.innerHTML =
      `<div class="flex items-center justify-between gap-2">` +
      `<p class="text-sm font-semibold text-slate-100 truncate">${escapeHtml(it.title)}</p>` +
      `<span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">${escapeHtml(it.type)}</span>` +
      `</div>` +
      `<p class="text-xs text-slate-400">${time}</p>` +
      `<p class="text-xs text-slate-500">${it.size} &middot; ${it.source}</p>`;
    list.appendChild(card);
  });
}

export function addHistoryEntry({ title, type, size, source }) {
  const items = loadHistory();
  items.unshift({
    title: title || "Rekaman",
    type: type || "layar",
    size: size || "0 MB",
    source: source || "lokal",
    timestamp: Date.now()
  });
  saveHistory(items);
  renderHistory();
}

export function wipeHistory() {
  clearHistory();
  renderHistory();
}

export { formatBytes };
