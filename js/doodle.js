// ============================================================
// doodle.js - Anotasi & Coret Layar Real-time (Screen Doodle)
// ============================================================
// Tanggung jawab:
//   - Mengelola kanvas anotasi interaktif di atas pratinjau video.
//   - Menyediakan alat: Pen (kuas bebas), Highlighter (stabilo),
//     Arrow (panah penunjuk), dan Rectangle (kotak fokus).
//   - Menangani riwayat coretan untuk Undo dan Clear.
//   - Merender hasil coretan ke canvas komposit agar terekam langsung.

import { get } from "./dom.js";
import { showToast } from "./ui.js";

// State internal doodle
export const DoodleState = {
  isActive: false,
  tool: "pen", // 'pen' | 'highlighter' | 'arrow' | 'rect'
  color: "#EF4444",
  size: 4,
  strokes: [], // Riwayat seluruh goresan
  currentStroke: null,
  canvas: null,
  ctx: null
};

// Fungsi murni: Membuat objek goresan baru
export function createStroke(tool, color, size, startPoint) {
  return {
    tool,
    color,
    size,
    points: [startPoint]
  };
}

// Fungsi murni: Menghitung titik sudut kepala panah
export function calculateArrowHead(fromX, fromY, toX, toY, headLength = 16) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const leftX = toX - headLength * Math.cos(angle - Math.PI / 6);
  const leftY = toY - headLength * Math.sin(angle - Math.PI / 6);
  const rightX = toX - headLength * Math.cos(angle + Math.PI / 6);
  const rightY = toY - headLength * Math.sin(angle + Math.PI / 6);
  return { leftX, leftY, rightX, rightY };
}

// Inisialisasi kanvas dan toolbar doodle
export function setupDoodle() {
  const btnDoodle = get("btn-doodle");
  const doodleCanvas = document.getElementById("doodle-canvas");
  const doodleToolbar = document.getElementById("doodle-toolbar");

  if (!btnDoodle || !doodleCanvas) return;

  DoodleState.canvas = doodleCanvas;
  DoodleState.ctx = doodleCanvas.getContext("2d");

  // Sesuaikan resolusi internal kanvas dengan ukuran tampilan
  const resizeCanvas = () => {
    const rect = doodleCanvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      doodleCanvas.width = rect.width;
      doodleCanvas.height = rect.height;
      redrawAllStrokes();
    }
  };

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Toggle mode doodle
  btnDoodle.addEventListener("click", () => {
    DoodleState.isActive = !DoodleState.isActive;
    resizeCanvas();

    if (DoodleState.isActive) {
      doodleCanvas.classList.remove("pointer-events-none");
      doodleCanvas.classList.add("cursor-crosshair");
      doodleToolbar?.classList.remove("hidden");
      doodleToolbar?.classList.add("flex");
      btnDoodle.classList.add("bg-indigo-600", "text-white");
      showToast("Mode coret aktif. Gambar langsung di atas layar.");
    } else {
      doodleCanvas.classList.add("pointer-events-none");
      doodleCanvas.classList.remove("cursor-crosshair");
      doodleToolbar?.classList.add("hidden");
      doodleToolbar?.classList.remove("flex");
      btnDoodle.classList.remove("bg-indigo-600", "text-white");
    }
  });

  // Event pointer untuk menggambar
  setupDrawingEvents(doodleCanvas);

  // Setup tombol toolbar doodle
  setupToolbarControls();
}

// Menangani event mouse / touch / pointer
function setupDrawingEvents(canvas) {
  let isDrawing = false;

  canvas.addEventListener("pointerdown", (e) => {
    if (!DoodleState.isActive) return;
    isDrawing = true;
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const pt = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    DoodleState.currentStroke = createStroke(
      DoodleState.tool,
      DoodleState.color,
      DoodleState.size,
      pt
    );
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!isDrawing || !DoodleState.currentStroke) return;
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const pt = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (DoodleState.tool === "pen" || DoodleState.tool === "highlighter") {
      DoodleState.currentStroke.points.push(pt);
    } else {
      // Untuk arrow dan rect: hanya simpan titik awal dan titik akhir
      if (DoodleState.currentStroke.points.length > 1) {
        DoodleState.currentStroke.points[1] = pt;
      } else {
        DoodleState.currentStroke.points.push(pt);
      }
    }

    redrawAllStrokes();
    renderSingleStroke(DoodleState.ctx, DoodleState.currentStroke);
  });

  const finishStroke = () => {
    if (!isDrawing) return;
    isDrawing = false;
    if (DoodleState.currentStroke && DoodleState.currentStroke.points.length > 0) {
      DoodleState.strokes.push(DoodleState.currentStroke);
      DoodleState.currentStroke = null;
    }
    redrawAllStrokes();
  };

  canvas.addEventListener("pointerup", finishStroke);
  canvas.addEventListener("pointercancel", finishStroke);
}

// Menggambar ulang seluruh riwayat goresan pada kanvas
export function redrawAllStrokes(targetCtx = DoodleState.ctx) {
  if (!targetCtx || !DoodleState.canvas) return;

  targetCtx.clearRect(0, 0, DoodleState.canvas.width, DoodleState.canvas.height);

  for (const stroke of DoodleState.strokes) {
    renderSingleStroke(targetCtx, stroke);
  }
}

// Merender satu objek goresan ke context 2D
function renderSingleStroke(ctx, stroke) {
  if (!ctx || !stroke || !stroke.points || stroke.points.length === 0) return;

  ctx.save();
  const pts = stroke.points;

  if (stroke.tool === "highlighter") {
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size * 3;
    ctx.lineCap = "square";
    ctx.lineJoin = "bevel";
  } else {
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  if (stroke.tool === "pen" || stroke.tool === "highlighter") {
    if (pts.length === 1) {
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, stroke.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
    }
  } else if (stroke.tool === "arrow" && pts.length >= 2) {
    const start = pts[0];
    const end = pts[1];

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    const arrow = calculateArrowHead(start.x, start.y, end.x, end.y, stroke.size * 3.5);
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(arrow.leftX, arrow.leftY);
    ctx.lineTo(arrow.rightX, arrow.rightY);
    ctx.closePath();
    ctx.fill();
  } else if (stroke.tool === "rect" && pts.length >= 2) {
    const start = pts[0];
    const end = pts[1];
    const w = end.x - start.x;
    const h = end.y - start.y;

    ctx.strokeRect(start.x, start.y, w, h);
  }

  ctx.restore();
}

// Menghubungkan tombol pada toolbar doodle
function setupToolbarControls() {
  // Pilihan Tool: Pen, Highlighter, Arrow, Rect
  const toolButtons = [
    { id: "tool-pen", tool: "pen" },
    { id: "tool-highlighter", tool: "highlighter" },
    { id: "tool-arrow", tool: "arrow" },
    { id: "tool-rect", tool: "rect" }
  ];

  toolButtons.forEach(({ id, tool }) => {
    const btn = document.getElementById(id);
    btn?.addEventListener("click", () => {
      DoodleState.tool = tool;
      toolButtons.forEach((b) => {
        document.getElementById(b.id)?.classList.remove("bg-indigo-600", "text-white");
        document.getElementById(b.id)?.classList.add("text-slate-400");
      });
      btn.classList.remove("text-slate-400");
      btn.classList.add("bg-indigo-600", "text-white");
    });
  });

  // Pilihan Warna
  const colors = ["#EF4444", "#FBBF24", "#10B981", "#38BDF8", "#A78BFA", "#FFFFFF"];
  colors.forEach((c) => {
    const swatch = document.getElementById(`doodle-color-${c.replace("#", "")}`);
    swatch?.addEventListener("click", () => {
      DoodleState.color = c;
      colors.forEach((other) => {
        const el = document.getElementById(`doodle-color-${other.replace("#", "")}`);
        if (el) el.style.borderColor = other === c ? "#FFFFFF" : "transparent";
      });
    });
  });

  // Undo
  document.getElementById("btn-doodle-undo")?.addEventListener("click", () => {
    if (DoodleState.strokes.length > 0) {
      DoodleState.strokes.pop();
      redrawAllStrokes();
    }
  });

  // Clear
  document.getElementById("btn-doodle-clear")?.addEventListener("click", () => {
    DoodleState.strokes = [];
    redrawAllStrokes();
    showToast("Coretan dibersihkan.");
  });

  // Close
  document.getElementById("btn-doodle-close")?.addEventListener("click", () => {
    const btnDoodle = get("btn-doodle");
    btnDoodle?.click();
  });
}

// Dipanggil dari buildComposite di media.js agar coretan masuk ke video hasil rekaman
export function renderDoodleToRecording(ctx, destWidth, destHeight) {
  if (!DoodleState.canvas || DoodleState.strokes.length === 0) return;

  ctx.save();
  ctx.drawImage(DoodleState.canvas, 0, 0, destWidth, destHeight);
  ctx.restore();
}
