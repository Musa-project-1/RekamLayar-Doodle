// ============================================================
// ui.js - Toast, notifikasi, modal konfirmasi, download, suara
// ============================================================
import { get } from "./dom.js";

let toastTimer = null;

export function showToast(msg, duration = 3000) {
  const el = get("toast-msg");
  const text = get("toast-text");
  if (!el || !text) return;
  text.textContent = msg;
  el.classList.remove("hidden", "opacity-0", "translate-y-4");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.add("opacity-0", "translate-y-4");
    setTimeout(() => el.classList.add("hidden"), 300);
  }, duration);
}

export function addNotification(title, body) {
  const list = get("notif-list");
  const dot = get("notif-dot");
  if (!list) return;
  const item = document.createElement("div");
  item.className = "px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors";
  const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  item.innerHTML =
    `<p class="text-sm font-medium text-slate-200">${escapeHtml(title)}</p>` +
    `<p class="text-xs text-slate-400 mt-0.5">${escapeHtml(body)}</p>` +
    `<p class="text-[10px] text-slate-500 mt-1">${time}</p>`;
  list.prepend(item);
  if (dot) dot.classList.remove("hidden");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function playBeep(type = "start") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    if (type === "start") {
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "stop") {
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
    osc.onended = () => ctx.close();
  } catch (_) {
    /* AudioContext mungkin belum diizinkan user; abaikan. */
  }
}

export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// Modal konfirmasi generik yang meneruskan callback ke caller.
export function openConfirm(message, onConfirm) {
  const modal = get("confirm-modal");
  const text = get("confirm-text");
  if (!modal || !text) return;
  text.textContent = message;
  modal.classList.remove("hidden");
  window.__confirmCallback = onConfirm;
}

export function closeConfirm() {
  const modal = get("confirm-modal");
  if (modal) modal.classList.add("hidden");
  window.__confirmCallback = null;
}

export { escapeHtml };
