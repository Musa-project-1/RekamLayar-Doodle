// ============================================================
// state.js - Satu-satunya sumber kebenaran untuk state aplikasi
// ============================================================

export const State = {
  displayStream: null,
  voiceStream: null,
  cameraStream: null,
  combinedStream: null,
  mediaRecorder: null,
  recordedChunks: [],
  finalBlob: null,        // Blob final (bukan hanya URL) agar tidak ada kebocoran referensi
  originalBlob: null,     // Backup blob sebelum trimming
  finalBlobURL: null,
  finalBlobSize: "0 MB",
  useMic: false,
  useCamera: false,
  isPaused: false,
  startTime: 0,
  elapsedTime: 0,
  timerInterval: null,
  // Region crop: koordinat relatif (0-1) area yang direkam.
  // null = full screen (default). {x, y, w, h} = area relatif ke video.
  cropRegion: null,
  cropMode: false,
  // Mode perekaman: 'screen' (rekam layar) atau 'camera' (perekam kamera/mobile fallback)
  recordingMode: "screen",
  isMobile: false,
  autoStopTimeout: null,
  confirmActionCallback: null,
  gdriveAccessToken: null,
  tokenClient: null,
  settings: {
    resolution: "default",
    fps: "30",
    countdown: "3",
    format: "webm",
    autoSave: true,
    watermark: {
      enabled: false,
      text: "LayarPro",
      position: "bottom-right", // top-left | top-right | bottom-left | bottom-right
      opacity: 0.5,
      fontSize: 24
    }
  },
  // Audio source type: 'system', 'mic', atau 'none'.
  audioSourceType: 'none',
  // Durasi limit tracking.
  durationLimitEnabled: true,
  startRecordingTime: 0,
};

export const DragState = {
  notes: {
    isDragging: false,
    currentX: 0,
    currentY: 0,
    initialX: 0,
    initialY: 0,
    xOffset: 0,
    yOffset: 0
  },
  cam: {
    isDragging: false,
    currentX: 0,
    currentY: 0,
    initialX: 0,
    initialY: 0,
    xOffset: 0,
    yOffset: 0
  },
  currentCamScale: 1
};

export const AudioState = {
  context: null,
  analyser: null,
  source: null,
  dataArray: null,
  animFrame: null
};

// Hapus blob URL dan lepaskan referensi agar GC dapat bekerja (anti memory leak).
export function releaseFinalBlob() {
  if (State.finalBlobURL) {
    URL.revokeObjectURL(State.finalBlobURL);
    State.finalBlobURL = null;
  }
  State.finalBlob = null;
  State.originalBlob = null;
  State.recordedChunks = [];
}
