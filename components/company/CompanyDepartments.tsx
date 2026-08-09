'use client';

// ═══════ CompanyDepartments — الأقسام (عرض فقط) ═══════

interface Member {
  id: string;
  name: string;
  icon: string;
  rank?: string;
  xp?: number;
  capabilities?: any[];
}

interface Dept {
  id: string;
  name: string;
  icon?: string;
  desc?: string;
  manager?: string;
  employees?: string[];
  members?: Member[];
  created?: string;
}

interface Emp {
  id: string;
  name: string;
  icon: string;
}

interface Props {
  departments: Dept[];
  employees: Emp[];
}

export default function CompanyDepartments({ departments, employees }: Props) {
  if (departments.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 30 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🏢</div>
        <div style={{ fontSize: 13.5, color: 'var(--dim)' }}>مفيش أقسام — قول لإسلام في تيليجرام «أنشئ قسم جديد»</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <b style={{ fontSize: 15 }}>🏢 الأقسام ({departments.length})</b>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {departments.map((d) => {
          const members = d.members || [];
          const manager = members.find((m) => m.id === d.manager) || members[0];
          const rest = members.filter((m) => m !== manager);
          return (
            <div key={d.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 24 }}>{d.icon}</span>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: 14 }}>{d.name}</b>
                  <div style={{ fontSize: 10.5, color: 'var(--dim)', marginTop: 2 }}>{d.desc || ''}</div>
                </div>
                <span style={{ fontSize: 10.5, color: 'var(--dim)', background: 'var(--bg-soft)', padding: '3px 9px', borderRadius: 7, border: '1px solid var(--border)' }}>
                  {members.length} عضو
                </span>
              </div>

              {/* المدير */}
              {manager && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '8px 10px', borderRadius: 9, background: 'rgba(255,215,64,0.05)', border: '1px solid rgba(255,215,64,0.15)' }}>
                  <span style={{ fontSize: 11 }}>👔</span>
                  <span style={{ fontSize: 18 }}>{manager.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{manager.name}</div>
                    <div style={{ fontSize: 9.5, color: 'var(--dim)' }}>مدير القسم</div>
                  </div>
                  {manager.rank && <span style={{ fontSize: 10, color: 'var(--dim)' }}>{manager.rank}</span>}
                </div>
              )}

              {/* الأعضاء */}
              {rest.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {rest.map((m) => (
                    <div key={m.id} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 9px', borderRadius: 8, fontSize: 11,
                      background: 'var(--bg-soft)', border: '1px solid var(--border)',
                    }}>
                      <span style={{ fontSize: 14 }}>{m.icon}</span>
                      <b>{m.name}</b>
                    </div>
                  ))}
                </div>
              )}
              {members.length === 0 && (
                <div style={{ fontSize: 11, color: 'var(--dim-2)', marginTop: 10 }}>قسم فاضي — قول لإسلام «عيِّن موظفين في القسم»</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
