// ============================================================
// drag.js - Drag & drop untuk notepad dan facecam (teleprompter)
// ============================================================
import { DragState } from "./state.js";

export function setupNotesDrag(header, panel) {
  if (!header || !panel) return;
  header.addEventListener("pointerdown", (e) => {
    DragState.notes.isDragging = true;
    DragState.notes.initialX = e.clientX - DragState.notes.xOffset;
    DragState.notes.initialY = e.clientY - DragState.notes.yOffset;
    header.setPointerCapture(e.pointerId);
  });
  header.addEventListener("pointermove", (e) => {
    if (!DragState.notes.isDragging) return;
    e.preventDefault();
    DragState.notes.currentX = e.clientX - DragState.notes.initialX;
    DragState.notes.currentY = e.clientY - DragState.notes.initialY;
    DragState.notes.xOffset = DragState.notes.currentX;
    DragState.notes.yOffset = DragState.notes.currentY;
    panel.style.transform =
      `translate(${DragState.notes.currentX}px, ${DragState.notes.currentY}px)`;
  });
  const end = () => {
    DragState.notes.isDragging = false;
    DragState.notes.initialX = DragState.notes.currentX;
    DragState.notes.initialY = DragState.notes.currentY;
  };
  header.addEventListener("pointerup", end);
  header.addEventListener("pointercancel", end);
}

export function setupCamDrag(handle, container) {
  if (!handle || !container) return;
  handle.addEventListener("pointerdown", (e) => {
    DragState.cam.isDragging = true;
    DragState.cam.initialX = e.clientX - DragState.cam.xOffset;
    DragState.cam.initialY = e.clientY - DragState.cam.yOffset;
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener("pointermove", (e) => {
    if (!DragState.cam.isDragging) return;
    e.preventDefault();
    DragState.cam.currentX = e.clientX - DragState.cam.initialX;
    DragState.cam.currentY = e.clientY - DragState.cam.initialY;
    DragState.cam.xOffset = DragState.cam.currentX;
    DragState.cam.yOffset = DragState.cam.currentY;
    container.style.transform =
      `translate(${DragState.cam.currentX}px, ${DragState.cam.currentY}px)`;
  });
  const end = () => {
    DragState.cam.isDragging = false;
    DragState.cam.initialX = DragState.cam.currentX;
    DragState.cam.initialY = DragState.cam.currentY;
  };
  handle.addEventListener("pointerup", end);
  handle.addEventListener("pointercancel", end);
}
