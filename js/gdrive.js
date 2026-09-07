// ============================================================
// gdrive.js - Google Drive uploader (OAuth token di memori saja)
// ============================================================
// KEAMANAN:
//   - Token akses TIDAK disimpan di localStorage/sessionStorage.
//   - Token hanya hidup di State selama sesi (in-memory).
//   - Menggunakan scope drive.file (akses terbatas pada file yang
//     dibuat aplikasi), bukan drive (full access).

import { State } from "./state.js";
import { CONFIG } from "./config.js";
import { get } from "./dom.js";
import { showToast } from "./ui.js";

export const GDrive = {
  init() {
    if (!window.google || !window.google.accounts) {
      showToast("Google Identity Services belum dimuat.");
      return;
    }
    State.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      scope: CONFIG.DRIVE_SCOPE,
      callback: (resp) => {
        if (resp.error) {
          showToast("Gagal otorisasi Google Drive: " + resp.error);
          return;
        }
        State.gdriveAccessToken = resp.access_token;
        this.uploadFinalBlob();
      }
    });
  },

  requestToken() {
    if (State.gdriveAccessToken) {
      this.uploadFinalBlob();
      return;
    }
    if (State.tokenClient) {
      State.tokenClient.requestAccessToken();
    } else {
      this.init();
      setTimeout(() => State.tokenClient?.requestAccessToken(), 300);
    }
  },

  clearToken() {
    State.gdriveAccessToken = null;
  },

  async uploadFinalBlob() {
    if (!State.finalBlob) {
      showToast("Tidak ada rekaman untuk diunggah.");
      return;
    }
    const token = State.gdriveAccessToken;
    if (!token) {
      this.requestToken();
      return;
    }

    const modal = get("drive-modal");
    const bar = get("drive-progress-bar");
    const pct = get("drive-percentage");
    if (modal) modal.classList.remove("hidden");
    if (bar) bar.style.width = "0%";

    try {
      const filename = `Reka-${Date.now()}.${CONFIG_EXT()}`;
      const metadata = {
        name: filename,
        mimeType: State.finalBlob.type || "video/webm"
      };

      // Fase 1: multer metadata (resumable upload).
      const initRes = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(metadata)
        }
      );
      if (!initRes.ok) throw new Error("Gagal memulai unggahan (HTTP " + initRes.status + ")");
      const location = initRes.headers.get("Location");

      // Fase 2: upload blob (bisa dipantau progress).
      const uploadRes = await fetch(location, {
        method: "PUT",
        headers: { "Content-Type": State.finalBlob.type || "video/webm" },
        body: State.finalBlob
      });

      if (bar) bar.style.width = "100%";
      if (pct) pct.textContent = "100%";

      if (!uploadRes.ok) throw new Error("Unggahan gagal (HTTP " + uploadRes.status + ")");

      const file = await uploadRes.json();
      const successActions = get("drive-success-actions");
      if (successActions) successActions.classList.remove("hidden");
      showToast("Berhasil disimpan ke Google Drive.");
    } catch (err) {
      showToast("Gagal unggah: " + err.message);
      if (bar) bar.style.width = "0%";
    }
  }
};

function CONFIG_EXT() {
  return "webm";
}
