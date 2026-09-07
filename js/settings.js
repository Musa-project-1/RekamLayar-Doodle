// ============================================================
// settings.js - Persistensi pengaturan & riwayat (localStorage)
// ============================================================
import { CONFIG } from "./config.js";

const DEFAULTS = {
  resolution: "default",
  fps: "30",
  countdown: "3",
  format: "webm"
};

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {
    /* localStorage penuh / private mode; abaikan. */
  }
}

export function loadSettings() {
  return { ...DEFAULTS, ...safeGet(CONFIG.SETTINGS_KEY, {}) };
}

export function saveSettings(settings) {
  safeSet(CONFIG.SETTINGS_KEY, settings);
}

export function loadHistory() {
  return safeGet(CONFIG.HISTORY_KEY, []);
}

export function saveHistory(history) {
  safeSet(CONFIG.HISTORY_KEY, history.slice(0, 50));
}

export function clearHistory() {
  localStorage.removeItem(CONFIG.HISTORY_KEY);
}
