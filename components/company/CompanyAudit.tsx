'use client';

// ═══════ CompanyAudit — السجل: أحداث + audit + سوق ═══════

interface AuditItem {
  time: string;
  action: string;
  detail: string;
}

interface Event {
  id: string;
  title: string;
  desc?: string;
  penalty?: number;
  bonus?: number;
  action?: string;
  started?: string;
}

interface Cand {
  id: string;
  name: string;
  icon: string;
  role?: string;
  capabilities?: string[];
  salary?: number;
  expires?: string;
}

interface Props {
  audit: AuditItem[];
  events: {
    active?: Event | null;
    history?: Event[];
  } | null;
  market: Cand[];
}

const ACTION_ICONS: Record<string, string> = {
  hire: '🤝', fire: '🚪', train: '📚', promote: '🏆', market: '🆕', salaries: '💰', event: '⚡',
  compete: '🎯', reinstate: '🔄', xp: '⚡', department: '📂', 'owner-task': '📋',
};

export default function CompanyAudit({ audit, events, market }: Props) {
  const items = [...audit].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* الحدث النشط */}
      {events?.active && (
        <div className="card" style={{ borderColor: 'rgba(255,215,64,0.3)', background: 'linear-gradient(135deg, rgba(255,215,64,0.06), transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>⚡</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#ffd740' }}>{events.active.title}</div>
              {events.active.desc && <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 3, lineHeight: 1.7 }}>{events.active.desc}</div>}
              {events.active.started && (
                <div style={{ fontSize: 9.5, color: 'var(--dim-2)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                  بدأ {new Date(events.active.started).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              {events.active.bonus ? (
                <>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#00e676', fontFamily: 'var(--font-mono)' }}>+{events.active.bonus}</div>
                  <div style={{ fontSize: 9, color: 'var(--dim)' }}>مكافأة</div>
                </>
              ) : events.active.penalty ? (
                <>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#ff5252', fontFamily: 'var(--font-mono)' }}>-{events.active.penalty}</div>
                  <div style={{ fontSize: 9, color: 'var(--dim)' }}>غرامة</div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* السجل الكامل */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <b style={{ fontSize: 14 }}>📜 سجل النشاط</b>
          <span style={{ fontSize: 10.5, color: 'var(--dim-2)' }}>{items.length} حدث</span>
        </div>
        {items.length === 0 ? (
          <div className="loading">مفيش أحداث مسجلة</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 520, overflowY: 'auto', paddingInlineEnd: 4 }}>
            {items.map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '7px 9px', borderRadius: 8,
                alignItems: 'flex-start', fontSize: 11.5,
                background: i % 2 === 0 ? 'var(--bg-soft)' : 'transparent',
              }}>
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{ACTION_ICONS[a.action] || '📌'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ lineHeight: 1.6 }}>{a.detail}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--dim-2)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {new Date(a.time).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })} · {new Date(a.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
