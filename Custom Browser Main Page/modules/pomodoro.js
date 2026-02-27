import translationManager from '../translations/translations.js';

class PomodoroTimer {
    constructor() {
        // Load custom times or defaults
        const savedTimers = JSON.parse(localStorage.getItem('pomo-timers'));
        this.timers = savedTimers || {
            work: 25 * 60,
            break: 5 * 60
        };

        this.currentMode = 'work';
        this.timeLeft = this.timers[this.currentMode];
        this.timerId = null;
        this.isRunning = false;
        this.isMuted = localStorage.getItem('pomo-muted') === 'true';

        this.el = {
            display: document.getElementById('pomo-display'),
            input: document.getElementById('pomo-input'),
            startBtn: document.getElementById('pomo-start-stop'),
            resetBtn: document.getElementById('pomo-reset'),
            muteBtn: document.getElementById('pomo-mute'),
            notification: document.getElementById('pomo-notification'),
            modeBtns: document.querySelectorAll('.pomo-mode-btn')
        };

        this._init();
    }

    _init() {
        if (!this.el.display) return;
        this._updateMuteIcon();
        this._updateDisplay();
        this._bindEvents();
    }

    _bindEvents() {
        this.el.startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        this.el.resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.reset();
        });

        this.el.muteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMute();
        });

        this.el.modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const mode = btn.dataset.mode;
                this.setMode(mode);
            });
        });

        // Click to change time
        this.el.display.addEventListener('click', (e) => {
            e.stopPropagation();
            this._showInput();
        });

        this.el.input.addEventListener('blur', () => this._hideInput());
        this.el.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this._hideInput();
        });

        this.el.display.title = translationManager.get('pomo-click-to-change') || "Click to change time";
        this.el.display.style.cursor = "pointer";
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('pomo-muted', this.isMuted);
        this._updateMuteIcon();
    }

    _updateMuteIcon() {
        if (!this.el.muteBtn) return;
        this.el.muteBtn.innerHTML = this.isMuted ?
            '<i class="fa-solid fa-volume-xmark"></i>' :
            '<i class="fa-solid fa-volume-high"></i>';
    }

    _playSound() {
        if (this.isMuted) return;

        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();

            const playBeep = (startTime) => {
                const osc = context.createOscillator();
                const gain = context.createGain();

                osc.connect(gain);
                gain.connect(context.destination);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, startTime);

                // Louder and shorter for a cleaner digital alert sound
                gain.gain.setValueAtTime(0.5, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

                osc.start(startTime);
                osc.stop(startTime + 0.2);
            };

            const now = context.currentTime;
            // Pattern: Beep-Beep ... pause ... Beep-Beep
            playBeep(now);
            playBeep(now + 0.25);

            playBeep(now + 0.8);
            playBeep(now + 1.05);

        } catch (e) {
            console.warn("Sound play failed", e);
        }
    }

    toggle() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.el.startBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        this.el.notification.classList.add('oculto');

        this.timerId = setInterval(() => {
            this.timeLeft--;
            this._updateDisplay();

            if (this.timeLeft <= 0) {
                this._finish();
            }
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        this.el.startBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        clearInterval(this.timerId);
    }

    reset() {
        this.pause();
        this.timeLeft = this.timers[this.currentMode];
        this.el.notification.classList.add('oculto');
        this._updateDisplay();
    }

    setMode(mode) {
        this.currentMode = mode;
        this.el.modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        this.reset();
    }

    _showInput() {
        const currentMins = Math.floor(this.timers[this.currentMode] / 60);
        this.el.display.style.display = 'none';
        this.el.input.style.display = 'block';
        this.el.input.value = currentMins;
        this.el.input.focus();
        this.el.input.select();
    }

    _hideInput() {
        const newMins = parseInt(this.el.input.value);
        if (!isNaN(newMins) && newMins > 0) {
            const seconds = Math.round(newMins * 60);
            this.timers[this.currentMode] = seconds;
            localStorage.setItem('pomo-timers', JSON.stringify(this.timers));
            this.reset();
        }
        this.el.display.style.display = 'block';
        this.el.input.style.display = 'none';
    }

    _finish() {
        this.pause();
        this._playSound();

        const msg = this.currentMode === 'work' ?
            (translationManager.get('pomo-finish-work') || 'Time to take a break!') :
            (translationManager.get('pomo-finish-break') || 'Back to work!');

        this._showNotification(msg);

        const nextMode = this.currentMode === 'work' ? 'break' : 'work';
        setTimeout(() => {
            this.setMode(nextMode);
        }, 5000); // 5s delay before switching so they see the msg
    }

    _showNotification(msg) {
        if (!this.el.notification) return;
        this.el.notification.textContent = msg;
        this.el.notification.classList.remove('oculto');
    }

    _updateDisplay() {
        const mins = Math.floor(this.timeLeft / 60);
        const secs = Math.floor(this.timeLeft % 60);
        this.el.display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

export const pomodoroTimer = new PomodoroTimer();
