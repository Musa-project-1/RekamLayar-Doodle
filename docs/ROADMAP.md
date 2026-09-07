# LayarPro — Roadmap & Prioritas Fitur

> Dokumen ini adalah living roadmap yang mengupdate status semua use case scenario
> dan gap yang teridentifikasi dari analisis senior developer (2024).

---

## ✅ Yang Sudah Selesai (v2.1)

| ID | Item | Status | Keterangan |
|----|------|--------|------------|
| C1 | Fix `formatBytes` (nilai kecil) | ✅ DONE | Menampilkan B, KB, MB, GB dengan tepat |
| C2 | Fix `formatTime` (0 detik awal) | ✅ DONE | Konsisten ke 00:00 |
| C3 | Pause behavior | ⏳ TODO | Webcam/mic tetap aktif selama pause (ambiguus UX) |
| C4 | Format dropdown berfungsi | ✅ DONE | WebM + MP4 (fallback ke webm jika browser tidak dukung) |
| C6 | `beforeunload` guard | ✅ DONE | Dialog konfirmasi saat menutup tab saat recording |
| C7 | Auto-save recovery | ✅ DONE | Ada tapi bisa dikontrol via toggle (TODO: UI toggle) |
| M1 | Unit test (Vitest) | ✅ DONE | 24 test untuk `utils`, `settings`, timer future |
| M2 | DRY `escapeHtml` | ✅ DONE | Sentralisasi di `utils.js` |
| L4 | Apple touch icon | ✅ DONE | `icons/icon-192.png` |
| L5 | OG meta / Twitter Card | ✅ DONE | Social sharing siap |

---

## 🔄 Sedang Dalam Progress / Perlu Perbaikan

### P0 — Kritis & Segera
1. **Fix C3 (Pause behavior)**  
   - Problem: Selama "pause", webcam & mic tetap live → hasil rekaman includes background audio/video saat user pause  
   - Solution: Matikan canvas capture stream (tapi not recorder state), beri visual "PAUSED" overlay besar  
   - Estimasi: 1 jam

2. **C7 Toggle auto-save**  
   - Problem: Recovery otomatis tanpa kontrol user  
   - Solution: Tambah checkbox "Hentikan & unduh otomatis jika tab ditutup" default ON, simpan ke localStorage  
   - Estimasi: 30 menit

3. **M8 (Durasi maksimal + warning storage)**  
   - Problem: Rekaman tak terbatas bisa crash RAM/browser  
   - Solution: Limit 60 min, warning setiap 15 min, auto-stop saat limit, indicator storage bar  
   - Estimasi: 1.5 jam

### P1 — High Priority
4. **System Audio Capture** (Meet/Webinar scenario)  
   - Problem: Saat ini hanya mic, bukan system audio (speaker output)  
   - Solution: `getDisplayMedia({ video: true, audio: { echoCancellation: false } })` + mix stream  
   - Note: Hanya Chrome/Edge modern support; fallback ke mic saja  
   - Estimasi: 2 jam

5. **Region Crop / Zoom**  
   - Problem: Hanya screen full, tidak bisa crop area spesifik  
   - Solution: Canvas cropping + overlay selection box + zoom slider  
   - Estimasi: 3 jam

6. **Watermark Overlay**  
   - Problem: Tidak ada branding pada rekaman  
   - Solution: Layer SVG/text di atas composite canvas (position configurable)  
   - Estimasi: 1.5 jam

7. **Trimming Tool (post-recording)**  
   - Problem: User tidak bisa potong awal/akhir setelah rekam  
   - Solution: WebAssembly FFmpeg (`ffmpeg.wasm`) atau native MediaSource API slicing  
   - Estimasi: 4-6 jam (tergantung choice: WASM vs Native)

### P2 — Nice to Have
8. **Subtitle Overlay**  
   - Caption track dari file SRT/WEBVTT di-render ke canvas  
   - Estimasi: 2 jam

9. **Multi-format Export**  
   - After recording: convert WebM → MP4/MKV via transcoder  
   - Estimasi: 3 jam

10. **Accessibility Full Support**  
    - ARIA labels on all buttons, keyboard nav complete in modals, screen reader optimized  
    - Estimasi: 1 jam

---

## 🚧 Backlog / Future Versions

| # | Use Case | Kebutuhan | Priority |
|---|----------|-----------|----------|
| 1 | Webinar panjang | Auto-stop + reminder "durasi X jam", battery saver mode | Low |
| 2 | Tutorial produk | Region selection tool, pointer highlight animation | Medium |
| 3 | Offline-only penuh | Remove all CDN dependencies (Font Awesome, Google Fonts pre-download) | Medium |
| 4 | Collaboration | Share link hasil ke cloud (Drive + share URL), version history | Low |
| 5 | Mobile responsive | Tablet/phone recording support, touch controls | Low |
| 6 | Accessibility | Full WCAG 2.1 AA compliance audit + remediation | Low |
| 7 | Localization | i18n framework (EN, ID, ES, etc.) | Low |

---

## 📊 Metrics & Target Release

| Milestone | Target | Notes |
|-----------|--------|-------|
| v2.1 | ✅ DONE | Format dropdown, unit test, OG meta, apple-touch-icon |
| v2.2 | Q1 2025 | System audio, region crop, watermark, trim tool |
| v2.3 | Q2 2025 | Subtitles, multi-format export, accessibility audit |
| v3.0 | H2 2025 | TypeScript migration, bundle builder, E2E test suite |

---

## 🔍 Next Steps Immediate

Untuk minggu ini / sprint berikutnya:
1. Implement **system audio capture** + fallback handler  
2. Tambah **storage/durasi limit** dengan visual indicator  
3. Buat **watermark configurator** sederhana (text only dulu)  
4. Audit a11y (keyboard nav, ARIA labels)  
5. Tambah test untuk module `media` + `timer`  

Setiap item akan saya implement berurutan karena ini adalah **use case scenario lengkap** yang diminta.

---

*Document updated: 2024 — current v2.1.*
