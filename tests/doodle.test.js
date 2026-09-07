import { describe, it, expect } from "vitest";
import {
  createStroke,
  calculateArrowHead,
  DoodleState
} from "../js/doodle.js";

describe("createStroke", () => {
  it("membuat objek goresan dengan data yang tepat", () => {
    const pt = { x: 100, y: 150 };
    const stroke = createStroke("pen", "#EF4444", 4, pt);

    expect(stroke.tool).toBe("pen");
    expect(stroke.color).toBe("#EF4444");
    expect(stroke.size).toBe(4);
    expect(stroke.points).toEqual([pt]);
  });

  it("mendukung jenis alat highlighter, arrow, dan rect", () => {
    const s1 = createStroke("highlighter", "#FBBF24", 12, { x: 0, y: 0 });
    const s2 = createStroke("arrow", "#38BDF8", 6, { x: 10, y: 10 });
    const s3 = createStroke("rect", "#10B981", 4, { x: 20, y: 20 });

    expect(s1.tool).toBe("highlighter");
    expect(s2.tool).toBe("arrow");
    expect(s3.tool).toBe("rect");
  });
});

describe("calculateArrowHead", () => {
  it("menghitung kepala panah ke arah kanan (horizontal)", () => {
    // Panah horizontal dari (0, 0) ke (100, 0)
    const { leftX, leftY, rightX, rightY } = calculateArrowHead(0, 0, 100, 0, 20);

    // Titik ujung di x=100, sayap panah harus berada di sebelah kiri (x < 100)
    expect(leftX).toBeLessThan(100);
    expect(rightX).toBeLessThan(100);
    // Sayap panah harus simetris terhadap sumbu horizontal y=0
    expect(leftY).toBeCloseTo(-rightY, 4);
  });

  it("menghitung kepala panah ke arah bawah (vertikal)", () => {
    // Panah vertikal dari (0, 0) ke (0, 100)
    const { leftX, leftY, rightX, rightY } = calculateArrowHead(0, 0, 0, 100, 20);

    expect(leftY).toBeLessThan(100);
    expect(rightY).toBeLessThan(100);
    expect(leftX).toBeCloseTo(-rightX, 4);
  });
});

describe("DoodleState defaults", () => {
  it("memiliki konfigurasi awal default yang valid", () => {
    expect(DoodleState.tool).toBe("pen");
    expect(DoodleState.color).toBe("#EF4444");
    expect(DoodleState.size).toBe(4);
    expect(Array.isArray(DoodleState.strokes)).toBe(true);
  });
});
