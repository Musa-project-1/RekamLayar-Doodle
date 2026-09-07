# LayarPro - Roadmap & Prioritas Fitur

> Dokumen ini adalah living roadmap yang mengupdate status semua use case scenario
> dan gap yang teridentifikasi dari analisis senior developer (2024).
> **Last updated: v2.2.0**

---

## ✅ Yang Sudah Selesai (v2.2)

### Bug Fixes
| ID | Item | Status | Keterangan |
|----|------|--------|------------|
| C1 | Fix `formatBytes` (nilai kecil) | ✅ DONE | Menampilkan B, KB, MB, GB dengan tepat |
| C2 | Fix `formatTime` (0 detik awal) | ✅ DONE | Konsisten ke 00:00 |
| C4 | Format dropdown berfungsi | ✅ DONE | WebM + MP4 (fallback otomatis) |
| C6 | `beforeunload` guard | ✅ DONE | Dialog konfirmasi saat tutup tab saat recording |
| C7 | Auto-save toggle UI | ✅ DONE | Checkbox di Settings + persistensi localStorage |

### Fitur P1 (High Priority)
| ID | Item | Status | Keterangan |
|----|------|--------|------------|
| P1-1 | System Audio Capture | ✅ DONE | `getDisplayMedia({audio:true})` + fallback ke mic |
| P1-2 | Duration Limit + Warning | ✅ DONE | Max 60 min, warning 15/30/45/60, auto-stop, `timer-extended.js` |
| P1-3 | Watermark Overlay | ✅ DONE | Text watermark, 4 posisi, opacity/font configurable di Settings |
| P1-4 | Region Crop / Zoom | ✅ DONE | `crop.js` dengan overlay seleksi, 5 presets aspect ratio |
| P1-5 | Trimming Tool (Pasca-Rekam) | ✅ DONE | `trimmer.js` pemotong rentang video dengan pratinjau & reset asli |
| C3 | Perbaikan Jeda (Pause Behavior) | ✅ DONE | Mute audio tracks saat jeda, visual banner di kanvas & badge amber |

### Keyboard & Accessibility
| ID | Item | Status | Keterangan |
|----|------|--------|------------|
| M3 | Keyboard shortcuts lengkap | ✅ DONE | Space / P (pause) / S (stop) / M (mic) / C (camera) |
| L1 | ARIA labels toolbar | ✅ DONE | Semua tombol interaktif ber-label |
| L4 | Apple touch icon | ✅ DONE | `icons/icon-192.png` |
| L5 | OG meta / Twitter Card | ✅ DONE | Social sharing siap |

### Quality & Testing
| ID | Item | Status | Keterangan |
|----|------|--------|------------|
| M1 | Unit test (Vitest) | ✅ DONE | 42 test (utils, settings, trimmer, crop math) |
| M2 | DRY `escapeHtml` | ✅ DONE | Sentralisasi di `utils.js` |
| - | CI/CD pipeline | ✅ DONE | GitHub Actions: lint → test → build CSS |

---

## 🔄 Sedang Dalam Progress / Perlu Perbaikan

### P2 - Fitur Tambahan (Nice to Have)
1. **Subtitle Overlay**  
   - Caption track dari file SRT/WEBVTT di-render ke canvas  
   - Estimasi: 2 jam

2. **Multi-format Export (Transcoding)**  
   - Konversi WebM ke MP4/MKV pasca-rekam  
   - Estimasi: 3 jam

3. **Full WCAG 2.1 AA Compliance Audit**  
   - Audit a11y komprehensif dengan axe-core & Lighthouse  
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
| 6 | TypeScript migration | Full TS types, safer refactor | Medium |
| 7 | Localization | i18n framework (EN, ID, ES, etc.) | Low |
| 8 | E2E Testing | Playwright/Cypress untuk recording flow end-to-end | Medium |
| 9 | Error Monitoring | Sentry integration untuk production error tracking | Medium |

---

## 📊 Metrics & Target Release

| Milestone | Target | Notes |
|-----------|--------|-------|
| v2.1 | ✅ DONE | Format dropdown, unit test, OG meta, apple-touch-icon |
| v2.2 | ✅ DONE | System audio, duration limit, watermark, auto-save toggle |
| v2.3 | Q1 2025 | Region crop, trimming tool, subtitle overlay |
| v3.0 | H2 2025 | TypeScript migration, bundle builder, E2E test suite |

---

## 🔍 Next Steps Immediate

Untuk sprint berikutnya:
1. **Fix C3 (Pause behavior)** - clarity UX saat pause (1 jam)
2. **Region crop/zoom** - seleksi area recording (3 jam)
3. **Trimming tool** - potong awal/akhir pasca-rekam (4-6 jam)
4. **Subtitle overlay** - SRT/WebVTT support (2 jam)
5. **E2E tests** - Playwright untuk full recording flow (3 jam)
6. **Error monitoring** - Sentry integration (1 jam)

---

*Document updated: 2024 - current v2.2.0.*
