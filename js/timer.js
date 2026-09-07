// ============================================================
// timer.js - Stopwatch & countdown
// ============================================================
import { State } from "./state.js";
import { get } from "./dom.js";
import { formatTime } from "./utils.js";

export const Timer = {
  start() {
    State.startTime = Date.now() - State.elapsedTime;
    State.timerInterval = setInterval(() => {
      State.elapsedTime = Date.now() - State.startTime;
      const display = get("timer-display");
      if (display) display.textContent = formatTime(State.elapsedTime / 1000);
    }, 200);
  },

  pause() {
    if (State.timerInterval) {
      clearInterval(State.timerInterval);
      State.timerInterval = null;
    }
  },

  resume() {
    this.start();
  },

  stop() {
    this.pause();
    State.elapsedTime = 0;
    const display = get("timer-display");
    if (display) display.textContent = formatTime(0);
  },

  reset() {
    this.pause();
    State.elapsedTime = 0;
    const display = get("timer-display");
    if (display) display.textContent = formatTime(0);
  }
};

export function runCountdown(seconds, onTick, onDone) {
  return new Promise((resolve) => {
    let remaining = Math.max(0, Math.floor(seconds));
    const overlay = get("countdown-overlay");
    const text = get("countdown-text");
    if (overlay) overlay.classList.remove("hidden");
    const step = () => {
      if (remaining <= 0) {
        if (overlay) overlay.classList.add("hidden");
        if (onDone) onDone();
        resolve();
        return;
      }
      if (text) text.textContent = String(remaining);
      if (onTick) onTick(remaining);
      remaining--;
      setTimeout(step, 1000);
    };
    step();
  });
}
