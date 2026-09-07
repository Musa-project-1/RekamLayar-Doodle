# LayarPro — User Guide & FAQ

## 👋 Welcome to LayarPro

LayarPro adalah aplikasi perekam layar modern yang berjalan langsung di browser tanpa perlu install software. Bisa untuk presentasi, webinar, tutorial, meeting recording, dan berbagai use case lainnya.

---

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Recording Workflow](#basic-recording-workflow)
3. [Settings Explained](#settings-explained)
4. [Keyboard Shortcuts](#keyboard-shortcuts)
5. [Google Drive Integration](#google-drive-integration)
6. [Troubleshooting](#troubleshooting)
7. [FAQ (Frequently Asked Questions)](#faq-frequently-asked-questions)
8. [Privacy & Security](#privacy--security)

---

## 🚀 Getting Started

### System Requirements

**Supported Browsers:**
- ✅ Chrome 88+ (recommended, best support)
- ✅ Edge 88+ (Chromium-based)
- ✅ Firefox 90+ (WebRTC basic support)
- ⚠️ Safari 15+ (limited system audio support)

**Minimum Specs:**
- RAM: 4GB+ (8GB recommended for 60fps recording)
- Storage: 500MB+ free space for recordings
- Internet: Required only for Google Drive upload (optional)

### First Time Setup

#### Step 1: Enable GitHub Pages (If Using Deployment)
```
1. Go to your repo settings: https://github.com/YOUR_USERNAME/RekamLayar-Doodle/settings/pages
2. Under "Build and deployment":
   - Source dropdown → Select "GitHub Actions"
3. Click SAVE
4. Wait ~2 minutes for initial build
5. Site will be live at: https://YOUR_USERNAME.github.io/RekamLayar-Doodle
```

#### Step 2: Configure Google OAuth (Optional)
Only needed if you want auto-upload to Google Drive.

```
1. Create project in Google Cloud Console:
   https://console.cloud.google.com/apis/credentials
   
2. Create OAuth Client ID (Web application):
   - Name: LayarPro
   - Authorized JavaScript origins: Your site URL (e.g., https://musa-project-1.github.io)
   - Authorized redirect URIs: Add same as origins + /oauth2callback
   
3. Copy the Client ID value
   
4. Update js/config.js line 15:
   GOOGLE_CLIENT_ID: "your-actual-client-id.apps.googleusercontent.com"
   
5. Commit & push changes
```

#### Step 3: Start Using
Navigate ke deployed site atau open `index.html` locally (need web server).

---

## 🎬 Basic Recording Workflow

### Step-by-Step Recording Process

#### 1. Open Settings Panel
```
Click button "Settings" (gear icon ⚙️)
Modal opens dengan 2 sections:
  • Video & Tampilan
  • Audio Options
```

#### 2. Adjust Recording Parameters
Recommended presets:

| Use Case | Resolution | FPS | Format | Notes |
|----------|-----------|-----|--------|-------|
| Quick demo | Default (screen size) | 30 | WebM | Small file size |
| Webinar | 1080p Full HD | 60 | WebM | Smooth motion |
| Meeting | 720p HD | 30 | MP4 | If browser supports |
| Tutorial | 1080p Full HD | 30 | WebM | Balance quality/size |

**Important:** 
- Higher resolution = larger file size (roughly 10-20MB per minute @1080p30)
- 60FPS = smoother but doubles file size vs 30FPS
- MP4 only works if browser has hardware H.264 encoder (Chrome/Edge yes, Firefox partial)

#### 3. Configure Mic & Camera (Optional)
Before starting, toggle these icons:
- **Microphone (🎤)**: On/Off voice recording
- **Camera (📹)**: On/Off facecam overlay

**Tip:** Toggle OFF both untuk recording tanpa audio/video (presentation-only).

#### 4. Start Recording
```
Click big white button "Mulai Rekaman"
```

Chrome permission prompt appears:
```
[ ] Share audio from this tab      ← CHECK THIS FOR SYSTEM AUDIO
[x] Share screen                    ← Standard display capture
```

**For System Audio Capture (NEW!):**
- Check "Share audio from this tab" option
- This captures speaker output (not microphone)
- Perfect untuk webinar/meetings where you need presenter audio

Click "Share", select window/screen to record.

#### 5. Countdown & Recording
3-second countdown animation plays on screen.
Recording starts automatically after countdown.

**Visual Indicators:**
- Red pill badge: "Merekam" with pulsing red dot
- Timer counter: 00:00 incrementing every second
- Volume visualizer: green waves jika mic enabled
- Facecam PiP: top-right corner jika camera enabled

#### 6. Pause During Recording
```
Click center button "Pause" (pill shape)
```

State changes:
- Badge text: "Merekam" → "Jeda"
- Timer pauses counting
- Preview frame freezes (no new frames captured)
- Webcam/mic still active (can resume anytime)

To resume, click same button (now shows play icon ▶️).

#### 7. Stop & Download
```
Click red button "Berhenti Rekaman"
```

Post-recording modal appears:
```
┌─────────────────────────────┐
│  ✨ Rekaman Selesai          │
│                             │
│  [Download Lokal]           │
│  [Simpan ke Google Drive]   │
│  [Lagi Rekaman]             │
└─────────────────────────────┘
```

**Option A: Download Lokal**
- File downloads instantly ke Downloads folder
- Naming pattern: `LayarPro-rekaman-YYYY-MM-DD_HH-MM-SS.webm`
- Extension matches format chosen (.webm or .mp4)

**Option B: Save to Google Drive**
- OAuth popup triggers (if Client ID configured)
- Sign-in with Google account
- Upload progress bar shows %
- Success toast setelah complete
- File saved to root "/" atau "LayarPro/" folder di Drive

#### 8. View History
Recent recordings listed di sidebar notification panel.
Click any entry untuk quick access to most recent files.

**Clear history** via Settings → "Hapus Riwayat Rekaman"

---

## ⚙️ Settings Explained

### Resolution Dropdown
- **Default**: Uses your full screen resolution (highest quality)
- **1920x1080**: Fixed Full HD size (good balance)
- **1280x720**: HD size (smaller files)
- **640x480**: VGA (smallest files, low quality)

**Recommendation:** Stick "Default" unless you have specific size constraints.

### FPS (Frames Per Second)
- **30 fps**: Standard video smoothness, good for most use cases
- **60 fps**: Ultra-smooth, better for fast motion/screenshots

**Note:** 60fps doubles file size compared to 30fps. Use only for important demos.

### Format Selector
- **WebM** (VP9 codec): Universal support, small files, highly recommended
- **MP4** (H.264): Only works if browser has hardware encoder (Chrome/Edge yes)

**Smart Behavior:** Jika MP4 tidak supported, auto-fallback ke WebM dengan toast notification.

### Countdown Duration
- **3 seconds**: Default, standard waiting time
- **5 seconds**: More time untuk prepare content
- **10 seconds**: Maximum prep time
- **No countdown**: Immediate start (quick recording)

**Use Case:** Longer countdown untuk presentation slides sebelum starting recording.

---

## ⌨️ Keyboard Shortcuts

Master all keyboard shortcuts untuk faster workflow:

| Key | Action | When Active |
|-----|--------|-------------|
| **Space** | Start recording | Idle state only (not during recording) |
| **P** | Pause / Resume recording | During recording |
| **S** | Stop recording | Anytime |
| **M** | Toggle microphone on/off | Always available |
| **C** | Toggle camera on/off | Always available |

**Pro Tips:**
- Press Space while idle untuk instant start (great for impromptu recordings)
- P key toggles pause/resume state (icon changes appearance)
- M and C work even when not recording (toggle before recording)
- All shortcuts can be disabled by typing in input fields (guard prevents accidental triggers)

**View Full Shortcut List:**
Click "?" help button → Modal shows complete keyboard reference.

---

## ☁️ Google Drive Integration

### How It Works
1. Click **"Simpan ke Google Drive"** button after recording
2. OAuth consent popup appears (first-time)
3. Grant permission app "LayarPro" access to Drive
4. Token stored in-memory selama sesi (tidak persistent localStorage)
5. Upload starts dengan progress visualization
6. Complete → success toast + history updated

### Privacy & Security
✅ **Token Management:** Access token hanya hidup dalam memory session, tidak disimpan ke localStorage/sessionStorage  
✅ **Minimal Scope:** Menggunakan scope `drive.file` saja (hanya bisa akses file yang dibuat app ini), bukan `drive` (full access)  
✅ **HTTPS Only:** OAuth flows over encrypted TLS connections  
✅ **Revocable:** User dapat revoke akses anytime via Google Account security settings

### Troubleshooting Drive Upload

**Problem:** "Gagal koneksi ke Google API"
- Solution: Verify Google Client ID configured correctly in js/config.js
- Check "Authorized JavaScript origins" di Google Cloud Console matches your domain

**Problem:** "Login required but popup blocked"
- Solution: Allow popups untuk your domain in browser settings

**Problem:** Upload stuck at 50%
- Solution: Check internet connection stability
- Try smaller file size or retry upload

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. "Unable to get display media" / Permission Denied
**Cause:** Browser blocking screen capture permission
**Solution:**
- Refresh page
- Click browser address lock icon → Ensure permissions allowed
- Try using Chrome instead (best WebRTC support)
- Verify no other app is capturing screen simultaneously

#### 2. No Sound in Recorded Video
**Possible causes:**
a) Microphone disabled: Toggle microphone button ON before recording  
b) Sharing audio not selected: In chrome dialog, check "Share audio from this tab"  
c) System volume muted: Check Windows/macOS volume mixer  

**Fix:** Record again dengan audio sharing option enabled

#### 3. File Too Large
**Causes:**
- High resolution (1080p+)
- 60FPS setting
- Long duration (>10 minutes)

**Solutions:**
- Lower resolution to 720p or lower
- Change FPS dari 60 → 30
- Use shorter clips split into segments
- Compress later with external tools

#### 4. Browser Crashes During Long Recording
**Cause:** Memory exhaustion from uncompressed frame data
**Prevention:**
- Recording auto-stops at 60 minutes (safety limit)
- Warning indicators muncul setiap 15, 30, 45, 60 menit
- Close browser tabs tidak digunakan saat recording

**Recovery:**
- Auto-save berfungsi jika tab accidentally closed
- Partial recording downloaded automatically

#### 5. Camera Not Showing Up
**Check:**
- Camera permission granted (browser prompt acceptance)
- Camera icon showing "video-slash" means OFF → Click to enable
- Other apps not using camera simultaneously (Zoom, Teams, etc.)

#### 6. Service Worker Error / Offline Mode Issues
**Diagnosis:** Cache corrupted atau stale version
**Fix:**
1. Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
2. Clear browser cache manually
3. Disable/enable Service Worker via DevTools Application tab
4. Re-register: Navigate away then back to site

---

## ❓ FAQ (Frequently Asked Questions)

### Q: Apakah LayarPro gratis?
A: Ya, sepenuhnya gratis dan open-source. Tidak ada subscription fees atau hidden costs.

### Q: Data saya aman? Bagaimana dengan privacy?
A: Sangat aman. Semua processing happens lokal di browser Anda (client-side). Tidak ada video upload ke server kami kecuali Anda pilih Google Drive integration secara explicit. No third-party analytics, no telemetry.

### Q: Bisa rekam tanpa microphone?
A: Ya, cukup toggle off microphone button before recording. Akan capture screen only tanpa audio track.

### Q: File apa formatnya?
A: WebM (default) atau MP4 jika didukung browser. Keduanya universal support di modern browsers dan VLC player.

### Q: Apakah offline bisa?
A: Yes! Setelah load pertama kali, semua assets pre-cache oleh Service Worker. Bisa buka tanpa internet, tapi features yang butuh network (Google Drive upload, first-time OAuth) memerlukan konektivitas.

### Q: Berapa ukuran file maksimal?
A: Praktical limit ~60 menit recording karena auto-stop protection. Secara teknis unlimited tapi recommended cap di 30 menit per clip untuk prevent memory overflow.

### Q: Support mobile/tablet?
A: Desktop-first optimized. Mobile support ada basic framework tapi touch gestures belum fully implemented. Roadmap v2.3 planned untuk improved mobile UX.

### Q: Bisakah edit/recut setelah recording?
A: Saat ini tidak ada built-in editor. Gunakan external tools seperti:
- Handbrake (free, cross-platform)
- Shutter Encoder (macOS/Windows)
- FFmpeg command-line power users
- Online tools: clideo.com, online-video-cutter.com

### Q: Kenapa format MP4 kadang tidak tersedia?
A: MP4 encoding requires hardware H.264 encoder di browser. Chrome/Edge Canary biasanya punya support. Firefox masih experimental. WebM selalu tersedia sebagai fallback universal format.

### Q: Apa itu "System Audio Capture"?
A: Fitur baru yang capture speaker output daripada microphone. Useful untuk:
- Webinar recordings (capture presenter audio langsung)
- Product demonstrations (play video sambil explain)
- Gaming recordings (capture game audio + gameplay)

Cara aktifkan: Dalam Chrome permission dialog, select "Audio sharing" tab lalu choose window.

### Q: Can I share my recorded videos directly?
A: Currently export options are local download or Google Drive upload. Untuk sharing link, gunakan:
- Generate public Drive link after upload
- Upload ke hosting service (YouTube, Vimeo) manual
- Send file directly via email/collab tools

Roadmap item untuk direct share links coming soon.

### Q: How do I report bugs or suggest features?
A: Via GitHub issues repository. Provide:
- Browser type & version
- Steps to reproduce (untuk bugs)
- Expected behavior description
- Screenshot/video example if possible

---

## 🔒 Privacy & Security

### What We Collect
**NOTHING.** Absolutely zero personal data collection.
- No usage statistics
- No crash reports sent anywhere
- No tracking cookies or pixels
- No third-party analytics

### What Happens to Your Videos
1. **Processing:** Local client-side only, never uploaded to our servers
2. **Storage:** Only pada device storage Anda (Downloads folder atau Google Drive pilihan Anda)
3. **Sessions:** Recording data cleared ketika browser tab closed (except optionally saved history)
4. **OAuth Tokens:** Stored in-memory only selama session alive, wiped on page reload

### Third-Party Dependencies
Library dependencies yang digunakan:
- Tailwind CSS (via CDN/prefetch) – design system styles
- Font Awesome (via CDN) – icon library
- Vitest (dev-only) – testing framework

Tidak ada ad networks, trackers, atau telemetry packages.

### Recommended Security Practices
1. **Update browser** regularly untuk latest security patches
2. **Verify HTTPS** connection (lock icon di address bar)
3. **Review OAuth permissions** monthly via Google Account dashboard
4. **Use strong password** untuk Google account bila pakai Drive integration
5. **Avoid public computers** sensitive recordings (use personal devices)

### GDPR / CCPA Compliance
App fully compliant dengan privacy regulations:
- Data minimization principle (collect minimal)
- User control (can delete everything anytime)
- No data sharing with third parties
- Right to erasure (auto-delete on tab close)

---

## 📞 Support & Contact

### Getting Help
1. **Documentation:** Check docs folder in repository
2. **Issues:** https://github.com/Musa-project-1/RekamLayar-Doodle/issues
3. **Community:** Join discussion thread di repository Discussions tab

### Contributing
Interested in improving? Contributions welcome! See CONTRIBUTING.md (can be added future).

### License
MIT License – open source, feel free to fork, modify, distribute.

---

*Last Updated: December 2024 | Version 2.1.0*
