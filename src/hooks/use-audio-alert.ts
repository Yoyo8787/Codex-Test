"use client";

import { useCallback, useRef } from "react";

export function useAudioAlert() {
  const synthRef = useRef<AudioContext>();

  const play = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      if (!synthRef.current) {
        synthRef.current = new AudioContext();
      }
      const synth = synthRef.current;
      const oscillator = synth.createOscillator();
      const gain = synth.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, synth.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.1, synth.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, synth.currentTime + 0.4);
      oscillator.connect(gain);
      gain.connect(synth.destination);
      oscillator.start();
      oscillator.stop(synth.currentTime + 0.5);
    } catch (error) {
      console.warn("Audio alert failed", error);
    }
  }, []);

  return { play };
}
