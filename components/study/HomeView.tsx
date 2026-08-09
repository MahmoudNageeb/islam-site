'use client';

// ═══════════ HomeView — الرئيسية (نقاط + مهام اليوم + اقتباس) ═══════════

import { DAYS, type Task } from './types';

interface Props {
  tasks: Task[];
  points: number;
  level: number;
  streak: number;
  sessionsCount: number;
  onNavigate: (tab: string) => void;
}

const QUOTES = [
  'النجاح مش نهاية الطريق، والفشل مش نهاية العالم — الشجاعة هي الاستمرار ✨',
  'كل يوم بيدرس سطر، بيقرأ كتاب كامل في السنة 📚',
  'التعليم أقوى سلاح اللي تقدر تغير بيه العالم 🚀',
  'الطموح هو بداية الطريق، والاجتهاد هو مشواره 💪',
  'مش محتاج تكون عبقري عشان تنجح — محتاج تكون مثابر 🎯',
];

export default function HomeView({ tasks, points, level, streak, sessionsCount, onNavigate }: Props) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const todayIdx = new Date().getDay();
  const todayName = DAYS[(todayIdx + 5) % 7] || DAYS[0];
  const todayTasks = tasks.filter((t) => t.day === todayName);
  const todayDone = todayTasks.filter((t) => t.done).length;

  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  const stats = [
    { icon: '📋', label: 'كل المهام', value: total, color: '#00e5ff' },
    { icon: '✅', label: 'مكتملة', value: done, color: '#00e676' },
    { icon: '📈', label: 'نسبة الإنجاز', value: `${pct}%`, color: '#ffd740' },
    { icon: '🏆', label: 'نقاط', value: points, color: '#ffd740' },
    { icon: '🎖️', label: 'المستوى', value: level, color: '#2979ff' },
    { icon: '🔥', label: 'Streak', value: `${streak} يوم`, color: '#ff5252' },
  ];

  return (
    <div>
      {/* اقتباس تحفيزي */}
      <div
        className="card mb"
        style={{
          background: 'linear-gradient(135deg, rgba(0,229,255,0.1), rgba(41,121,255,0.05), transparent)',
          borderColor: 'rgba(0,229,255,0.25)',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.8 }}>💬 {quote}</div>
        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn sm" onClick={() => onNavigate('schedule')}>📅 فتح الجدول</button>
          <button className="btn sm ghost" onClick={() => onNavigate('pomodoro')}>🍅 بومودورو</button>
          <button className="btn sm ghost" onClick={() => onNavigate('stats')}>📊 إحصائيات</button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid cols-3 mb" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        {stats.map((s) => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: 'var(--dim)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* شريط التقدم الكلي */}
      <div className="card mb">
        <div className="row spread" style={{ marginBottom: 8 }}>
          <b style={{ fontSize: 14 }}>تقدمك الكلي</b>
          <span style={{ fontSize: 13, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>{pct}%</span>
        </div>
        <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 6,
            background: 'linear-gradient(90deg, #00e5ff, #2979ff)',
            boxShadow: '0 0 14px rgba(0,229,255,0.4)', transition: 'width 0.5s var(--ease)',
          }} />
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--dim)', marginTop: 8 }}>
          {total - done} مهمة متبقية · {sessionsCount} جلسة بومودورو
        </div>
      </div>

      {/* مهام اليوم */}
      <div className="card">
        <div className="row spread" style={{ marginBottom: 10 }}>
          <b style={{ fontSize: 14 }}>📅 مهام {todayName}</b>
          <span style={{ fontSize: 12, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>{todayDone}/{todayTasks.length}</span>
        </div>
        {todayTasks.length === 0 ? (
          <div style={{ fontSize: 12.5, color: 'var(--dim-2)' }}>
            مفيش مهام النهاردة — كده كده يوم راحة 😎
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {todayTasks.slice(0, 5).map((t) => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
                padding: '7px 10px', borderRadius: 8, background: 'var(--bg-soft)',
                border: '1px solid var(--border)',
              }}>
                <span style={{ color: t.done ? 'var(--green)' : 'var(--dim)' }}>{t.done ? '✅' : '⬜'}</span>
                <span style={{
                  flex: 1, textDecoration: t.done ? 'line-through' : 'none',
                  color: t.done ? 'var(--dim)' : 'var(--text)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{t.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
