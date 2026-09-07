// ============================================================
// timer-extended.js - Stopwatch, countdown, & duration limiting
// ============================================================
import { State } from "./state.js";
import { get } from "./dom.js";
import { formatTime } from "./utils.js";
import { MAX_DURATION_MS, WARNING_THRESHOLDS } from "./config.js";
import { playBeep, addNotification } from "./ui.js";

export const TimerExtended = {
  start() {
    State.startTime = Date.now() - State.elapsedTime;
    State.startRecordingTime = Date.now(); // For duration tracking
    
    State.timerInterval = setInterval(() => {
      State.elapsedTime = Date.now() - State.startTime;
      const display = get("timer-display");
      if (display) display.textContent = formatTime(State.elapsedTime / 1000);
      
      // Check duration limits
      this.checkDurationLimit();
    }, 200);
    
    // Start visual timer indicator animation
    this.startVisualIndicator();
  },
  
  pause() {
    clearInterval(State.timerInterval);
    cancelAnimationFrame(State.visualFrameId);
  },
  
  resume() {
    this.start();
  },
  
  stop() {
    clearInterval(State.timerInterval);
    cancelAnimationFrame(State.visualFrameId);
    this.resetVisualIndicator();
  },
  
  checkDurationLimit() {
    if (!State.durationLimitEnabled) return;
    
    const elapsedMin = Math.floor((Date.now() - State.startRecordingTime) / 60000);
    
    // Warning at specific thresholds
    for (const threshold of WARNING_THRESHOLDS) {
      if (elapsedMin === threshold && !this.warningShown[threshold]) {
        this.showWarning(threshold);
        this.warningShown[threshold] = true;
      }
    }
    
    // Stop at max duration
    if (elapsedMin >= 60) {
      this.stopRecording();
    }
  },
  
  showWarning(minutes) {
    const message = `⏰ Peringatan durasi: Rekaman telah berjalan ${minutes} menit`;
    addNotification(message, "warning");
    playBeep();
  },
  
  stopRecording() {
    this.pause();
    alert("⚠️ Durasi rekaman maksimum (60 menit) tercapai. Rekaman akan dihentikan otomatis.");
    addNotification("Rekaman dihentikan karena durasi maksimum", "error");
    // Signal app to stop recording through event or callback
    if (window.__onMaxDurationReached) {
      window.__onMaxDurationReached();
    }
  },
  
  warningShown: {},
  
  // Visual duration indicator (progress bar under video)
  startVisualIndicator() {
    if (!get("duration-progress-container")) return;
    
    const updateProgress = () => {
      if (!State.durationLimitEnabled || !State.startRecordingTime) {
        this.resetVisualIndicator();
        return;
      }
      
      const elapsed = Date.now() - State.startRecordingTime;
      const progress = Math.min(100, (elapsed / MAX_DURATION_MS) * 100);
      
      const progressBar = get("duration-progress-bar");
      const container = get("duration-progress-container");
      
      if (progressBar && container) {
        progressBar.style.width = `${progress}%`;
        
        // Change color based on progress
        if (progress >= 90) {
          container.classList.add("bg-red-500");
          container.classList.remove("bg-indigo-500", "bg-yellow-500");
        } else if (progress >= 75) {
          container.classList.add("bg-yellow-500");
          container.classList.remove("bg-red-500", "bg-indigo-500");
        } else {
          container.classList.add("bg-indigo-500");
          container.classList.remove("bg-red-500", "bg-yellow-500");
        }
        
        // Show elapsed time text
        const progressText = get("progress-text");
        if (progressText) {
          progressText.textContent = formatTime(elapsed / 1000);
        }
      }
      
      State.visualFrameId = requestAnimationFrame(updateProgress);
    };
    
    updateProgress();
  },
  
  resetVisualIndicator() {
    const progressBar = get("duration-progress-bar");
    const container = get("duration-progress-container");
    const progressText = get("progress-text");
    
    if (progressBar) {
      progressBar.style.width = '0%';
      progressBar.classList.remove('bg-red-500', 'bg-yellow-500', 'bg-indigo-500');
    }
    
    if (container) {
      container.classList.remove('bg-red-500', 'bg-yellow-500', 'bg-indigo-500');
    }
    
    if (progressText) {
      progressText.textContent = '00:00';
    }
    
    cancelAnimationFrame(State.visualFrameId);
  }
};
