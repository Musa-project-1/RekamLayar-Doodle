import { describe, it, expect } from "vitest";
import {
  formatBytes,
  formatTime,
  sanitizeFilename,
  timestampString,
  escapeHtml,
  sleep
} from "../js/utils.js";

describe("formatBytes", () => {
  it("mengembalikan 0 MB untuk 0 / nilai invalid", () => {
    expect(formatBytes(0)).toBe("0 MB");
    expect(formatBytes(-5)).toBe("0 MB");
    expect(formatBytes(undefined)).toBe("0 MB");
    expect(formatBytes(NaN)).toBe("0 MB");
  });

  it("menampilkan byte untuk nilai kecil", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("menampilkan KB", () => {
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(1024 * 500)).toBe("500.0 KB");
  });

  it("menampilkan MB", () => {
    expect(formatBytes(1024 * 1024 * 3)).toBe("3.00 MB");
  });

  it("menampilkan GB untuk nilai besar", () => {
    expect(formatBytes(1024 * 1024 * 1024 * 2)).toBe("2.00 GB");
  });
});

describe("formatTime", () => {
  it("menampilkan 00:00 untuk 0", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("menampilkan menit:detik", () => {
    expect(formatTime(65)).toBe("01:05");
    expect(formatTime(599)).toBe("09:59");
  });

  it("menampilkan jam ketika >= 1 jam", () => {
    expect(formatTime(3600)).toBe("01:00:00");
    expect(formatTime(3661)).toBe("01:01:01");
  });

  it("membulatkan ke bawah detik pecahan", () => {
    expect(formatTime(65.9)).toBe("01:05");
  });

  it("menangani nilai negatif sebagai 0", () => {
    expect(formatTime(-10)).toBe("00:00");
  });
});

describe("sanitizeFilename", () => {
  it("mengganti karakter ilegal", () => {
    expect(sanitizeFilename("a/b\\c:d*e?f\"g<h>i|j")).toBe("a-b-c-d-e-f-g-h-i-j");
  });

  it("memangkas spasi dan batas 120 karakter", () => {
    expect(sanitizeFilename("  hello  world  ")).toBe("hello world");
    expect(sanitizeFilename("x".repeat(200)).length).toBe(120);
  });

  it("fallback ke 'rekaman' untuk input kosong", () => {
    expect(sanitizeFilename("")).toBe("rekaman");
    expect(sanitizeFilename(null)).toBe("rekaman");
  });
});

describe("timestampString", () => {
  it("menghasilkan format YYYY-MM-DD_HH-MM-SS", () => {
    expect(timestampString()).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/);
  });
});

describe("escapeHtml", () => {
  it("meng-escape karakter HTML", () => {
    expect(escapeHtml(`<script>"&'`)).toBe("&lt;script&gt;&quot;&amp;&#39;");
  });

  it("mengembalikan string asli untuk teks aman", () => {
    expect(escapeHtml("hello")).toBe("hello");
  });
});

describe("sleep", () => {
  it("resolve setelah durasi", async () => {
    const start = Date.now();
    await sleep(20);
    expect(Date.now() - start).toBeGreaterThanOrEqual(15);
  });
});
