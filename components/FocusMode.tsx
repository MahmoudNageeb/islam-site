'use client';

// ═══════════ FocusMode — وضع التركيز + بومودورو (25/5) ═══════════

import { useEffect, useRef, useState } from 'react';

interface FocusModeProps {
  open: boolean;
  taskTitle?: string;
  onClose: () => void;
}

export default function FocusMode({ open, taskTitle, onClose }: FocusModeProps) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [work, setWork] = useState(true);
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (open) {
      setSeconds(25 * 60);
      setRunning(false);
      setWork(true);
      notifiedRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!running || !open) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          // خلصنا الجلسة
          setRunning(false);
          if (!notifiedRef.current) {
            notifiedRef.current = true;
            const phase = work ? 'راحة' : 'شغل';
            try {
              // toast بسيط
              const el = document.createElement('div');
              el.className = 'hud-toast good';
              el.textContent = work ? '🍅 جلسة الشغل خلصت! خد 5 دقايق راحة' : '⚡ الراحة خلصت — نرجع نشتغل!';
              const wrap = document.querySelector('.hud-toast-wrap') || document.body;
              wrap.appendChild(el);
              setTimeout(() => el.remove(), 4000);
              // إشعار تيليجرام
              fetch('/study/api/telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'notify', text: `🍅 خلصت جلسة ${work ? 'شغل' : 'راحة'} 25 دقيقة!` }),
              }).catch(() => {});
            } catch {}
            // بدّل المرحلة
            const nextWork = !work;
            setWork(nextWork);
            setSeconds(nextWork ? 25 * 60 : 5 * 60);
            notifiedRef.current = false;
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, work, open]);

  if (!open) return null;

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const pct = work ? (seconds / (25 * 60)) * 100 : (seconds / (5 * 60)) * 100;

  return (
    <div className="focus-overlay">
      <button className="focus-close" onClick={onClose} title="خروج (Esc)">✕</button>
      <div className="focus-phase">{work ? '● FOCUS — شغل' : '○ BREAK — راحة'}</div>
      {taskTitle && <div className="focus-title">🎯 {taskTitle}</div>}
      <div className="focus-timer">{mm}:{ss}</div>
      <div style={{ width: 'min(380px, 80vw)', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #00e5ff, #2979ff)', transition: 'width 1s linear', boxShadow: '0 0 12px rgba(0,229,255,0.4)' }} />
      </div>
      <div className="focus-controls">
        <button className="btn" onClick={() => setRunning(!running)}>
          {running ? '⏸ إيقاف مؤقت' : '▶️ ابدأ'}
        </button>
        <button className="btn ghost" onClick={() => { setSeconds(work ? 25 * 60 : 5 * 60); setRunning(false); }}>
          🔄 إعادة
        </button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--dim-2)', fontFamily: 'var(--font-mono)' }}>
        {work ? '25 دقيقة شغل → 5 راحة' : '5 دقايق راحة → 25 شغل'}
      </div>
    </div>
  );
}
