'use client';

// ═══════════ ProgressHub — إحصائيات + مكافآت + تقويم في تبويب واحد ═══════════
import { useState } from 'react';
import type { Link, Note, SessionRow, Task } from './types';
import StatsView from './StatsView';
import RewardsView from './RewardsView';
import CalendarView from './CalendarView';

interface Props {
  tasks: Task[];
  sessions: SessionRow[];
  streak: number;
  points: number;
  completedTasksCount: number;
  notes: Note[];
  links: Link[];
  studyDays: number;
}

export default function ProgressHub(props: Props) {
  const [sub, setSub] = useState<'stats' | 'rewards' | 'calendar'>('stats');

  const subTabs = [
    { id: 'stats' as const, icon: '📊', label: 'إحصائيات' },
    { id: 'rewards' as const, icon: '🏆', label: 'مكافآت' },
    { id: 'calendar' as const, icon: '🗓️', label: 'تقويم' },
  ];

  return (
    <div>
      {/* سوب-تبويبات */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            style={{
              padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', border: '1px solid transparent', transition: 'all 0.15s',
              background: sub === t.id ? 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(41,121,255,0.08))' : 'var(--bg-soft)',
              color: sub === t.id ? '#00e5ff' : 'var(--dim)',
              borderColor: sub === t.id ? 'rgba(0,229,255,0.3)' : 'var(--border)',
            }}
          >{t.icon} {t.label}</button>
        ))}
      </div>

      <div key={sub} className="anim-fade">
        {sub === 'stats' && <StatsView tasks={props.tasks} sessions={props.sessions} streak={props.streak} />}
        {sub === 'rewards' && (
          <RewardsView
            points={props.points}
            completedTasksCount={props.completedTasksCount}
            streak={props.streak}
            sessionsCount={props.sessions.length}
            notes={props.notes}
            links={props.links}
            studyDays={props.studyDays}
          />
        )}
        {sub === 'calendar' && <CalendarView tasks={props.tasks} />}
      </div>
    </div>
  );
}
