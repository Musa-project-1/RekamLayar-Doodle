// ============================================================
// trimmer.js - Pemotong video rekaman pasca-rekam (Client-Side)
// ============================================================
// Tanggung jawab:
//   - Menghitung rentang potong (start & end time).
//   - Memvalidasi batas waktu dan durasi minimum.
//   - Pratinjau potongan langsung di pemutar video.
//   - Memproses potongan menggunakan canvas + MediaRecorder.
//   - Memperbarui State.finalBlob dan menyediakan opsi reset ke asli.

import { State } from "./state.js";
import { get } from "./dom.js";
import { formatTime, formatBytes } from "./utils.js";
import { showToast } from "./ui.js";

// Validasi rentang waktu potongan.
export function validateTrimRange(start, end, totalDuration) {
  const dur = Number(totalDuration) || 0;
  let s = Math.max(0, Number(start) || 0);
  let e = Math.min(dur, Number(end) || dur);

  if (dur <= 0) {
    return { valid: false, error: "Durasi video tidak valid.", start: 0, end: 0, duration: 0 };
  }

  if (s >= e) {
    return { valid: false, error: "Waktu mulai harus lebih kecil dari waktu selesai.", start: s, end: e, duration: 0 };
  }

  const trimmedDur = e - s;
  if (trimmedDur < 0.5) {
    return { valid: false, error: "Durasi potongan minimal 0.5 detik.", start: s, end: e, duration: trimmedDur };
  }

  return { valid: true, start: s, end: e, duration: trimmedDur };
}

// Menghitung estimasi ukuran file hasil potongan berdasarkan durasi.
export function calculateTrimMetrics(start, end, totalDuration, originalBytes) {
  const total = Number(totalDuration) || 1;
  const bytes = Number(originalBytes) || 0;
  const { valid, duration: trimmedDur } = validateTrimRange(start, end, total);

  if (!valid || total <= 0) {
    return { trimmedDuration: 0, estimatedBytes: bytes, percentageKept: 100 };
  }

  const ratio = Math.min(1, Math.max(0, trimmedDur / total));
  const estimatedBytes = Math.round(bytes * ratio);
  const percentageKept = Math.round(ratio * 100);

  return { trimmedDuration: trimmedDur, estimatedBytes, percentageKept };
}

// Format tampilan rentang waktu untuk label UI.
export function formatTimeRange(start, end, totalDuration) {
  const sStr = formatTime(Math.max(0, start));
  const eStr = formatTime(Math.min(totalDuration, end));
  const durStr = formatTime(Math.max(0, end - start));
  const totStr = formatTime(Math.max(0, totalDuration));
  return `${sStr} - ${eStr} (${durStr} / ${totStr})`;
}

// Inisialisasi controller UI trimmer.
export function setupTrimmerUI() {
  const playbackVideo = get("playback-video");
  const startSlider = document.getElementById("trim-start-slider");
  const endSlider = document.getElementById("trim-end-slider");
  const startLabel = document.getElementById("trim-start-label");
  const endLabel = document.getElementById("trim-end-label");
  const rangeDisplay = document.getElementById("trim-range-display");
  const btnPreview = document.getElementById("btn-trim-preview");
  const btnApply = document.getElementById("btn-trim-apply");
  const btnReset = document.getElementById("btn-trim-reset");
  const progressContainer = document.getElementById("trim-progress-container");
  const progressBar = document.getElementById("trim-progress-bar");

  if (!playbackVideo || !startSlider || !endSlider) return;

  let isTrimming = false;
  let previewInterval = null;

  // Sinkronkan slider saat video metadata selesai dimuat.
  const updateSlidersFromVideo = () => {
    const dur = playbackVideo.duration;
    if (!Number.isFinite(dur) || dur <= 0) return;

    startSlider.max = String(dur);
    startSlider.value = "0";
    endSlider.max = String(dur);
    endSlider.value = String(dur);

    if (startLabel) startLabel.textContent = formatTime(0);
    if (endLabel) endLabel.textContent = formatTime(dur);
    if (rangeDisplay) rangeDisplay.textContent = formatTimeRange(0, dur, dur);
  };

  playbackVideo.addEventListener("loadedmetadata", updateSlidersFromVideo);
  playbackVideo.addEventListener("durationchange", updateSlidersFromVideo);

  // Update slider input events.
  const syncLabels = () => {
    const dur = playbackVideo.duration || 0;
    let s = parseFloat(startSlider.value) || 0;
    let e = parseFloat(endSlider.value) || dur;

    // Pastikan start tidak melewati end.
    if (s >= e) {
      s = Math.max(0, e - 0.5);
      startSlider.value = String(s);
    }

    if (startLabel) startLabel.textContent = formatTime(s);
    if (endLabel) endLabel.textContent = formatTime(e);
    if (rangeDisplay) rangeDisplay.textContent = formatTimeRange(s, e, dur);
  };

  startSlider.addEventListener("input", syncLabels);
  endSlider.addEventListener("input", syncLabels);

  // Pratinjau bagian yang dipotong.
  btnPreview?.addEventListener("click", () => {
    const s = parseFloat(startSlider.value) || 0;
    const e = parseFloat(endSlider.value) || playbackVideo.duration;

    playbackVideo.currentTime = s;
    playbackVideo.play().catch(() => {});

    if (previewInterval) clearInterval(previewInterval);
    previewInterval = setInterval(() => {
      if (playbackVideo.currentTime >= e || playbackVideo.paused) {
        playbackVideo.pause();
        clearInterval(previewInterval);
        previewInterval = null;
      }
    }, 100);
  });

  // Terapkan pemotongan video (render ulang via canvas & MediaRecorder).
  btnApply?.addEventListener("click", async () => {
    if (isTrimming || !State.finalBlob) return;

    const dur = playbackVideo.duration || 0;
    const s = parseFloat(startSlider.value) || 0;
    const e = parseFloat(endSlider.value) || dur;

    const validation = validateTrimRange(s, e, dur);
    if (!validation.valid) {
      showToast(validation.error);
      return;
    }

    isTrimming = true;
    btnApply.disabled = true;
    if (progressContainer) progressContainer.classList.remove("hidden");
    if (progressBar) progressBar.style.width = "0%";

    try {
      showToast("Memproses potongan video...");
      const trimmedBlob = await executeTrim(
        State.finalBlob,
        validation.start,
        validation.end,
        (pct) => {
          if (progressBar) progressBar.style.width = `${pct}%`;
        }
      );

      // Simpan backup originalBlob jika belum ada.
      if (!State.originalBlob) {
        State.originalBlob = State.finalBlob;
      }

      // Perbarui final blob dengan hasil potongan.
      State.finalBlob = trimmedBlob;
      State.finalBlobSize = formatBytes(trimmedBlob.size);

      // Revoke URL lama & buat URL baru.
      if (State.finalBlobURL) URL.revokeObjectURL(State.finalBlobURL);
      State.finalBlobURL = URL.createObjectURL(trimmedBlob);
      playbackVideo.src = State.finalBlobURL;

      if (btnReset) btnReset.classList.remove("hidden");
      showToast("Video berhasil dipotong! (" + State.finalBlobSize + ")");
    } catch (err) {
      showToast("Gagal memotong video: " + err.message);
    } finally {
      isTrimming = false;
      btnApply.disabled = false;
      setTimeout(() => {
        if (progressContainer) progressContainer.classList.add("hidden");
      }, 600);
    }
  });

  // Reset ke video asli sebelum pemotongan.
  btnReset?.addEventListener("click", () => {
    if (!State.originalBlob) return;

    State.finalBlob = State.originalBlob;
    State.finalBlobSize = formatBytes(State.originalBlob.size);

    if (State.finalBlobURL) URL.revokeObjectURL(State.finalBlobURL);
    State.finalBlobURL = URL.createObjectURL(State.finalBlob);
    playbackVideo.src = State.finalBlobURL;

    btnReset.classList.add("hidden");
    showToast("Video dikembalikan ke rekaman asli.");
  });
}

// Proses pemotongan video via offscreen canvas dan MediaRecorder.
async function executeTrim(sourceBlob, startTime, endTime, onProgress) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.src = URL.createObjectURL(sourceBlob);
    video.muted = true; // Mencegah suara dobel saat proses render

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Gagal membaca video sumber"));
    };

    video.onloadedmetadata = async () => {
      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");

      // Setup capture stream pada 30 FPS.
      const canvasStream = canvas.captureStream(30);

      // Rute audio dari elemen video jika didukung.
      let audioCtx = null;
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        dest.stream.getAudioTracks().forEach((t) => canvasStream.addTrack(t));
      } catch (_) {
        // Fallback: jika MediaElementSource dibatasi, tetap proses video canvas
      }

      // Pilih MIME type yang didukung.
      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm"
      ];
      let mimeType = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || "";

      let recorder;
      try {
        recorder = new MediaRecorder(canvasStream, mimeType ? { mimeType } : {});
      } catch (e) {
        URL.revokeObjectURL(video.src);
        if (audioCtx) audioCtx.close().catch(() => {});
        reject(e);
        return;
      }

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      let animId = null;
      const totalTrimDur = Math.max(0.1, endTime - startTime);

      recorder.onstop = () => {
        if (animId) cancelAnimationFrame(animId);
        if (audioCtx) audioCtx.close().catch(() => {});
        URL.revokeObjectURL(video.src);
        video.src = "";
        const resultBlob = new Blob(chunks, { type: mimeType || "video/webm" });
        resolve(resultBlob);
      };

      // Pindahkan playback ke waktu mulai.
      video.currentTime = startTime;
      await new Promise((res) => { video.onseeked = res; });

      recorder.start(100);
      video.play().catch(reject);

      const renderFrame = () => {
        if (video.currentTime >= endTime || video.ended) {
          video.pause();
          if (recorder.state === "recording") recorder.stop();
          if (onProgress) onProgress(100);
          return;
        }

        ctx.drawImage(video, 0, 0, w, h);
        const curProgress = Math.min(
          99,
          Math.max(0, Math.round(((video.currentTime - startTime) / totalTrimDur) * 100))
        );
        if (onProgress) onProgress(curProgress);
        animId = requestAnimationFrame(renderFrame);
      };

      animId = requestAnimationFrame(renderFrame);
    };
  });
}
