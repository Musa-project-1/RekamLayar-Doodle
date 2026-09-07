import { describe, it, expect, beforeEach } from "vitest";
import {
  loadSettings,
  saveSettings,
  loadHistory,
  saveHistory,
  clearHistory
} from "../js/settings.js";
import { CONFIG } from "../js/config.js";

describe("settings persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loadSettings mengembalikan default saat kosong", () => {
    const s = loadSettings();
    expect(s.resolution).toBe("default");
    expect(s.fps).toBe("30");
    expect(s.countdown).toBe("3");
    expect(s.format).toBe("webm");
  });

  it("saveSettings + loadSettings round-trip", () => {
    saveSettings({ fps: "60", countdown: "5" });
    const s = loadSettings();
    expect(s.fps).toBe("60");
    expect(s.countdown).toBe("5");
    // field yang tidak di-set tetap default
    expect(s.resolution).toBe("default");
  });

  it("loadHistory mengembalikan array kosong", () => {
    expect(loadHistory()).toEqual([]);
  });

  it("saveHistory membatasi ke 50 entri", () => {
    const entries = Array.from({ length: 60 }, (_, i) => ({ title: `r${i}` }));
    saveHistory(entries);
    expect(loadHistory().length).toBe(50);
  });

  it("saveHistory mempertahankan urutan (terbaru dulu di addHistoryEntry)", () => {
    saveHistory([{ title: "a" }, { title: "b" }]);
    const h = loadHistory();
    expect(h[0].title).toBe("a");
    expect(h[1].title).toBe("b");
  });

  it("clearHistory mengosongkan riwayat", () => {
    saveHistory([{ title: "x" }]);
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });

  it("aman terhadap localStorage korup (JSON rusak)", () => {
    localStorage.setItem(CONFIG.SETTINGS_KEY, "{not valid json");
    expect(loadSettings().fps).toBe("30");
  });
});
