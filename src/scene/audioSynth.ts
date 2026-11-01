/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private isAmbientRunning: boolean = false;
  private lastTouchChimeTime: number = -1;
  private lastScannerBeepTime: number = -1;
  private lastPaymentPingTime: number = -1;
  private lastKeypadTime: number = -1;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!muted) {
      this.initCtx();
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
  }

  public startAmbient() {
    if (this.isMuted || this.isAmbientRunning) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      this.isAmbientRunning = true;
      const now = this.ctx.currentTime;
      // Warm, ultra-low frequency architectural room drone (55Hz and 110Hz warm hum)
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.0001, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.018, now + 2.0);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);

      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(55, now); // A1 hum

      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(82.4, now); // E2 warmth

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc1.start(now);
      this.ambientOsc2.start(now);
    } catch {
      // Guard against audio context autoplay policies
    }
  }

  public stopAmbient() {
    if (!this.isAmbientRunning || !this.ctx || !this.ambientGain) return;
    try {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.exponentialRampToValueAtTime(0.00001, now + 0.5);
      setTimeout(() => {
        try {
          this.ambientOsc1?.stop();
          this.ambientOsc2?.stop();
        } catch {}
        this.isAmbientRunning = false;
      }, 550);
    } catch {
      this.isAmbientRunning = false;
    }
  }

  public playTouchChime(time?: number) {
    if (this.isMuted) return;
    if (time !== undefined && Math.abs(time - this.lastTouchChimeTime) < 0.6) return;
    if (time !== undefined) this.lastTouchChimeTime = time;

    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Luxury acoustic capacitive touch chime
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1244.51, now); // D#6
      osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2489.02, now); // D#7 harmonic

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.42);
      osc2.stop(now + 0.42);
    } catch {}
  }

  public playKeypadClick(time?: number) {
    if (this.isMuted) return;
    if (time !== undefined && Math.abs(time - this.lastKeypadTime) < 0.2) return;
    if (time !== undefined) this.lastKeypadTime = time;

    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.03);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  public playScannerBeep(time?: number) {
    if (this.isMuted) return;
    if (time !== undefined && Math.abs(time - this.lastScannerBeepTime) < 1.0) return;
    if (time !== undefined) this.lastScannerBeepTime = time;

    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // High-precision optical laser verification dual tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2093.0, now); // C7
      osc.frequency.setValueAtTime(2793.83, now + 0.08); // F7

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  public playCartPopup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(1174.66, now); // D6
      oscHarmonic.frequency.exponentialRampToValueAtTime(1760.0, now + 0.12); // A6

      gain.gain.setValueAtTime(0.065, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + 0.42);
      oscHarmonic.stop(now + 0.42);
    } catch {}
  }

  public playCheckoutProceed() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const freqs = [659.25, 830.61, 987.77]; // E major chord
      freqs.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now);
        osc.stop(now + 0.52);
      });
    } catch {}
  }

  public playPaymentApproved(time?: number) {
    if (this.isMuted) return;
    if (time !== undefined && Math.abs(time - this.lastPaymentPingTime) < 1.5) return;
    if (time !== undefined) this.lastPaymentPingTime = time;

    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // High-end NFC approval chime: crisp pleasant double chime
      [
        { freq: 1046.5, delay: 0.0, dur: 0.35 },
        { freq: 1567.98, delay: 0.1, dur: 0.45 },
      ].forEach((tone) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(tone.freq, now + tone.delay);
        gain.gain.setValueAtTime(0.07, now + tone.delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.delay + tone.dur);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + tone.delay);
        osc.stop(now + tone.delay + tone.dur + 0.05);
      });
    } catch {}
  }
}

export const audioSynth = new AudioSynthesizer();
