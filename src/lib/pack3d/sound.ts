/**
 * The rip's sounds, synthesized with Web Audio so there are no files to download: foil
 * tearing that follows the speed of the drag, the pop as the strip comes free, a
 * whoosh as cards move, a snap as one turns over, and a shimmer for the hit.
 *
 * Nothing plays until the visitor has touched the pack, and the mute switch is kept
 * in localStorage under `pokeid-sound`.
 */

import { createBrowserStorage } from "@/lib/browser-storage";

export const soundSetting = createBrowserStorage("pokeid-sound");

/** Sound is on unless it was switched off. */
export function readSoundOn() {
  return soundSetting.read() !== "off";
}

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

export type PackSound = {
  /** Call from a pointer or key handler: browsers only start audio from a gesture. */
  unlock(): void;
  setMuted(muted: boolean): void;
  /** Called every frame while tearing, with the tear's speed in pack widths a second. */
  tear(speed: number): void;
  pop(): void;
  whoosh(strength?: number): void;
  flip(): void;
  shimmer(): void;
  dispose(): void;
};

export function createPackSound(muted: boolean): PackSound {
  let context: AudioContext | null = null;
  let master: GainNode | null = null;
  let noise: AudioBuffer | null = null;
  let tearGain: GainNode | null = null;
  let tearBand: BiquadFilterNode | null = null;
  let tearSource: AudioBufferSourceNode | null = null;
  let isMuted = muted;
  let crackleAt = 0;

  function ready() {
    if (!context || !master || isMuted || context.state !== "running") return null;
    return context;
  }

  function noiseSource(ctx: AudioContext) {
    const source = ctx.createBufferSource();
    source.buffer = noise;
    source.loop = true;
    return source;
  }

  /** A burst of filtered noise with a quick attack and an exponential tail. */
  function burst(ctx: AudioContext, { type, frequency, q = 1, gain, attack = 0.004, decay, at = ctx.currentTime, sweepTo }: {
    type: BiquadFilterType;
    frequency: number;
    q?: number;
    gain: number;
    attack?: number;
    decay: number;
    at?: number;
    sweepTo?: number;
  }) {
    const source = noiseSource(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(frequency, at);
    if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, at + attack + decay);
    filter.Q.value = q;
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, at);
    envelope.gain.exponentialRampToValueAtTime(gain, at + attack);
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
    source.connect(filter).connect(envelope).connect(master!);
    source.start(at, Math.random() * 1.5);
    source.stop(at + attack + decay + 0.05);
  }

  function tone(ctx: AudioContext, { frequency, type = "sine", gain, attack = 0.005, decay, at = ctx.currentTime, glideTo }: {
    frequency: number;
    type?: OscillatorType;
    gain: number;
    attack?: number;
    decay: number;
    at?: number;
    glideTo?: number;
  }) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, at);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, at + attack + decay);
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, at);
    envelope.gain.exponentialRampToValueAtTime(gain, at + attack);
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
    osc.connect(envelope).connect(master!);
    osc.start(at);
    osc.stop(at + attack + decay + 0.05);
  }

  return {
    unlock() {
      if (!context) {
        const Context = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
        if (!Context) return;
        try {
          context = new Context();
        } catch {
          return;
        }
        const compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -16;
        compressor.ratio.value = 4;
        master = context.createGain();
        master.gain.value = isMuted ? 0 : 0.7;
        master.connect(compressor).connect(context.destination);
        // Two seconds of white noise feeds every foil and air sound.
        noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
        const data = noise.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        // The tear runs continuously and is only heard while the foil is moving.
        tearSource = noiseSource(context);
        tearBand = context.createBiquadFilter();
        tearBand.type = "bandpass";
        tearBand.frequency.value = 2400;
        tearBand.Q.value = 0.9;
        const highpass = context.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 700;
        tearGain = context.createGain();
        tearGain.gain.value = 0;
        tearSource.connect(tearBand).connect(highpass).connect(tearGain).connect(master);
        tearSource.start();
      }
      if (context.state === "suspended") void context.resume().catch(() => undefined);
    },

    setMuted(next) {
      isMuted = next;
      if (context && master) master.gain.setTargetAtTime(next ? 0 : 0.7, context.currentTime, 0.02);
    },

    tear(speed) {
      const ctx = ready();
      if (!ctx || !tearGain || !tearBand) return;
      const level = Math.min(1, speed * 0.9);
      tearGain.gain.setTargetAtTime(level * 0.55, ctx.currentTime, 0.025);
      tearBand.frequency.setTargetAtTime(1800 + level * 2200, ctx.currentTime, 0.05);
      // Foil crackles: tiny clicks, closer together the faster it tears.
      if (level > 0.05 && ctx.currentTime >= crackleAt) {
        burst(ctx, { type: "highpass", frequency: 3000 + Math.random() * 3000, gain: 0.25 + level * 0.35, attack: 0.001, decay: 0.012 + Math.random() * 0.02 });
        crackleAt = ctx.currentTime + 0.012 + (1 - level) * 0.06 * Math.random();
      }
    },

    pop() {
      const ctx = ready();
      if (!ctx) return;
      tearGain?.gain.setTargetAtTime(0, ctx.currentTime, 0.02);
      burst(ctx, { type: "lowpass", frequency: 1800, gain: 0.9, decay: 0.14 });
      tone(ctx, { frequency: 150, glideTo: 55, gain: 0.7, decay: 0.22 });
      burst(ctx, { type: "bandpass", frequency: 600, sweepTo: 4200, q: 0.7, gain: 0.35, attack: 0.03, decay: 0.5, at: ctx.currentTime + 0.05 });
    },

    whoosh(strength = 1) {
      const ctx = ready();
      if (!ctx) return;
      burst(ctx, { type: "bandpass", frequency: 350, sweepTo: 2600, q: 1.1, gain: 0.32 * strength, attack: 0.07, decay: 0.32 });
    },

    flip() {
      const ctx = ready();
      if (!ctx) return;
      burst(ctx, { type: "bandpass", frequency: 2600, q: 1.4, gain: 0.32, attack: 0.002, decay: 0.05 });
      burst(ctx, { type: "bandpass", frequency: 900, sweepTo: 2200, q: 0.8, gain: 0.16, attack: 0.03, decay: 0.12 });
    },

    shimmer() {
      const ctx = ready();
      if (!ctx) return;
      const now = ctx.currentTime;
      // A rising major arpeggio over a soft swell, then sparkle on top.
      [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((frequency, i) => {
        tone(ctx, { frequency, type: "triangle", gain: 0.16, decay: 1.6, at: now + i * 0.07 });
        tone(ctx, { frequency: frequency * 2, gain: 0.05, decay: 1.1, at: now + i * 0.07 + 0.01 });
      });
      tone(ctx, { frequency: 261.63, gain: 0.18, attack: 0.25, decay: 1.8, at: now });
      burst(ctx, { type: "highpass", frequency: 6500, gain: 0.12, attack: 0.2, decay: 1.2, at: now + 0.1 });
    },

    dispose() {
      try {
        tearSource?.stop();
      } catch {
        // Already stopped.
      }
      void context?.close().catch(() => undefined);
      context = null;
    },
  };
}
