'use client';

// ═══════════ BootScreen — شاشة إقلاع «ISLAM OS» (مرة واحدة) ═══════════

import { useEffect, useState } from 'react';

export default function BootScreen() {
  const [hidden, setHidden] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // شغال مرة واحدة بس (localStorage)
    try {
      if (localStorage.getItem('islam_booted') === '1') {
        setHidden(true);
        setGone(true);
        return;
      }
    } catch {}
    const t1 = setTimeout(() => setHidden(true), 2100);
    const t2 = setTimeout(() => {
      setGone(true);
      try { localStorage.setItem('islam_booted', '1'); } catch {}
    }, 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (gone) return null;

  return (
    <div className={`boot-screen ${hidden ? 'hidden' : ''}`}>
      <div className="boot-logo">ISLAM OS</div>
      <div className="boot-sub">SYSTEM BOOTING — V6.0.0</div>
      <div className="boot-bar" />
      <div className="boot-sub" style={{ marginTop: 18, fontSize: 10, opacity: 0.5 }}>
        {new Date().toLocaleTimeString('en-GB')} · JARVIS EDITION
      </div>
    </div>
  );
}
