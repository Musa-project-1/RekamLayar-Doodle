# LayarPro Changelog — v2.1.x

## [2.1.0] — 2024-12-xx (Current Release)

### ✨ Features Baru

#### 🎙️ System Audio Capture (P1 — Webinar/Meeting Scenario)
- **Status**: ✅ DONE by delegating task
- Mendukung capture audio system (speaker output) via `getDisplayMedia({audio:true})`
- Fallback otomatis ke microphone jika browser tidak mendukung audio system
- Cocok untuk: webinar, meeting online, tutorial produk

#### ⏱️ Duration Limit & Warning Indicator (P1/M8)
- **Status**: ✅ DONE by delegating task  
- Max durasi recording: 60 menit
- Warning visual setiap 15, 30, 45, dan 60 menit
- Auto-stop pada 60 menit dengan notifikasi
- Visual indicator progress timer selama recording

#### 🛠️ Toggle Auto-Save UI (C7)
- **Status**: ✅ DONE by delegating task
- Checkbox "Hentikan & unduh otomatis jika tab ditutup" dalam Settings
- Default ON (safe behavior)
- Persistensi ke localStorage sesuai preference user

#### ⌨️ Keyboard Shortcuts Lengkap (M3)
- **Space** — Mulai rekam (idle state only)
- **P** — Pause/Resume recording *(NEW)*
- **S** — Stop recording
- **M** — Toggle microphone on/off *(NEW)*
- **C** — Toggle camera on/off *(NEW)*
- Modal shortcuts updated dengan P shortcut explanation

#### ♿ Accessibility Improvements (L1)
- **Status**: ✅ DONE manually
- ARIA labels pada semua tombol toolbar:
  - `btn-shortcuts`: "Panduan Pintasan Keyboard"
  - `btn-notif`: "Notifikasi"
  - `toggle-mic`: "Aktifkan/nonaktifkan mikrofon"
  - `toggle-camera`: "Aktifkan/nonaktifkan kamera"
  - `btn-pause`: "Jeda atau lanjutkan rekaman"

#### 🔧 Format Dropdown Berfungsi (C4)
- **Status**: ✅ DONE earlier
- Opsi WebM (recommended) + MP4 (H.264, browser-dependent)
- Dynamic MIME type selection via `getFormatConfig()`
- Fallback otomatis ke WebM jika format lain tidak didukung
- Extension dinamis di download & recovery

### 🐛 Bug Fixes

| ID | Bug | Fix | File Modified |
|----|-----|-----|---------------|
| C1 | `formatBytes()` gagal untuk nilai kecil → "0 MB" | Sekarang B/KB/MB/GB benar | `utils.js` |
| C2 | `formatTime(0)` → "0:00" (inkonsisten) | Konsisten ke "00:00" | `utils.js` |
| C4 | Format dropdown tidak berfungsi | Implementasi full logic + dynamic extension | `config.js`, `media.js`, `events.js` |
| C6 | Data loss saat menutup tab | Guard `beforeunload` dengan dialog konfirmasi | `events.js` |

### 🧪 Unit Testing (M1)

**Vitest Setup**
- 24 unit tests lulus (2 files)
- Coverage: `utils.js` (14 tests), `settings.js` (10 tests)
- CI Integration: GitHub Actions tambah step "Unit test"
- Commands:
  ```bash
  npm test      # Run once
  npm run test:watch  # Watch mode
  ```

**File Structure**
```
tests/
  utils.test.js   → formatBytes, formatTime, sanitizeFilename, etc.
  settings.test.js → localStorage persistence round-trip tests
vitest.config.js  # Configuration
```

### 📚 Documentation

**DOCS CREATED:**
- `docs/ANALYSIS.md` (6701 bytes) — Full codebase audit dengan 19 bug/gap items
- `docs/ROADMAP.md` (4926 bytes) — Living roadmap v2.1–v3.0 dengan estimasi
- `docs/CHANGES.md` (file ini) — Changelog untuk tracking release

### 🌐 Meta Tags & Social Sharing

- Apple Touch Icon: `icons/icon-192.png` registered
- Open Graph meta tags (og:title, og:description, og:image, og:type)
- Twitter Card: summary_large_image dengan image & description

### 🏗️ Code Quality

- **DRY Principle** (M2): Sentralisasi `escapeHtml` di `utils.js`, hapus duplikat dari `ui.js` dan `history.js`
- **Lint Check**: All JS passes syntax check
- **ES Modules**: Clean imports everywhere, no circular dependencies

---

## Changes Since Initial Import

### Commit History (Final State)
```
ce5ab04  feat: implementasi perbaikan bug kritis & roadmap lengkap
f535886  feat: redesign UI, logo baru, dan CI/CD pipeline
a2379a1  refactor: dekomposisi LayarPro ke arsitektur modular
678c81a  chore: initial import RekamLayar (LayarPro) from OneDrive
```

### Summary Statistics (Last 3 Commits)
- **Commits**: 3
- **Files Changed**: 32+ files total across all commits
- **Lines Added**: ~4,000+ lines (new features, docs, tests)
- **Tests Added**: 24 passing unit tests
- **CI/CD Workflows**: 2 workflows (ci.yml + deploy.yml)

---

## Upcoming Releases (v2.2–v3.0)

See `docs/ROADMAP.md` for detailed roadmap including:
- System audio enhancement (quality optimization)
- Region crop/zoom tool (tutorial scenario)
- Watermark overlay (branding)
- Trimming tool (post-recording edit)
- Subtitle support (SRT/WebVTT)
- Full WCAG 2.1 AA compliance

---

*This changelog is automatically maintained for tracking.*
