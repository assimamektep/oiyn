// ============================================
// HUB, ANIMATIONS MENU & FULL-SCREEN EMOTIONS
// ============================================

const ANIMATIONS_CONFIG = [
    {
        id: 'madeni-mura',
        title: 'Мәдени мұраны сақтаушы ұрпақпын',
        subtitle: '3 эмоция • Кері байланыс',
        thumbnail: 'images/animation/Gemini_Generated_Gif_4ma0ue4ma0ue4ma0.gif',
        open: () => openEmotionScreen()
    }
];

const emotionState = new Map();
let emotionAudioCtx = null;

const bgMusicState = {
    volume: 0.5,
    lastNonZeroVolume: 0.5,
    muted: false,
    userPaused: false
};

function getBgAudio() {
    return document.getElementById('emotionBgMusic');
}

function updateAudioUI() {
    const audio = getBgAudio();
    const toggleBtn = document.getElementById('bgMusicToggleBtn');
    const muteBtn = document.getElementById('bgMusicMuteBtn');
    const volumeSlider = document.getElementById('bgMusicVolume');

    const isPlaying = Boolean(audio && !audio.paused && !audio.ended);
    if (toggleBtn) {
        toggleBtn.classList.toggle('is-playing', isPlaying);
        toggleBtn.setAttribute('aria-pressed', String(isPlaying));
    }

    const effectiveVol = bgMusicState.muted ? 0 : bgMusicState.volume;
    if (muteBtn) {
        muteBtn.classList.remove('vol-high', 'vol-low', 'vol-mute');
        if (effectiveVol === 0) {
            muteBtn.classList.add('vol-mute');
        } else if (effectiveVol <= 0.5) {
            muteBtn.classList.add('vol-low');
        } else {
            muteBtn.classList.add('vol-high');
        }
    }

    if (volumeSlider) {
        const sliderVal = Math.round(effectiveVol * 100);
        volumeSlider.value = String(sliderVal);
        volumeSlider.style.setProperty('--vol-percent', `${sliderVal}%`);
    }
}

function startBgMusic(resetTime = false) {
    const audio = getBgAudio();
    if (!audio) return;

    audio.volume = bgMusicState.muted ? 0 : bgMusicState.volume;
    if (resetTime) {
        audio.currentTime = 0;
    }

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(() => updateAudioUI()).catch(() => updateAudioUI());
    } else {
        updateAudioUI();
    }
}

function pauseBgMusic() {
    const audio = getBgAudio();
    if (!audio) return;
    if (!audio.paused) {
        audio.pause();
    }
    updateAudioUI();
}

function toggleBgMusic() {
    const audio = getBgAudio();
    if (!audio) return;

    if (audio.paused) {
        bgMusicState.userPaused = false;
        startBgMusic(false);
    } else {
        bgMusicState.userPaused = true;
        pauseBgMusic();
    }
}

function toggleBgMute() {
    const audio = getBgAudio();
    if (bgMusicState.muted || bgMusicState.volume === 0) {
        bgMusicState.muted = false;
        if (bgMusicState.volume === 0) {
            bgMusicState.volume = bgMusicState.lastNonZeroVolume || 0.5;
        }
    } else {
        bgMusicState.muted = true;
    }

    if (audio) {
        audio.volume = bgMusicState.muted ? 0 : bgMusicState.volume;
    }
    updateAudioUI();
}

function setBgVolume(percent) {
    const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
    const vol = clamped / 100;

    if (vol === 0) {
        bgMusicState.muted = true;
        bgMusicState.volume = 0;
    } else {
        bgMusicState.muted = false;
        bgMusicState.volume = vol;
        bgMusicState.lastNonZeroVolume = vol;
    }

    const audio = getBgAudio();
    if (audio) {
        audio.volume = bgMusicState.muted ? 0 : bgMusicState.volume;
    }
    updateAudioUI();
}

function initBgMusicControls() {
    const volumeSlider = document.getElementById('bgMusicVolume');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            setBgVolume(e.target.value);
        });
    }

    const audio = getBgAudio();
    if (audio) {
        audio.volume = bgMusicState.muted ? 0 : bgMusicState.volume;
        audio.addEventListener('play', updateAudioUI);
        audio.addEventListener('pause', updateAudioUI);
        audio.addEventListener('ended', updateAudioUI);
    }
    updateAudioUI();
}

// Render animation buttons dynamically so new animations can be added via ANIMATIONS_CONFIG
function renderAnimationsMenu() {
    const listEl = document.getElementById('animationsList');
    if (!listEl) return;

    listEl.innerHTML = '';
    ANIMATIONS_CONFIG.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'menu-btn game-type-btn animation-item-btn';
        btn.addEventListener('click', () => item.open());

        const img = document.createElement('img');
        img.src = item.thumbnail;
        img.alt = item.title;
        img.className = 'menu-icon hub-anim-thumb';

        const textWrap = document.createElement('div');
        textWrap.className = 'game-type-text';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'game-type-title';
        titleSpan.textContent = item.title;

        const subSpan = document.createElement('span');
        subSpan.className = 'game-type-subtitle';
        subSpan.textContent = item.subtitle;

        textWrap.appendChild(titleSpan);
        textWrap.appendChild(subSpan);
        btn.appendChild(img);
        btn.appendChild(textWrap);
        listEl.appendChild(btn);
    });
}

function hideAllGameScreens() {
    const ids = [
        'gameTypeMenu',
        'mathModeMenuTarikTambang',
        'mathModeMenuPanjatPinang',
        'mathModeMenuBalapKarung',
        'levelMenuAddition',
        'levelMenuSubtraction',
        'levelMenuMultiplication',
        'levelMenuDivision',
        'gameScreenTarikTambang',
        'gameScreenPanjatPinang',
        'gameScreenBalapKarung',
        'winnerModal'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    document.body.classList.remove('emotion-active');
}

function showMainHubMenu() {
    pauseBgMusic();
    stopAllEmotions();
    hideAllGameScreens();

    const animationsMenu = document.getElementById('animationsMenu');
    const emotionScreen = document.getElementById('emotionScreen');
    const mainHubMenu = document.getElementById('mainHubMenu');
    const homeBtn = document.getElementById('homeBtn');

    if (animationsMenu) animationsMenu.style.display = 'none';
    if (emotionScreen) emotionScreen.style.display = 'none';
    if (homeBtn) homeBtn.style.display = 'none';
    if (mainHubMenu) mainHubMenu.style.display = 'flex';
}

function openGamesSection() {
    pauseBgMusic();
    stopAllEmotions();
    const mainHubMenu = document.getElementById('mainHubMenu');
    const animationsMenu = document.getElementById('animationsMenu');
    const emotionScreen = document.getElementById('emotionScreen');

    if (mainHubMenu) mainHubMenu.style.display = 'none';
    if (animationsMenu) animationsMenu.style.display = 'none';
    if (emotionScreen) emotionScreen.style.display = 'none';
    document.body.classList.remove('emotion-active');

    if (typeof showGameTypeMenu === 'function') {
        showGameTypeMenu();
    }
}

function openAnimationsSection() {
    pauseBgMusic();
    stopAllEmotions();
    hideAllGameScreens();

    const mainHubMenu = document.getElementById('mainHubMenu');
    const emotionScreen = document.getElementById('emotionScreen');
    const animationsMenu = document.getElementById('animationsMenu');
    const homeBtn = document.getElementById('homeBtn');

    if (mainHubMenu) mainHubMenu.style.display = 'none';
    if (emotionScreen) emotionScreen.style.display = 'none';
    if (homeBtn) homeBtn.style.display = 'none';
    if (animationsMenu) animationsMenu.style.display = 'flex';
}

function openEmotionScreen() {
    hideAllGameScreens();

    const mainHubMenu = document.getElementById('mainHubMenu');
    const animationsMenu = document.getElementById('animationsMenu');
    const emotionScreen = document.getElementById('emotionScreen');
    const homeBtn = document.getElementById('homeBtn');

    if (mainHubMenu) mainHubMenu.style.display = 'none';
    if (animationsMenu) animationsMenu.style.display = 'none';
    if (homeBtn) homeBtn.style.display = 'none';
    if (emotionScreen) emotionScreen.style.display = 'flex';

    document.body.classList.add('emotion-active');
    ensureEmotionStillsDrawn();
    bgMusicState.userPaused = false;
    startBgMusic(true);
}

function goToMainHub() {
    showMainHubMenu();
}

// Draw frame 0 of a GIF onto its canvas so the character rests in idle pose
function drawStillFrame(card, state) {
    const canvas = card.querySelector('.emotion-still');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        state.stillReady = true;
    };
    img.src = state.baseSrc;
}

function ensureEmotionStillsDrawn() {
    emotionState.forEach((state, card) => {
        if (!state.stillReady) {
            drawStillFrame(card, state);
        }
    });
}

function playEmotionSound(emotionType) {
    if (bgMusicState.muted || bgMusicState.volume === 0) return;

    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!emotionAudioCtx) {
            emotionAudioCtx = new AudioCtx();
        }
        if (emotionAudioCtx.state === 'suspended') {
            emotionAudioCtx.resume();
        }

        const tones = {
            understood: [523.25, 659.25, 783.99],
            questions: [392.0, 493.88],
            'not-understood': [329.63, 261.63]
        };
        const notes = tones[emotionType] || [523.25];
        const now = emotionAudioCtx.currentTime;
        const peakGain = 0.08 * Math.max(0.25, bgMusicState.volume);

        notes.forEach((freq, idx) => {
            const osc = emotionAudioCtx.createOscillator();
            const gain = emotionAudioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.001, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(peakGain, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
            osc.connect(gain);
            gain.connect(emotionAudioCtx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.19);
        });
    } catch (_) {
        // Ignore audio errors when autoplay/audio context is restricted
    }
}

function spawnPlusOne(card) {
    const footer = card.querySelector('.emotion-footer');
    if (!footer) return;

    const badge = document.createElement('span');
    badge.className = 'emotion-plus-one';
    badge.textContent = '+1';
    footer.appendChild(badge);

    setTimeout(() => {
        badge.remove();
    }, 750);
}

function stopEmotion(card) {
    const state = emotionState.get(card);
    if (!state) return;

    if (state.timer) {
        clearTimeout(state.timer);
        state.timer = null;
    }

    card.classList.remove('is-playing');
    const gifImg = card.querySelector('.emotion-gif');
    if (gifImg) {
        gifImg.removeAttribute('src');
    }

    if (state.blobUrl) {
        URL.revokeObjectURL(state.blobUrl);
        state.blobUrl = null;
    }
}

function stopAllEmotions() {
    emotionState.forEach((_, card) => stopEmotion(card));
}

function triggerEmotion(card) {
    const state = emotionState.get(card);
    if (!state) return;

    state.count += 1;
    const counterEl = card.querySelector('.emotion-counter');
    if (counterEl) {
        counterEl.textContent = String(state.count);
        counterEl.classList.remove('pop');
        void counterEl.offsetWidth;
        counterEl.classList.add('pop');
    }

    spawnPlusOne(card);
    playEmotionSound(card.dataset.emotion);

    if (state.timer) {
        clearTimeout(state.timer);
        state.timer = null;
    }

    if (state.blobUrl) {
        URL.revokeObjectURL(state.blobUrl);
        state.blobUrl = null;
    }

    const gifImg = card.querySelector('.emotion-gif');
    card.classList.remove('is-playing');
    void card.offsetWidth;
    card.classList.add('is-playing');

    if (gifImg) {
        if (state.gifBlob) {
            state.blobUrl = URL.createObjectURL(state.gifBlob);
            gifImg.src = state.blobUrl;
        } else {
            gifImg.removeAttribute('src');
            requestAnimationFrame(() => {
                gifImg.src = `${state.baseSrc}?play=${Date.now()}`;
            });
        }
    }

    state.timer = setTimeout(() => {
        stopEmotion(card);
    }, state.duration);
}

function resetEmotionCounters() {
    stopAllEmotions();
    emotionState.forEach((state, card) => {
        state.count = 0;
        const counterEl = card.querySelector('.emotion-counter');
        if (counterEl) {
            counterEl.textContent = '0';
            counterEl.classList.remove('pop');
        }
    });

    const resetBtn = document.querySelector('.emotion-reset-btn');
    if (resetBtn) {
        resetBtn.classList.remove('spinning');
        void resetBtn.offsetWidth;
        resetBtn.classList.add('spinning');
    }
}

function initEmotionCards() {
    const cards = document.querySelectorAll('#emotionScreen .emotion-card');
    cards.forEach(card => {
        const baseSrc = card.dataset.gif;
        const duration = parseInt(card.dataset.duration || '3000', 10);
        const state = {
            count: 0,
            timer: null,
            blobUrl: null,
            gifBlob: null,
            baseSrc,
            duration,
            stillReady: false
        };
        emotionState.set(card, state);
        drawStillFrame(card, state);

        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            fetch(baseSrc)
                .then(res => (res.ok ? res.blob() : null))
                .then(blob => {
                    if (blob) state.gifBlob = blob;
                })
                .catch(() => { });
        }

        card.addEventListener('click', () => triggerEmotion(card));
    });
}

renderAnimationsMenu();
initEmotionCards();
initBgMusicControls();
showMainHubMenu();
