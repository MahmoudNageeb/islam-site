'use client';

// ═══════════ CalendarView — التقويم الشهري (زي table.html) ═══════════

import { useState } from 'react';
import { DAYS, PRIORITY_COLOR, type Task } from './types';

interface Props {
  tasks: Task[];
}

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const WEEKDAYS = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export default function CalendarView({ tasks }: Props) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m); setYear(y); setSelectedDay(null);
  };

  // تحويل يوم الأسبوع من JS (0=أحد) لاسم اليوم في النظام (السبت...)
  const dayToTasks = (dayNum: number) => {
    const jsDay = new Date(year, month, dayNum).getDay(); // 0=أحد
    const systemDay = DAYS[(jsDay + 5) % 7]; // أحد→السبت index 0? لا: jsDay 1(اثنين)→DAYS[6]؟ نتحقق
    // jsDay: 0=أحد,1=اثنين,2=ثلاثاء,3=أربعاء,4=خميس,5=جمعة,6=سبت
    // النظام: السبت=0, الأحد=1, الإثنين=2, الثلاثاء=3, الأربعاء=4, الخميس=5, الجمعة=6
    const map = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return tasks.filter((t) => t.day === map[jsDay]);
  };

  const selectedTasks = selectedDay ? dayToTasks(selectedDay) : [];
  const selectedDate = selectedDay ? `${selectedDay} ${MONTHS[month]} ${year}` : '';

  return (
    <div>
      {/* رأس التقويم */}
      <div className="card mb" style={{ padding: '14px 16px' }}>
        <div className="row spread">
          <button className="btn sm ghost" style={{ padding: '6px 12px' }} onClick={() => changeMonth(-1)}>→ السابق</button>
          <b style={{ fontSize: 15 }}>🗓️ {MONTHS[month]} {year}</b>
          <button className="btn sm ghost" style={{ padding: '6px 12px' }} onClick={() => changeMonth(1)}>التالي ←</button>
        </div>

        {/* شبكة التقويم */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, marginTop: 14,
        }}>
          {WEEKDAYS.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--dim)', fontWeight: 700, padding: '4px 0' }}>{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e${i}`} style={{ aspectRatio: '1', minHeight: 34 }} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayTasks = dayToTasks(dayNum);
            const isToday = dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isSelected = dayNum === selectedDay;
            const allDone = dayTasks.length > 0 && dayTasks.every((t) => t.done);
            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(isSelected ? null : dayNum)}
                style={{
                  aspectRatio: '1', minHeight: 34, borderRadius: 8, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: isSelected ? 'rgba(0,229,255,0.15)' : isToday ? 'rgba(41,121,255,0.15)' : 'transparent',
                  border: `1px solid ${isSelected ? 'rgba(0,229,255,0.4)' : isToday ? 'rgba(41,121,255,0.35)' : 'var(--border)'}`,
                  color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 13,
                  position: 'relative', transition: 'all 0.12s',
                }}
              >
                {dayNum}
                {dayTasks.length > 0 && (
                  <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                    {dayTasks.slice(0, 3).map((t) => (
                      <span key={t.id} style={{
                        width: 6, height: 6, borderRadius: 2,
                        background: t.done ? '#00e676' : PRIORITY_COLOR[t.priority],
                      }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* مهام اليوم المحدد */}
      {selectedDay && (
        <div className="card">
          <b style={{ fontSize: 14, marginBottom: 10, display: 'block' }}>📋 مهام {selectedDate} ({selectedTasks.length})</b>
          {selectedTasks.length === 0 ? (
            <div style={{ fontSize: 12.5, color: 'var(--dim-2)' }}>مفيش مهام في اليوم ده</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selectedTasks.map((t) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
                  padding: '8px 10px', borderRadius: 8, background: 'var(--bg-soft)',
                  border: '1px solid var(--border)', borderInlineStart: `3px solid ${PRIORITY_COLOR[t.priority]}`,
                }}>
                  <span>{t.done ? '✅' : '⬜'}</span>
                  <span style={{ flex: 1, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--dim)' : 'var(--text)' }}>{t.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
