'use client';

// ═══════════ RewardsView — المكافآت والشارات (زي table.html) ═══════════

import type { Link, Note, Task } from './types';

interface Props {
  points: number;
  completedTasksCount: number;
  streak: number;
  sessionsCount: number;
  notes: Note[];
  links: Link[];
  studyDays: number;
}

export default function RewardsView({ points, completedTasksCount, streak, sessionsCount, notes, links, studyDays }: Props) {
  const level = Math.floor(points / 100) + 1;
  const levelProgress = points % 100;
  const nextLevelAt = (level) * 100;

  const badges = [
    { name: 'المبتدئ', desc: 'أكمل 5 مهام', icon: '🌱', earned: completedTasksCount >= 5 },
    { name: 'منتج', desc: 'أكمل 20 مهمة', icon: '⚡', earned: completedTasksCount >= 20 },
    { name: 'مثابر', desc: '3 أيام متتالية', icon: '🔥', earned: streak >= 3 },
    { name: 'بومودورو', desc: '10 جلسات بومودورو', icon: '🍅', earned: sessionsCount >= 10 },
    { name: 'المنظم', desc: 'أضف 5 ملاحظات', icon: '📝', earned: notes.length >= 5 },
    { name: 'الباحث', desc: 'أضف 3 روابط', icon: '🔗', earned: links.length >= 3 },
    { name: 'المنتج الأسطوري', desc: 'أكمل 50 مهمة', icon: '🚀', earned: completedTasksCount >= 50 },
    { name: 'المثابر الحقيقي', desc: '7 أيام متتالية', icon: '👑', earned: streak >= 7 },
    { name: 'المتفوق', desc: 'أكمل 100 مهمة', icon: '🏆', earned: completedTasksCount >= 100 },
    { name: 'المبدع', desc: 'أضف 10 ملاحظات', icon: '💡', earned: notes.length >= 10 },
    { name: 'المنظم المتميز', desc: 'ذاكر 5 أيام', icon: '⭐', earned: studyDays >= 5 },
    { name: 'بطل البومودورو', desc: '25 جلسة', icon: '🎖️', earned: sessionsCount >= 25 },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div>
      {/* النقاط والمستوى */}
      <div className="card mb" style={{ textAlign: 'center', padding: '24px' }}>
        <div style={{ fontSize: 13, color: 'var(--dim)' }}>نقاطك</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: '#ffd740', fontFamily: 'var(--font-mono)', textShadow: '0 0 30px rgba(255,215,64,0.3)' }}>
          {points}
        </div>
        <div style={{ fontSize: 14, marginTop: 4 }}>🎖️ المستوى {level}</div>
        <div style={{ maxWidth: 320, margin: '14px auto 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--dim)', marginBottom: 5 }}>
            <span>{levelProgress}/100</span>
            <span>المستوى {level + 1} عند {nextLevelAt}</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${levelProgress}%`, borderRadius: 5,
              background: 'linear-gradient(90deg, #ffd740, #ff9100)',
              boxShadow: '0 0 12px rgba(255,215,64,0.4)', transition: 'width 0.5s',
            }} />
          </div>
        </div>
      </div>

      {/* الشارات */}
      <div className="card">
        <div className="row spread" style={{ marginBottom: 12 }}>
          <b style={{ fontSize: 14 }}>🏅 الشارات ({earnedCount}/{badges.length})</b>
        </div>
        <div className="grid cols-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
          {badges.map((b) => (
            <div
              key={b.name}
              className="card"
              style={{
                textAlign: 'center', padding: '16px 8px',
                opacity: b.earned ? 1 : 0.35,
                filter: b.earned ? 'none' : 'grayscale(1)',
                borderColor: b.earned ? 'rgba(0,229,255,0.2)' : undefined,
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 6 }}>{b.earned ? b.icon : '🔒'}</div>
              <b style={{ fontSize: 12.5 }}>{b.name}</b>
              <div style={{ fontSize: 10.5, color: 'var(--dim)', marginTop: 3 }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
