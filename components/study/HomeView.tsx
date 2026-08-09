'use client';

// ═══════════ HomeView — لوحة مهامي v8 ═══════════
// هيدر تحية → شريط تقدم اليوم → مهام اليوم بالأولوية → مهام بكرة → اختصارات

import { useState } from 'react';
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
  const [animDone, setAnimDone] = useState<number | null>(null);

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const todayIdx = new Date().getDay();
  const todayName = DAYS[(todayIdx + 1) % 7] || DAYS[0];
  const tomorrowName = DAYS[(todayIdx + 2) % 7] || DAYS[0];

  const allToday = tasks.filter((t) => t.day === todayName);
  const todayTasks = allToday
    .filter((t) => !t.done)
    .sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return (p[a.priority] ?? 3) - (p[b.priority] ?? 3);
    });
  const todayDone = allToday.filter((t) => t.done).length;
  const todayPct = allToday.length ? Math.round((todayDone / allToday.length) * 100) : 0;

  const tomorrowTasks = tasks
    .filter((t) => t.day === tomorrowName && !t.done)
    .slice(0, 3);

  const quote = QUOTES[new Date().getDate() % QUOTES.length];
  const dateStr = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });

  const handleToggle = (t: Task) => {
    setAnimDone(t.id);
    setTimeout(() => {
      onUpdate?.(t.id, { done: t.done ? 0 : 1 });
      setAnimDone(null);
    }, 250);
  };

  const completedToday = allToday.filter((t) => t.done);

  return (
    <div>
      {/* ═══ ① هيدر التحية ═══ */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(41,121,255,0.03), transparent)',
          borderColor: 'rgba(0,229,255,0.2)',
          padding: '18px 18px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800 }}>{getGreeting()}</div>
            <div style={{ fontSize: 12.5, color: 'var(--dim)', marginTop: 3 }}>{dateStr}</div>
            <div style={{ fontSize: 12, color: 'var(--dim-2)', marginTop: 6, lineHeight: 1.7, maxWidth: 420 }}>
              💬 {quote}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', padding: '8px 12px', borderRadius: 10, background: 'rgba(255,215,64,0.08)', border: '1px solid rgba(255,215,64,0.2)' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#ffd740', fontFamily: 'var(--font-mono)' }}>{points}</div>
              <div style={{ fontSize: 10, color: 'var(--dim)' }}>نقاط</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px 12px', borderRadius: 10, background: 'rgba(41,121,255,0.08)', border: '1px solid rgba(41,121,255,0.2)' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#2979ff', fontFamily: 'var(--font-mono)' }}>{level}</div>
              <div style={{ fontSize: 10, color: 'var(--dim)' }}>مستوى</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px 12px', borderRadius: 10, background: 'rgba(255,82,82,0.08)', border: '1px solid rgba(255,82,82,0.2)' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#ff5252', fontFamily: 'var(--font-mono)' }}>{streak}🔥</div>
              <div style={{ fontSize: 10, color: 'var(--dim)' }}>Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ② تقدم اليوم ═══ */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <b style={{ fontSize: 13.5 }}>📅 تقدم {todayName}</b>
          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: todayPct === 100 ? '#00e676' : '#00e5ff', fontWeight: 700 }}>
            {todayDone}/{allToday.length} · {todayPct}%
          </span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${todayPct}%`, borderRadius: 5,
            background: todayPct === 100 ? 'linear-gradient(90deg, #00e676, #00b8d4)' : 'linear-gradient(90deg, #00e5ff, #2979ff)',
            boxShadow: '0 0 12px rgba(0,229,255,0.4)', transition: 'width 0.5s var(--ease)',
          }} />
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--dim)', marginTop: 8 }}>
          {todayPct === 100 ? '🎉 خلصت مهام النهاردة! استريح أو زود إنجاز' : `${todayTasks.length} مهمة متبقية · ${sessionsCount} جلسة بومودورو`}
        </div>
      </div>

      {/* ═══ ③ مهام اليوم — بالأولوية ═══ */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <b style={{ fontSize: 14 }}>🎯 مهام {todayName}</b>
          <button className="btn sm ghost" style={{ padding: '4px 10px', fontSize: 11.5 }} onClick={() => onNavigate('schedule')}>
            عرض الكل
          </button>
        </div>

        {allToday.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 30, marginBottom: 6 }}>🌴</div>
            <div style={{ fontSize: 13, color: 'var(--dim-2)' }}>مفيش مهام النهاردة — يوم راحة!</div>
            <button className="btn sm mt" onClick={() => onNavigate('schedule')}>➕ ضيف مهمة</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PRIORITIES.map((pr) => {
              const group = todayTasks.filter((t) => t.priority === pr);
              const groupDone = completedToday.filter((t) => t.priority === pr);
              if (group.length === 0 && groupDone.length === 0) return null;
              return (
                <div key={pr}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 11 }}>{PRIORITY_ICON[pr]}</span>
                    <b style={{ fontSize: 11.5, color: PRIORITY_COLOR[pr] }}>{PRIORITY_LABEL[pr]}</b>
                    <span style={{ fontSize: 10.5, color: 'var(--dim-2)', fontFamily: 'var(--font-mono)' }}>
                      ({group.length + groupDone.length})
                    </span>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${PRIORITY_COLOR[pr]}33, transparent)` }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {group.map((t) => (
                      <TaskRow key={t.id} t={t} anim={animDone === t.id} onToggle={() => handleToggle(t)} />
                    ))}
                    {groupDone.length > 0 && (
                      <div style={{ opacity: 0.5 }}>
                        {groupDone.map((t) => (
                          <TaskRow key={t.id} t={t} anim={false} onToggle={() => handleToggle(t)} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ ④ مهام بكرة ═══ */}
      {tomorrowTasks.length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(41,121,255,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <b style={{ fontSize: 13.5 }}>⏭️ بكرة ({tomorrowName})</b>
            <span style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>{tomorrowTasks.length} مهمة</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tomorrowTasks.map((t) => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5,
                padding: '7px 11px', borderRadius: 8, background: 'rgba(41,121,255,0.04)',
                border: '1px solid rgba(41,121,255,0.12)',
              }}>
                <span style={{ fontSize: 11 }}>{PRIORITY_ICON[t.priority]}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.text}</span>
                {t.start_time && <span style={{ fontSize: 10, color: 'var(--dim-2)', fontFamily: 'var(--font-mono)' }}>{t.start_time.slice(0, 5)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ ⑤ اختصارات سريعة ═══ */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))' }}>
        <button className="card shortcut-card" onClick={() => onNavigate('focus')} style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', borderRadius: 12, padding: '14px 10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>🍅</div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>بومودورو</div>
          <div style={{ fontSize: 10, color: 'var(--dim)' }}>{sessionsCount} جلسة</div>
        </button>
        <button className="card shortcut-card" onClick={() => onNavigate('notes')} style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', borderRadius: 12, padding: '14px 10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>📝</div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>ملاحظات</div>
          <div style={{ fontSize: 10, color: 'var(--dim)' }}>سريعة</div>
        </button>
        <button className="card shortcut-card" onClick={() => onNavigate('progress')} style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', borderRadius: 12, padding: '14px 10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>📊</div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>إحصائيات</div>
          <div style={{ fontSize: 10, color: 'var(--dim)' }}>{pct}% إجمالي</div>
        </button>
        <button className="card shortcut-card" onClick={() => onNavigate('settings')} style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', borderRadius: 12, padding: '14px 10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>⚙️</div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>إعدادات</div>
          <div style={{ fontSize: 10, color: 'var(--dim)' }}>تخصيص</div>
        </button>
      </div>
    </div>
  );
}

// ═══════ صف مهمة ═══════
function TaskRow({ t, anim, onToggle }: { t: Task; anim: boolean; onToggle: () => void }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 9, fontSize: 13,
        padding: '8px 11px', borderRadius: 9,
        background: t.done ? 'rgba(255,255,255,0.02)' : 'var(--bg-soft)',
        border: `1px solid ${t.done ? 'rgba(255,255,255,0.05)' : 'var(--border)'}`,
        borderInlineStart: `3px solid ${t.done ? '#00e676' : PRIORITY_COLOR[t.priority]}`,
        opacity: t.done ? 0.55 : 1,
        transition: 'all 0.25s var(--ease)',
        animation: anim ? 'task-pop 0.3s var(--ease-spring)' : undefined,
      }}
    >
      <button
        onClick={onToggle}
        title={t.done ? 'رجّع المهمة' : 'كمّل المهمة'}
        style={{
          width: 21, height: 21, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
          border: `2px solid ${t.done ? '#00e676' : PRIORITY_COLOR[t.priority]}`,
          background: t.done ? '#00e676' : 'transparent',
          color: '#000', fontSize: 12, fontWeight: 800,
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
  );
}
