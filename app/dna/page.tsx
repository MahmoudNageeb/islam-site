'use client';

// ═══════════ DNA — شخصيتك الرقمية: تحليلات + عادات ═══════════

import { useEffect, useMemo, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import ProgressBar from '@/components/ui/ProgressBar';

interface Emp {
  name: string;
  role: string;
  icon: string;
  xp: number;
  rank_name?: string;
  tasks_done?: number;
  tasks_failed?: number;
  capabilities?: { name: string; level: string }[];
}

interface Audit {
  time: string;
  detail: string;
}

export default function DnaPage() {
  const [emps, setEmps] = useState<Emp[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch('/api/company/leaderboard'),
          fetch('/api/company/audit'),
        ]);
        const d1 = await r1.json();
        const d2 = await r2.json();
        setEmps((d1?.data?.leaderboard ?? d1?.data ?? d1?.leaderboard ?? []) || []);
        setAudit((d2?.data?.audit ?? d2?.data ?? d2?.audit ?? []) || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const totalXp = emps.reduce((s, e) => s + (e.xp || 0), 0);
    const totalDone = emps.reduce((s, e) => s + (e.tasks_done || 0), 0);
    const totalFail = emps.reduce((s, e) => s + (e.tasks_failed || 0), 0);
    const top = [...emps].sort((a, b) => (b.xp || 0) - (a.xp || 0))[0];
    return { totalXp, totalDone, totalFail, top };
  }, [emps]);

  // أفضل الأوقات (من السجل)
  const hourBins = useMemo(() => {
    const bins: Record<number, number> = {};
    audit.forEach((a) => {
      const h = new Date(a.time).getHours();
      bins[h] = (bins[h] || 0) + 1;
    });
    return bins;
  }, [audit]);

  const bestHour = Object.entries(hourBins).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="anim-fade">
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>🧬 DNA</h1>
      <p style={{ color: 'var(--dim)', fontSize: 13, marginBottom: 18 }}>
        شخصيتك الرقمية — من بياناتك الحقيقية (الشركة + السجل)
      </p>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : (
        <>
          {/* ═══ البطاقات الرئيسية ═══ */}
          <div className="grid cols-4 mb">
            <GlassCard title="⚡ إجمالي XP" glow="primary">
              <div className="card-value">{stats.totalXp.toLocaleString('ar-EG')}</div>
              <div className="card-sub">خبرة الفريق كلها</div>
            </GlassCard>
            <GlassCard title="✅ مهام نجحت" glow="green">
              <div className="card-value">{stats.totalDone}</div>
              <div className="card-sub">مهمة منجزة</div>
            </GlassCard>
            <GlassCard title="❌ مهام فشلت" glow="red">
              <div className="card-value">{stats.totalFail}</div>
              <div className="card-sub">فرص للتعلم</div>
            </GlassCard>
            <GlassCard title="🏆 الأفضل" glow="gold">
              <div className="card-value" style={{ fontSize: 18 }}>{stats.top?.icon} {stats.top?.name}</div>
              <div className="card-sub">{stats.top?.rank_name} · ⚡{stats.top?.xp}</div>
            </GlassCard>
          </div>

          {/* ═══ الأوقات الذهبية ═══ */}
          <div className="grid cols-2 mb">
            <GlassCard title="⏰ أوقات نشاطك (من السجل)" glow="accent">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 110 }}>
                {Array.from({ length: 24 }).map((_, h) => {
                  const v = hourBins[h] || 0;
                  const max = Math.max(1, ...Object.values(hourBins));
                  return (
                    <div key={h} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <div
                        style={{
                          width: '100%',
                          height: `${(v / max) * 80}px`,
                          background: v > 0 ? 'linear-gradient(180deg,#6366f1,#a855f7)' : 'rgba(99,138,255,.08)',
                          borderRadius: '4px 4px 0 0',
                          minHeight: 3,
                        }}
                      />
                      {h % 4 === 0 && <span style={{ fontSize: 9, color: 'var(--dim)' }}>{h}</span>}
                    </div>
                  );
                })}
              </div>
              {bestHour && (
                <div style={{ marginTop: 12, fontSize: 13 }}>
                  💡 أكثر وقت نشاط: <b style={{ color: 'var(--primary-light)' }}>{bestHour[0]}:00</b> ({bestHour[1]} عملية) — ده وقتك الذهبي للشغل العميق
                </div>
              )}
            </GlassCard>

            <GlassCard title="📈 توزيع المهارات" glow="primary">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {emps.slice(0, 5).map((e) => {
                  const skills = e.capabilities?.length || 0;
                  const pct = Math.min(100, Math.round((skills / 5) * 100));
                  return (
                    <div key={e.name}>
                      <div className="row spread" style={{ marginBottom: 4, fontSize: 12.5 }}>
                        <span>{e.icon} {e.name}</span>
                        <span style={{ color: 'var(--dim)' }}>{skills} مهارة</span>
                      </div>
                      <ProgressBar pct={pct} size="sm" status="working" />
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}
