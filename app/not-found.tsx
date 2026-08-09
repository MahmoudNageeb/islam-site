'use client';

// ═══════════ 404 — ضعت في الفضاء 🌌 ═══════════

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotFound() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center', gap: 18 }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'clamp(72px, 18vw, 150px)',
        fontWeight: 800,
        color: 'var(--primary)',
        textShadow: '0 0 40px rgba(0,229,255,.35), 0 0 80px rgba(0,229,255,.15)',
        lineHeight: 1,
        letterSpacing: '-4px',
      }}>404</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-strong)' }}>
        🌌 ضعت في الفضاء يا قائد
      </div>
      <p style={{ color: 'var(--dim)', fontSize: 13.5, maxWidth: 360 }}>
        الصفحة اللي بتدور عليها مش موجودة — أو اتغير مكانها.
        <br />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--dim-2)' }}>
          SYSTEM.LOG: page_not_found · {seconds}s في الفضاء
        </span>
      </p>
      <div className="row" style={{ gap: 10, marginTop: 8 }}>
        <Link href="/" className="btn">🏠 ارجع للرئيسية</Link>
        <Link href="/study" className="btn ghost">📚 مهامي</Link>
      </div>
    </div>
  );
}
