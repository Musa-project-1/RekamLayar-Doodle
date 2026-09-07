// ============================================================
// dom.js - Cache referensi elemen DOM
// ============================================================
// Dipanggil setelah DOM siap. Gunakan fungsi get() agar aman
// terhadap elemen yang mungkin tidak ada di halaman.

const cache = {};

function $(id) {
  return document.getElementById(id);
}

export function initDom() {
  const ids = [
    "video-preview", "no-video-overlay", "facecam-preview", "playback-video",
    "btn-start", "btn-pause", "btn-stop",
    "toggle-mic", "toggle-camera", "mic-icon", "camera-icon",
    "mic-volume-container", "mic-volume-bar",
    "status-badge", "status-indicator",
    "recording-timer-container", "timer-display",
    "pre-record-settings", "meeting-title", "auto-stop-mins",
    "countdown-overlay", "countdown-text",
    "btn-screenshot", "btn-notes", "btn-pip",
    "floating-notepad", "notepad-header", "btn-close-notes",
    "btn-download-notes", "notepad-text",
    "post-recording-actions", "btn-close-post-rec",
    "btn-download-local", "btn-save-drive",
    "drive-modal", "drive-progress-bar", "drive-percentage",
    "drive-title", "drive-desc", "drive-success-actions", "btn-close-drive-modal",
    "history-modal", "history-list", "history-search", "history-filter",
    "settings-modal", "shortcuts-modal",
    "btn-shortcuts", "btn-close-shortcuts",
    "confirm-modal", "confirm-text", "btn-confirm-cancel", "btn-confirm-ok",
    "btn-notif", "notif-panel", "notif-list", "notif-dot",
    "toast-msg", "toast-text",
    "setting-resolution", "setting-format", "setting-countdown",
    "btn-clear-history",
    "menu-new", "menu-history", "menu-settings"
  ];
  ids.forEach((id) => {
    cache[id] = $(id);
  });
  // Elemen berulang (radio group) diambil lewat query.
  cache.setFpsRadios = Array.from(document.getElementsByName("fps"));
  return cache;
}

export function getDom() {
  return cache;
}

export function get(id) {
  return cache[id] || $(id);
}
