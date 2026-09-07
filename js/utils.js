// ============================================================
// utils.js - Helper UI & utility murni (tanpa side effect media)
// ============================================================

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n < 0) return "0 MB";
  if (n === 0) return "0 MB";
  if (n < 1024) return n + " B";
  const kb = n / 1024;
  if (kb < 1024) return kb.toFixed(1) + " KB";
  const mb = kb / 1024;
  if (mb < 1024) return mb.toFixed(2) + " MB";
  return (mb / 1024).toFixed(2) + " GB";
}

function formatTime(totalSeconds) {
  const total = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function sanitizeFilename(name) {
  return (name || "rekaman")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function timestampString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Menghitung source rectangle (dalam pixel) untuk crop region relatif (0-1).
// Return {sx, sy, sw, sh} yang sudah di-clamp ke batas video.
function computeCropSource(cropRegion, fullW, fullH) {
  const w = fullW || 0;
  const h = fullH || 0;
  if (!cropRegion) return { sx: 0, sy: 0, sw: w, sh: h };

  const r = cropRegion;
  const sx = Math.max(0, Math.round(r.x * w));
  const sy = Math.max(0, Math.round(r.y * h));
  const sw = Math.min(w - sx, Math.round(r.w * w));
  const sh = Math.min(h - sy, Math.round(r.h * h));
  return { sx, sy, sw: Math.max(1, sw), sh: Math.max(1, sh) };
}

// Cek apakah browser mendukung Web API getDisplayMedia (perekaman layar)
function isDisplayMediaSupported() {
  return typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === "function");
}

// Deteksi apakah pengguna mengakses dari perangkat seluler (smartphone / tablet)
function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTouchDevice = typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1;
  const isNarrowScreen = typeof window !== "undefined" && window.innerWidth <= 820;
  return isMobileUA || (isTouchDevice && isNarrowScreen);
}

export {
  sleep,
  formatBytes,
  formatTime,
  sanitizeFilename,
  timestampString,
  escapeHtml,
  computeCropSource,
  isDisplayMediaSupported,
  isMobileDevice
};
