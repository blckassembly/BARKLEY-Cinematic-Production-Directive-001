/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastFootstepTime: number = -1;
  private lastTouchChimeTime: number = -1;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    }
  }

  public playFootstep(time: number, isRightFoot: boolean) {
    if (this.isMuted) return;
    if (Math.abs(time - this.lastFootstepTime) < 0.25) return;
    this.lastFootstepTime = time;

    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Soft cushioned sneaker sole impact on terrazzo
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isRightFoot ? 180 : 160, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isRightFoot ? 95 : 85, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Audio context may be restricted before user gesture
    }
  }

  public playTouchChime(time: number) {
    if (this.isMuted) return;
    if (Math.abs(time - this.lastTouchChimeTime) < 1.0) return;
    this.lastTouchChimeTime = time;

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

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.48);
      osc2.stop(now + 0.48);
    } catch {
      // Audio context guard
    }
  }

  public playCartPopup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // High-end glass card pop sound: pleasant ascending dual chime
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
    } catch {
      // Audio context guard
    }
  }

  public playCheckoutProceed() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Affirmative soft confirmation chord
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
    } catch {
      // Audio context guard
    }
  }
}

export const audioSynth = new AudioSynthesizer();
