class ArcadeSoundController {
  ctx = null;
  enabled = true;
  sfxVolume = 0.8;
  musicVolume = 0.6;
  currentTrack = "off";
  bgmInterval = null;
  bgmNodes = [];
  visualizerData = [0.2, 0.4, 0.6, 0.3, 0.5, 0.7, 0.4, 0.2];
  onTrackChangeCallbacks = [];
  constructor() {
    try {
      const saved = localStorage.getItem("arcade_sound_enabled");
      this.enabled = saved !== null ? saved === "true" : true;
      const savedSfx = localStorage.getItem("arcade_sfx_volume");
      if (savedSfx !== null) this.sfxVolume = parseFloat(savedSfx);
      const savedMusic = localStorage.getItem("arcade_music_volume");
      if (savedMusic !== null) this.musicVolume = parseFloat(savedMusic);
    } catch {
      this.enabled = true;
    }
  }
  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem("arcade_sfx_volume", String(this.sfxVolume));
    } catch {
    }
  }
  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem("arcade_music_volume", String(this.musicVolume));
    } catch {
    }
  }
  onTrackChange(cb) {
    this.onTrackChangeCallbacks.push(cb);
    return () => {
      this.onTrackChangeCallbacks = this.onTrackChangeCallbacks.filter((c) => c !== cb);
    };
  }
  notifyTrackChange() {
    this.onTrackChangeCallbacks.forEach((cb) => cb(this.currentTrack));
  }
  initContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {
      });
    }
    return this.ctx;
  }
  toggle() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem("arcade_sound_enabled", String(this.enabled));
    } catch {
    }
    if (!this.enabled) {
      this.stopBGM();
      this.currentTrack = "off";
      this.notifyTrackChange();
    } else {
      this.playSuccess();
    }
    return this.enabled;
  }
  // --- SOUND EFFECTS ---
  playClick(freq = 600, type = "sine") {
    if (!this.enabled || this.sfxVolume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
    }
  }
  playLaser() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(920, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.14 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
    }
  }
  playExplosion() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const bufferSize = ctx.sampleRate * 0.22;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(750, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.22);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.24 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.22);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch {
    }
  }
  playPowerup() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const notes = [330, 440, 550, 660, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.1 * this.sfxVolume, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + idx * 0.05 + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.09);
      });
    } catch {
    }
  }
  playSnakeEat() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.14 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
    }
  }
  playFlip() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.1 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
    }
  }
  playCardFlip() {
    this.playFlip();
  }
  playTileMerge() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
    }
  }
  playSlide() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.07 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
    }
  }
  playSuccess() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.12 * this.sfxVolume, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + idx * 0.06 + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.17);
      });
    } catch {
    }
  }
  playError() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(105, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {
    }
  }
  playFanfare() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const chords = [
        { freqs: [523.25, 659.25], start: 0, dur: 0.12 },
        { freqs: [587.33, 698.46], start: 0.12, dur: 0.12 },
        { freqs: [659.25, 783.99], start: 0.24, dur: 0.14 },
        { freqs: [783.99, 1046.5], start: 0.38, dur: 0.4 }
      ];
      chords.forEach(({ freqs, start, dur }) => {
        freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
          gain.gain.setValueAtTime(0.1 * this.sfxVolume, ctx.currentTime + start);
          gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + start + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + start);
          osc.stop(ctx.currentTime + start + dur + 0.02);
        });
      });
    } catch {
    }
  }
  playTyping() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const freq = 1200 + Math.random() * 600;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
    }
  }
  // --- PROCEDURAL ARCADE SYNTHWAVE RADIO ---
  stopBGM() {
    if (this.bgmInterval) {
      window.clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.bgmNodes.forEach((node) => {
      try {
        if ("stop" in node) node.stop();
        node.disconnect();
      } catch {
      }
    });
    this.bgmNodes = [];
  }
  setTrack(track) {
    if (!this.enabled && track !== "off") {
      this.enabled = true;
      try {
        localStorage.setItem("arcade_sound_enabled", "true");
      } catch {
      }
    }
    this.stopBGM();
    this.currentTrack = track;
    this.notifyTrackChange();
    if (track === "off") return;
    const ctx = this.initContext();
    if (!ctx) return;
    if (track === "synthwave") {
      const bassNotes = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
      const arpNotes = [440, 523.25, 659.25, 880, 659.25, 523.25, 783.99, 659.25];
      let step = 0;
      const intervalMs = 60 / 116 / 4 * 1e3;
      this.bgmInterval = window.setInterval(() => {
        if (!this.enabled || this.currentTrack !== "synthwave" || this.musicVolume <= 0) {
          return;
        }
        try {
          const now = ctx.currentTime;
          if (step % 2 === 0) {
            const bassOsc = ctx.createOscillator();
            const bassGain = ctx.createGain();
            bassOsc.type = "sawtooth";
            const bassFreq = bassNotes[Math.floor(step / 4) % bassNotes.length];
            bassOsc.frequency.setValueAtTime(bassFreq, now);
            bassGain.gain.setValueAtTime(0.065 * this.musicVolume, now);
            bassGain.gain.exponentialRampToValueAtTime(1e-3, now + 0.22);
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(450, now);
            bassOsc.connect(filter);
            filter.connect(bassGain);
            bassGain.connect(ctx.destination);
            bassOsc.start(now);
            bassOsc.stop(now + 0.24);
          }
          const arpOsc = ctx.createOscillator();
          const arpGain = ctx.createGain();
          arpOsc.type = "triangle";
          const arpfreq = arpNotes[step % arpNotes.length];
          arpOsc.frequency.setValueAtTime(arpfreq, now);
          arpGain.gain.setValueAtTime(0.045 * this.musicVolume, now);
          arpGain.gain.exponentialRampToValueAtTime(1e-3, now + 0.14);
          arpOsc.connect(arpGain);
          arpGain.connect(ctx.destination);
          arpOsc.start(now);
          arpOsc.stop(now + 0.15);
          this.visualizerData = [
            0.3 + Math.random() * 0.7,
            0.2 + Math.random() * 0.8,
            0.4 + Math.random() * 0.6,
            0.5 + Math.random() * 0.5,
            0.3 + Math.random() * 0.7,
            0.6 + Math.random() * 0.4,
            0.2 + Math.random() * 0.7,
            0.4 + Math.random() * 0.6
          ];
          step = (step + 1) % 32;
        } catch {
        }
      }, intervalMs);
    } else if (track === "lofi") {
      const chords = [
        [261.63, 329.63, 392, 493.88],
        [220, 261.63, 329.63, 392],
        [174.61, 220, 261.63, 329.63],
        [196, 246.94, 293.66, 349.23]
      ];
      let chordIndex = 0;
      this.bgmInterval = window.setInterval(() => {
        if (!this.enabled || this.currentTrack !== "lofi" || this.musicVolume <= 0) {
          return;
        }
        try {
          const now = ctx.currentTime;
          const currentChord = chords[chordIndex % chords.length];
          currentChord.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);
            gain.gain.setValueAtTime(0.04 * this.musicVolume, now + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(1e-3, now + 1.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.04);
            osc.stop(now + 1.7);
          });
          this.visualizerData = [
            0.2 + Math.random() * 0.4,
            0.3 + Math.random() * 0.5,
            0.5 + Math.random() * 0.4,
            0.4 + Math.random() * 0.5,
            0.3 + Math.random() * 0.4,
            0.4 + Math.random() * 0.4,
            0.2 + Math.random() * 0.5,
            0.3 + Math.random() * 0.4
          ];
          chordIndex++;
        } catch {
        }
      }, 1900);
    } else if (track === "ambient") {
      const droneNotes = [55, 110, 164.81, 220];
      let step = 0;
      this.bgmInterval = window.setInterval(() => {
        if (!this.enabled || this.currentTrack !== "ambient" || this.musicVolume <= 0) {
          return;
        }
        try {
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          const freq = droneNotes[step % droneNotes.length];
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.03 * this.musicVolume, now);
          gain.gain.exponentialRampToValueAtTime(1e-3, now + 2.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 2.9);
          this.visualizerData = [
            0.2 + Math.random() * 0.3,
            0.3 + Math.random() * 0.3,
            0.4 + Math.random() * 0.3,
            0.3 + Math.random() * 0.3,
            0.5 + Math.random() * 0.3,
            0.4 + Math.random() * 0.3,
            0.3 + Math.random() * 0.3,
            0.2 + Math.random() * 0.3
          ];
          step++;
        } catch {
        }
      }, 2500);
    }
  }
}
export const arcadeSound = new ArcadeSoundController();
