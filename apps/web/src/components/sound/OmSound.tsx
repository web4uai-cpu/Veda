'use client';

import { useCallback, useRef, useEffect } from 'react';

/**
 * Synthesizes a soft, ambient "Om" drone using the Web Audio API.
 * No audio file needed — entirely generated in the browser.
 */
export function useOmSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);

  const play = useCallback(() => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    try {
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      // Base Om frequency (~136.1 Hz — the "Om" frequency)
      const fundamental = 136.1;
      const duration = 6;
      const fadeIn = 2;
      const fadeOut = 3;

      // Create oscillators for rich harmonics
      const harmonics = [
        { freq: fundamental, gain: 0.12 },
        { freq: fundamental * 2, gain: 0.06 },
        { freq: fundamental * 3, gain: 0.03 },
        { freq: fundamental * 0.5, gain: 0.04 },
      ];

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + fadeIn);
      masterGain.gain.setValueAtTime(0.08, ctx.currentTime + duration - fadeOut);
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
      masterGain.connect(ctx.destination);

      // Low-pass filter for warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 0.5;
      filter.connect(masterGain);

      harmonics.forEach(({ freq, gain }) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;
        // Slight detune for richness
        osc.detune.value = (Math.random() - 0.5) * 5;

        oscGain.gain.value = gain;
        osc.connect(oscGain);
        oscGain.connect(filter);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration + 0.5);
      });

      // Add subtle noise for texture
      const bufferSize = ctx.sampleRate * duration;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.002;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.3;
      noiseSource.connect(noiseGain);
      noiseGain.connect(filter);
      noiseSource.start(ctx.currentTime);

      // Clean up after playback
      setTimeout(() => {
        isPlayingRef.current = false;
        ctx.close().catch(() => {});
      }, (duration + 1) * 1000);
    } catch {
      isPlayingRef.current = false;
    }
  }, []);

  const stop = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      isPlayingRef.current = false;
    }
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { play, stop };
}
