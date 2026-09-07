// ============================================================
// media.js - MediaStream capture, komposit, recorder & visualizer
// ============================================================
// Tanggung jawab:
//   - Menangkap display + microphone + webcam.
//   - Menyusun kanvas komposit (layar + picture-in-picture webcam).
//   - Menghidupkan MediaRecorder dengan dukungan auto-save.
//   - Mengelola chunks secara aman untuk mencegah memory leak.
//   - Visualizer gelombang mikrofon.

import { State, AudioState, releaseFinalBlob } from "./state.js";
import { getFormatConfig } from "./config.js";
import { get } from "./dom.js";
import { computeCropSource, formatBytes, sanitizeFilename, timestampString } from "./utils.js";
import { showToast } from "./ui.js";

// MIME type + extension aktif untuk sesi ini (ditentukan oleh setting format).
let activeFormat = "webm";

export function currentExtension() {
  return getFormatConfig(activeFormat).extension;
}

function pickMimeType() {
  const { mimeTypes } = getFormatConfig(activeFormat);
  for (const t of mimeTypes) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(t)) return t;
  }
  // Fallback: jika format yang diminta tidak didukung, pakai webm.
  const fallback = getFormatConfig("webm").mimeTypes;
  for (const t of fallback) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(t)) {
      activeFormat = "webm";
      return t;
    }
  }
  return "";
}

export function setRecordFormat(format) {
  activeFormat = getFormatConfig(format) ? format : "webm";
}

export async function captureSources({ useMic, useCamera, fps }) {
  // Clear previous streams.
  stopAllTracks();
  
  // Display capture dengan system audio (experimental) atau fallback ke mic.
  let displayStream;
  const fpsNumber = Number(fps) || 30;
  
  try {
    // Attempt to capture system audio first (requires enable-unsafe-unsecure-media-policies).
    displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: fpsNumber } },
      audio: true // System audio capture
    });
    State.audioSourceType = 'system';
  } catch (err) {
    console.warn("System audio not available, falling back to microphone:", err);
    State.audioSourceType = 'none';
    
    // Fallback: no system audio in this call, handle mic separately.
    displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: fpsNumber } },
      audio: false
    });
  }
  
  State.displayStream = displayStream;
  
  // Mic handling: if user requested mic AND system audio wasn't available.
  if (useMic && !displayStream.getAudioTracks().length) {
    try {
      const voiceStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      State.voiceStream = voiceStream;
      State.audioSourceType = 'mic';
    } catch (err) {
      console.log("Microphone access denied or unavailable:", err.message);
      State.useMic = false;
    }
  } else if (useMic && displayStream.getAudioTracks().length) {
    // System audio captured successfully, but user still might want additional mic input.
    try {
      const voiceStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      State.voiceStream = voiceStream;
      // If both system audio and mic are available, we keep both.
    } catch (err) {
      console.log("Additional microphone not available:", err.message);
    }
  }
  
  if (useCamera) {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 } },
        audio: false
      });
      State.cameraStream = cameraStream;
    } catch (err) {
      console.log("Webcam access denied or unavailable:", err.message);
      State.useCamera = false;
    }
  }
  
  return displayStream;
}

// Menggambar watermark (branding text) pada canvas composite.
function drawWatermark(ctx, width, height) {
  const wm = State.settings.watermark;
  if (!wm || !wm.enabled || !wm.text) return;

  const text = wm.text, fontSize = wm.fontSize || 24, padding = Math.round(width * 0.02) || 20;
  ctx.save();
  ctx.globalAlpha = Math.min(1, Math.max(0, wm.opacity ?? 0.5));
  ctx.font = `600 ${fontSize}px 'Segoe UI', system-ui, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";

  const tw = ctx.measureText(text).width;
  const isRight = (wm.position || "bottom-right").includes("right");
  const isTop = (wm.position || "bottom-right").includes("top");
  const x = isRight ? width - tw - padding : padding;
  const y = isTop ? padding : height - padding;

  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Banner visual saat perekaman sedang dijeda (C3 fix).
function drawPauseBanner(ctx, width, height) {
  ctx.save();
  ctx.fillStyle = "rgba(11, 17, 32, 0.7)";
  ctx.fillRect(0, 0, width, height);

  const bw = Math.min(300, width * 0.7), bh = 56;
  const bx = (width - bw) / 2, by = (height - bh) / 2;

  ctx.fillStyle = "rgba(17, 26, 43, 0.95)";
  ctx.strokeStyle = "rgba(245, 158, 11, 0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#FBBF24";
  ctx.font = "600 16px 'Inter', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PAUSED - REKAMAN DIJEDA", width / 2, height / 2);
  ctx.restore();
}

// Membangun komposit di canvas offscreen, lalu menampilkannya ke <video>
// preview melalui captureStream(). Ini memastikan sinkronisasi A/V tetap satu
// timeline (bukan menggabungkan stream terpisah yang bisa desync).
export function buildComposite(videoElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const displayVideo = document.createElement("video");
  const camVideo = document.createElement("video");

  displayVideo.srcObject = State.displayStream;
  displayVideo.autoplay = true;
  displayVideo.muted = true;

  camVideo.srcObject = State.cameraStream || null;
  camVideo.autoplay = true;
  camVideo.muted = true;
  if (State.cameraStream) camVideo.play().catch(() => {});

  const draw = () => {
    const fullW = displayVideo.videoWidth || 1280;
    const fullH = displayVideo.videoHeight || 720;

    // Tentukan area source yang akan digambar (crop region).
    const { sx, sy, sw, sh } = computeCropSource(State.cropRegion, fullW, fullH);

    // Canvas selalu seukuran area yang dipilih (crop) atau full screen.
    canvas.width = sw;
    canvas.height = sh;
    ctx.drawImage(displayVideo, sx, sy, sw, sh, 0, 0, sw, sh);

    if (State.cameraStream && camVideo.videoWidth) {
      const scale = 0.22;
      const w = canvas.width * scale;
      const h = camVideo.videoHeight * (w / camVideo.videoWidth);
      const pad = 16;
      const x = canvas.width - w - pad;
      const y = canvas.height - h - pad;
      ctx.save();
      ctx.fillStyle = "#111A2B";
      ctx.strokeStyle = "rgba(99,102,241,0.6)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 12);
      ctx.fill();
      ctx.stroke();
      ctx.clip();
      ctx.drawImage(camVideo, x, y, w, h);
      ctx.restore();
    }

    // Watermark overlay (branding) - digambar paling akhir agar selalu di atas.
    drawWatermark(ctx, canvas.width, canvas.height);

    // Banner visual saat perekaman sedang dijeda (C3 fix).
    if (State.isPaused) {
      drawPauseBanner(ctx, canvas.width, canvas.height);
    }

    requestAnimationFrame(draw);
  };

  displayVideo.play().then(draw).catch(draw);

  // Simpan referensi untuk cleanup.
  State._compositeVideos = { displayVideo, camVideo, ctx, canvas };

  const compositeStream = canvas.captureStream(Number(State.settings.fps) || 30);
  State.combinedStream = compositeStream;

  // Gabungkan audio microphone ke stream komposit agar rekaman memiliki
  // suara (canvas.captureStream tidak membawa audio).
  if (State.voiceStream) {
    State.voiceStream.getAudioTracks().forEach((track) => {
      compositeStream.addTrack(track);
    });
  }

  // Tampilkan komposit ke elemen <video> preview.
  if (videoElement) videoElement.srcObject = compositeStream;

  return compositeStream;
}

export function startRecording({ useMic, useCamera }) {
  const mime = pickMimeType();
  const options = mime ? { mimeType: mime, videoBitsPerSecond: 6_000_000 } : { videoBitsPerSecond: 6_000_000 };

  const recorder = new MediaRecorder(State.combinedStream, options);
  State.mediaRecorder = recorder;

  State.recordedChunks = [];
  releaseFinalBlob();

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      State.recordedChunks.push(e.data);
    }
  };

  recorder.onstop = () => {
    finalizeBlob();
  };

  recorder.start(1000); // slice per 1 detik agar chunks kecil & aman
  return recorder;
}

function finalizeBlob() {
  const blob = new Blob(State.recordedChunks, {
    type: State.mediaRecorder?.mimeType || "video/webm"
  });
  State.finalBlob = blob;
  State.originalBlob = blob; // Backup untuk fitur reset potongan video (trimmer)
  State.recordedChunks = []; // bebaskan referensi chunks (anti memory leak)
  State.finalBlobURL = URL.createObjectURL(blob);
  State.finalBlobSize = formatBytes(blob.size);

  const playback = get("playback-video");
  if (playback) {
    playback.src = State.finalBlobURL;
  }
}

export function stopRecording() {
  return new Promise((resolve) => {
    if (!State.mediaRecorder || State.mediaRecorder.state === "inactive") {
      resolve();
      return;
    }
    State.mediaRecorder.onstop = () => {
      finalizeBlob();
      resolve();
    };
    State.mediaRecorder.stop();
  });
}

export function pauseRecording() {
  if (State.mediaRecorder && State.mediaRecorder.state === "recording") {
    State.mediaRecorder.pause();
    // Bungkam track audio selama pause agar tidak bocor ke rekaman
    if (State.voiceStream) {
      State.voiceStream.getAudioTracks().forEach((t) => { t.enabled = false; });
    }
    if (State.displayStream) {
      State.displayStream.getAudioTracks().forEach((t) => { t.enabled = false; });
    }
  }
}

export function resumeRecording() {
  if (State.mediaRecorder && State.mediaRecorder.state === "paused") {
    if (State.voiceStream && State.useMic) {
      State.voiceStream.getAudioTracks().forEach((t) => { t.enabled = true; });
    }
    if (State.displayStream) {
      State.displayStream.getAudioTracks().forEach((t) => { t.enabled = true; });
    }
    State.mediaRecorder.resume();
  }
}

export function stopAllTracks() {
  [State.displayStream, State.voiceStream, State.cameraStream, State.combinedStream]
    .forEach((s) => {
      if (s) s.getTracks().forEach((t) => t.stop());
    });
  State.displayStream = null;
  State.voiceStream = null;
  State.cameraStream = null;
  State.combinedStream = null;

  if (State._compositeVideos) {
    const { displayVideo, camVideo } = State._compositeVideos;
    displayVideo.srcObject = null;
    camVideo.srcObject = null;
    State._compositeVideos = null;
  }
}

// Auto-save: jika tab ditutup saat merekam, simpan sebagian yang ada.
export function setupAutoSave() {
  window.addEventListener("beforeunload", (e) => {
    if (State.mediaRecorder && State.mediaRecorder.state === "recording") {
      try {
        State.mediaRecorder.onstop = () => {
          const blob = new Blob(State.recordedChunks, { type: "video/webm" });
          const name = `${sanitizeFilename("LayarPro-recovery")}-${timestampString()}.${currentExtension()}`;
          triggerDownloadSilent(blob, name);
        };
        State.mediaRecorder.stop();
        e.preventDefault();
        e.returnValue = "";
      } catch (_) { /* best effort */ }
    }
  });
}

function triggerDownloadSilent(blob, filename) {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  } catch (_) { /* ignore */ }
}

export function screenshotFromCanvas() {
  const canvas = State._compositeVideos?.canvas;
  if (!canvas) return null;
  return canvas.toDataURL("image/png");
}

// ---- Visualizer gelombang mikrofon ----
export function startVisualizer() {
  if (!State.voiceStream) return;
  const ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
  const source = ctxAudio.createMediaStreamSource(State.voiceStream);
  const analyser = ctxAudio.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);
  AudioState.context = ctxAudio;
  AudioState.analyser = analyser;
  AudioState.source = source;
  AudioState.dataArray = new Uint8Array(analyser.frequencyBinCount);

  const draw = () => {
    analyser.getByteTimeDomainData(AudioState.dataArray);
    const bar = get("mic-volume-bar");
    if (bar) {
      let sum = 0;
      for (let i = 0; i < AudioState.dataArray.length; i++) {
        const v = (AudioState.dataArray[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / AudioState.dataArray.length);
      const pct = Math.min(100, Math.round(rms * 300));
      bar.style.width = pct + "%";
    }
    AudioState.animFrame = requestAnimationFrame(draw);
  };
  draw();
}

export function stopVisualizer() {
  if (AudioState.animFrame) cancelAnimationFrame(AudioState.animFrame);
  AudioState.animFrame = null;
  if (AudioState.context) AudioState.context.close().catch(() => {});
  AudioState.context = null;
  AudioState.analyser = null;
  AudioState.source = null;
}
