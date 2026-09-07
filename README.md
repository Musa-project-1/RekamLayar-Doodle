# LayarPro - Perekam Layar & Rapat (Offline-First)

**LayarPro v2.0.0** - Aplikasi perekam layar desktop dengan rekaman webcam picture-in-picture, catatan drag-dan-geser, dan integrasi Google Drive. Dibangun dengan Vanilla JavaScript modular dan Tailwind CSS lokal.

---

## 🎯 Fitur Utama

- **Rekam layar + kamera/webcam** dengan composite preview real-time
- **Mikrofon dengan visualizer gelombang audio** (real-time volume bar)
- **Stopwatch & countdown** sebelum mulai merekam
- **Auto-save** saat tab ditutup secara tidak sengaja
- **Tangkapan layar** pada frame aktif
- **Catatan/teleprompter** floating window yang bisa digeser
- **Picture-in-Picture** untuk video preview utama
- **Riwayat rekaman lokal** (localStorage)
- **Google Drive upload** dengan OAuth scoped minimal (`drive.file`)
- **PWA-ready** dengan service worker untuk caching offline-first

---

## 📁 Struktur Modul

```
RekamLayar/
├── index.html                    # UI utama (<450 baris)
├── manifest.webmanifest          # PWA metadata
├── package.json                  # npm dependencies
├── tailwind.config.js            # Konfigurasi Tailwind CLI
├── css/
│   └── input.css                 # Source Tailwind + custom styles
├── dist/
│   └── styles.css                # Compiled/minified CSS (build output)
├── js/                           # Modul ES (semua <450 baris)
│   ├── config.js                 # KONSTANTA: Client ID, MIME types, ekstensi
│   ├── state.js                  # State global: stream refs, flags, timer
│   ├── dom.js                    # DOM cache helper (get() pattern)
│   ├── utils.js                  # Utility: formatBytes, formatTime, sanitization
│   ├── ui.js                     # Toast, notification, beep, download
│   ├── settings.js               # Persistensi localStorage (settings & history)
│   ├── timer.js                  # Stopwatch & countdown logic
│   ├── media.js                  # Rekorder inti: captureStream, composite, recorder
│   ├── gdrive.js                 # Google Drive uploader (token in-memory)
│   ├── drag.js                   # Drag handlers untuk notes & facecam
│   ├── history.js                # Render & manage riwayat rekaman
│   ├── events.js                 # UI event listeners + keyboard shortcuts
│   └── app.js                    # Bootstrap & initialization
├── sw.js                         # Service worker (cache-first strategy)
└── icons/                        # App icons (SVG + PNG placeholders)
    ├── icon.svg
    ├── icon-192.png
    └── icon-512.png
```

---

## 🔧 Setup & Development

### Prasyarat
- Node.js ≥ 18.x (untuk npm & Tailwind CLI)
- Browser modern yang mendukung `getDisplayMedia`, `MediaRecorder`, `canvas.captureStream`

### Instalasi
```bash
npm install
```

### Build (Production CSS)
```bash
npm run build
# atau shortcut:
npm run build:css
```

### Watch Mode (Development CSS)
```bash
npm run watch:css
```

### Lint (syntax check)
```bash
npm run lint
```

### Regenerasi Ikon (opsional, butuh `sharp`)
```bash
npm i -D sharp
npm run build:icons
```

---

## 🚀 CI/CD (GitHub Actions)

Repositori ini dilengkapi dua workflow otomatis:

| Workflow | File | Fungsi |
|----------|------|--------|
| CI | `.github/workflows/ci.yml` | Lint semua JS + build CSS di setiap push/PR |
| Deploy | `.github/workflows/deploy.yml` | Auto-deploy ke GitHub Pages setelah push ke `main` |

Untuk mengaktifkan GitHub Pages, buka **Settings > Pages** di repositori
dan pilih source **"GitHub Actions"**.

---

## 🛠️ Keamanan

### OAuth Token Security
- **Token akses Google Drive hanya disimpan di memori** (`State.gdriveAccessToken`) - tidak pernah ke `localStorage` atau database.
- **Scope minimal**: `drive.file` (hanya membuat/modifikasi file baru, tidak akses semua Drive).
- Token otomatis hilang setelah sesi browser ditutup/reload.

### Memory Leak Prevention (MediaEngine)
- Setiap kali rekaman selesai, chunks array dibersihkan `recordedChunks = []`.
- Blob URL direvoke via `URL.revokeObjectURL()` setelah download/playback selesai.
- Semua track MediaStream dihentikan eksplisit via `stopAllTracks()`.

### Anti-Slop Typography
- Font **Inter** (system-ui fallback) tanpa em-dash, tipografi konsisten.
- Glassmorphism panel dengan backdrop blur modern.
- Warna gelap elegan: `#0B1120` background + indigo accents.

---

## ⚡ Performa & Optimization

- **Tailwind CLI lokal** (bukan CDN) - compile sekali untuk production.
- **Service worker caching** untuk semua aset JS/CSS/HTML (offline-first capability).
- **ES Modules** terpisah tiap domain logic (no monolithic script.js).
- **Canvas capture per-frame** untuk komposit A/V sync (video+webcam+mikrofon sinkron timeline).

---

## 🧪 Testing Manual Checklist

- [ ] Klik tombol "Mulai" → hitung mundur → kanvas menampilkan composite screen+facecam
- [ ] Toggle mikrofon: ikon berubah, visualizer bar bereaksi terhadap suara
- [ ] Toggle kamera: facecam overlay muncul di pojok kanan bawah, bisa digeser
- [ ] Pause/Resume: stopwatch pause/resume, indikator berkedip merah saat pause
- [ ] Stop: rekaman tersimpan, muncul menu download local & save to Google Drive
- [ ] Screenshot: gambar PNG di-download dari frame terakhir preview
- [ ] Catat: notepad floating window muncul, teks bisa di-copy/di-download
- [ ] PiP: klik PiP → video preview menjadi jendela floating browser
- [ ] Close tab saat merekam: recovery blob otomatis triggered (test di devtools beforeunload)
- [ ] History modal: list rekaman terbaru muncul, filter by type/search title
- [ ] Settings: resolusi, FPS, countdown persist after reload
- [ ] Notifikasi: badge indicator muncul saat ada notif, click "mark read" hide dot
- [ ] Google Drive upload: OAuth prompt muncul, file berhasil masuk ke folder "LayarPro"

---

## 🚀 Deployment

### Production Build Steps
1. Update `GOOGLE_CLIENT_ID` di `js/config.js` dengan client ID Anda sendiri.
2. Generate production PNG icons:
   ```bash
   convert icons/icon.svg -resize 192x192 icons/icon-192.png
   convert icons/icon.svg -resize 512x512 icons/icon-512.png
   ```
3. Commit & push:
   ```bash
   git add .
   git commit -m "refactor: modular architecture v2.0"
   git push origin main
   ```
4. Deploy ke hosting static (Netlify/Vercel/GitHub Pages):
   - Static files root: `index.html`, `dist/styles.css`, `js/*.js`, `sw.js`, `manifest.webmanifest`
   - Set correct MIME types: `.webmanifest` → `application/manifest+json`, `.js` → `text/javascript`

### Service Worker Activation
- SW auto-register on first load via `app.js`:
  ```js
  navigator.serviceWorker.register("./sw.js")
  ```
- Cache-busting via `CACHE_NAME = "layarpro-v1"` versioning (upgrade via update name).

---

## 📜 License

MIT License - bebas digunakan, dimodifikasi, dan didistribusikan.

Lihat file [LICENSE](LICENSE) untuk detail lengkap.

---

*Last updated: Module restructure complete.*
