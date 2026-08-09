'use client';

// ═══════════ SettingsView — الإعدادات (تصدير/استيراد + مسح) ═══════════

import { useRef } from 'react';
import type { Link, Note, SessionRow, Task } from './types';

interface Props {
  workTime: number;
  breakTime: number;
  longBreakTime: number;
  tasks: Task[];
  notes: Note[];
  links: Link[];
  sessions: SessionRow[];
  onSaveSetting: (key: string, value: string) => void;
  onImport: (data: { tasks: Task[]; notes: Note[]; links: Link[] }) => Promise<void>;
  onClearAll: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function SettingsView({ workTime, breakTime, longBreakTime, tasks, notes, links, sessions, onSaveSetting, onImport, onClearAll, showToast }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const data = { tasks, notes, links, sessions, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `islam-study-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تصدير بياناتك بنجاح ✅', 'success');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.tasks) throw new Error('ملف غير صالح');
      await onImport(data);
      showToast('تم استيراد البيانات بنجاح ✅', 'success');
    } catch (err: any) {
      showToast('الملف مش صالح: ' + err.message, 'error');
    }
    e.target.value = '';
  };

  return (
    <div>
      {/* مؤقتات */}
      <div className="card mb">
        <b style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>⏱️ المؤقتات</b>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {([
            ['work_time', 'شغل (د)', workTime],
            ['break_time', 'راحة (د)', breakTime],
            ['long_break_time', 'طويلة (د)', longBreakTime],
          ] as const).map(([key, label, val]) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 11.5, color: 'var(--dim)', marginBottom: 5 }}>{label}</label>
              <input
                type="number" min={1} max={120} value={val}
                onChange={(e) => onSaveSetting(key, e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--bg-soft)',
                  color: 'var(--text)', fontFamily: 'var(--font-mono)', textAlign: 'center', outline: 'none',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* البيانات */}
      <div className="card mb">
        <b style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>💾 البيانات</b>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" onClick={exportData}>📤 تصدير البيانات (JSON)</button>
          <button className="btn ghost" onClick={() => fileRef.current?.click()}>📥 استيراد البيانات</button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--dim)', marginTop: 10 }}>
          عندك {tasks.length} مهمة · {notes.length} ملاحظة · {links.length} رابط · {sessions.length} جلسة
        </div>
      </div>

      {/* منطقة الخطر */}
      <div className="card" style={{ borderColor: 'rgba(255,82,82,0.25)' }}>
        <b style={{ fontSize: 14, display: 'block', marginBottom: 6, color: '#ff5252' }}>⚠️ منطقة الخطر</b>
        <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 12 }}>
          مسح كل البيانات (مهام + ملاحظات + روابط + جلسات) — مفيش رجوع!
        </div>
        <button
          className="btn"
          style={{ background: 'linear-gradient(135deg, #ff5252, #d32f2f)', color: '#fff' }}
          onClick={async () => {
            if (confirm('متأكد 100%؟ دي هتمسح كل حاجة نهائياً!')) await onClearAll();
          }}
        >🗑️ مسح كل البيانات</button>
      </div>
    </div>
  );
}
