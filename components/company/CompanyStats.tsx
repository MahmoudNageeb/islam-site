'use client';

// ═══════ CompanyStats — عدادات حية (count-up) ═══════
import { useEffect, useRef, useState } from 'react';

interface Props {
  budget: number;
  employeeCount: number;
  activeCount: number;
  deptCount: number;
  totalXp: number;
  tasksDone: number;
}

function CountUp({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    prev.current = value;
    if (from === to) { setDisplay(to); return; }
    const dur = 700;
    const start = performance.now();
    let raf: number;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{prefix}{display.toLocaleString('en-US')}{suffix}</span>;
}

export default function CompanyStats({ budget, employeeCount, activeCount, deptCount, totalXp, tasksDone }: Props) {
  const cards = [
    { label: 'الميزانية', value: budget, prefix: '', suffix: ' XPC', icon: '💰', color: '#00e5ff' },
    { label: 'الموظفون', value: activeCount, prefix: '', suffix: ` / ${employeeCount}`, icon: '👥', color: '#00e676' },
    { label: 'الأقسام', value: deptCount, prefix: '', suffix: '', icon: '🏢', color: '#2979ff' },
    { label: 'إجمالي XP', value: totalXp, prefix: '', suffix: '', icon: '⚡', color: '#ffd740' },
    { label: 'مهام مكتملة', value: tasksDone, prefix: '', suffix: '', icon: '✅', color: '#ff5252' },
  ];

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
      {cards.map((c) => (
        <div
          key={c.label}
          className="card"
          style={{
            padding: '14px 16px', position: 'relative', overflow: 'hidden',
            borderColor: `${c.color}22`,
          }}
        >
          <div style={{ position: 'absolute', top: -14, left: -14, width: 60, height: 60, borderRadius: '50%', background: `${c.color}0d`, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 17 }}>{c.icon}</span>
            <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 600 }}>{c.label}</span>
          </div>
          <div style={{ fontSize: 21, color: c.color }}>
            <CountUp value={c.value} prefix={c.prefix} suffix={c.suffix} />
          </div>
        </div>
      ))}
    </div>
  );
}
