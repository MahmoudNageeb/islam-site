'use client';

// ═══════════ Gamification — XP + مستويات + شارات + Confetti ═══════════

import { useEffect, useMemo, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import ProgressBar from '@/components/ui/ProgressBar';

// ─── المستويات ───
const LEVELS = [
  { name: 'زيرو', min: 0, icon: '🌱', color: '#94a3b8' },
  { name: 'طالب', min: 100, icon: '📖', color: '#38bdf8' },
  { name: 'محارب', min: 300, icon: '⚔️', color: '#f59e0b' },
  { name: 'مهندس', min: 700, icon: '⚙️', color: '#6366f1' },
  { name: 'أسطورة', min: 1500, icon: '👑', color: '#a855f7' },
];

// ─── الشارات ───
const BADGES = [
  { id: 'first', icon: '🎯', name: 'أول خطوة', desc: 'خلّصت أول مهمة' },
  { id: 'ten', icon: '🔥', name: 'عشر مهام', desc: '10 مهام منجزة' },
  { id: 'lead', icon: '👑', name: 'قائد', desc: 'وصلت لرتبة Lead' },
  { id: 'expert', icon: '🧠', name: 'خبير', desc: 'مهارة بمستوى خبير' },
  { id: 'builder', icon: '🏗️', name: 'باني', desc: 'أسست قسم' },
];

interface Emp {
  id: string;
  name: string;
  icon: string;
  xp: number;
  rank_name?: string;
  tasks_done?: number;
  capabilities?: { name: string; level: string }[];
}

export default function ProfilePage() {
  const [emps, setEmps] = useState<Emp[]>([]);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(false);
  const [selEmp, setSelEmp] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/company/leaderboard');
        const d = await r.json();
        const list = d?.data?.leaderboard ?? d?.data ?? d?.leaderboard ?? [];
        setEmps(Array.isArray(list) ? list : []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const active = useMemo(() => {
    const target = selEmp ? emps.find((e) => e.id === selEmp) : emps[0];
    return target || null;
  }, [emps, selEmp]);

  const levelInfo = useMemo(() => {
    if (!active) return null;
    const lv = [...LEVELS].reverse().find((l) => active.xp >= l.min) || LEVELS[0];
    const next = LEVELS.find((l) => l.min > active.xp);
    const curIdx = LEVELS.findIndex((l) => l.name === lv.name);
    const prevMin = LEVELS[Math.max(0, curIdx - 1)]?.min || 0;
    const pct = next
      ? Math.min(100, Math.round(((active.xp - lv.min) / (next.min - lv.min)) * 100))
      : 100;
    return { lv, next, pct, prevMin };
  }, [active]);

  const earnedBadges = useMemo(() => {
    if (!active) return [];
    const got = [];
    if ((active.tasks_done || 0) >= 1) got.push(BADGES[0]);
    if ((active.tasks_done || 0) >= 10) got.push(BADGES[1]);
    if (active.rank_name === 'Lead') got.push(BADGES[2]);
    if (active.capabilities?.some((c) => c.level === 'خبير')) got.push(BADGES[3]);
    return got;
  }, [active]);

  const celebrate = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2500);
  };

  return (
    <div className="anim-fade">
      {confetti && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: -20,
                width: 8,
                height: 14,
                borderRadius: 3,
                background: ['#6366f1', '#a855f7', '#38bdf8', '#f59e0b', '#34d399'][i % 5],
                animation: `confetti-fall ${1.5 + Math.random() * 2}s linear ${Math.random() * 0.5}s infinite`,
              }}
            />
          ))}
          <style>{`@keyframes confetti-fall { to { transform: translateY(110vh) rotate(720deg); } }`}</style>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>🎮 الإنجازات</h1>
        <button className="btn sm" onClick={celebrate}>🎉 احتفل</button>
      </div>
      <p style={{ color: 'var(--dim)', fontSize: 13, marginBottom: 18 }}>
        مستويات + شارات + XP — من بيانات الفريق الحقيقية
      </p>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : (
        <>
          {/* ═══ اختيار الموظف ═══ */}
          <div className="row mb" style={{ gap: 8, flexWrap: 'wrap' }}>
            {emps.map((e) => (
              <button
                key={e.id}
                className={`btn sm ${selEmp === e.id || (selEmp === null && e.id === emps[0]?.id) ? '' : 'ghost'}`}
                onClick={() => setSelEmp(e.id)}
              >
                {e.icon} {e.name}
              </button>
            ))}
          </div>

          {active && levelInfo && (
            <div className="grid cols-2 mb">
              {/* ═══ المستوى ═══ */}
              <GlassCard glow="primary">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${levelInfo.lv.color}33, transparent)`,
                      border: `2px solid ${levelInfo.lv.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 30,
                    }}
                  >
                    {levelInfo.lv.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>
                      {active.icon} {active.name}
                    </div>
                    <div style={{ color: levelInfo.lv.color, fontWeight: 700, fontSize: 14 }}>
                      {levelInfo.lv.name}
                    </div>
                    <div style={{ color: 'var(--dim)', fontSize: 12 }}>⚡ {active.xp} XP</div>
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <div className="row spread" style={{ marginBottom: 4, fontSize: 12 }}>
                    <span>{levelInfo.lv.name}</span>
                    {levelInfo.next && <span style={{ color: 'var(--dim)' }}>التالي: {levelInfo.next.name} ({levelInfo.next.min} XP)</span>}
                  </div>
                  <ProgressBar pct={levelInfo.pct} status="working" />
                </div>
              </GlassCard>

              {/* ═══ الشارات ═══ */}
              <GlassCard title={`🏅 الشارات (${earnedBadges.length}/${BADGES.length})`} glow="gold">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
                  {BADGES.map((b) => {
                    const got = earnedBadges.some((x) => x.id === b.id);
                    return (
                      <div
                        key={b.id}
                        style={{
                          background: got ? 'rgba(251,191,36,.1)' : 'var(--bg-card-solid)',
                          border: `1px solid ${got ? 'rgba(251,191,36,.4)' : 'var(--border)'}`,
                          borderRadius: 12,
                          padding: '10px 8px',
                          textAlign: 'center',
                          opacity: got ? 1 : 0.45,
                        }}
                        title={b.desc}
                      >
                        <div style={{ fontSize: 24 }}>{got ? b.icon : '🔒'}</div>
                        <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 4 }}>{b.name}</div>
                        <div style={{ fontSize: 9.5, color: 'var(--dim)', marginTop: 2 }}>{b.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>
          )}
        </>
      )}
    </div>
  );
}
