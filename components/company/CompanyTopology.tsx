'use client';

// ═══════ CompanyTopology — خريطة الشركة الحية ═══════
// محمود (👑) → إسلام (🤖) → أقسام → موظفين
// خطوط متحركة بين المستويات + حالة كل موظف لحظياً

import { useState } from 'react';

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
  success_rate?: number;
  capabilities?: { name: string; level?: string }[];
}

interface Dept {
  id: string;
  name: string;
  icon?: string;
  desc?: string;
  manager?: string;
  employees?: string[];
}

interface Props {
  employees: Emp[];
  departments: Dept[];
}

const RANK_COLORS: Record<string, string> = {
  'Lead': '#ffd740', 'Senior': '#00e5ff', 'Mid': '#00e676', 'Junior': '#9e9e9e', 'متدرب': '#9e9e9e',
};

export default function CompanyTopology({ employees, departments }: Props) {
  const [hover, setHover] = useState<Emp | null>(null);
  const active = employees.filter((e) => e.status === 'active');

  // لو الأقسام فاضية — اعرض الموظفين تحت المدير مباشرة
  const deps = departments.length ? departments : [{ id: 'all', name: 'الفريق', icon: '🚀', employees: active.map(e => e.id) }];

  return (
    <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 800 }}>🛰️ طوبولوجيا الشركة</div>
        <div style={{ display: 'flex', gap: 12, fontSize: 10.5, color: 'var(--dim)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e676', boxShadow: '0 0 6px #00e676' }} /> نشط</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffd740' }} /> قيد العمل</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#666' }} /> موقوف</span>
        </div>
      </div>

      <div style={{ padding: '14px 18px 18px', position: 'relative' }}>
        {/* ── المستوى 1: محمود (الرئيس) ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '10px 22px', borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(255,215,64,0.12), rgba(255,152,0,0.04))',
            border: '1px solid rgba(255,215,64,0.3)',
            boxShadow: '0 0 30px rgba(255,215,64,0.08)',
          }}>
            <span style={{ fontSize: 30, filter: 'drop-shadow(0 0 12px rgba(255,215,64,0.5))' }}>👑</span>
            <b style={{ fontSize: 13 }}>محمود</b>
            <span style={{ fontSize: 10, color: 'var(--dim)' }}>الرئيس — صاحب الشركة</span>
          </div>
        </div>

        {/* خط عمودي */}
        <div style={{ display: 'flex', justifyContent: 'center', height: 26 }}>
          <div style={{ width: 2, height: '100%', background: 'linear-gradient(180deg, rgba(255,215,64,0.5), rgba(0,229,255,0.4))', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, left: 0, width: 2, height: 14, background: '#00e5ff', animation: 'flow-down 2s linear infinite' }} />
          </div>
        </div>

        {/* ── المستوى 2: إسلام (المدير) ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '10px 22px', borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(41,121,255,0.04))',
            border: '1px solid rgba(0,229,255,0.35)',
            boxShadow: '0 0 30px rgba(0,229,255,0.1)',
          }}>
            <span style={{ fontSize: 28, filter: 'drop-shadow(0 0 12px rgba(0,229,255,0.6))' }}>🤖</span>
            <b style={{ fontSize: 13 }}>إسلام</b>
            <span style={{ fontSize: 10, color: 'var(--dim)' }}>المدير — يوزّع المهام ويراجع</span>
          </div>
        </div>

        {/* خط عمودي للفروع */}
        <div style={{ display: 'flex', justifyContent: 'center', height: 26 }}>
          <div style={{ width: 2, height: '100%', background: 'linear-gradient(180deg, rgba(0,229,255,0.5), rgba(41,121,255,0.3))', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, left: 0, width: 2, height: 14, background: '#2979ff', animation: 'flow-down 2s linear infinite 0.5s' }} />
          </div>
        </div>

        {/* ── المستوى 3: الأقسام ── */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`, gap: 10, alignItems: 'start' }}>
          {deps.map((dept) => {
            const members = dept.employees
              ? dept.employees.map((id) => employees.find((e) => e.id === id)).filter(Boolean) as Emp[]
              : active;
            const manager = members.find((m) => m.id === dept.manager) || null;
            const rest = members.filter((m) => m.id !== dept.manager);
            return (
              <div key={dept.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* القسم */}
                <div style={{
                  padding: '7px 12px', borderRadius: 10, fontSize: 11.5, fontWeight: 800,
                  background: 'rgba(41,121,255,0.08)', border: '1px solid rgba(41,121,255,0.25)',
                  color: '#7fb3ff', marginBottom: 8, whiteSpace: 'nowrap',
                }}>
                  {dept.icon} {dept.name}
                </div>
                {/* خط صغير */}
                <div style={{ width: 1, height: 14, background: 'rgba(41,121,255,0.3)' }} />
                {/* الموظفين */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                  {manager && <EmployeeNode emp={manager} onHover={setHover} />}
                  {rest.slice(0, 4).map((e) => <EmployeeNode key={e.id} emp={e} onHover={setHover} />)}
                  {rest.length > 4 && (
                    <div style={{ fontSize: 10, color: 'var(--dim-2)', fontFamily: 'var(--font-mono)' }}>+{rest.length - 4} آخرين</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── بطاقة hover ── */}
      {hover && (
        <div
          style={{
            position: 'absolute', zIndex: 20, bottom: 18, left: 18, width: 250,
            padding: '12px 14px', borderRadius: 12,
            background: 'var(--bg-card-solid)', border: '1px solid rgba(0,229,255,0.3)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(0,229,255,0.08)',
            animation: 'scale-in 0.15s var(--ease-spring)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 20 }}>{hover.icon}</span>
            <div>
              <b style={{ fontSize: 13 }}>{hover.name}</b>
              <div style={{ fontSize: 10.5, color: 'var(--dim)' }}>{hover.role}</div>
            </div>
            {hover.rank_icon && <span style={{ marginInlineStart: 'auto', fontSize: 13 }}>{hover.rank_icon}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11 }}>
            <div style={{ padding: '5px 8px', borderRadius: 7, background: 'rgba(255,215,64,0.07)', border: '1px solid rgba(255,215,64,0.15)' }}>
              <div style={{ color: 'var(--dim)', fontSize: 9.5 }}>XP</div>
              <b style={{ color: '#ffd740', fontFamily: 'var(--font-mono)' }}>{hover.xp ?? 0}</b>
            </div>
            <div style={{ padding: '5px 8px', borderRadius: 7, background: 'rgba(0,230,118,0.07)', border: '1px solid rgba(0,230,118,0.15)' }}>
              <div style={{ color: 'var(--dim)', fontSize: 9.5 }}>النجاح</div>
              <b style={{ color: '#00e676', fontFamily: 'var(--font-mono)' }}>{hover.success_rate ?? 0}%</b>
            </div>
          </div>
          {hover.capabilities && hover.capabilities.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
              {hover.capabilities.slice(0, 4).map((c, i) => (
                <span key={i} style={{ fontSize: 9.5, padding: '2px 8px', borderRadius: 6, background: 'rgba(0,229,255,0.08)', color: '#7fd8e6' }}>
                  {typeof c === 'string' ? c : c.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════ عقدة موظف ═══════
function EmployeeNode({ emp, onHover }: { emp: Emp; onHover: (e: Emp | null) => void }) {
  const active = emp.status === 'active';
  const rankColor = RANK_COLORS[emp.rank_name || ''] || '#00e5ff';
  return (
    <div
      onMouseEnter={() => onHover(emp)}
      onMouseLeave={() => onHover(null)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 10px', borderRadius: 9,
        background: active ? 'var(--bg-soft)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${active ? `rgba(0,229,255,0.18)` : 'rgba(255,255,255,0.06)'}`,
        opacity: active ? 1 : 0.45,
        cursor: 'default',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: 17 }}>{emp.icon}</span>
      <span style={{ fontSize: 11.5, fontWeight: 700 }}>{emp.name}</span>
      <span style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        background: active ? '#00e676' : '#666',
        boxShadow: active ? '0 0 8px rgba(0,230,118,0.8)' : 'none',
        animation: active ? 'pulse-dot 2s infinite' : 'none',
      }} />
      {emp.rank_name && (
        <span style={{
          fontSize: 9.5, fontWeight: 800, padding: '1px 6px', borderRadius: 5,
          color: rankColor, background: `${rankColor}14`, border: `1px solid ${rankColor}30`,
        }}>{emp.rank_name}</span>
      )}
    </div>
  );
}
