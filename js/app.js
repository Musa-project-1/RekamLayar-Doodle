// ============================================================
// app.js - Bootstrap aplikasi (entry point)
// ============================================================
import { State } from "./state.js";
import { initDom } from "./dom.js";
import { setupEventListeners, initWatermarkUI } from "./events.js";
import { setupCropSelector } from "./crop.js";
import { setupTrimmerUI } from "./trimmer.js";
import { setupDoodle } from "./doodle.js";
import { setupMobileSupport } from "./mobile.js";
import { GDrive } from "./gdrive.js";
import { loadSettings } from "./settings.js";
import { setupAutoSave } from "./media.js";
import * as Media from "./media.js";
import { get } from "./dom.js";
import { TimerExtended } from "./timer-extended.js";

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* offline mode gagal; tidak fatal */
    });
  }
}

function bootstrap() {
  try {
    initDom();
    State.settings = { ...State.settings, ...loadSettings() };

    // Terapkan format tersimpan ke media engine.
    Media.setRecordFormat(State.settings.format || "webm");
    
    // Apply auto-save setting
    State.durationLimitEnabled = State.settings.durationLimitEnabled ?? true;

    // Isi radio FPS dari pengaturan.
    const fps = State.settings.fps;
    const radios = get("setFpsRadios") || [];
    radios.forEach((r) => {
      if (r.value === fps) r.checked = true;
    });

    setupEventListeners();
    initWatermarkUI();
    setupCropSelector();
    setupTrimmerUI();
    setupDoodle();
    setupMobileSupport();
    setupAutoSave();
    GDrive.init();
    registerServiceWorker();
    
    console.log("[Reka] siap.");
  } catch (e) {
    console.error("[Reka] Gagal inisialisasi:", e);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
