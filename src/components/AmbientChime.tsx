"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Generates a gentle, warm acoustic harp/chime progression using the Web Audio API.
 * Requires zero external MP3 assets and starts only on explicit user interaction.
 */
export function useAmbientChime() {
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playNote = useCallback((freq: number, delaySec: number, durationSec: number) => {
    const ctx = ctxRef.current;
    if (!ctx || ctx.state !== "running") return;

    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.032, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec + 0.05);
  }, []);

  const playChordLoop = useCallback(() => {
    // Warm Dmaj9 / Bm7 / Gmaj7 / A6 ambient harp notes
    const progression = [
      [293.66, 369.99, 440.0, 554.37, 659.25],
      [246.94, 369.99, 440.0, 587.33],
      [196.0, 293.66, 369.99, 493.88],
      [220.0, 329.63, 440.0, 554.37],
    ];
    let step = 0;

    const triggerBar = () => {
      const chord = progression[step % progression.length];
      chord.forEach((freq, idx) => {
        playNote(freq, idx * 0.28, 2.6);
      });
      step += 1;
    };

    triggerBar();
    intervalRef.current = setInterval(triggerBar, 4200);
  }, [playNote]);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      if (!ctxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioCtx) return;
        ctxRef.current = new AudioCtx();
      }
      if (ctxRef.current.state === "suspended") {
        void ctxRef.current.resume();
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      playChordLoop();
      setIsPlaying(true);
    } catch {
      // Ignore if browser audio is blocked
    }
  }, [playChordLoop]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (ctxRef.current) {
        void ctxRef.current.close();
      }
    };
  }, []);

  return { isPlaying, start, stop, toggle };
}

export function SoundTogglePill({
  isPlaying,
  onToggle,
}: {
  isPlaying: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isPlaying ? "Mute ambient music" : "Play ambient music"}
      className="fixed right-4 bottom-4 z-30 inline-flex items-center gap-2 rounded-full border border-champagne-400/75 bg-ivory-50/90 px-4 py-2 text-[11px] font-semibold tracking-wider text-champagne-700 uppercase shadow-md backdrop-blur-md transition-colors hover:bg-champagne-300/30"
    >
      {isPlaying ? (
        <>
          <Volume2 className="h-3.5 w-3.5 text-champagne-600" />
          <span>Sound On</span>
        </>
      ) : (
        <>
          <VolumeX className="h-3.5 w-3.5 text-espresso-500" />
          <span>Sound Off</span>
        </>
      )}
    </button>
  );
}
