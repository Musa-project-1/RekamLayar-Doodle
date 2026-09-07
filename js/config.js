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
  DRIVE_FOLDER_NAME: "LayarPro",
  SETTINGS_KEY: "layarpro_settings",
  HISTORY_KEY: "layarpro_history"
};

// Daftar MIME types yang dicoba berurutan (kualitas terbaik lebih dulu).
export const MIME_TYPES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm"
];

export const RECORD_EXTENSION = "webm";
