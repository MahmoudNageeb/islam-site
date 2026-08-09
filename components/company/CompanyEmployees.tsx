'use client';

// ═══════ CompanyEmployees — بطاقات الموظفين (عرض فقط) ═══════

interface Cap { name: string; level?: string; type?: string }

interface Emp {
  id: string;
  name: string;
  icon: string;
  role?: string;
  rank_name?: string;
  rank_icon?: string;
  xp?: number;
  balance?: number;
  status?: string;
  tasks_done?: number;
  tasks_failed?: number;
  success_rate?: number;
  warnings?: number;
  probation?: boolean;
  capabilities?: Cap[];
}

interface Props {
  employees: Emp[];
}

const RANK_COLORS: Record<string, string> = {
  'Lead': '#ffd740', 'Senior': '#00e5ff', 'Mid': '#00e676', 'Junior': '#9e9e9e', 'متدرب': '#9e9e9e',
};

const LEVEL_COLORS: Record<string, string> = {
  'متقدم': '#00e5ff', 'متوسط': '#ffd740', 'مبتدئ': '#00e676',
};

export default function CompanyEmployees({ employees }: Props) {
  const sorted = [...employees].sort((a, b) => (b.xp || 0) - (a.xp || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <b style={{ fontSize: 15 }}>👥 الموظفون ({employees.length})</b>
        <span style={{ fontSize: 11, color: 'var(--dim)' }}>ترتيب حسب الـ XP</span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {sorted.map((e) => {
          const rc = RANK_COLORS[e.rank_name || ''] || '#00e5ff';
          const sr = e.success_rate ?? 0;
          const caps = e.capabilities || [];
          return (
            <div key={e.id} className="card" style={{ padding: '16px', borderColor: e.status === 'active' ? `${rc}30` : 'rgba(255,255,255,0.06)', opacity: e.status === 'active' ? 1 : 0.55 }}>
              {/* الرأس */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  background: `linear-gradient(135deg, ${rc}18, ${rc}05)`,
                  border: `1px solid ${rc}35`,
                }}>
                  {e.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <b style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</b>
                    {e.probation && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'rgba(255,215,64,0.12)', color: '#ffd740', border: '1px solid rgba(255,215,64,0.25)' }}>تحت الاختبار</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.role}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 800, padding: '1px 6px', borderRadius: 5, color: rc, background: `${rc}14`, border: `1px solid ${rc}30` }}>
                      {e.rank_icon} {e.rank_name || '—'}
                    </span>
                    <span style={{
                      fontSize: 9.5, fontWeight: 700, padding: '1px 6px', borderRadius: 5,
                      color: e.status === 'active' ? '#00e676' : '#ff5252',
                      background: e.status === 'active' ? 'rgba(0,230,118,0.1)' : 'rgba(255,82,82,0.1)',
                      border: `1px solid ${e.status === 'active' ? 'rgba(0,230,118,0.25)' : 'rgba(255,82,82,0.25)'}`,
                    }}>
                      {e.status === 'active' ? '🟢 نشط' : '⚫ موقوف'}
                    </span>
                  </div>
                </div>
              </div>

              {/* الإحصائيات */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
                <div style={{ textAlign: 'center', padding: '7px 4px', borderRadius: 8, background: 'rgba(255,215,64,0.06)', border: '1px solid rgba(255,215,64,0.12)' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#ffd740', fontFamily: 'var(--font-mono)' }}>⚡{e.xp}</div>
                  <div style={{ fontSize: 8.5, color: 'var(--dim)' }}>XP</div>
                </div>
                <div style={{ textAlign: 'center', padding: '7px 4px', borderRadius: 8, background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.12)' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#00e676', fontFamily: 'var(--font-mono)' }}>{sr}%</div>
                  <div style={{ fontSize: 8.5, color: 'var(--dim)' }}>نجاح</div>
                </div>
                <div style={{ textAlign: 'center', padding: '7px 4px', borderRadius: 8, background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#00e5ff', fontFamily: 'var(--font-mono)' }}>{e.tasks_done || 0}</div>
                  <div style={{ fontSize: 8.5, color: 'var(--dim)' }}>مهام</div>
                </div>
              </div>

              {/* المهارات */}
              {caps.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {caps.slice(0, 6).map((c, i) => {
                    const lvl = c.level || '';
                    const lc = LEVEL_COLORS[lvl] || '#9e9e9e';
                    return (
                      <span key={i} style={{
                        fontSize: 9.5, padding: '3px 8px', borderRadius: 6,
                        background: `${lc}0d`, color: lc, border: `1px solid ${lc}25`,
                      }}>
                        {c.name}{lvl ? ` · ${lvl}` : ''}
                      </span>
                    );
                  })}
                  {caps.length > 6 && <span style={{ fontSize: 9.5, color: 'var(--dim-2)', alignSelf: 'center' }}>+{caps.length - 6}</span>}
                </div>
              )}

              {/* إنذارات */}
              {(e.warnings || 0) > 0 && (
                <div style={{ marginTop: 10, fontSize: 10, color: '#ff5252', display: 'flex', alignItems: 'center', gap: 5 }}>
                  ⚠️ {e.warnings} إنذار{e.warnings > 1 ? 'ات' : ''}
                </div>
              )}
            </div>
          );
        })}
        {sorted.length === 0 && <div className="loading">مفيش موظفين — النظام لسه بيجهز...</div>}
      </div>
    </div>
  );
}
