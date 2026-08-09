'use client';

// ═══════════ SettingsHub — إعدادات + بروفايل في تبويب واحد ═══════════
import { useState } from 'react';
import type { Link, Note, SessionRow, Task } from './types';
import SettingsView from './SettingsView';
import ProfileView from './ProfileView';

interface Props {
  workTime: number;
  breakTime: number;
  longBreakTime: number;
  tasks: Task[];
  notes: Note[];
  links: Link[];
  sessions: SessionRow[];
  points: number;
  streak: number;
  onSaveSetting: (key: string, value: string) => void;
  onImport: (data: { tasks: Task[]; notes: Note[]; links: Link[] }) => Promise<void>;
  onClearAll: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function SettingsHub(props: Props) {
  const [sub, setSub] = useState<'settings' | 'profile'>('settings');

  return (
    <div>
      {/* سوب-تبويبات */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button
          onClick={() => setSub('settings')}
          style={{
            padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', border: '1px solid transparent', transition: 'all 0.15s',
            background: sub === 'settings' ? 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(41,121,255,0.08))' : 'var(--bg-soft)',
            color: sub === 'settings' ? '#00e5ff' : 'var(--dim)',
            borderColor: sub === 'settings' ? 'rgba(0,229,255,0.3)' : 'var(--border)',
          }}
        >⚙️ الإعدادات</button>
        <button
          onClick={() => setSub('profile')}
          style={{
            padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', border: '1px solid transparent', transition: 'all 0.15s',
            background: sub === 'profile' ? 'linear-gradient(135deg, rgba(255,215,64,0.15), rgba(255,152,0,0.08))' : 'var(--bg-soft)',
            color: sub === 'profile' ? '#ffd740' : 'var(--dim)',
            borderColor: sub === 'profile' ? 'rgba(255,215,64,0.3)' : 'var(--border)',
          }}
        >👤 البروفايل</button>
      </div>

      <div key={sub} className="anim-fade">
        {sub === 'settings' ? (
          <SettingsView
            workTime={props.workTime}
            breakTime={props.breakTime}
            longBreakTime={props.longBreakTime}
            tasks={props.tasks}
            notes={props.notes}
            links={props.links}
            sessions={props.sessions}
            onSaveSetting={props.onSaveSetting}
            onImport={props.onImport}
            onClearAll={props.onClearAll}
            showToast={props.showToast}
          />
        ) : (
          <ProfileView
            tasks={props.tasks}
            notes={props.notes}
            links={props.links}
            sessions={props.sessions}
            points={props.points}
            streak={props.streak}
          />
        )}
      </div>
    </div>
  );
}
