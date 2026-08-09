'use client';

// ═══════════ التقويم الذكي — امتحانات + مواعيد + ألوان ═══════════

import { useEffect, useMemo, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';

// ─── أحداث ثابتة (من ملفات محفوظة) ───
const EVENTS = [
  { day: 10, month: 8, year: 2026, title: '📐 امتحان تفاضل', color: '#a855f7' },
  { day: 14, month: 8, year: 2026, title: '⚡ امتحان فيزيا', color: '#6366f1' },
  { day: 17, month: 8, year: 2026, title: '🧪 امتحان كيميا', color: '#34d399' },
  { day: 21, month: 8, year: 2026, title: '📖 امتحان عربي', color: '#f59e0b' },
  { day: 24, month: 8, year: 2026, title: '🇬🇧 امتحان إنجليزي', color: '#38bdf8' },
  { day: 28, month: 8, year: 2026, title: '📐 امتحان جبر', color: '#a855f7' },
  { day: 7, month: 9, year: 2026, title: '📐 امتحان استاتيكا', color: '#a855f7' },
];

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const DAYS_AR = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

export default function CalendarPage() {
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selected, setSelected] = useState<number | null>(null);

  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const firstDay = new Date(view.y, view.m, 1).getDay(); // 0=أحد؟ عندنا السبت أول أسبوع

  // تحويل: JS day: 0=Sunday...6=Saturday → عندنا السبت=0
  const startOffset = (firstDay + 1) % 7; // السبت = 0

  const monthEvents = useMemo(
    () => EVENTS.filter((e) => e.month === view.m + 1 && e.year === view.y),
    [view],
  );

  const prev = () => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const next = () => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));

  const selectedEvents = selected
    ? monthEvents.filter((e) => e.day === selected)
    : [];

  return (
    <div className="anim-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>🗓️ التقويم الذكي</h1>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn sm ghost" onClick={prev}>→ السابق</button>
          <button className="btn sm" onClick={() => setView({ y: today.getFullYear(), m: today.getMonth() })}>اليوم</button>
          <button className="btn sm ghost" onClick={next}>التالي ←</button>
        </div>
      </div>
      <p style={{ color: 'var(--dim)', fontSize: 13, marginBottom: 18 }}>
        {MONTHS_AR[view.m]} {view.y} — اضغط على يوم عشان تشوف أحداثه
      </p>

      <div className="grid cols-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <GlassCard>
          {/* رأس الأيام */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {DAYS_AR.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--dim)', fontWeight: 700, padding: '6px 0' }}>
                {d}
              </div>
            ))}
          </div>
          {/* الأيام */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const evs = monthEvents.filter((e) => e.day === day);
              const isToday = day === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear();
              const isSel = selected === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelected(isSel ? null : day)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 10,
                    border: isSel
                      ? '1.5px solid var(--primary-light)'
                      : isToday
                        ? '1.5px solid var(--green)'
                        : '1px solid transparent',
                    background: isSel
                      ? 'rgba(99,102,241,.2)'
                      : isToday
                        ? 'rgba(52,211,153,.12)'
                        : 'var(--bg-card-solid)',
                    color: isToday ? 'var(--green)' : 'var(--text)',
                    fontSize: 13,
                    fontWeight: isToday || evs.length > 0 ? 700 : 400,
                    cursor: 'pointer',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {day}
                  {evs.length > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 4,
                        display: 'flex',
                        gap: 2,
                      }}
                    >
                      {evs.map((e, j) => (
                        <span key={j} style={{ width: 5, height: 5, borderRadius: '50%', background: e.color }} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard title={selected ? `📌 أحداث يوم ${selected}` : '📌 أحداث الشهر'} glow="accent">
          {selectedEvents.length === 0 && (selected === null ? monthEvents.length === 0 : true) && (
            <div className="loading">مفيش أحداث{selected ? ' في اليوم ده' : ''} — كل حاجة تمام 🎉</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(selected ? selectedEvents : monthEvents).map((e, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-card-solid)',
                  border: `1px solid ${e.color}44`,
                  borderInlineStart: `3px solid ${e.color}`,
                  borderRadius: 10,
                  padding: '10px 12px',
                  fontSize: 13,
                }}
              >
                <b>{e.title}</b>
                <div style={{ color: 'var(--dim)', fontSize: 11.5, marginTop: 2 }}>
                  {e.day} {MONTHS_AR[e.month - 1]}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
