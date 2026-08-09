'use client';

// ═══════════ HomeView — مهامي (الرئيسية الجديدة v7) ═══════════
// تحية + 4 كروت إحصائيات → مهام اليوم بالأولويات (checkbox مباشر) → تقدم يومي ring → أزرار سريعة

import { DAYS, PRIORITY_LABEL, PRIORITY_COLOR, PRIORITY_ICON, type Priority, type Task } from './types';

interface Props {
  tasks: Task[];
  points: number;
  level: number;
  streak: number;
  sessionsCount: number;
  onNavigate: (tab: string) => void;
  onUpdate?: (id: number, patch: Partial<Task>) => void;
}

const QUOTES = [
  'النجاح مش نهاية الطريق، والفشل مش نهاية العالم — الشجاعة هي الاستمرار ✨',
  'كل يوم بيدرس سطر، بيقرا كتاب كامل في السنة 📚',
  'التعليم أقوى سلاح اللي تقدر تغير بيه العالم 🚀',
  'الطموح هو بداية الطريق، والاجتهاد هو مشواره 💪',
  'مش محتاج تكون عبقري عشان تنجح — محتاج تكون مثابر 🎯',
];

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'سهران يا بطل؟ 😴';
  if (h < 12) return 'صبحك الله يا محمود! ☀️';
  if (h < 17) return 'نهارك سعيد يا صاحبي! 🌤️';
  if (h < 21) return 'مساءك سعيد! 🌆';
  return 'مساء الفل يا محمود! 🌙';
}

export default function HomeView({ tasks, points, level, streak, sessionsCount, onNavigate, onUpdate }: Props) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const todayIdx = new Date().getDay();
  const todayName = DAYS[(todayIdx + 1) % 7] || DAYS[0];
  const todayTasks = tasks
    .filter((t) => t.day === todayName)
    .sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return (p[a.priority] ?? 3) - (p[b.priority] ?? 3);
    });
  const todayDone = todayTasks.filter((t) => t.done).length;
  const todayPct = todayTasks.length ? Math.round((todayDone / todayTasks.length) * 100) : 0;

  const quote = QUOTES[new Date().getDate() % QUOTES.length];
  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });

  const stats = [
    { icon: '📋', label: 'مهام اليوم', value: `${todayDone}/${todayTasks.length}`, color: '#00e5ff' },
    { icon: '✅', label: 'إجمالي مكتمل', value: done, color: '#00e676' },
    { icon: '🏆', label: 'نقاط', value: points, color: '#ffd740' },
    { icon: '🔥', label: 'Streak', value: `${streak} يوم`, color: '#ff5252' },
  ];

  const ringRadius = 34;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc * (1 - todayPct / 100);

  return (
    <div>
      {/* التحية والتاريخ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{getGreeting()}</div>
          <div style={{ fontSize: 12.5, color: 'var(--dim)', marginTop: 2 }}>{dateStr} · {todayName}</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
          المستوى {level} · 🎖️
        </div>
      </div>

      {/* اقتباس تحفيزي */}
      <div
        className="card mb"
        style={{
          background: 'linear-gradient(135deg, rgba(0,229,255,0.1), rgba(41,121,255,0.05), transparent)',
          borderColor: 'rgba(0,229,255,0.25)',
        }}
      >
        <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.8 }}>💬 {quote}</div>
      </div>

      {/* 4 كروت إحصائيات */}
      <div className="grid mb" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        {stats.map((s) => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '15px 12px' }}>
            <div style={{ fontSize: 20, marginBottom: 3 }}>{s.icon}</div>
            <div style={{ fontSize: 21, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: 'var(--dim)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* التقدم اليومي — ring + مهام اليوم */}
      <div className="card mb">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Ring */}
          <div style={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
            <svg width="84" height="84" viewBox="0 0 84 84" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="42" cy="42" r={ringRadius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
              <circle
                cx="42" cy="42" r={ringRadius} fill="none"
                stroke="url(#todayGrad)" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={ringCirc} strokeDashoffset={ringOffset}
                style={{ transition: 'stroke-dashoffset 0.6s var(--ease)' }}
              />
              <defs>
                <linearGradient id="todayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="100%" stopColor="#2979ff" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <b style={{ fontSize: 17, fontFamily: 'var(--font-mono)', color: '#00e5ff' }}>{todayPct}%</b>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <b style={{ fontSize: 14 }}>📅 تقدم النهاردة</b>
              <span style={{ fontSize: 12.5, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
                {todayDone}/{todayTasks.length} مهمة
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--dim)', lineHeight: 1.7 }}>
              {todayTasks.length === 0
                ? 'مفيش مهام النهاردة — كده كده يوم راحة 😎'
                : `${todayTasks.length - todayDone} مهمة متبقية · ${sessionsCount} جلسة بومودورو اليوم`}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              <button className="btn sm" onClick={() => onNavigate('schedule')}>📅 فتح الجدول</button>
              <button className="btn sm ghost" onClick={() => onNavigate('pomodoro')}>🍅 بومودورو</button>
              <button className="btn sm ghost" onClick={() => onNavigate('stats')}>📊 إحصائيات</button>
            </div>
          </div>
        </div>
      </div>

      {/* مهام اليوم — مقسمة حسب الأولوية */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <b style={{ fontSize: 14 }}>🎯 مهام {todayName}</b>
          {todayTasks.length > 0 && (
            <span style={{ fontSize: 12, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>{todayDone}/{todayTasks.length}</span>
          )}
        </div>

        {todayTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '18px 0' }}>
            <div style={{ fontSize: 30, marginBottom: 6 }}>🌴</div>
            <div style={{ fontSize: 13, color: 'var(--dim-2)' }}>مفيش مهام النهاردة — يوم راحة!</div>
            <button className="btn sm mt" onClick={() => onNavigate('schedule')}>➕ ضيف مهمة</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PRIORITIES.map((pr) => {
              const group = todayTasks.filter((t) => t.priority === pr && !t.done);
              const groupDone = todayTasks.filter((t) => t.priority === pr && t.done);
              if (group.length === 0 && groupDone.length === 0) return null;
              return (
                <div key={pr}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 12 }}>{PRIORITY_ICON[pr]}</span>
                    <b style={{ fontSize: 12, color: PRIORITY_COLOR[pr] }}>{PRIORITY_LABEL[pr]}</b>
                    <span style={{ fontSize: 11, color: 'var(--dim-2)', fontFamily: 'var(--font-mono)' }}>
                      ({group.length + groupDone.length})
                    </span>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${PRIORITY_COLOR[pr]}33, transparent)` }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {[...group, ...groupDone].map((t) => (
                      <div
                        key={t.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 9, fontSize: 13,
                          padding: '8px 11px', borderRadius: 9,
                          background: t.done ? 'rgba(255,255,255,0.03)' : 'var(--bg-soft)',
                          border: `1px solid ${t.done ? 'rgba(255,255,255,0.05)' : 'var(--border)'}`,
                          opacity: t.done ? 0.55 : 1,
                          transition: 'all 0.2s',
                        }}
                      >
                        <button
                          onClick={() => onUpdate?.(t.id, { done: t.done ? 0 : 1 })}
                          title={t.done ? 'رجّع المهمة' : 'كمّل المهمة'}
                          style={{
                            width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
                            border: `2px solid ${t.done ? '#00e676' : PRIORITY_COLOR[pr]}`,
                            background: t.done ? '#00e676' : 'transparent',
                            color: '#000', fontSize: 13, fontWeight: 800,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                        >
                          {t.done ? '✓' : ''}
                        </button>
                        <span
                          style={{
                            flex: 1,
                            textDecoration: t.done ? 'line-through' : 'none',
                            color: t.done ? 'var(--dim)' : 'var(--text)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}
                        >
                          {t.text}
                        </span>
                        {t.notes && <span title={t.notes} style={{ fontSize: 11, color: 'var(--dim)' }}>📝</span>}
                        {t.link && <span title="فيه لينك" style={{ fontSize: 11, color: '#00e5ff' }}>🔗</span>}
                        {t.start_time && (
                          <span style={{ fontSize: 10.5, color: 'var(--dim-2)', fontFamily: 'var(--font-mono)' }}>
                            {t.start_time.slice(0, 5)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
