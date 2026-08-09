'use client';

// ═══════ CompanyMarket — سوق التوظيف (عرض فقط) ═══════

interface Cand {
  id: string;
  name: string;
  icon: string;
  role?: string;
  capabilities?: string[];
  skills_count?: number;
  rank?: string;
  salary?: number;
  expires?: string;
  trial_task?: string;
  source?: string;
}

interface Props {
  market: Cand[];
}

export default function CompanyMarket({ market }: Props) {
  if (market.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 30 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🎪</div>
        <div style={{ fontSize: 13.5, color: 'var(--dim)' }}>السوق فاضي دلوقتي — السوق الجديد هيظهر يوم الجمعة</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <b style={{ fontSize: 14 }}>🎪 سوق التوظيف</b>
        <span style={{ fontSize: 10.5, color: 'var(--dim-2)' }}>{market.length} مرشحين متاحين</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {market.map((c) => (
          <div key={c.id} style={{
            padding: '12px 14px', borderRadius: 11,
            background: 'var(--bg-soft)', border: '1px solid var(--border)',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21,
              background: 'linear-gradient(135deg, rgba(0,229,255,0.14), rgba(41,121,255,0.05))',
              border: '1px solid rgba(0,229,255,0.25)',
            }}>
              {c.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                <b style={{ fontSize: 13 }}>{c.name}</b>
                <span style={{ fontSize: 10, color: 'var(--dim)' }}>{c.role}</span>
                {c.rank && (
                  <span style={{ fontSize: 9.5, fontWeight: 700, padding: '1px 6px', borderRadius: 5, color: '#ffd740', background: 'rgba(255,215,64,0.1)', border: '1px solid rgba(255,215,64,0.25)' }}>
                    {c.rank}
                  </span>
                )}
              </div>
              {c.capabilities && c.capabilities.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 7 }}>
                  {c.capabilities.slice(0, 5).map((s, i) => (
                    <span key={i} style={{ fontSize: 9.5, padding: '2px 7px', borderRadius: 5, background: 'rgba(0,229,255,0.07)', color: '#7fd8e6', border: '1px solid rgba(0,229,255,0.15)' }}>
                      {s}
                    </span>
                  ))}
                  {(c.skills_count || c.capabilities.length) > 5 && (
                    <span style={{ fontSize: 9.5, color: 'var(--dim-2)', alignSelf: 'center' }}>+{(c.skills_count || c.capabilities.length) - 5}</span>
                  )}
                </div>
              )}
              {c.trial_task && (
                <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 7, lineHeight: 1.6 }}>
                  📋 {c.trial_task.length > 90 ? c.trial_task.slice(0, 90) + '...' : c.trial_task}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 10, color: 'var(--dim-2)' }}>
                {c.salary && <span>💰 {c.salary} XPC/شهر</span>}
                {c.expires && <span>⏳ ينتهي {new Date(c.expires).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
