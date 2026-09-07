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
import { MIME_TYPES, RECORD_EXTENSION } from "./config.js";
import { get } from "./dom.js";
import { formatBytes, sanitizeFilename, timestampString } from "./utils.js";
import { showToast } from "./ui.js";

function pickMimeType() {
  for (const t of MIME_TYPES) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

export async function captureSources({ useMic, useCamera, fps }) {
  // Display selalu video-only. Audio ditangani terpisah lewat mic agar
  // tidak terjadi konflik sumber audio dan agar mixing terkontrol penuh.
  const displayStream = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: { ideal: Number(fps) || 30 } },
    audio: false
  });

  State.displayStream = displayStream;

  if (useMic) {
    try {
      const voiceStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      State.voiceStream = voiceStream;
    } catch (err) {
      showToast("Mikrofon tidak dapat diakses: " + err.message);
      State.useMic = false;
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
      showToast("Webcam tidak dapat diakses: " + err.message);
      State.useCamera = false;
    }
  }

  return displayStream;
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
    canvas.width = displayVideo.videoWidth || 1280;
    canvas.height = displayVideo.videoHeight || 720;
    ctx.drawImage(displayVideo, 0, 0, canvas.width, canvas.height);

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
  }
}

export function resumeRecording() {
  if (State.mediaRecorder && State.mediaRecorder.state === "paused") {
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
          const name = `${sanitizeFilename("LayarPro-recovery")}-${timestampString()}.${RECORD_EXTENSION}`;
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
