'use client';

// ═══════════ ProfileView — البروفايل (بياناتك وإنجازاتك) ═══════════

import type { Link, Note, SessionRow, Task } from './types';

interface Props {
  tasks: Task[];
  notes: Note[];
  links: Link[];
  sessions: SessionRow[];
  points: number;
  streak: number;
}

export default function ProfileView({ tasks, notes, links, sessions, points, streak }: Props) {
  const level = Math.floor(points / 100) + 1;
  const completed = tasks.filter((t) => t.done).length;
  const studyDays = new Set(sessions.map((s) => s.date)).size;

  const items = [
    { icon: '✅', label: 'مهام مكتملة', value: completed },
    { icon: '🔥', label: 'أيام متتالية', value: streak },
    { icon: '🎖️', label: 'المستوى', value: level },
    { icon: '⭐', label: 'النقاط', value: points },
    { icon: '🍅', label: 'جلسات بومودورو', value: sessions.length },
    { icon: '📝', label: 'ملاحظات', value: notes.length },
    { icon: '🔗', label: 'روابط', value: links.length },
    { icon: '📚', label: 'أيام مذاكرة', value: studyDays },
  ];

  return (
    <div>
      {/* الكارت الشخصي */}
      <div
        className="card mb"
        style={{
          textAlign: 'center', padding: '28px 20px',
          background: 'linear-gradient(145deg, rgba(0,229,255,0.08), rgba(41,121,255,0.04), transparent)',
          borderColor: 'rgba(0,229,255,0.2)',
        }}
      >
        <div style={{
          width: 76, height: 76, borderRadius: '50%', margin: '0 auto 12px',
          background: 'linear-gradient(135deg, #00e5ff, #2979ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 34, fontWeight: 800, color: '#fff',
          boxShadow: '0 0 30px rgba(0,229,255,0.4)',
        }}>
          م
        </div>
        <b style={{ fontSize: 17 }}>محمود محمد نجيب</b>
        <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4 }}>
          🎓 ثانوية عامة — علمي رياضة · 🎯 ميكاترونكس
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: 'rgba(0,229,255,0.12)', color: '#00e5ff' }}>🎖️ مستوى {level}</span>
          <span className="badge" style={{ background: 'rgba(255,215,64,0.12)', color: '#ffd740' }}>⭐ {points} نقطة</span>
          <span className="badge" style={{ background: 'rgba(255,82,82,0.12)', color: '#ff5252' }}>🔥 {streak} يوم</span>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid cols-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
        {items.map((it) => (
          <div key={it.label} className="card" style={{ textAlign: 'center', padding: '14px 10px' }}>
            <div style={{ fontSize: 20, marginBottom: 3 }}>{it.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{it.value}</div>
            <div style={{ fontSize: 10.5, color: 'var(--dim)', marginTop: 2 }}>{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
