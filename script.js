// ==========================================
// 1. STATE & GLOBAL VARIABLES
// ==========================================
const State = {
    displayStream: null,
    voiceStream: null,
    cameraStream: null,
    combinedStream: null,
    mediaRecorder: null,
    recordedChunks: [],
    finalBlobURL: null,
    finalBlobSize: '0 MB',
    useMic: false,
    useCamera: false,
    isPaused: false,
    startTime: 0,
    elapsedTime: 0,
    timerInterval: null,
    autoStopTimeout: null,
    confirmActionCallback: null,
    gdriveAccessToken: null,
    tokenClient: null,
    settings: {
        resolution: 'default',
        fps: '30',
        countdown: '3',
        format: 'webm'
    }
};

const DragState = {
    notes: { isDragging: false, currentX: 0, currentY: 0, initialX: 0, initialY: 0, xOffset: 0, yOffset: 0 },
    cam: { isDragging: false, currentX: 0, currentY: 0, initialX: 0, initialY: 0, xOffset: 0, yOffset: 0 },
    currentCamScale: 1
};

const AudioState = { context: null, analyser: null, source: null, dataArray: null, animFrame: null };

// ==========================================
// 2. DOM ELEMENTS CACHE
// ==========================================
const DOM = {
    videoPreview: document.getElementById('video-preview'),
    noVideoOverlay: document.getElementById('no-video-overlay'),
    facecamPreview: document.getElementById('facecam-preview'),
    playbackVideo: document.getElementById('playback-video'),
    btnStart: document.getElementById('btn-start'),
    btnPause: document.getElementById('btn-pause'),
    btnStop: document.getElementById('btn-stop'),
    btnToggleMic: document.getElementById('toggle-mic'),
    btnToggleCamera: document.getElementById('toggle-camera'),
    micIcon: document.getElementById('mic-icon'),
    cameraIcon: document.getElementById('camera-icon'),
    micVolumeContainer: document.getElementById('mic-volume-container'),
    micVolumeBar: document.getElementById('mic-volume-bar'),
    statusBadge: document.getElementById('status-badge'),
    statusIndicator: document.getElementById('status-indicator'),
    timerContainer: document.getElementById('recording-timer-container'),
    timerDisplay: document.getElementById('timer-display'),
    preRecordSettings: document.getElementById('pre-record-settings'),
    inputMeetingTitle: document.getElementById('meeting-title'),
    inputAutoStop: document.getElementById('auto-stop-mins'),
    countdownOverlay: document.getElementById('countdown-overlay'),
    countdownText: document.getElementById('countdown-text'),
    btnScreenshot: document.getElementById('btn-screenshot'),
    btnNotes: document.getElementById('btn-notes'),
    btnPip: document.getElementById('btn-pip'),
    floatingNotepad: document.getElementById('floating-notepad'),
    notepadHeader: document.getElementById('notepad-header'),
    btnCloseNotes: document.getElementById('btn-close-notes'),
    btnDownloadNotes: document.getElementById('btn-download-notes'),
    notepadText: document.getElementById('notepad-text'),
    postRecActions: document.getElementById('post-recording-actions'),
    btnClosePostRec: document.getElementById('btn-close-post-rec'),
    btnDownloadLocal: document.getElementById('btn-download-local'),
    btnSaveDrive: document.getElementById('btn-save-drive'),
    driveModal: document.getElementById('drive-modal'),
    driveProgressBar: document.getElementById('drive-progress-bar'),
    drivePercentage: document.getElementById('drive-percentage'),
    driveTitle: document.getElementById('drive-title'),
    driveDesc: document.getElementById('drive-desc'),
    driveSuccessActions: document.getElementById('drive-success-actions'),
    btnCloseDriveModal: document.getElementById('btn-close-drive-modal'),
    historyModal: document.getElementById('history-modal'),
    historyList: document.getElementById('history-list'),
    historySearch: document.getElementById('history-search'),
    historyFilter: document.getElementById('history-filter'),
    settingsModal: document.getElementById('settings-modal'),
    shortcutsModal: document.getElementById('shortcuts-modal'),
    btnShortcuts: document.getElementById('btn-shortcuts'),
    btnCloseShortcuts: document.getElementById('btn-close-shortcuts'),
    confirmModal: document.getElementById('confirm-modal'),
    confirmText: document.getElementById('confirm-text'),
    btnNotif: document.getElementById('btn-notif'),
    notifPanel: document.getElementById('notif-panel'),
    notifList: document.getElementById('notif-list'),
    notifDot: document.getElementById('notif-dot'),
    toastMsg: document.getElementById('toast-msg'),
    toastText: document.getElementById('toast-text'),
    // Pengaturan Inputs
    setResolution: document.getElementById('setting-resolution'),
    setFpsRadios: document.getElementsByName('fps'),
    setFormat: document.getElementById('setting-format'),
    setCountdown: document.getElementById('setting-countdown')
};

// ==========================================
// 3. UTILITY & APP SETTINGS LOGIC
// ==========================================
const AppSettings = {
    load: () => {
        const saved = JSON.parse(localStorage.getItem('layarpro_settings') || '{}');
        State.settings = { ...State.settings, ...saved };
        
        // Mencegah error null jika elemen HTML tidak ditemukan
        if (DOM.setResolution) DOM.setResolution.value = State.settings.resolution || 'default';
        if (DOM.setCountdown) DOM.setCountdown.value = State.settings.countdown || '3';
        if (DOM.setFormat) DOM.setFormat.value = State.settings.format || 'webm';
        if (DOM.setFpsRadios && DOM.setFpsRadios.length > 0) {
            DOM.setFpsRadios.forEach(radio => {
                if(radio.value === (State.settings.fps || '30')) radio.checked = true;
            });
        }
    },
    save: () => {
        let selectedFps = '30';
        if (DOM.setFpsRadios && DOM.setFpsRadios.length > 0) {
            DOM.setFpsRadios.forEach(r => { if(r.checked) selectedFps = r.value; });
        }

        State.settings = {
            resolution: DOM.setResolution ? DOM.setResolution.value : 'default',
            fps: selectedFps,
            countdown: DOM.setCountdown ? DOM.setCountdown.value : '3',
            format: DOM.setFormat ? DOM.setFormat.value : 'webm'
        };
        localStorage.setItem('layarpro_settings', JSON.stringify(State.settings));
    }
};

const UI = {
    showToast: (message) => {
        DOM.toastText.textContent = message;
        DOM.toastMsg.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => DOM.toastMsg.classList.add('translate-y-20', 'opacity-0'), 3000);
    },
    
    addNotification: (message, isSuccess = true) => {
        const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const icon = isSuccess ? '<i class="fa-solid fa-circle-check text-green-400 mr-2"></i>' : '<i class="fa-solid fa-circle-info text-indigo-400 mr-2"></i>';
        const notifItem = `
            <div class="p-3 bg-white/5 border border-transparent hover:border-white/5 rounded-xl mb-1 transition-all cursor-default">
                <p class="text-sm text-slate-200 font-medium leading-tight">${icon} ${message}</p>
                <p class="text-xs text-slate-500 mt-1.5 pl-6">${time}</p>
            </div>`;
        DOM.notifList.insertAdjacentHTML('afterbegin', notifItem);
        DOM.notifDot.classList.remove('hidden');
        UI.showToast(message);
    },

    showConfirm: (text, onConfirm) => {
        DOM.confirmText.textContent = text;
        State.confirmActionCallback = onConfirm;
        DOM.confirmModal.classList.remove('hidden');
    },

    closeAllPopups: () => {
        const modals = [DOM.historyModal, DOM.settingsModal, DOM.shortcutsModal, DOM.notifPanel, DOM.postRecActions];
        modals.forEach(m => { if(m) m.classList.add('hidden'); });
        if(DOM.notifPanel) DOM.notifPanel.style.display = '';
        
        ['menu-new', 'menu-history', 'menu-settings'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (id === 'menu-new') el.className = "nav-tab h-full flex items-center border-b-2 border-indigo-500 text-white text-sm font-semibold transition-all";
            else el.className = "nav-tab h-full flex items-center border-b-2 border-transparent text-slate-400 hover:text-slate-200 text-sm font-medium transition-all";
        });
    },

    updateNav: (activeId) => {
        ['menu-new', 'menu-history', 'menu-settings'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (id === activeId) el.className = "nav-tab h-full flex items-center border-b-2 border-indigo-500 text-white text-sm font-semibold transition-all";
            else el.className = "nav-tab h-full flex items-center border-b-2 border-transparent text-slate-400 hover:text-slate-200 text-sm font-medium transition-all";
        });
    },

    triggerDownload: (url, filename) => {
        const a = document.createElement('a');
        a.style.display = 'none'; a.href = url; a.download = filename;
        document.body.appendChild(a); a.click();
        setTimeout(() => document.body.removeChild(a), 100);
    },

    getSafeFileName: () => {
        let title = DOM.inputMeetingTitle.value.trim() || "Rekaman_Rapat";
        title = title.replace(/[^a-zA-Z0-9_\- ]/g, '_').replace(/ /g, '-');
        const dateStr = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
        return `${title}_${dateStr}`;
    },

    playBeep: (type = 'start') => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            if(type === 'start') { oscillator.frequency.setValueAtTime(440, ctx.currentTime); oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); }
            else if(type === 'stop') { oscillator.frequency.setValueAtTime(880, ctx.currentTime); oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); }
            else if(type === 'snap') { oscillator.frequency.setValueAtTime(1200, ctx.currentTime); oscillator.type = 'square'; }
            
            gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            oscillator.connect(gainNode); gainNode.connect(ctx.destination);
            oscillator.start(); oscillator.stop(ctx.currentTime + 0.15);
        } catch (e) { }
    }
};

// ==========================================
// 4. TIMER & HISTORY MANAGEMENT
// ==========================================
const Timer = {
    update: () => {
        if(!State.isPaused) {
            const totalSecs = Math.floor((State.elapsedTime + (Date.now() - State.startTime)) / 1000);
            const h = String(Math.floor(totalSecs / 3600)).padStart(2, '0'), m = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0'), s = String(totalSecs % 60).padStart(2, '0');
            DOM.timerDisplay.textContent = `${h}:${m}:${s}`;
        }
    },
    start: () => { State.startTime = Date.now(); State.timerInterval = setInterval(Timer.update, 1000); DOM.timerContainer.classList.remove('hidden'); },
    pause: () => { State.elapsedTime += Date.now() - State.startTime; clearInterval(State.timerInterval); },
    resume: () => { State.startTime = Date.now(); State.timerInterval = setInterval(Timer.update, 1000); },
    stop: () => { clearInterval(State.timerInterval); State.elapsedTime = 0; DOM.timerContainer.classList.add('hidden'); DOM.timerDisplay.textContent = "00:00:00"; }
};

const History = {
    save: (filename, type, size) => {
        let history = JSON.parse(localStorage.getItem('meetrec_history') || '[]');
        history.unshift({ 
            id: Date.now().toString(),
            name: filename, 
            date: new Date().toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), 
            type: type,
            size: size || 'N/A'
        });
        localStorage.setItem('meetrec_history', JSON.stringify(history));
        History.render();
    },
    delete: (id) => {
        let history = JSON.parse(localStorage.getItem('meetrec_history') || '[]');
        history = history.filter(item => item.id !== id);
        localStorage.setItem('meetrec_history', JSON.stringify(history));
        History.render();
    },
    render: () => {
        if(!DOM.historyList) return;
        let history = JSON.parse(localStorage.getItem('meetrec_history') || '[]');
        
        const searchQuery = DOM.historySearch ? DOM.historySearch.value.toLowerCase() : '';
        const filterQuery = DOM.historyFilter ? DOM.historyFilter.value : 'all';
        
        let filtered = history.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery);
            const matchesFilter = filterQuery === 'all' || item.type === filterQuery;
            return matchesSearch && matchesFilter;
        });

        if (filtered.length === 0) {
            DOM.historyList.innerHTML = `<div class="flex flex-col items-center justify-center py-16 opacity-50"><i class="fa-solid fa-folder-open text-5xl text-slate-700 mb-5"></i><p class="text-slate-400 text-sm font-medium">Data riwayat kosong atau tidak ditemukan.</p></div>`;
            return;
        }
        
        DOM.historyList.innerHTML = filtered.map(item => `
            <div class="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all gap-4">
                <div class="flex items-center gap-4 overflow-hidden w-full sm:w-auto">
                    <div class="w-12 h-12 rounded-xl ${item.type === 'Google Drive' ? 'bg-gradient-to-br from-[#1FA463]/20 to-[#1FA463]/10 text-[#1FA463]' : 'bg-gradient-to-br from-slate-700/80 to-slate-800 text-slate-300'} flex items-center justify-center text-xl shrink-0 shadow-inner border border-white/5">
                        <i class="${item.type === 'Google Drive' ? 'fa-brands fa-google-drive' : 'fa-solid fa-file-video'}"></i>
                    </div>
                    <div class="overflow-hidden">
                        <p class="font-semibold text-slate-200 text-sm truncate w-48 sm:w-72 md:w-80 lg:w-96" title="${item.name}">${item.name}</p>
                        <div class="flex items-center gap-3 mt-1.5 flex-wrap">
                            <p class="text-[11px] text-slate-400 font-medium"><i class="fa-regular fa-calendar-days mr-1 opacity-70"></i> ${item.date}</p>
                            <div class="w-1 h-1 rounded-full bg-slate-600"></div>
                            <p class="text-[11px] text-slate-400 font-medium"><i class="fa-solid fa-hard-drive mr-1 opacity-70"></i> ${item.size}</p>
                        </div>
                    </div>
                </div>
                <div class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
                    <span class="px-2.5 py-1 bg-black/40 rounded-lg text-[10px] font-bold uppercase tracking-wider ${item.type === 'Google Drive' ? 'text-[#1FA463]' : 'text-slate-400'} border border-white/5 shadow-sm">${item.type}</span>
                    
                    <div class="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center shadow-sm" onclick="event.stopPropagation(); window.deleteHistoryItem('${item.id}')" title="Hapus dari Riwayat">
                            <i class="fa-solid fa-trash-can text-[13px]"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
};

// ==========================================
// 5. MEDIA & RECORDING LOGIC
// ==========================================
const Media = {
    drawVisualizer: () => {
        if(!AudioState.analyser || !State.useMic) return;
        AudioState.animFrame = requestAnimationFrame(Media.drawVisualizer);
        AudioState.analyser.getByteFrequencyData(AudioState.dataArray);
        let sum = 0; for(let i = 0; i < AudioState.dataArray.length; i++) sum += AudioState.dataArray[i];
        let volumePercent = ((sum / AudioState.dataArray.length) / 128) * 100;
        DOM.micVolumeBar.style.width = `${Math.min(volumePercent, 100)}%`;
        DOM.micVolumeBar.className = 'h-full transition-all duration-75 ' + (volumePercent > 80 ? 'bg-red-500' : (volumePercent > 30 ? 'bg-green-400' : 'bg-indigo-400'));
    },

    setupStreams: async () => {
        try {
            const targetFps = parseInt(State.settings.fps);
            const videoConstraints = {
                cursor: "always",
                frameRate: { ideal: targetFps, max: targetFps }
            };

            if (State.settings.resolution === '1080') videoConstraints.height = { ideal: 1080 };
            else if (State.settings.resolution === '720') videoConstraints.height = { ideal: 720 };

            State.displayStream = await navigator.mediaDevices.getDisplayMedia({ video: videoConstraints, audio: true });
            
            if (State.useMic) {
                try {
                    State.voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                    if(AudioState.context) AudioState.context.close();
                    AudioState.context = new (window.AudioContext || window.webkitAudioContext)();
                    AudioState.analyser = AudioState.context.createAnalyser(); AudioState.analyser.fftSize = 256;
                    AudioState.dataArray = new Uint8Array(AudioState.analyser.frequencyBinCount);
                    AudioState.source = AudioState.context.createMediaStreamSource(State.voiceStream);
                    AudioState.source.connect(AudioState.analyser);
                    Media.drawVisualizer();
                } catch (err) { DOM.btnToggleMic.click(); }
            }

            let audioTracks = [];
            const hasScreenAudio = State.displayStream.getAudioTracks().length > 0;
            const hasMicAudio = State.voiceStream && State.voiceStream.getAudioTracks().length > 0;

            if (hasScreenAudio || hasMicAudio) {
                if(!AudioState.context || AudioState.context.state === 'closed') AudioState.context = new (window.AudioContext || window.webkitAudioContext)();
                const dest = AudioState.context.createMediaStreamDestination();
                if (hasScreenAudio) AudioState.context.createMediaStreamSource(State.displayStream).connect(dest);
                if (hasMicAudio) AudioState.context.createMediaStreamSource(State.voiceStream).connect(dest);
                audioTracks = dest.stream.getAudioTracks();
            }

            State.combinedStream = new MediaStream([...State.displayStream.getVideoTracks(), ...audioTracks]);
            DOM.videoPreview.srcObject = State.combinedStream;
            DOM.noVideoOverlay.classList.add('hidden');
            State.displayStream.getVideoTracks()[0].onended = () => { if(State.mediaRecorder && State.mediaRecorder.state !== 'inactive') Media.stopRecording(); };
            return true;
        } catch (err) {
            UI.showToast("Akses layar ditolak atau dibatalkan.");
            DOM.btnStart.classList.remove('hidden'); return false;
        }
    },

    startRecording: () => {
        UI.playBeep('start');
        
        const options = {};
        if (State.settings.fps === '60') options.videoBitsPerSecond = 8000000;
        
        const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
        let selectedMimeType = mimeTypes.find(mime => MediaRecorder.isTypeSupported(mime)) || '';
        if(selectedMimeType) options.mimeType = selectedMimeType;

        State.mediaRecorder = new MediaRecorder(State.combinedStream, options);
        State.mediaRecorder.ondataavailable = e => { if (e.data.size > 0) State.recordedChunks.push(e.data); };
        State.mediaRecorder.onstop = Media.handleStop;
        State.mediaRecorder.start(1000); Timer.start();

        const limitMins = parseInt(DOM.inputAutoStop.value);
        if (limitMins > 0) {
            State.autoStopTimeout = setTimeout(() => {
                if (State.mediaRecorder && State.mediaRecorder.state !== 'inactive') {
                    Media.stopRecording(); UI.showToast(`Otomatis berhenti: Batas waktu tercapai.`);
                }
            }, limitMins * 60 * 1000);
        }

        DOM.btnPause.classList.remove('hidden');
        DOM.btnStop.classList.remove('hidden');
        
        DOM.statusIndicator.className = "fa-solid fa-circle text-[8px] text-red-500 pulse-record";
        DOM.statusBadge.innerHTML = `<i class="fa-solid fa-circle text-[8px] text-red-500 pulse-record"></i> Perekaman Aktif`;
    },

    stopRecording: () => {
        if (State.mediaRecorder && State.mediaRecorder.state !== 'inactive') {
            State.mediaRecorder.stop(); Timer.stop(); UI.playBeep('stop');
            DOM.btnStart.classList.remove('hidden'); 
            DOM.btnPause.classList.add('hidden');
            DOM.btnStop.classList.add('hidden');
            State.isPaused = false;
            DOM.btnPause.innerHTML = `<i class="fa-solid fa-pause text-sm"></i>`;
            DOM.btnPause.className = "ml-1 w-10 h-10 bg-slate-700 hover:bg-slate-600 border border-white/10 text-white rounded-full font-bold shadow-lg flex items-center justify-center transition-all hidden";
            DOM.statusBadge.innerHTML = `<i class="fa-solid fa-circle text-[8px] text-slate-500"></i> Siap`;
        }
    },

    handleStop: () => {
        const blob = new Blob(State.recordedChunks, { type: State.mediaRecorder.mimeType || 'video/webm' });
        State.finalBlobURL = URL.createObjectURL(blob);
        
        State.finalBlobSize = (blob.size / (1024 * 1024)).toFixed(2) + ' MB';
        
        DOM.playbackVideo.src = State.finalBlobURL;
        DOM.postRecActions.classList.remove('hidden'); DOM.preRecordSettings.classList.remove('hidden');
        if (document.pictureInPictureElement) document.exitPictureInPicture();
        DOM.videoPreview.srcObject = null; DOM.noVideoOverlay.classList.remove('hidden');
        
        State.combinedStream.getTracks().forEach(t => t.stop());
        if (State.displayStream) State.displayStream.getTracks().forEach(t => t.stop());
        if (State.voiceStream) State.voiceStream.getTracks().forEach(t => t.stop());
        
        if (AudioState.animFrame) cancelAnimationFrame(AudioState.animFrame);
        DOM.micVolumeBar.style.width = '0%'; if (State.autoStopTimeout) clearTimeout(State.autoStopTimeout);
    }
};

// ==========================================
// 6. EVENT LISTENERS SETUP
// ==========================================
function setupEventListeners() {
    // -- Navigation --
    document.getElementById('menu-new').addEventListener('click', e => {
        e.preventDefault(); UI.closeAllPopups(); UI.updateNav('menu-new');
        if (State.mediaRecorder && State.mediaRecorder.state !== 'inactive') return UI.showToast("Hentikan rekaman aktif terlebih dahulu.");
        DOM.preRecordSettings.classList.remove('hidden');
    });
    document.getElementById('menu-history').addEventListener('click', e => { e.preventDefault(); UI.closeAllPopups(); UI.updateNav('menu-history'); History.render(); DOM.historyModal.classList.remove('hidden'); });
    document.getElementById('menu-settings').addEventListener('click', e => { e.preventDefault(); UI.closeAllPopups(); UI.updateNav('menu-settings'); DOM.settingsModal.classList.remove('hidden'); });

    // -- Controls (Mic & Cam) --
    DOM.btnToggleMic.addEventListener('click', () => {
        State.useMic = !State.useMic;
        if (State.useMic) {
            DOM.btnToggleMic.className = "w-10 h-10 rounded-full bg-indigo-500 text-white hover:bg-indigo-400 transition-all duration-300 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.4)]";
            DOM.micIcon.className = "fa-solid fa-microphone text-sm"; DOM.micVolumeContainer.classList.remove('hidden');
        } else {
            DOM.btnToggleMic.className = "w-10 h-10 rounded-full bg-white/5 text-slate-300 hover:bg-white/10 transition-all duration-300 flex items-center justify-center";
            DOM.micIcon.className = "fa-solid fa-microphone-slash text-sm"; DOM.micVolumeContainer.classList.add('hidden'); DOM.micVolumeBar.style.width = '0%';
        }
        if (State.voiceStream) State.voiceStream.getAudioTracks().forEach(t => t.enabled = State.useMic);
    });

    DOM.btnToggleCamera.addEventListener('click', async () => {
        State.useCamera = !State.useCamera;
        if (State.useCamera) {
            try {
                State.cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
                DOM.facecamPreview.srcObject = State.cameraStream; DOM.facecamPreview.classList.remove('hidden');
                DOM.btnToggleCamera.className = "w-10 h-10 rounded-full bg-indigo-500 text-white hover:bg-indigo-400 transition-all flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.4)]";
                DOM.cameraIcon.className = "fa-solid fa-video text-sm";
            } catch (err) { State.useCamera = false; UI.showToast("Gagal mengakses kamera."); }
        } else {
            if (State.cameraStream) State.cameraStream.getTracks().forEach(t => t.stop());
            DOM.facecamPreview.classList.add('hidden');
            DOM.btnToggleCamera.className = "w-10 h-10 rounded-full bg-white/5 text-slate-300 hover:bg-white/10 transition-all flex items-center justify-center";
            DOM.cameraIcon.className = "fa-solid fa-video-slash text-sm";
        }
    });

    // -- Record Actions --
    DOM.btnStart.addEventListener('click', async () => {
        DOM.postRecActions.classList.add('hidden'); State.recordedChunks = [];
        if (!(await Media.setupStreams())) return;

        DOM.preRecordSettings.classList.add('hidden'); DOM.btnStart.classList.add('hidden');
        
        let count = parseInt(State.settings.countdown);
        if (count > 0) {
            DOM.countdownOverlay.classList.remove('hidden');
            DOM.countdownText.textContent = count; UI.playBeep('start');
            const int = setInterval(() => {
                count--;
                if (count > 0) { DOM.countdownText.textContent = count; UI.playBeep('start'); } 
                else { clearInterval(int); DOM.countdownOverlay.classList.add('hidden'); Media.startRecording(); }
            }, 1000);
        } else {
            Media.startRecording();
        }
    });

    DOM.btnPause.addEventListener('click', () => {
        if (State.mediaRecorder.state === 'recording') {
            State.mediaRecorder.pause(); Timer.pause(); State.isPaused = true; UI.playBeep('stop');
            DOM.btnPause.innerHTML = `<i class="fa-solid fa-play text-sm"></i>`;
            DOM.btnPause.className = "ml-1 w-10 h-10 bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center transition-all shadow-[0_0_10px_rgba(245,158,11,0.4)]";
        } else if (State.mediaRecorder.state === 'paused') {
            State.mediaRecorder.resume(); Timer.resume(); State.isPaused = false; UI.playBeep('start');
            DOM.btnPause.innerHTML = `<i class="fa-solid fa-pause text-sm"></i>`;
            DOM.btnPause.className = "ml-1 w-10 h-10 bg-slate-700 hover:bg-slate-600 border border-white/10 text-white rounded-full font-bold shadow-lg flex items-center justify-center transition-all";
        }
    });
    DOM.btnStop.addEventListener('click', Media.stopRecording);

    // -- Floating Tools (Screenshot, Notes, PiP) --
    DOM.btnScreenshot.addEventListener('click', () => {
        if (!DOM.videoPreview.srcObject) return UI.showToast("Mulai sumber terlebih dahulu.");
        UI.playBeep('snap');
        const canvas = document.createElement('canvas'); canvas.width = DOM.videoPreview.videoWidth; canvas.height = DOM.videoPreview.videoHeight;
        canvas.getContext('2d').drawImage(DOM.videoPreview, 0, 0, canvas.width, canvas.height);
        UI.triggerDownload(canvas.toDataURL('image/png'), `Snap_${UI.getSafeFileName()}.png`);
        UI.addNotification(`Tangkapan layar tersimpan.`);
    });
    DOM.btnPip.addEventListener('click', async () => {
        if (document.pictureInPictureElement) await document.exitPictureInPicture();
        else if (document.pictureInPictureEnabled && DOM.videoPreview.srcObject) await DOM.videoPreview.requestPictureInPicture();
    });
    DOM.btnNotes.addEventListener('click', e => { e.preventDefault(); DOM.floatingNotepad.classList.remove('hidden'); DOM.floatingNotepad.classList.add('flex'); DOM.floatingNotepad.style.display = ''; });
    DOM.btnCloseNotes.addEventListener('click', e => { e.preventDefault(); DOM.floatingNotepad.classList.add('hidden'); DOM.floatingNotepad.classList.remove('flex'); });
    DOM.btnDownloadNotes.addEventListener('click', () => {
        if (!DOM.notepadText.value.trim()) return UI.showToast("Catatan kosong.");
        UI.triggerDownload(URL.createObjectURL(new Blob([DOM.notepadText.value], { type: 'text/plain' })), `${UI.getSafeFileName()}_Catatan.txt`);
        UI.addNotification("Catatan diunduh.");
    });

    // -- Drag Logic --
    DOM.notepadHeader.addEventListener("mousedown", e => { DragState.notes.initialX = e.clientX - DragState.notes.xOffset; DragState.notes.initialY = e.clientY - DragState.notes.yOffset; DragState.notes.isDragging = true; });
    DOM.facecamPreview.addEventListener("mousedown", e => { DragState.cam.initialX = e.clientX - DragState.cam.xOffset; DragState.cam.initialY = e.clientY - DragState.cam.yOffset; DragState.cam.isDragging = true; });
    document.addEventListener("mouseup", () => { DragState.notes.isDragging = false; DragState.cam.isDragging = false; });
    document.addEventListener("mousemove", e => {
        if (DragState.notes.isDragging) { e.preventDefault(); DragState.notes.currentX = e.clientX - DragState.notes.initialX; DragState.notes.currentY = e.clientY - DragState.notes.initialY; DragState.notes.xOffset = DragState.notes.currentX; DragState.notes.yOffset = DragState.notes.currentY; DOM.floatingNotepad.style.transform = `translate3d(${DragState.notes.currentX}px, ${DragState.notes.currentY}px, 0)`; }
        if (DragState.cam.isDragging) { e.preventDefault(); DragState.cam.currentX = e.clientX - DragState.cam.initialX; DragState.cam.currentY = e.clientY - DragState.cam.initialY; DragState.cam.xOffset = DragState.cam.currentX; DragState.cam.yOffset = DragState.cam.currentY; DOM.facecamPreview.style.transform = `translate3d(${DragState.cam.currentX}px, ${DragState.cam.currentY}px, 0)`; }
    });

    DOM.facecamPreview.addEventListener('dblclick', () => { const isRound = DOM.facecamPreview.classList.contains('rounded-full'); DOM.facecamPreview.classList.replace(isRound ? 'rounded-full' : 'rounded-2xl', isRound ? 'rounded-2xl' : 'rounded-full'); });
    DOM.facecamPreview.addEventListener('wheel', e => { e.preventDefault(); DragState.currentCamScale = e.deltaY < 0 ? Math.min(DragState.currentCamScale + 0.1, 3.0) : Math.max(DragState.currentCamScale - 0.1, 0.5); DOM.facecamPreview.style.width = `${160 * DragState.currentCamScale}px`; DOM.facecamPreview.style.height = `${160 * DragState.currentCamScale}px`; });

    // -- Settings & Preferences Event Listeners --
    const saveSettingsHandler = () => { AppSettings.save(); UI.showToast("Pengaturan disimpan"); };
    if (DOM.setResolution) DOM.setResolution.addEventListener('change', saveSettingsHandler);
    if (DOM.setFormat) DOM.setFormat.addEventListener('change', saveSettingsHandler);
    if (DOM.setCountdown) DOM.setCountdown.addEventListener('change', saveSettingsHandler);
    if (DOM.setFpsRadios) DOM.setFpsRadios.forEach(radio => radio.addEventListener('change', saveSettingsHandler));

    // -- Modals Actions --
    DOM.btnDownloadLocal.addEventListener('click', () => {
        if (State.finalBlobURL) {
            const fname = UI.getSafeFileName() + '.webm';
            UI.triggerDownload(State.finalBlobURL, fname);
            History.save(fname, 'Lokal', State.finalBlobSize);
            UI.addNotification(`Video tersimpan.`);
            DOM.postRecActions.classList.add('hidden'); DOM.playbackVideo.pause();
        }
    });
    document.getElementById('btn-close-history').addEventListener('click', UI.closeAllPopups);
    document.getElementById('btn-close-settings').addEventListener('click', UI.closeAllPopups);
    
    if (DOM.btnShortcuts && DOM.shortcutsModal) {
        DOM.btnShortcuts.addEventListener('click', e => { e.preventDefault(); UI.closeAllPopups(); DOM.shortcutsModal.classList.remove('hidden'); });
        DOM.btnCloseShortcuts.addEventListener('click', UI.closeAllPopups);
    }
    
    DOM.btnClosePostRec.addEventListener('click', () => { DOM.postRecActions.classList.add('hidden'); DOM.playbackVideo.pause(); });
    
    document.getElementById('btn-clear-history').addEventListener('click', () => {
        UI.showConfirm("Hapus riwayat rekaman lokal secara permanen?", () => {
            localStorage.removeItem('meetrec_history'); History.render(); DOM.settingsModal.classList.add('hidden'); UI.addNotification("Riwayat dibersihkan.");
        });
    });
    document.getElementById('btn-confirm-cancel').addEventListener('click', () => DOM.confirmModal.classList.add('hidden'));
    document.getElementById('btn-confirm-ok').addEventListener('click', () => { DOM.confirmModal.classList.add('hidden'); if (State.confirmActionCallback) State.confirmActionCallback(); });
    DOM.btnNotif.addEventListener('click', e => { e.stopPropagation(); const isHidden = DOM.notifPanel.classList.contains('hidden'); UI.closeAllPopups(); if (isHidden) DOM.notifPanel.classList.remove('hidden'); });
    document.getElementById('btn-clear-notif').addEventListener('click', () => { DOM.notifDot.classList.add('hidden'); DOM.notifPanel.classList.add('hidden'); DOM.notifPanel.style.display = ''; });
    document.addEventListener('click', e => { if (!DOM.btnNotif.contains(e.target) && !DOM.notifPanel.contains(e.target)) { DOM.notifPanel.classList.add('hidden'); DOM.notifPanel.style.display = ''; } });
    
    // -- Tutup Modal dengan Klik Area Latar Belakang (Backdrop) --
    const interactiveModals = [DOM.historyModal, DOM.settingsModal];
    if(DOM.shortcutsModal) interactiveModals.push(DOM.shortcutsModal);
    
    interactiveModals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                UI.closeAllPopups();
                UI.updateNav('menu-new');
            }
        });
    });

    DOM.postRecActions.addEventListener('click', (e) => {
        if (e.target === DOM.postRecActions) {
            DOM.postRecActions.classList.add('hidden');
            DOM.playbackVideo.pause();
        }
    });

    DOM.driveModal.addEventListener('click', (e) => {
        if (e.target === DOM.driveModal) DOM.driveModal.classList.add('hidden');
    });

    DOM.confirmModal.addEventListener('click', (e) => {
        if (e.target === DOM.confirmModal) DOM.confirmModal.classList.add('hidden');
    });

    // Keybinds (Smart Shortcuts)
    document.addEventListener('keydown', e => { 
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        if (e.code === 'Space') { 
            e.preventDefault(); 
            if (State.mediaRecorder && State.mediaRecorder.state !== 'inactive') {
                DOM.btnPause.click(); 
            } else if (State.combinedStream) {
                DOM.btnStart.click();
            }
        }
        if (e.code === 'KeyS' && State.mediaRecorder && State.mediaRecorder.state !== 'inactive') {
            e.preventDefault();
            DOM.btnStop.click();
        }
        if (e.code === 'KeyM') {
            e.preventDefault();
            DOM.btnToggleMic.click();
        }
        if (e.code === 'KeyC') {
            e.preventDefault();
            DOM.btnToggleCamera.click();
        }
    });
}

// ==========================================
// 7. GOOGLE DRIVE INTEGRATION
// ==========================================
const GDrive = {
    CLIENT_ID: '901999994100-0ubp5ptr62rsvf59rv6nc5rvg744v09e.apps.googleusercontent.com',
    init: () => {
        if(window.google && window.google.accounts) {
            State.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: GDrive.CLIENT_ID, scope: '[https://www.googleapis.com/auth/drive.file](https://www.googleapis.com/auth/drive.file)',
                callback: (tokenResponse) => { if (tokenResponse && tokenResponse.access_token) { State.gdriveAccessToken = tokenResponse.access_token; GDrive.upload(); } },
            });
        }
    },
    upload: async () => {
        DOM.driveModal.classList.remove('hidden');
        DOM.driveProgressBar.style.width = '10%'; DOM.drivePercentage.textContent = '10%';
        DOM.driveSuccessActions.classList.add('hidden'); 
        DOM.driveTitle.textContent = "Menyiapkan Folder...";
        DOM.driveDesc.textContent = 'Menyimpan rekaman ke dalam folder "LayarPro" di Google Drive.';
        
        try {
            const folderName = "LayarPro";
            const query = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`);
            let folderId = null;

            const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id)`, {
                headers: { 'Authorization': `Bearer ${State.gdriveAccessToken}` }
            });
            
            if (!searchRes.ok) throw new Error("Gagal memeriksa direktori Google Drive.");
            const searchData = await searchRes.json();

            if (searchData.files && searchData.files.length > 0) {
                folderId = searchData.files[0].id;
            } else {
                DOM.drivePercentage.textContent = '25%';
                const createRes = await fetch('[https://www.googleapis.com/drive/v3/files](https://www.googleapis.com/drive/v3/files)', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${State.gdriveAccessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: folderName,
                        mimeType: 'application/vnd.google-apps.folder'
                    })
                });
                
                if (!createRes.ok) throw new Error("Gagal membuat folder LayarPro.");
                const createData = await createRes.json();
                folderId = createData.id;
            }

            DOM.driveTitle.textContent = "Mengunggah Video...";
            DOM.driveProgressBar.style.width = '40%'; DOM.drivePercentage.textContent = '40%';

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify({ 
                name: UI.getSafeFileName() + '.webm', 
                mimeType: 'video/webm',
                parents: [folderId]
            })], { type: 'application/json' }));
            
            form.append('file', await (await fetch(State.finalBlobURL)).blob());
            
            DOM.driveProgressBar.style.width = '70%'; DOM.drivePercentage.textContent = '70%';

            const res = await fetch('[https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart](https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart)', { 
                method: 'POST', 
                headers: { 'Authorization': `Bearer ${State.gdriveAccessToken}` }, 
                body: form 
            });

            if (res.ok) {
                DOM.driveProgressBar.style.width = '100%'; DOM.drivePercentage.textContent = '100%';
                DOM.driveTitle.textContent = "Berhasil Diunggah!"; DOM.driveSuccessActions.classList.remove('hidden');
                History.save(UI.getSafeFileName() + '.webm', 'Google Drive', State.finalBlobSize);
                UI.addNotification(`Tersimpan di folder Drive "LayarPro".`);
                DOM.postRecActions.classList.add('hidden'); DOM.playbackVideo.pause();
            } else {
                throw new Error((await res.json()).error.message);
            }
        } catch (error) { 
            UI.showToast("Gagal unggah: " + error.message); 
            DOM.driveModal.classList.add('hidden'); 
        }
    }
};

window.addEventListener('load', () => {
    try {
        AppSettings.load(); 
        
        if(DOM.historySearch) DOM.historySearch.addEventListener('input', History.render);
        if(DOM.historyFilter) DOM.historyFilter.addEventListener('change', History.render);

        window.deleteHistoryItem = (id) => {
            UI.showConfirm("Hapus log riwayat ini secara permanen?", () => {
                History.delete(id);
                UI.addNotification("Data riwayat berhasil dihapus.");
            });
        };

        setupEventListeners();
        DOM.btnSaveDrive.addEventListener('click', () => {
            if (!State.finalBlobURL) return;
            if (!State.tokenClient) return UI.showToast("Sistem Google sedang dimuat, tunggu...");
            State.tokenClient.requestAccessToken();
        });
        DOM.btnCloseDriveModal.addEventListener('click', () => DOM.driveModal.classList.add('hidden'));
        setTimeout(GDrive.init, 1000); 
    } catch(e) { console.error("Initialization Error:", e); }
});
