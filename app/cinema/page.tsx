'use client';

// ═══════════ وضع السينما — لوحة عرض كبيرة (شاشة/تلفزيون) ═══════════
// كل حاجة بتحرك لوحدها — مناسبة للعرض على شاشة كبيرة

import { useEffect, useState } from 'react';

export default function CinemaPage() {
  const [sys, setSys] = useState<any>({});
  const [emps, setEmps] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [clock, setClock] = useState(new Date());

  const load = async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch('/api/system'),
        fetch('/api/company/leaderboard'),
        fetch('/api/notifications'),
      ]);
      const d1 = await r1.json();
      const d2 = await r2.json();
      const d3 = await r3.json();
      setSys({
        cpu: d1?.data?.cpu?.percent ?? d1?.data?.cpu,
        ram: d1?.data?.memory?.percent ?? d1?.data?.ram,
        disk: d1?.data?.disk?.percent ?? d1?.data?.disk,
      });
      const lb = d2?.data?.leaderboard ?? d2?.data ?? d2?.leaderboard ?? [];
      setEmps(Array.isArray(lb) ? lb : []);
      setNotifs(d3?.data?.items ?? d3?.items ?? []);
    } catch {}
  };

  useEffect(() => {
    load();
    const t = setInterval(() => {
      load();
      setClock(new Date());
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const bar = (pct: number, color: string) => (
    <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 999, height: 14, overflow: 'hidden', flex: 1 }}>
      <div
        style={{
          height: '100%',
          width: `${Math.min(100, pct)}%`,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          transition: 'width .8s ease',
        }}
      />
    </div>
  );

  return (
    <div
      className="anim-fade"
      style={{
        minHeight: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* ═══ الترويسة الكبيرة ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>🛰️ لوحة العرض</h1>
          <p style={{ color: 'var(--dim)', fontSize: 16, margin: '4px 0 0' }}>
            وضع السينما — بيحدث لوحده كل 5 ثواني
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
            {clock.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style={{ color: 'var(--dim)', fontSize: 14 }}>
            {clock.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* ═══ حالة السيرفر كبيرة ═══ */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,.15), rgba(168,85,247,.08))',
          border: '1px solid rgba(99,102,241,.35)',
          borderRadius: 20,
          padding: '24px 28px',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>🖥️ حالة السيرفر</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 70, fontWeight: 700 }}>CPU</span>
            {bar(sys.cpu ?? 0, '#6366f1')}
            <span style={{ width: 60, textAlign: 'end', fontVariantNumeric: 'tabular-nums' }}>{sys.cpu ?? '...'}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 70, fontWeight: 700 }}>RAM</span>
            {bar(sys.ram ?? 0, '#a855f7')}
            <span style={{ width: 60, textAlign: 'end', fontVariantNumeric: 'tabular-nums' }}>{sys.ram ?? '...'}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 70, fontWeight: 700 }}>Disk</span>
            {bar(sys.disk ?? 0, '#38bdf8')}
            <span style={{ width: 60, textAlign: 'end', fontVariantNumeric: 'tabular-nums' }}>{sys.disk ?? '...'}%</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        {/* ═══ المتصدرون ═══ */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(52,211,153,.1), rgba(16,185,129,.05))',
            border: '1px solid rgba(52,211,153,.3)',
            borderRadius: 20,
            padding: '24px 28px',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>🏆 المتصدرون</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {emps.slice(0, 5).map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16 }}>
                <span style={{ width: 36, fontWeight: 900, color: i < 3 ? '#fbbf24' : 'var(--dim)' }}>#{e.rank}</span>
                <span style={{ fontSize: 22 }}>{e.icon}</span>
                <b style={{ flex: 1 }}>{e.name}</b>
                <span style={{ color: 'var(--dim)' }}>{e.rank_name}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>⚡{e.xp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ آخر الإشعارات ═══ */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(56,189,248,.1), rgba(14,165,233,.05))',
            border: '1px solid rgba(56,189,248,.3)',
            borderRadius: 20,
            padding: '24px 28px',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>🔔 آخر الأخبار</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifs.length === 0 ? (
              <div style={{ color: 'var(--dim)', fontSize: 14 }}>مفيش إشعارات لسه</div>
            ) : (
              notifs.slice(0, 5).map((n, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14 }}>
                  <span style={{ fontSize: 18 }}>{n.icon || '📌'}</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{n.title}</div>
                    {n.body && <div style={{ color: 'var(--dim)', fontSize: 12.5, whiteSpace: 'pre-line' }}>{n.body}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
