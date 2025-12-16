class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Default volume
        this.masterGain.connect(this.ctx.destination);
    }

    playTone(freq, duration, type = 'sine') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.value = freq;
        osc.type = type;

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playClick() {
        // High pitched short blip
        this.playTone(800, 0.1, 'sine');
    }

    playPop() {
        // Bubble pop sound
        this.playTone(600, 0.05, 'triangle');
    }

    playError() {
        // Low buzzing error
        this.playTone(150, 0.3, 'sawtooth');
    }

    playWin() {
        // Ascending Major Triad
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'sine'), i * 100);
        });
    }

    playLose() {
        // Descending tones
        [300, 200, 100].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.4, 'square'), i * 150);
        });
    }
}

window.SoundManager = new SoundManager();
