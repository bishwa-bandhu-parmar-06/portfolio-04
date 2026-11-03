'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

// three.js (~150 KB gzipped) is only downloaded on capable devices, after the page is interactive.
const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false, loading: () => null });

type Mode = 'pending' | 'static' | '3d';

/** Decide whether this device should get the WebGL scene or the static gradient. */
function canRender3D(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return false;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const lowPower = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  if (coarse && lowPower) return false;
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
    // Wait for an idle moment so the scene never competes with the first paint.
    const decide = () => setMode(canRender3D() ? '3d' : 'static');
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(decide, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(decide, 300);
    return () => clearTimeout(t);
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
