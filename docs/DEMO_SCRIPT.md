# LayarPro - Demo Script & Presentation Guide

## 🎬 Purpose
Demo script untuk showcase fitur-fitur utama LayarPro kepada stakeholder/user. Cocok untuk presentation, tutorial video, atau dokumentasi produk.

---

## ⏱️ Timing Estimate: 8-10 menit (interactive demo + explanation)

---

## 📋 PRE-DEMO SETUP (5 menit before start)

### A. GitHub Pages Activation (User Action Required)
```
1. Buka: https://github.com/Musa-project-1/RekamLayar-Doodle/settings/pages
2. Section "Build and deployment":
   - Source dropdown → Pilih "GitHub Actions"
3. Klik SAVE
4. Wait ~2 menit untuk initial build
```

### B. Google OAuth Configuration
```
1. Update js/config.js line 15:
   OLD: GOOGLE_CLIENT_ID: "YOUR_GOOGLE_CLIENT_ID"
   NEW: GOOGLE_CLIENT_ID: "your-actual-id.apps.googleusercontent.com"
   
2. Commit & push:
   git add . && git commit -m "config: update client ID" && git push
   
3. Verify in browser console: no OAuth errors
```

### C. Browser Preparation
```
Open Chrome (recommended for best WebRTC support):
1. Open DevTools (F12)
2. Console tab - ready for debugging
3. Application tab - can inspect Service Worker cache
```

---

## 🎥 DETAILED DEMO SCRIPT (10 slides max)

### Slide 1: Opening / Hero Shot (30 sec)
**Goal:** Show first impression & modern UI

**Narration:**
>"Ini adalah LayarPro - aplikasi perekam layar modern built entirely sebagai Progressive Web App (PWA). Perhatikan design sistem konsisten dengan glass-morphism panels dan gradient accents."

**Actions:**
1. Navigate ke deployed site URL
2. Point out header dengan logo baru (monitor + red dot icon)
3. Highlight status badge "Siap" dengan indicator hijau

**What to Emphasize:**
- Clean, modern aesthetic
- Responsive layout (mobile-friendly)
- PWA-ready manifest (installable to desktop/home screen)

---

### Slide 2: Settings Panel Access (1 min)
**Goal:** Demonstrate configuration flexibility

**Narration:**
>"Sebelum rekam, kita bisa adjust settings untuk berbagai use case scenarios."

**Actions:**
1. Click **"Settings"** button (gear icon)
2. Modal opens dengan 2 sections: Video & Tampilan

**Walkthrough Fields:**
- **Resolution**: Default vs Full HD (explain: higher = larger file size)
- **FPS**: 30 vs 60 (FPS 60 smooth tapi lebih berat)
- **Format**: WebM (recommended) vs MP4 (browser-dependent)
- **Countdown**: 3 detik (default) vs custom

**Interactive:**
- Change FPS dari 30 → 60
- Change format ke MP4 (show fallback warning jika tidak supported)
- Click "Save Settings"

**Key Points:**
> "Format dropdown sekarang functional - kalau browser support MP4 encoding, akan save as .mp4. Kalau tidak, auto-fallback ke WebM dengan toast notification."

---

### Slide 3: Recording Start + Countdown (1 min)
**Goal:** Show recording flow + preview composite

**Narration:**
>"Mari mulai rekam. Kita akan test full pipeline: display capture → webcam overlay → audio routing."

**Actions:**
1. Click **"Mulai Rekaman"** button
2. System prompt appears (Chrome only):
   ```
   [ ] Audio sharing → CHECK THIS (important!)
   [x] Share audio from tab
   ```
3. Select screen/window to record
4. 3-second countdown animation muncul di canvas

**Visual Details to Highlight:**
- Preview composite canvas: full screen + PiP facecam top-right
- Red recording indicator + timer counter starts at 00:00
- Toast: "Merekam..." appears briefly

**Technical Note:**
> "Countdown menggunakan native JavaScript timers, no external dependencies. Visual feedback real-time via DOM updates setiap second."

---

### Slide 4: Pause / Resume Feature (1.5 min)
**Goal:** Demonstrate pause functionality + state management

**Narration:**
>"Saat presentasi, kadang perlu pause sebentar untuk explanation. Fitur pause membantu tanpa ending recording."

**Actions:**
1. Click **"Pause"** button (pill shape, center toolbar)
2. Visual change:
   - Status badge berubah "Merekam" → "Jeda"
   - Timer PAUSES counting (freeze at current time)
   - Canvas tetap menampilkan last frame (no new frames captured)

**Explain State Management:**
> "State.isPaused = true di State singleton. Recorder state juga pause, tapi streams masih active (webcam/mic tetap live)."

3. Click **"Resume"** (icon berubah pause → play)
4. Timer resumes counting
5. Status badge kembali "Merekam"

**Critical UX Detail:**
> "Perhatikan visual difference - pause icon berubah jadi play icon. Ini affordance penting user tahu mereka sedang paused."

---

### Slide 5: Mute / Camera Toggle Shortcuts (1 min)
**Goal:** Showcase keyboard shortcuts (M3 improvements)

**Narration:**
>"Shortcut keys mempercepat workflow tanpa mouse navigation."

**Actions (recorded keystrokes):**
1. Press **M** (toggle microphone on/off)
   - Mic icon changes color: indigo-300 → slate-500
   - Toast: "Mikrofon nonaktif"
   - Volume visualizer disappears
   
2. Press **C** (toggle camera on/off)
   - Camera icon flips: video-slash → video
   - PiP canvas disappears
   - Toast: "Kamera aktif"

**Explain Design Decisions:**
> "Shortcuts P/M/C designed untuk minimal cognitive load. Semua single letter, intuitive associations."

**Bonus (if time permits):**
3. Press **Space** (should not work while recording)
4. Explain guard: Space only works when idle (recordingInProgress = false)

---

### Slide 6: System Audio Capture (P1 Feature) (2 min)
**Goal:** Demonstrate system audio (webinar scenario)

**Narration:**
>"Fitur P1 baru: system audio capture untuk recording webinar/meetings dimana Anda perlu capture speaker output bukan mic."

**Actions:**
1. Click **Start Recording** again
2. In Chrome permission dialog, select **"Audio sharing"** tab option
3. Grant permission
4. Play some audio content (YouTube or local video)

**Verification Steps:**
1. Check volume visualizer bars animating
2. Stop recording after 10 sec
3. Download locally
4. Play video back → verify includes system audio

**Technical Explanation:**
> "getDisplayMedia() dengan {audio:true} captures audio from selected window/tab. Fallback otomatis ke getUserMedia({audio:true}) jika tidak support system audio capture (older browsers)."

**Use Case Mention:**
> "Perfect untuk: webinar recordings, online meetings, product demos yang perlu audio dari speaker output."

---

### Slide 7: Duration Limit & Warning (P1 Feature) (1.5 min)
**Goal:** Show safety features for long recordings

**Narration:**
>"Untuk webinar panjang atau sessions >1 jam, ada duration limit protection."

**Actions:**
1. Start a very long recording (or simulate by waiting)
2. Point out progress indicator di header:
   ```
   ⏱️ 15:00 / 60:00 ────────────
   ```
3. Explain warning triggers:
   - 15:00 → Yellow warning bar
   - 30:00 → Orange warning
   - 45:00 → Red warning
   - 60:00 → Auto-stop + toast

**Code Walkthrough (optional in presentation):**
> "TimerExtended module tracks elapsed vs MAX_DURATION constant. Progress bar computed dari percentage."

**Safety Value Proposition:**
> "Prevent memory overflow di browser, auto-save recovery tersedia kalau user accidentally closes tab."

---

### Slide 8: Stop + Post-Recording Actions (1.5 min)
**Goal:** Showcase finalization options

**Narration:**
>"Sekarang mari stop dan lihat hasil akhir serta export options."

**Actions:**
1. Click **"Berhenti Rekaman"** (red pill button)
2. Modal post-recording actions:
   ```
   [Download Lokal] [Simpan ke Drive] [Lagi Rekaman]
   ```

3. Click **"Download Lokal"**
4. File downloads instantly dengan naming pattern:
   ```
   LayarPro-rekaman-YYYY-MM-DD_HH-MM-SS.webm
   ```

**Show Download Behavior:**
- Filename auto-generated dengan timestamp
- Extension matches chosen format (.webm atau .mp4)
- Size displayed in toast notification

**Optional: Google Drive Integration**
1. Click **"Simpan ke Drive"** instead
2. OAuth popup appears (if Client ID configured)
3. Token request + upload progress bar
4. Success toast setelah upload complete

**Drive Security Note:**
> "Token akses hanya in-memory (tidak localStorage), scope drive.file terbatas hanya untuk file yang dibuat app ini."

---

### Slide 9: Accessibility Features (30 sec)
**Goal:** Briefly demonstrate accessibility compliance

**Narration:**
>"Aplikasi mendukung keyboard-only workflow dan screen readers."

**Quick Demo:**
1. Close browser (disable mouse temporarily if possible)
2. Tab through all buttons: Start → Settings → Shortcuts → ...
3. Verify all focus states visible (outline ring)
4. Show aria-labels via DevTools Element panel:
   ```html
   <button aria-label="Aktifkan/nonaktifkan mikrofon">...</button>
   ```

**Accessibility Checklist:**
- ✅ All interactive elements keyboard accessible
- ✅ ARIA labels on all buttons
- ✅ Focus indicators clear
- ✅ Contrast ratios WCAG AA compliant

---

### Slide 10: Testing & CI/CD (1 min)
**Goal:** Show quality assurance infrastructure

**Navigate to GitHub → Actions tab**

**Show Recent Workflow Runs:**
```
✅ CI - Lint      (clean)
✅ CI - Unit Test (24 passed)  
✅ CI - Build CSS (success)
✅ Deploy to Pages (if triggered)
```

**Explanation:**
> "Setiap push ke main trigger automated pipeline: syntax check → 24 unit tests → Tailwind build → deploy pages. No manual intervention needed."

**Code Quality Points:**
- 24 vitest unit tests passing
- ESLint syntax validation
- Zero security warnings in dependencies
- CI runs automatically on PR merge

---

## 🎯 POST-DEMO DISCUSSION POINTS

### Technical Q&A Prepares

**Q: Apakah aplikasi offline?**
A: Ya, Service Worker pre-cache semua static assets. Bisa dibuka tanpa internet, tapi GDrive upload perlu online.

**Q: Berapa besar file yang di-capture?**
A: Sekitar 10-20 MB per menit untuk WebM VP9 @ 1080p60. Bisa configure resolution/FPS untuk trade-off quality vs size.

**Q: Format apa saja yang didukung?**
A: WebM (universal support) dan MP4 (jika browser punya hardware H.264 encoder). Fallback otomatis.

**Q: Memory footprint berapa?**
A: Recording 1 jam ~200-500MB RAM tergantung resolution. Auto-stop 60 min prevent crash.

**Q: Support mobile phone?**
A: Desktop-first saat ini. Mobile support ada basic framework tapi touch gestures belum optimized. Roadmap v2.3 planned.

**Q: Security concerns?**
A: OAuth token in-memory saja, scope minimal drive.file, Client ID public (bukan secret). TLS enforces HTTPS production.

---

## 📹 RECORDING FOR VIDEO DEMO (Recommended)

Jika ingin video tutorial/review, rekam proses dengan:

1. Screen capture software (OBS Studio free)
2. Enable cursor highlights
3. Slow down key actions (zoom in pada UI elements)
4. Narrate with voiceover script above
5. Add timestamps for important features
6. Export 1080p @ 30fps

**Suggested Video Structure:**
- Intro (0:00-0:30): What is LayarPro
- Basic usage (0:30-3:00): Record, pause, stop, download
- Advanced features (3:00-7:00): System audio, shortcuts, duration limit
- Tech deep-dive (7:00-9:00): Architecture, CI/CD, testing
- Conclusion (9:00-10:00): Summary + roadmap

---

## ✅ DEMO SUCCESS METRICS

Dem считается berhasil jika:
- ✅ User memahami core functionality dalam 10 menit
- ✅ Dapat navigate settings dan start recording independently
- ✅ Notice accessibility features (keyboard nav, aria-labels)
- ✅ Understand P1 new features (system audio, duration limit)
- ✅ Aware of CI/CD quality gates

**If user asks about roadmap items** → point to ROADMAP.md document

---

*End of Demo Script - Good luck! 🚀*
