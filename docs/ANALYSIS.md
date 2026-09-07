# LayarPro — Analisis Senior Developer & Roadmap

> Dokumen ini adalah hasil audit menyeluruh terhadap seluruh codebase (`js/`, `css/`,
> `sw.js`, `manifest`, dan workflow CI/CD). Setiap temuan diklasifikasikan berdasarkan
> tingkat keparahan dan disertai rekomendasi perbaikan.

---

## 1. Ringkasan Kondisi Saat Ini

**Kekuatan (yang sudah bagus):**
- Arsitektur modular ES yang bersih (14 modul, tanggung jawab terpisah).
- State terpusat (`State`, `DragState`, `AudioState`) dengan satu sumber kebenaran.
- Penanganan memory leak sudah ada (`releaseFinalBlob`, revoke URL, close AudioContext).
- Token OAuth hanya in-memory, scope `drive.file` minimal, Client ID placeholder.
- PWA lengkap (SW + manifest + ikon maskable).
- CI/CD otomatis (lint + build + deploy Pages).

**Risiko utama (perlu segera ditangani):** lihat tabel temuan di bawah.

---

## 2. Temuan Berdasarkan Keparahan

### 🔴 KRITIS (bug / gap yang mempengaruhi fungsionalitas inti)

| ID | Temuan | Dampak | Lokasi |
|----|--------|--------|--------|
| C1 | **`formatBytes` rusak untuk nilai kecil** — `bytes <= 0` mengembalikan `"0 MB"`, dan nilai < 1 MB tetap `toFixed(2)` = `"0.00 MB"`. Ukuran rekaman kecil tampil `0.00 MB`. | UX membingungkan | `utils.js:7` |
| C2 | **`formatTime` tidak menampilkan 0 detik awal** — `formatTime(0)` = `"0:00"` (menit 0 pad 1 digit), tidak konsisten dengan `"00:00"`. | Tampilan timer awal janggal | `utils.js:14` |
| C3 | **Fitur "Pause" tidak benar-benar pause media** — `pauseRecording()` hanya `recorder.pause()`; display stream TETAP jalan (canvas terus menggambar). Resume tidak ada gap di timeline, tapi webcam/mic tetap aktif selama pause. | Perilaku pause ambigu; mic masih merekam saat "paused" | `media.js` |
| C4 | **Tidak ada dukungan MP4/format lain** — setting `format` ada di UI tapi `RECORD_EXTENSION` hardcoded `"webm"`, dan `MIME_TYPES` hanya webm. Format dropdown tidak berfungsi. | Setting format = dead UI | `config.js`, `settings.js` |
| C5 | **Screenshot hanya saat recording** — `screenshotFromCanvas()` mengembalikan null jika canvas tidak punya stream aktif. Tidak bisa screenshot preview. | Fitur terbatas | `media.js` |
| C6 | **Tanpa penanganan `beforeunload`** — user menutup tab saat recording = rekaman hilang tanpa peringatan. | Data loss | `app.js` |
| C7 | **Auto-save ke Drive tidak terpasang di UI** — `setupAutoSave()` dipanggil tapi tidak ada toggle/kontrol untuk mengaktifkannya. | Fitur mati | `media.js`, `app.js` |

### 🟠 SEDANG (kualitas, robustness, edge case)

| ID | Temuan | Dampak | Lokasi |
|----|--------|--------|--------|
| M1 | **Tanpa unit test** — 0 test coverage untuk `utils`, `timer`, `history`, `settings`. | Regresi mudah lolos | seluruh repo |
| M2 | **`escapeHtml` diduplikasi** di `ui.js` dan `history.js`. | DRY violation | `ui.js:36`, `history.js:45` |
| M3 | **Keyboard shortcut konflik** — Space untuk start hanya saat idle, tapi `S` untuk stop tidak dicek saat input fokus (sudah dicek), tapi tidak ada `P` untuk pause. | UX shortcut tidak lengkap | `events.js:233` |
| M4 | **`runCountdown` tidak bisa dibatalkan** — jika user klik start lalu tutup, countdown tetap jalan. | UX | `timer.js:44` |
| M5 | **Service worker cache-busting manual** — `CACHE_NAME` hardcoded `layarpro-v1`; versi baru perlu edit manual. | Maintenance | `sw.js:4` |
| M6 | **Tanpa fitur trim/clip recording** — setelah rekam, user tidak bisa potong awal/akhir. | Use case umum hilang | - |
| M7 | **Tanpa watermark/logo overlay** saat recording. | Branding | - |
| M8 | **Tanpa indikator durasi maksimal** — rekaman bisa memenuhi RAM tanpa batas. | Crash/performance | `media.js` |
| M9 | **`DragState` tidak reset saat rekaman baru** — posisi facecam/notes nyangkut dari sesi sebelumnya. | UX | `drag.js`, `state.js` |

### 🟡 RENDAH (polish, aksesibilitas, i18n)

| ID | Temuan | Dampak |
|----|--------|--------|
| L1 | Tidak ada `aria-label` pada tombol ikon toolbar. | Aksesibilitas |
| L2 | Tidak ada dukungan keyboard full (tab navigation di modal). | Aksesibilitas |
| L3 | Warna status "recording" memakai `bg-red-500 animate-pulse` (Tailwind) bukan class custom `.status-dot.recording` yang sudah dibuat di CSS. | Inkonsistensi |
| L4 | Tanpa favicon Apple touch icon (`apple-touch-icon.png`). | iOS PWA |
| L5 | Tanpa meta Open Graph / Twitter Card. | Social sharing |

---

## 3. Use Case Scenario yang Perlu Didukung

### A. Use case yang SUDAH didukung
1. Rekam layar penuh + mic.
2. Rekam layar + webcam (PiP).
3. Pause/resume (parsial — lihat C3).
4. Screenshot saat recording.
5. Catatan teleprompter (drag).
6. Upload ke Google Drive.
7. Riwayat rekaman + clear.
8. Pengaturan (resolusi, fps, countdown).

### B. Use case yang BELUM didukung (gap)
| # | Use case | Kebutuhan |
|---|----------|-----------|
| 1 | **Webinar / presentasi panjang** | Durasi maksimal + auto-stop + warning storage |
| 2 | **Tutorial / demo produk** | Watermark branding + zoom/crop region |
| 3 | **Meeting online** | System audio capture (`getDisplayMedia` + `audio`), saat ini hanya mic |
| 4 | **Editing cepat** | Trim awal/akhir sebelum download |
| 5 | **Rekaman portabel** | Export MP4 (butuh transcoder WASM seperti `ffmpeg.wasm`) |
| 6 | **Offline penuh** | Semua aset sudah pre-cache (OK), tapi Google Fonts masih CDN |
| 7 | **Kolaborasi** | Share link hasil (bukan hanya upload Drive) |
| 8 | **Aksesibilitas** | Keyboard nav penuh + screen reader |

---

## 4. Prioritas Implementasi (Roadmap)

| Prioritas | Item | Estimasi |
|-----------|------|----------|
| **P0 — Sekarang** | Fix C1, C2, C6 (formatBytes, formatTime, beforeunload) | 30 menit |
| **P0 — Sekarang** | Fix C4 (format dropdown dead) + C7 (auto-save toggle) | 45 menit |
| **P0 — Sekarang** | Unit test (Vitest) untuk `utils`, `timer`, `settings` | 1 jam |
| **P1** | Fix C3 (pause media) + M9 (reset drag state) | 1 jam |
| **P1** | M6 (trim) + M7 (watermark) + M8 (durasi maks) | 2 jam |
| **P1** | M2 (DRY escapeHtml), M3 (shortcut P), L1/L2 (a11y) | 1 jam |
| **P2** | L4 (apple-touch-icon), L5 (OG meta), M5 (SW version auto) | 45 menit |
| **P2** | System audio capture, MP4 export, region crop | backlog |

---

## 5. Rekomendasi Arsitektur Jangka Panjang

1. **Pindah ke TypeScript** — menambah type safety pada `State`, `CONFIG`, dan event.
2. **State management** — jika fitur bertambah (trim, region, watermark), pertimbangkan
   `zustand` atau `signals` untuk reactive state.
3. **Test runner** — Vitest + jsdom untuk modul murni; Playwright untuk E2E recording.
4. **Build bundler** — esbuild/Vite untuk tree-shaking dan minifikasi JS.
5. **Error reporting** — sentry / error boundary untuk produksi.
