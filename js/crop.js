// ============================================================
// crop.js - Region crop / zoom tool untuk seleksi area spesifik
// ============================================================
// Tanggung jawab:
//   - Toggle crop mode ON/OFF
//   - Show/hide selection overlay dengan draggable box
//   - Preset aspect ratio (16:9, 4:3, 21:9, square)
//   - Manual drag & drop resize box
//   - Save/load crop region ke State

import { State } from "./state.js";
import { get } from "./dom.js";
import { showToast } from "./ui.js";

export function setupCropSelector() {
  const toggleCrop = get("btn-crop-tool");
  
  if (!toggleCrop) return;

  toggleCrop.addEventListener("click", () => {
    // Toggle crop mode
    State.cropMode = !State.cropMode;
    
    if (State.cropMode) {
      showCropOverlay();
      showToast("Mode crop aktif - seret kotak untuk seleksi area");
    } else {
      hideCropOverlay();
      showToast("Mode crop dimatikan - rekam full screen");
    }
    
    toggleCrop.classList.toggle("active", State.cropMode);
  });
}

function showCropOverlay() {
  const existing = document.querySelector(".crop-overlay");
  if (existing) return; // Already showing

  const overlay = document.createElement("div");
  overlay.className = "crop-overlay";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(0,0,0,0.5);
    cursor: default;
  `;

  // Selection box
  const box = document.createElement("div");
  box.className = "crop-selection-box";
  box.style.cssText = `
    position: absolute;
    left: 50%;
    top: 50%;
    width: 80%;
    height: 70%;
    transform: translate(-50%, -50%);
    border: 2px solid #6366f1;
    background: rgba(99,102,241,0.1);
    cursor: move;
    pointer-events: auto;
  `;

  // Resize handle (bottom-right corner)
  const handle = document.createElement("div");
  handle.className = "crop-resize-handle";
  handle.style.cssText = `
    position: absolute;
    right: -6px;
    bottom: -6px;
    width: 14px;
    height: 14px;
    background: #6366f1;
    cursor: nwse-resize;
    border-radius: 2px;
    pointer-events: auto;
  `;

  // Aspect ratio presets dropdown (floating menu)
  const presets = document.createElement("select");
  presets.className = "crop-preset-select";
  presets.innerHTML = `
    <option value="16:9">16:9</option>
    <option value="4:3">4:3</option>
    <option value="21:9">21:9 (Ultrawide)</option>
    <option value="1:1">Square</option>
    <option value="free">Free size</option>
  `;
  presets.style.cssText = `
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    color: white;
    border: 1px solid #6366f1;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 13px;
    outline: none;
    z-index: 101;
  `;

  presets.addEventListener("change", (e) => {
    const [widthRatio, heightRatio] = e.target.value.split(":").map(Number);
    if (e.target.value === "free") {
      // Reset to free form
      box.style.aspectRatio = "";
    } else {
      box.style.aspectRatio = `${widthRatio}/${heightRatio}`;
    }
    saveCropRegion(box);
  });

  // Confirm button
  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "Gunakan Area Ini";
  confirmBtn.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #6366f1;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    z-index: 101;
    transition: background 0.2s;
  `;
  confirmBtn.onmouseover = () => confirmBtn.style.background = "#4f46e5";
  confirmBtn.onmouseout = () => confirmBtn.style.background = "#6366f1";
  confirmBtn.onclick = () => {
    hideCropOverlay();
    showToast("Area crop tersimpan");
  };

  // Cancel/Close
  const closeBtn = document.createElement("span");
  closeBtn.innerHTML = "&times;";
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    color: white;
    cursor: pointer;
    z-index: 101;
    opacity: 0.8;
  `;
  closeBtn.onclick = () => {
    hideCropOverlay();
    State.cropMode = false;
    State.cropRegion = null; // Reset ke full screen
    get("btn-crop-tool")?.classList.remove("active");
    showToast("Crop dibatalkan - rekam full screen");
  };

  // Append all elements
  overlay.appendChild(closeBtn);
  overlay.appendChild(presets);
  overlay.appendChild(confirmBtn);
  box.appendChild(handle);
  overlay.appendChild(box);

  // Make box draggable
  makeDraggable(box);

  // Make handle resizable
  makeResizable(handle, box);

  document.body.appendChild(overlay);
}

function hideCropOverlay() {
  document.querySelectorAll(".crop-overlay, .crop-selection-box, .crop-resize-handle, .crop-preset-select").forEach(el => el.remove());
}

function makeDraggable(element) {
  let isDragging = false;
  let startX, startY, initialLeft, initialTop;

  element.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return; // Left click only
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = element.offsetLeft;
    initialTop = element.offsetTop;
    element.setPointerCapture(e.pointerId);
  });

  element.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    element.style.left = `${initialLeft + dx}px`;
    element.style.top = `${initialTop + dy}px`;
  });

  element.addEventListener("pointerup", (e) => {
    isDragging = false;
    element.releasePointerCapture(e.pointerId);
    saveCropRegion(element);
  });

  element.addEventListener("pointercancel", (e) => {
    isDragging = false;
    element.releasePointerCapture(e.pointerId);
    saveCropRegion(element);
  });
}

function makeResizable(handle, box) {
  let isResizing = false;
  let startX, startY, startWidth, startHeight;

  handle.addEventListener("pointerdown", (e) => {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(window.getComputedStyle(box).width || 0, 10);
    startHeight = parseInt(window.getComputedStyle(box).height || 0, 10);
    handle.setPointerCapture(e.pointerId);
  });

  handle.addEventListener("pointermove", (e) => {
    if (!isResizing) return;
    e.preventDefault();
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    box.style.width = `${Math.max(50, startWidth + dx)}px`;
    box.style.height = `${Math.max(50, startHeight + dy)}px`;
  });

  handle.addEventListener("pointerup", (e) => {
    isResizing = false;
    handle.releasePointerCapture(e.pointerId);
    saveCropRegion(box);
  });
}

function saveCropRegion(box) {
  if (!box) return;

  // Hitung koordinat relatif (0-1) terhadap viewport
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  
  const x = box.offsetLeft / viewportW;
  const y = box.offsetTop / viewportH;
  const w = (parseFloat(box.style.width) || 0) / viewportW;
  const h = (parseFloat(box.style.height) || 0) / viewportH;

  State.cropRegion = { x, y, w, h };

  console.log("[Crop] Region saved:", State.cropRegion);
}
