// scripts/generate-icons.mjs
// Regenerate ikon PNG (192 & 512) dari icons/icon.svg.
// Membutuhkan dependensi opsional "sharp" (npm i -D sharp).
//
// Jika sharp tidak tersedia, script ini hanya memvalidasi bahwa
// icon.svg ada dan menampilkan pesan instruksi (tidak error).

import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const svgPath = resolve(root, "icons", "icon.svg");

if (!existsSync(svgPath)) {
  console.error("ERROR: icons/icon.svg tidak ditemukan.");
  process.exit(1);
}

console.log("icons/icon.svg ditemukan.");

let sharp = null;
try {
  sharp = (await import("sharp")).default;
} catch {
  sharp = null;
}

if (!sharp) {
  console.log(
    "sharp tidak terinstal. Jalankan `npm i -D sharp` untuk auto-generate PNG.\n" +
    "Ikon PNG saat ini sudah di-commit, jadi tidak ada tindakan yang diperlukan."
  );
  process.exit(0);
}

for (const size of [192, 512]) {
  await sharp(svgPath)
    .resize(size, size)
    .png()
    .toFile(resolve(root, "icons", `icon-${size}.png`));
  console.log(`Generated icons/icon-${size}.png`);
}

console.log("Selesai.");
