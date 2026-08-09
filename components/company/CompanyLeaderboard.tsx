'use client';

// ═══════ CompanyLeaderboard — المتصدرون (عرض فقط) ═══════

interface Emp {
  id: string;
  name: string;
  icon: string;
  role?: string;
  rank_name?: string;
  rank_icon?: string;
  xp?: number;
  status?: string;
  tasks_done?: number;
  tasks_failed?: number;
  success_rate?: number;
  balance?: number;
}

interface Props {
  employees: Emp[];
}

const RANK_COLORS: Record<string, string> = {
  'Lead': '#ffd740', 'Senior': '#00e5ff', 'Mid': '#00e676', 'Junior': '#9e9e9e', 'متدرب': '#9e9e9e',
};

const MEDALS = ['🥇', '🥈', '🥉'];

export default function CompanyLeaderboard({ employees }: Props) {
  const sorted = [...employees].sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const maxXp = Math.max(...sorted.map((e) => e.xp || 0), 1);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <b style={{ fontSize: 14 }}>🏆 المتصدرون</b>
        <span style={{ fontSize: 10.5, color: 'var(--dim-2)' }}>حسب الـ XP</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((e, i) => {
          const color = RANK_COLORS[e.rank_name || ''] || '#00e5ff';
          const pct = Math.round(((e.xp || 0) / maxXp) * 100);
          const sr = e.success_rate ?? 0;
          return (
            <div
              key={e.id}
              style={{
                padding: '9px 12px', borderRadius: 10,
                background: 'var(--bg-soft)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 17, width: 26, textAlign: 'center' }}>{MEDALS[i] || `${i + 1}`}</span>
              <span style={{ fontSize: 19 }}>{e.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <b style={{ fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</b>
                  {e.rank_name && (
                    <span style={{ fontSize: 9.5, fontWeight: 800, padding: '1px 6px', borderRadius: 5, color, background: `${color}14`, border: `1px solid ${color}30`, whiteSpace: 'nowrap' }}>
                      {e.rank_icon} {e.rank_name}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                  <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 3,
                      background: `linear-gradient(90deg, ${color}88, ${color})`,
                      boxShadow: `0 0 8px ${color}55`,
                      transition: 'width 0.6s var(--ease)',
                    }} />
                  </div>
                  <span style={{ fontSize: 10.5, color: '#ffd740', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>⚡{e.xp}</span>
                </div>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: sr >= 85 ? '#00e676' : sr >= 60 ? '#ffd740' : '#ff5252', fontFamily: 'var(--font-mono)' }}>{sr}%</div>
                <div style={{ fontSize: 9, color: 'var(--dim-2)' }}>نجاح</div>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0, display: 'none', '@media (min-width: 480px)': { display: 'block' } } as any}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{e.tasks_done || 0}</div>
                <div style={{ fontSize: 9, color: 'var(--dim-2)' }}>مهام</div>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && <div className="loading">مفيش موظفين — النظام لسه بيجهز...</div>}
      </div>
    </div>
  );
}
