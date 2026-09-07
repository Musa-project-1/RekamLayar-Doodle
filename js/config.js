// ============================================================
// config.js - Konfigurasi terpusat (non-secret)
// ============================================================
//
// CATATAN KEAMANAN:
//   Google OAuth Client ID bersifat publik untuk aplikasi web
//   (bukan rahasia). Meski demikian, nilai ini dipindahkan ke
//   modul konfigurasi terpisah agar mudah dirotasi dan tidak
//   tertanam di logika bisnis. Token akses TIDAK pernah
//   disimpan ke localStorage; token hanya hidup di memori (State)
//   selama sesi berjalan.

export const CONFIG = {
  // Ganti dengan Client ID Google OAuth Anda sendiri.
  // Cara membuatnya: https://console.cloud.google.com/apis/credentials
  // Pastikan "Authorized JavaScript origins" dikunci ke domain Anda.
  GOOGLE_CLIENT_ID: "YOUR_GOOGLE_CLIENT_ID",
  DRIVE_SCOPE: "https://www.googleapis.com/auth/drive.file",
  DRIVE_FOLDER_NAME: "Reka",
  SETTINGS_KEY: "reka_settings",
  HISTORY_KEY: "reka_history"
};

// Daftar MIME types per format output (kualitas terbaik lebih dulu).
// Browser modern mayoritas mendukung WebM; MP4 (H.264) hanya sebagian
// (Chrome/Edge via hardware encoder). Fallback otomatis ke webm.
const FORMAT_CONFIG = {
  webm: {
    extension: "webm",
    mimeTypes: [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ]
  },
  mp4: {
    extension: "mp4",
    mimeTypes: [
      "video/mp4;codecs=h264,aac",
      "video/mp4;codecs=avc1",
      "video/mp4"
    ]
  }
};

export function getFormatConfig(format = "webm") {
  return FORMAT_CONFIG[format] || FORMAT_CONFIG.webm;
}

// Daftar format yang didukung UI (untuk dropdown dinamis).
export const SUPPORTED_FORMATS = Object.keys(FORMAT_CONFIG);

// Tetap dipertahankan untuk kompatibilitas (default webm).
export const MIME_TYPES = FORMAT_CONFIG.webm.mimeTypes;
export const RECORD_EXTENSION = FORMAT_CONFIG.webm.extension;

// Durasi maksimum rekaman dalam milidetik (60 menit).
export const MAX_DURATION_MS = 60 * 60 * 1000;
// Warning threshold dalam milidetik (15, 30, 45 menit).
export const WARNING_THRESHOLDS = [15, 30, 45]; // menit
