// ============================================================
// mobile.js - Deteksi & Dukungan Fallback Perangkat Seluler
// ============================================================
// Tanggung jawab:
//   - Mendeteksi perangkat seluler (smartphone / tablet).
//   - Memeriksa ketersediaan Web API getDisplayMedia().
//   - Menampilkan edukasi ramah pengguna mengenai pembatasan OS seluler.
//   - Menyediakan mode fallback Perekam Kamera & Suara jika rekam layar tidak didukung.

import { State } from "./state.js";
import { get } from "./dom.js";
import { isDisplayMediaSupported, isMobileDevice } from "./utils.js";
import { showToast } from "./ui.js";

// Menentukan mode perekaman yang tersedia
export function resolveRecordingMode(displaySupported) {
  return displaySupported ? "screen" : "camera";
}

// Menghasilkan teks panduan edukatif sesuai status perangkat
export function getMobileNoticeMessage(isMobile, displaySupported) {
  if (!displaySupported) {
    return isMobile
      ? "Browser ponsel (Android/iOS) melarang perekaman layar demi keamanan privasi sistem operasi. Mode Kamera & Suara diaktifkan secara otomatis. Buka di Laptop/PC untuk merekam layar penuh."
      : "Browser ini belum mendukung perekaman layar penuh. Mode Kamera & Suara diaktifkan.";
  }
  return "";
}

// Inisialisasi dukungan seluler saat aplikasi dimuat
export function setupMobileSupport() {
  const displaySupported = isDisplayMediaSupported();
  const mobile = isMobileDevice();

  State.isMobile = mobile;
  State.recordingMode = resolveRecordingMode(displaySupported);

  // Jika perekaman layar tidak didukung (ponsel atau browser tanpa getDisplayMedia)
  if (!displaySupported || mobile) {
    applyMobileUIMode(mobile, displaySupported);
  }
}

// Mengadaptasi antarmuka untuk mode seluler / kamera
function applyMobileUIMode(isMobile, displaySupported) {
  const noticeBanner = document.getElementById("mobile-notice-banner");
  const noticeText = document.getElementById("mobile-notice-text");
  const btnStart = get("btn-start");
  const noVideoTitle = document.querySelector("#no-video-overlay h2");
  const noVideoDesc = document.querySelector("#no-video-overlay p");

  const message = getMobileNoticeMessage(isMobile, displaySupported);

  // Tampilkan banner informasi di atas layar
  if (noticeBanner && noticeText) {
    noticeText.textContent = message;
    noticeBanner.classList.remove("hidden");
    noticeBanner.classList.add("flex");
  }

  // Sesuaikan teks tombol rekam
  if (btnStart && !displaySupported) {
    btnStart.innerHTML = `<i class="fa-solid fa-camera"></i> Mulai Rekam Kamera`;
  }

  // Sesuaikan teks overlay pratinjau
  if (noVideoTitle && !displaySupported) {
    noVideoTitle.textContent = "Perekam Video Kamera";
  }
  if (noVideoDesc && !displaySupported) {
    noVideoDesc.textContent = "Tekan tombol di atas untuk mulai merekam video diri dan suara Anda secara langsung.";
  }

  // Tombol tutup banner
  document.getElementById("btn-close-mobile-notice")?.addEventListener("click", () => {
    noticeBanner?.classList.add("hidden");
    noticeBanner?.classList.remove("flex");
  });
}

// Menangkap kamera sebagai sumber video utama (fallback saat di ponsel)
export async function captureCameraSource({ fps, facingMode = "user" }) {
  const targetFps = Number(fps) || 30;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode,
        frameRate: { ideal: targetFps }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    State.displayStream = stream;
    // Pada mode kamera seluler, stream audio sudah langsung tergabung
    return stream;
  } catch (err) {
    showToast("Akses kamera atau mikrofon ditolak: " + err.message);
    throw err;
  }
}
