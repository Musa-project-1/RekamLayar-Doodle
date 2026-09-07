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

  it("loadSettings menyediakan default watermark", () => {
    const s = loadSettings();
    expect(s.watermark).toBeDefined();
    expect(s.watermark.enabled).toBe(false);
    expect(s.watermark.text).toBe("LayarPro");
    expect(s.watermark.position).toBe("bottom-right");
    expect(s.watermark.opacity).toBe(0.5);
    expect(s.watermark.fontSize).toBe(24);
  });

  it("watermark deep-merge mempertahankan field lama saat upgrade", () => {
    // Simulasikan data tersimpan dari versi lama tanpa field baru.
    localStorage.setItem(
      CONFIG.SETTINGS_KEY,
      JSON.stringify({ watermark: { enabled: true, text: "Brand X" } })
    );
    const s = loadSettings();
    expect(s.watermark.enabled).toBe(true);
    expect(s.watermark.text).toBe("Brand X");
    // Field baru tetap terisi default (tidak hilang).
    expect(s.watermark.position).toBe("bottom-right");
    expect(s.watermark.opacity).toBe(0.5);
    expect(s.watermark.fontSize).toBe(24);
  });

  it("watermark round-trip lengkap", () => {
    saveSettings({
      watermark: {
        enabled: true,
        text: "MyBrand",
        position: "top-left",
        opacity: 0.8,
        fontSize: 32
      }
    });
    const s = loadSettings();
    expect(s.watermark.enabled).toBe(true);
    expect(s.watermark.text).toBe("MyBrand");
    expect(s.watermark.position).toBe("top-left");
    expect(s.watermark.opacity).toBe(0.8);
    expect(s.watermark.fontSize).toBe(32);
  });
});
