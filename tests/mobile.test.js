import { describe, it, expect } from "vitest";
import {
  resolveRecordingMode,
  getMobileNoticeMessage
} from "../js/mobile.js";

describe("resolveRecordingMode", () => {
  it("memilih mode screen jika getDisplayMedia didukung", () => {
    expect(resolveRecordingMode(true)).toBe("screen");
  });

  it("memilih mode camera jika getDisplayMedia tidak didukung (misal di ponsel)", () => {
    expect(resolveRecordingMode(false)).toBe("camera");
  });
});

describe("getMobileNoticeMessage", () => {
  it("mengembalikan pesan edukasi ponsel jika di perangkat seluler tanpa rekam layar", () => {
    const msg = getMobileNoticeMessage(true, false);
    expect(msg).toContain("Browser ponsel");
    expect(msg).toContain("Mode Kamera & Suara diaktifkan secara otomatis");
  });

  it("mengembalikan pesan browser tidak mendukung jika desktop tanpa getDisplayMedia", () => {
    const msg = getMobileNoticeMessage(false, false);
    expect(msg).toContain("Browser ini belum mendukung");
  });

  it("mengembalikan string kosong jika getDisplayMedia didukung penuh", () => {
    expect(getMobileNoticeMessage(false, true)).toBe("");
    expect(getMobileNoticeMessage(true, true)).toBe("");
  });
});
