// ============================================================
// events.js - Semua UI event handlers
// ============================================================
import { State } from "./state.js";
import { get } from "./dom.js";
import { Timer, runCountdown } from "./timer.js";
import * as Media from "./media.js";
import { GDrive } from "./gdrive.js";
import { setupNotesDrag, setupCamDrag } from "./drag.js";
import { renderHistory, addHistoryEntry, wipeHistory } from "./history.js";
import { loadSettings, saveSettings } from "./settings.js";
import { showToast, addNotification, playBeep, closeConfirm, triggerDownload } from "./ui.js";
import { sanitizeFilename, timestampString } from "./utils.js";

let recordingInProgress = false;

// Guard terhadap penutupan tab saat merekam (cegah data loss).
export function isRecording() {
  return recordingInProgress;
}

function setupUnloadGuard() {
  window.addEventListener("beforeunload", (e) => {
    if (!recordingInProgress) return;
    e.preventDefault();
    e.returnValue = ""; // memicu dialog konfirmasi bawaan browser
  });
}

export function setupEventListeners() {
  const d = get;
  setupUnloadGuard();

  // ---- Toggle Mic & Camera ----
  d("toggle-mic")?.addEventListener("click", () => {
    State.useMic = !State.useMic;
    const icon = d("mic-icon");
    if (icon) icon.className = State.useMic
      ? "fa-solid fa-microphone text-indigo-300"
      : "fa-solid fa-microphone-slash text-slate-500";
    d("mic-volume-container")?.classList.toggle("hidden", !State.useMic);
    showToast(State.useMic ? "Mikrofon aktif" : "Mikrofon nonaktif");
  });

  d("toggle-camera")?.addEventListener("click", () => {
    State.useCamera = !State.useCamera;
    const icon = d("camera-icon");
    if (icon) icon.className = State.useCamera
      ? "fa-solid fa-video text-indigo-300"
      : "fa-solid fa-video-slash text-slate-500";
    showToast(State.useCamera ? "Kamera aktif" : "Kamera nonaktif");
  });

  // ---- Mulai rekam ----
  d("btn-start")?.addEventListener("click", async () => {
    if (recordingInProgress) return;
    const settings = State.settings;
    const seconds = Number(settings.countdown) || 0;

    try {
      if (seconds > 0) await runCountdown(seconds);
      await Media.captureSources({
        useMic: State.useMic,
        useCamera: State.useCamera,
        fps: settings.fps
      });
      const videoPreview = d("video-preview");
      Media.buildComposite(videoPreview);
      Media.startRecording({ useMic: State.useMic, useCamera: State.useCamera });
      Media.startVisualizer();
      Timer.start();
      recordingInProgress = true;
      setRecordingUI(true);
      playBeep("start");
      addNotification("Rekaman dimulai", "Layar sedang direkam.");
    } catch (err) {
      showToast("Gagal memulai rekaman: " + err.message);
    }
  });

  // ---- Pause / Resume ----
  d("btn-pause")?.addEventListener("click", () => {
    if (!recordingInProgress) return;
    if (!State.isPaused) {
      Media.pauseRecording();
      Timer.pause();
      State.isPaused = true;
      playBeep("stop");
    } else {
      Media.resumeRecording();
      Timer.resume();
      State.isPaused = false;
      playBeep("start");
    }
    const icon = d("btn-pause")?.querySelector("i");
    if (icon) icon.className = State.isPaused
      ? "fa-solid fa-play text-sm"
      : "fa-solid fa-pause text-sm";
  });

  // ---- Stop ----
  d("btn-stop")?.addEventListener("click", async () => {
    if (!recordingInProgress) return;
    recordingInProgress = false;
    await Media.stopRecording();
    Media.stopVisualizer();
    Media.stopAllTracks();
    Timer.stop();
    setRecordingUI(false);
    playBeep("stop");
    addNotification("Rekaman selesai", "Rekaman siap diunduh atau disimpan.");
    const title = sanitizeFilename("LayarPro-rekaman");
    addHistoryEntry({
      title,
      type: "layar",
      size: State.finalBlobSize,
      source: "lokal"
    });
    d("post-recording-actions")?.classList.remove("hidden");
  });

  // ---- Screenshot ----
  d("btn-screenshot")?.addEventListener("click", () => {
    const dataUrl = Media.screenshotFromCanvas();
    if (!dataUrl) {
      showToast("Belum ada rekaman untuk di-screenshot.");
      return;
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `LayarPro-screenshot-${timestampString()}.png`;
    a.click();
    showToast("Screenshot tersimpan.");
  });

  // ---- Notes / Teleprompter ----
  d("btn-notes")?.addEventListener("click", () => {
    d("floating-notepad")?.classList.toggle("hidden");
  });
  d("btn-close-notes")?.addEventListener("click", () => {
    d("floating-notepad")?.classList.add("hidden");
  });
  d("btn-download-notes")?.addEventListener("click", () => {
    const text = d("notepad-text")?.value || "";
    if (!text.trim()) {
      showToast("Catatan kosong.");
      return;
    }
    const blob = new Blob([text], { type: "text/plain" });
    triggerDownload(blob, `LayarPro-catatan-${timestampString()}.txt`);
  });
  setupNotesDrag(d("notepad-header"), d("floating-notepad"));

  // ---- PiP ----
  d("btn-pip")?.addEventListener("click", async () => {
    try {
      const v = d("video-preview");
      if (v && document.pictureInPictureEnabled && v !== document.pictureInPictureElement) {
        await v.requestPictureInPicture();
      }
    } catch (err) {
      showToast("PiP tidak didukung: " + err.message);
    }
  });
  setupCamDrag(d("facecam-preview"), d("facecam-preview"));

  // ---- Post-recording ----
  d("btn-close-post-rec")?.addEventListener("click", () => {
    d("post-recording-actions")?.classList.add("hidden");
  });
  d("btn-download-local")?.addEventListener("click", () => {
    if (!State.finalBlob) return;
    const ext = Media.currentExtension();
    const name = `${sanitizeFilename("LayarPro-rekaman")}-${timestampString()}.${ext}`;
    triggerDownload(State.finalBlob, name);
  });
  d("btn-save-drive")?.addEventListener("click", () => {
    GDrive.requestToken();
  });

  // ---- Drive modal ----
  d("btn-close-drive-modal")?.addEventListener("click", () => {
    d("drive-modal")?.classList.add("hidden");
  });
  d("drive-modal")?.addEventListener("click", (e) => {
    if (e.target === d("drive-modal")) d("drive-modal")?.classList.add("hidden");
  });

  // ---- History ----
  d("menu-history")?.addEventListener("click", () => {
    renderHistory();
    d("history-modal")?.classList.remove("hidden");
  });
  d("btn-close-history")?.addEventListener("click", () => {
    d("history-modal")?.classList.add("hidden");
  });
  d("btn-clear-history")?.addEventListener("click", () => {
    wipeHistory();
    showToast("Riwayat dihapus.");
  });

  // ---- Settings ----
  d("menu-settings")?.addEventListener("click", () => {
    const s = loadSettings();
    if (d("setting-resolution")) d("setting-resolution").value = s.resolution;
    if (d("setting-format")) d("setting-format").value = s.format;
    if (d("setting-countdown")) d("setting-countdown").value = s.countdown;
    d("settings-modal")?.classList.remove("hidden");
  });
  d("btn-close-settings")?.addEventListener("click", () => {
    d("settings-modal")?.classList.add("hidden");
  });

  // ---- Notifikasi ----
  d("btn-clear-notif")?.addEventListener("click", () => {
    const list = d("notif-list");
    if (list) list.innerHTML = "";
    d("notif-dot")?.classList.add("hidden");
  });

  // ---- Shortcuts ----
  d("btn-shortcuts")?.addEventListener("click", () => {
    d("shortcuts-modal")?.classList.remove("hidden");
  });
  d("btn-close-shortcuts")?.addEventListener("click", () => {
    d("shortcuts-modal")?.classList.add("hidden");
  });

  // ---- Confirm modal ----
  d("btn-confirm-cancel")?.addEventListener("click", closeConfirm);
  d("btn-confirm-ok")?.addEventListener("click", () => {
    if (window.__confirmCallback) {
      const cb = window.__confirmCallback;
      closeConfirm();
      cb();
    }
  });

  // ---- Close modals on backdrop ----
  ["settings-modal", "shortcuts-modal", "history-modal"].forEach((id) => {
    d(id)?.addEventListener("click", (e) => {
      if (e.target === d(id)) d(id)?.classList.add("hidden");
    });
  });

  // ---- Keyboard shortcuts ----
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === " " && !recordingInProgress) {
      e.preventDefault();
      d("btn-start")?.click();
    } else if (e.key.toLowerCase() === "s" && recordingInProgress) {
      e.preventDefault();
      d("btn-stop")?.click();
    }
  });

  bindSettingsSave();
}

function setRecordingUI(active) {
  const status = get("status-badge");
  const indicator = get("status-indicator");
  const timerContainer = get("recording-timer-container");
  const preRecord = get("pre-record-settings");

  if (status) status.textContent = active ? "Merekam" : "Siap";
  if (indicator) {
    indicator.className = active
      ? "w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"
      : "w-2.5 h-2.5 rounded-full bg-emerald-400";
  }
  if (timerContainer) timerContainer.classList.toggle("hidden", !active);
  if (preRecord) preRecord.classList.toggle("hidden", active);
  get("btn-start")?.classList.toggle("hidden", active);
  get("btn-pause")?.classList.toggle("hidden", !active);
  get("btn-stop")?.classList.toggle("hidden", !active);
}

function bindSettingsSave() {
  const save = () => {
    State.settings.resolution = get("setting-resolution")?.value || "default";
    const format = get("setting-format")?.value || "webm";
    State.settings.format = format;
    // Propagate ke media engine agar pickMimeType() pakai yang benar
    Media.setRecordFormat(format);
    State.settings.countdown = get("setting-countdown")?.value || "3";
    saveSettings(State.settings);
    showToast("Pengaturan tersimpan.");
  };
  get("setting-resolution")?.addEventListener("change", save);
  get("setting-format")?.addEventListener("change", save);
  get("setting-countdown")?.addEventListener("change", save);
}
