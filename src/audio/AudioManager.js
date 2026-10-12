/**
 * Web Audio API Sound Effects & Procedural Adventure Music Manager
 * Respects browser autoplay rules and persists user audio preferences.
 */

import { progressManager } from '../storage/ProgressManager.js';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.musicTimer = null;
    this.musicStep = 0;
    this.isPlayingMusic = false;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  get effectiveVolume() {
    const s = progressManager.getSettings();
    if (!s.soundEnabled) return 0;
    return s.volume ?? 0.8;
  }

  playTone(freq, type = 'sine', duration = 0.12, startTimeOffset = 0, gainScale = 0.22, slideToFreq = null) {
    const vol = this.effectiveVolume;
    if (vol <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + startTimeOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideToFreq, now + duration);
    }

    const peakGain = Math.max(0.001, gainScale * vol);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playJump() {
    this.playTone(260, 'sine', 0.16, 0, 0.25, 580);
  }

  playLand() {
    this.playTone(150, 'triangle', 0.07, 0, 0.14, 95);
  }

  playCoin() {
    this.playTone(987.77, 'sine', 0.08, 0, 0.2); // B5
    this.playTone(1318.51, 'sine', 0.22, 0.07, 0.22); // E6
  }

  playStar() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 'triangle', 0.14, idx * 0.055, 0.22);
    });
  }

  playCorrectAnswer() {
    // Cheerful ascending major triad + octave chime
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sine', 0.18, idx * 0.07, 0.26);
    });
  }

  playIncorrectAnswer() {
    // Gentle, non-startling warm double wooden marimba tone
    this.playTone(310, 'sine', 0.15, 0, 0.2, 270);
    this.playTone(260, 'sine', 0.22, 0.14, 0.18, 235);
  }

  playCheckpoint() {
    this.playTone(440, 'triangle', 0.12, 0, 0.22);
    this.playTone(554.37, 'triangle', 0.12, 0.09, 0.22);
    this.playTone(659.25, 'triangle', 0.24, 0.18, 0.25);
  }

  playFlagUnlock() {
    const notes = [392.0, 493.88, 587.33, 783.99, 987.77];
    notes.forEach((freq, i) => {
      this.playTone(freq, 'triangle', 0.2, i * 0.065, 0.24);
    });
  }

  playLevelComplete() {
    const fanfare = [
      { f: 523.25, d: 0.14, t: 0 },
      { f: 659.25, d: 0.14, t: 0.13 },
      { f: 783.99, d: 0.14, t: 0.26 },
      { f: 1046.5, d: 0.28, t: 0.39 },
      { f: 783.99, d: 0.14, t: 0.68 },
      { f: 1046.5, d: 0.45, t: 0.82 }
    ];
    fanfare.forEach((n) => {
      this.playTone(n.f, 'triangle', n.d, n.t, 0.28);
    });
  }

  playClick() {
    this.playTone(620, 'sine', 0.06, 0, 0.16, 780);
  }

  playHover() {
    this.playTone(480, 'sine', 0.035, 0, 0.07);
  }

  startBackgroundMusic() {
    const s = progressManager.getSettings();
    if (!s.soundEnabled || !s.musicEnabled) {
      this.stopBackgroundMusic();
      return;
    }
    if (this.isPlayingMusic) return;

    const ctx = this.ensureContext();
    if (!ctx) return;

    this.isPlayingMusic = true;
    const melody = [
      523.25, 659.25, 783.99, 659.25,
      587.33, 698.46, 880.0, 698.46,
      523.25, 659.25, 783.99, 1046.5,
      880.0, 783.99, 659.25, 587.33
    ];

    this.musicTimer = window.setInterval(() => {
      const currentSettings = progressManager.getSettings();
      if (!currentSettings.soundEnabled || !currentSettings.musicEnabled || document.hidden) {
        return;
      }
      if (!this.ctx || this.ctx.state !== 'running') return;

      const note = melody[this.musicStep % melody.length];
      this.musicStep++;
      this.playTone(note, 'sine', 0.22, 0, 0.055);
    }, 360);
  }

  stopBackgroundMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  toggleSound() {
    const s = progressManager.getSettings();
    const next = !s.soundEnabled;
    progressManager.updateSettings({ soundEnabled: next });
    if (next) {
      this.ensureContext();
      this.playClick();
      if (s.musicEnabled) this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
    return next;
  }

  toggleMusic() {
    const s = progressManager.getSettings();
    const next = !s.musicEnabled;
    progressManager.updateSettings({ musicEnabled: next });
    if (next && s.soundEnabled) {
      this.ensureContext();
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
    return next;
  }

  setVolume(val) {
    const clamped = Math.min(1, Math.max(0, Number(val)));
    progressManager.updateSettings({ volume: clamped });
  }
}

export const audioManager = new AudioManager();
