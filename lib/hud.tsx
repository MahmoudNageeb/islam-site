'use client';

// ═══════════ HUD Utilities — عدادات حية + Typewriter ═══════════

import { useEffect, useRef, useState } from 'react';

// ═══ HUD Counter — رقم بيعد من 0 للقيمة الحقيقية ═══
// الاستخدام: const count = useHudCount(5110, 1200);  → 0 → 5110
export function useHudCount(target: number, duration = 1000, enabled = true) {
  const [value, setValue] = useState(enabled ? 0 : target);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!enabled) { setValue(target); return; }
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // ease-out: 1 - (1-p)^3
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, enabled]);

  return value;
}

// ═══ HUDNumber — مكوّن جاهز (رقم بعد + حركة) ═══
export function HUDNumber({ value, duration = 1000, suffix = '', prefix = '' }: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) {
  const count = useHudCount(value, duration);
  return (
    <span className="hud-num">
      {prefix}{count.toLocaleString('en-US')}{suffix}
    </span>
  );
}

// ═══ Typewriter — نص بيظهر حرف بحرف ═══
export function useTypewriter(text: string, speed = 14, enabled = true) {
  const [out, setOut] = useState('');
  const idxRef = useRef(0);

  useEffect(() => {
    if (!enabled) { setOut(text); return; }
    idxRef.current = 0;
    setOut('');
    const t = setInterval(() => {
      idxRef.current += 1;
      setOut(text.slice(0, idxRef.current));
      if (idxRef.current >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed, enabled]);

  return out;
}
