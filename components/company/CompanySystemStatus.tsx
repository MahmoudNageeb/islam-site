'use client';

// ═══════ CompanySystemStatus — حالة المنظومة (أضواء حية) ═══════

interface Props {
  guardian: any;
  connected: boolean;
}

export default function CompanySystemStatus({ guardian, connected }: Props) {
  const checks = guardian?.last_check || {};
  const services = [
    { key: 'service_dashboard', label: 'الداشبورد', icon: '🖥️' },
    { key: 'service_islam_site', label: 'موقع إسلام', icon: '🌐' },
    { key: 'service_hermes_serve', label: 'Hermes Serve', icon: '🤖' },
    { key: 'tunnel_islam_site', label: 'تانل الموقع', icon: '🔗' },
    { key: 'tunnel_company', label: 'تانل الشركة', icon: '🔗' },
    { key: 'device_phone', label: 'التلفون', icon: '📱' },
    { key: 'device_tablet', label: 'التابلت', icon: '📲' },
    { key: 'disk', label: 'القرص', icon: '💾' },
    { key: 'ram', label: 'الذاكرة', icon: '🧠' },
    { key: 'cpu', label: 'المعالج', icon: '⚙️' },
  ];

  // حد أقصى: 30 ثانية من آخر فحص = أخضر
  const isFresh = (key: string) => {
    const t = checks[key];
    if (!t) return false;
    const age = Date.now() - new Date(t).getTime();
    return age < 60_000;
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <b style={{ fontSize: 14 }}>🛰️ حالة المنظومة</b>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: 'var(--dim)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#00e676' : '#ff5252', boxShadow: connected ? '0 0 8px #00e676' : '0 0 8px #ff5252', animation: connected ? 'pulse-dot 2s infinite' : 'none' }} />
          {connected ? 'متصل' : 'منقطع'}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
        {services.map((s) => {
          const fresh = isFresh(s.key);
          const hasCheck = !!checks[s.key];
          const status = !hasCheck ? 'none' : fresh ? 'ok' : 'stale';
          const color = status === 'ok' ? '#00e676' : status === 'stale' ? '#ffd740' : '#666';
          return (
            <div key={s.key} style={{
              padding: '9px 10px', borderRadius: 9,
              background: 'var(--bg-soft)', border: `1px solid ${color}22`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 15 }}>{s.icon}</span>
              <span style={{ fontSize: 10.5, fontWeight: 600, flex: 1 }}>{s.label}</span>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: color, boxShadow: `0 0 8px ${color}aa`,
                animation: status === 'ok' ? 'pulse-dot 2s infinite' : 'none',
              }} />
            </div>
          );
        })}
      </div>
      {guardian?.heal_history && guardian.heal_history.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 10.5, color: 'var(--dim-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🔧 آخر إصلاح:</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{guardian.heal_history[guardian.heal_history.length - 1].type.replace('heal_', '')}</span>
          <span>·</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{new Date(guardian.heal_history[guardian.heal_history.length - 1].time).toLocaleTimeString('ar-EG')}</span>
        </div>
      )}
    </div>
  );
}
