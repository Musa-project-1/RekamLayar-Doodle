import { describe, it, expect } from "vitest";
import {
  validateTrimRange,
  calculateTrimMetrics,
  formatTimeRange
} from "../js/trimmer.js";

describe("validateTrimRange", () => {
  it("mengembalikan valid untuk rentang yang benar", () => {
    const res = validateTrimRange(10, 40, 60);
    expect(res.valid).toBe(true);
    expect(res.start).toBe(10);
    expect(res.end).toBe(40);
    expect(res.duration).toBe(30);
  });

  it("gagal jika durasi total <= 0", () => {
    const res = validateTrimRange(0, 10, 0);
    expect(res.valid).toBe(false);
    expect(res.error).toBe("Durasi video tidak valid.");
  });

  it("gagal jika waktu mulai >= waktu selesai", () => {
    const res = validateTrimRange(30, 20, 60);
    expect(res.valid).toBe(false);
    expect(res.error).toBe("Waktu mulai harus lebih kecil dari waktu selesai.");
  });

  it("gagal jika durasi potongan kurang dari 0.5 detik", () => {
    const res = validateTrimRange(10, 10.2, 60);
    expect(res.valid).toBe(false);
    expect(res.error).toBe("Durasi potongan minimal 0.5 detik.");
  });

  it("meng-clamp start negatif ke 0 dan end melebihi durasi ke total", () => {
    const res = validateTrimRange(-5, 100, 50);
    expect(res.valid).toBe(true);
    expect(res.start).toBe(0);
    expect(res.end).toBe(50);
    expect(res.duration).toBe(50);
  });
});

describe("calculateTrimMetrics", () => {
  it("menghitung proporsi ukuran file dan durasi secara tepat", () => {
    const res = calculateTrimMetrics(0, 30, 60, 1000000);
    expect(res.trimmedDuration).toBe(30);
    expect(res.estimatedBytes).toBe(500000);
    expect(res.percentageKept).toBe(50);
  });

  it("menghitung potongan 25%", () => {
    const res = calculateTrimMetrics(15, 30, 60, 4000000);
    expect(res.trimmedDuration).toBe(15);
    expect(res.estimatedBytes).toBe(1000000);
    expect(res.percentageKept).toBe(25);
  });

  it("mengembalikan fallback aman untuk rentang tidak valid", () => {
    const res = calculateTrimMetrics(50, 20, 60, 1000000);
    expect(res.trimmedDuration).toBe(0);
    expect(res.estimatedBytes).toBe(1000000);
    expect(res.percentageKept).toBe(100);
  });
});

describe("formatTimeRange", () => {
  it("memformat rentang waktu dengan benar", () => {
    const formatted = formatTimeRange(5, 75, 120);
    expect(formatted).toBe("00:05 - 01:15 (01:10 / 02:00)");
  });

  it("menangani awal 0 detik", () => {
    const formatted = formatTimeRange(0, 30, 60);
    expect(formatted).toBe("00:00 - 00:30 (00:30 / 01:00)");
  });
});
