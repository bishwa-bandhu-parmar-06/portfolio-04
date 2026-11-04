'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

// three.js (~240 KB gzipped) is only downloaded on capable devices, after the visitor first interacts.
const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false, loading: () => null });

type Mode = 'pending' | 'static' | '3d';

/** Fallback for visitors who just look: start the scene after this long without input. */
const IDLE_FALLBACK_MS = 10_000;
const WAKE_EVENTS = ['pointermove', 'pointerdown', 'scroll', 'keydown', 'wheel'] as const;

/**
 * Cheap checks, run on mount: should this device get the WebGL scene at all?
 * Phones and tablets always get the gradient: the visual is small there and the
 * download and GPU work aren't worth the battery and data.
 */
function wants3D(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (!window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return false;
  return (nav.hardwareConcurrency ?? 8) > 2 && (nav.deviceMemory ?? 8) > 2;
}

/**
 * Creating a WebGL context is expensive (hundreds of ms without a GPU), so this
 * probe only runs when the scene is about to start, never during page load.
 */
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('pending');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!wants3D()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time capability check after mount
      setMode('static');
      return;
    }
    // Load the scene on the first interaction, so page load and hydration never compete with it.
    const start = () => {
      cleanup();
      setMode(hasWebGL() ? '3d' : 'static');
    };
    const timer = setTimeout(start, IDLE_FALLBACK_MS);
    const cleanup = () => {
      clearTimeout(timer);
      WAKE_EVENTS.forEach((e) => window.removeEventListener(e, start));
    };
    WAKE_EVENTS.forEach((e) => window.addEventListener(e, start, { once: true, passive: true }));
    return cleanup;
  }, []);

  // Pause rendering while the hero is scrolled out of view or the tab is hidden.
  useEffect(() => {
    const el = ref.current;
    if (!el || mode !== '3d') return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && !document.hidden), {
      threshold: 0,
    });
    io.observe(el);
    const onVis = () => setVisible(!document.hidden && el.getBoundingClientRect().bottom > 0);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [mode]);

  return (
    <div ref={ref} aria-hidden className="absolute inset-0">
      {/* Static gradient: shown first, and kept on devices that skip WebGL. */}
      <div
        className={`absolute inset-[6%] rounded-full bg-[conic-gradient(from_210deg,rgb(var(--primary-rgb)/0.45),rgb(var(--secondary-rgb)/0.35),rgb(var(--primary-rgb)/0.1),rgb(var(--primary-rgb)/0.45))] blur-2xl transition-opacity duration-1000 ${
          mode === '3d' ? 'opacity-40' : 'opacity-70'
        }`}
      />
      {mode === '3d' && <HeroScene active={visible} />}
    </div>
  );
}
