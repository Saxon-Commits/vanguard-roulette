let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // Resume in case suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Ascending C-major chime for Bingo win */
export function playBingoChime(): void {
  try {
    const ctx = getCtx();
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.14;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  } catch (_) { /* silently skip if audio unavailable */ }
}

/** Low dramatic bass drop for saboteur selection */
export function playSpinStart(): void {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (_) { /* skip */ }
}

/** Descending reveal sting */
export function playRevealSting(): void {
  try {
    const ctx = getCtx();
    const freqs = [880, 660, 440, 330];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  } catch (_) { /* skip */ }
}
