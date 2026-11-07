// Pure Web Audio API Indian Tanpura / Sitar harmonic drone generator
// Zero external file dependencies, instant start, works offline

class IndianAmbianceAudio {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private oscillators: OscillatorNode[] = [];
  private gainNode: GainNode | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.stop(); // Stop any existing

      const now = this.ctx.currentTime;
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.001, now);
      this.gainNode.gain.exponentialRampToValueAtTime(0.18, now + 2); // Soft 2-second fade-in
      this.gainNode.connect(this.ctx.destination);

      // Traditional Indian Sa - Pa - Sa (C# / D# tanpura root tuning)
      // Root: 138.59 Hz (C#3), Fifth: 207.65 Hz (G#3), Octave: 277.18 Hz (C#4)
      const freqs = [138.59, 207.65, 277.18, 554.37];

      freqs.forEach((freq, i) => {
        if (!this.ctx || !this.gainNode) return;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        // Warm triangle and sine waves
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Subtle slow pitch detuning for authentic rich sitar/tanpura resonance
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.2 + i * 0.1, now);
        lfoGain.gain.setValueAtTime(1.5, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        oscGain.gain.setValueAtTime(0.25 / (i + 1), now);
        osc.connect(oscGain);
        oscGain.connect(this.gainNode);
        osc.start();

        this.oscillators.push(osc);
      });

      this.isPlaying = true;
    } catch (e) {
      console.warn('Audio playback not allowed or failed:', e);
    }
  }

  public stop() {
    if (this.ctx && this.gainNode) {
      const now = this.ctx.currentTime;
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      setTimeout(() => {
        this.oscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Already stopped
          }
        });
        this.oscillators = [];
      }, 900);
    }
    this.isPlaying = false;
  }
}

export const ambianceAudio = new IndianAmbianceAudio();

