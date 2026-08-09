'use client';

// ═══════════ Guardian — مراقبة النظام الذاتية ═══════════

import { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import ProgressBar from '@/components/ui/ProgressBar';

export default function GuardianPage() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch('/api/guardian');
        const json = await res.json();
        setState(json.data);
      } catch {}
      setLoading(false);
    };
    fetchState();
    const t = setInterval(fetchState, 15000); // تحديث كل 15 ثانية
    return () => clearInterval(t);
  }, []);

  if (loading) return <div className="loading">بيجيب حالة الجارديان...</div>;
  if (!state) return <GlassCard glow="red" style={{ textAlign: 'center', padding: 30 }}>❌ الجارديان مش شغال أو ملف الحالة مش موجود</GlassCard>;

  const stats = state.stats || {};
  const lastCheck = state.last_check || {};
  const heals = (state.heal_history || []).slice(-10).reverse();
  const checkins = (state.checkin_history || []).slice(-5).reverse();

  const fmtTime = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch { return '—'; }
  };

  return (
    <div className="anim-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>🤖 الجارديان</h1>
        <span className="badge green" style={{ fontSize: 12 }}>
          🟢 شغال · فاصل {state.adaptive_interval || 30} ثانية
        </span>
      </div>
      <p style={{ color: 'var(--dim)', fontSize: 12.5, marginTop: 0 }}>مراقبة ذاتية — يصلح المشاكل لوحده ويبعتلك النتيجة</p>

      {/* ═══ Radar حي ═══ */}
      <GlassCard title="🛰️ رادار النظام — فحص حي للخدمات" className="mb" glow="accent" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div className="radar" style={{ flexShrink: 0 }}>
          {(state.services || []).map((s: any, i: number) => {
            const ok = s.status !== 'down' && s.status !== 'error';
            const angle = (i / Math.max((state.services || []).length, 1)) * 360;
            const radius = 34 + (i % 3) * 22;
            const rad = (angle * Math.PI) / 180;
            return (
              <span
                key={s.name || i}
                className={`radar-dot ${ok ? 'ok' : 'bad'}`}
                style={{
                  left: `${50 + (radius * Math.cos(rad)) / 2.4}%`,
                  top: `${50 + (radius * Math.sin(rad)) / 2.4}%`,
                  animationDelay: `${i * 0.18}s`,
                }}
                title={s.name}
              />
            );
          })}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>حالة الخدمات</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(state.services || []).map((s: any) => (
              <div key={s.name} className="row spread" style={{ fontSize: 12.5 }}>
                <span style={{ color: 'var(--dim)' }}>{s.name}</span>
                <b style={{ color: s.status === 'down' || s.status === 'error' ? 'var(--red)' : 'var(--green)' }}>
                  {s.status === 'down' || s.status === 'error' ? '● واقع' : '● شغال'}
                </b>
              </div>
            ))}
            {(state.services || []).length === 0 && <div style={{ color: 'var(--dim)', fontSize: 12.5 }}>مفيش بيانات خدمات...</div>}
          </div>
        </div>
      </GlassCard>

      {/* ═══ إحصائيات ═══ */}
      <div className="grid cols-4 mb" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <GlassCard glow="primary" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{stats.total_checks || 0}</div>
          <div style={{ fontSize: 12, color: 'var(--dim)' }}>فحص</div>
        </GlassCard>
        <GlassCard glow="green" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--green)' }}>{stats.successful_heals || 0}</div>
          <div style={{ fontSize: 12, color: 'var(--dim)' }}>إصلاح ناجح</div>
        </GlassCard>
        <GlassCard glow="red" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--red)' }}>{stats.failed_heals || 0}</div>
          <div style={{ fontSize: 12, color: 'var(--dim)' }}>إصلاح فاشل</div>
        </GlassCard>
        <GlassCard glow="accent" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary-light)' }}>{stats.checkins_sent || 0}</div>
          <div style={{ fontSize: 12, color: 'var(--dim)' }}>Check-in</div>
        </GlassCard>
      </div>

      {/* ═══ آخر فحص ═══ */}
      <GlassCard title="🕐 آخر فحص للنظام" className="mb">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
          {Object.entries(lastCheck).map(([k, v]) => (
            <div key={k} className="row spread" style={{ background: 'var(--bg-card-solid)', borderRadius: 8, padding: '7px 10px', fontSize: 12 }}>
              <span style={{ color: 'var(--dim)' }}>{k}</span>
              <span>{fmtTime(v as string)}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ═══ سجل الإصلاحات ═══ */}
      <GlassCard title="🔧 سجل الإصلاحات" className="mb">
        {heals.length === 0 ? (
          <div className="loading">مفيش إصلاحات لسه</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {heals.map((h: any, i: number) => (
              <div key={i} className="row spread" style={{ padding: '8px 10px', borderRadius: 8, background: h.success ? 'rgba(52,211,153,.06)' : 'rgba(248,113,113,.06)', border: `1px solid ${h.success ? 'rgba(52,211,153,.2)' : 'rgba(248,113,113,.2)'}`, fontSize: 12.5 }}>
                <span>{h.success ? '✅' : '❌'} {h.details}</span>
                <span style={{ color: 'var(--dim)', fontSize: 11 }}>{fmtTime(h.time)}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* ═══ Check-ins ═══ */}
      <GlassCard title="📊 Check-ins الأخيرة" glow="accent">
        {checkins.length === 0 ? (
          <div className="loading">لسه مفيش check-ins</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {checkins.map((c: any, i: number) => (
              <div key={i} style={{ background: 'var(--bg-card-solid)', borderRadius: 10, padding: '10px 12px', fontSize: 12, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {c.summary}
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
