'use client';

// ═══════════ StatsView — الإحصائيات (Streak + وقت الدراسة + أفضل يوم) ═══════════

import { DAYS, type SessionRow, type Task } from './types';

interface Props {
  tasks: Task[];
  sessions: SessionRow[];
  streak: number;
}

export default function StatsView({ tasks, sessions, streak }: Props) {
  const completed = tasks.filter((t) => t.done).length;

  // أفضل يوم (أكتر يوم فيه مهام مكتملة)
  const dayStats: Record<string, number> = {};
  tasks.forEach((t) => { if (t.done) dayStats[t.day] = (dayStats[t.day] || 0) + 1; });
  let bestDay = 'لا يوجد';
  let maxCount = 0;
  for (const d in dayStats) { if (dayStats[d] > maxCount) { maxCount = dayStats[d]; bestDay = d; } }

  // عدد أيام المذاكرة (من الجلسات)
  const studyDays = new Set(sessions.map((s) => s.date)).size;

  // إجمالي وقت المذاكرة بالدقائق
  const totalStudySeconds = sessions.filter((s) => s.type === 'work').reduce((a, s) => a + s.duration_seconds, 0);
  const totalHours = Math.round(totalStudySeconds / 3600 * 10) / 10;

  // إحصائيات الأسبوع
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const weeklySessions = sessions.filter((s) => s.date >= weekAgo).length;

  const stats = [
    { icon: '🔥', label: 'Streak', value: `${streak} يوم`, color: '#ff5252' },
    { icon: '✅', label: 'مهام مكتملة', value: completed, color: '#00e676' },
    { icon: '⭐', label: 'أفضل يوم', value: bestDay, color: '#ffd740' },
    { icon: '📚', label: 'أيام مذاكرة', value: studyDays, color: '#00e5ff' },
    { icon: '⏱️', label: 'وقت الدراسة', value: `${totalHours} ساعة`, color: '#2979ff' },
    { icon: '🍅', label: 'جلسات الأسبوع', value: weeklySessions, color: '#ff9100' },
  ];

  // توزيع الأولويات
  const high = tasks.filter((t) => t.priority === 'high').length;
  const med = tasks.filter((t) => t.priority === 'medium').length;
  const low = tasks.filter((t) => t.priority === 'low').length;

  return (
    <div>
      <div className="grid cols-3 mb" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        {stats.map((s) => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: 'var(--dim)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* توزيع الأولويات */}
      <div className="card mb">
        <b style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>📊 توزيع الأولويات</b>
        {[
          ['🔴 عالية', high, '#ff5252'],
          ['🟡 متوسطة', med, '#ffd740'],
          ['🔵 منخفضة', low, '#00e5ff'],
        ].map(([label, count, color]) => {
          const total = Math.max(1, high + med + low);
          const pct = Math.round(((count as number) / total) * 100);
          return (
            <div key={label as string} style={{ marginBottom: 10 }}>
              <div className="row spread" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 12 }}>{label}</span>
                <span style={{ fontSize: 11.5, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>{count} · {pct}%</span>
              </div>
              <div style={{ height: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: color as string, transition: 'width 0.4s' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* إنجاز الأسبوع */}
      <div className="card">
        <b style={{ fontSize: 14, display: 'block', marginBottom: 10 }}>📅 إنجاز الأسبوع</b>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {DAYS.map((day) => {
            const count = tasks.filter((t) => t.day === day).length;
            const done = tasks.filter((t) => t.day === day && t.done).length;
            const pct = count ? Math.round((done / count) * 100) : 0;
            return (
              <div key={day} style={{ textAlign: 'center' }}>
                <div style={{
                  aspectRatio: '1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)',
                  background: count === 0 ? 'rgba(255,255,255,0.03)' : `linear-gradient(135deg, rgba(0,229,255,${0.08 + pct / 200}), rgba(41,121,255,${0.08 + pct / 200}))`,
                  border: `1px solid ${count === 0 ? 'var(--border)' : pct >= 100 ? 'rgba(0,230,118,0.4)' : 'rgba(0,229,255,0.25)'}`,
                  color: pct >= 100 ? '#00e676' : 'var(--text)',
                }}>
                  {count ? `${done}/${count}` : '·'}
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--dim)', marginTop: 4 }}>{day}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
