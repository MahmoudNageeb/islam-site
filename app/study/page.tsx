'use client';

// ═══════════ 📚 مهامي — نظام المذاكرة الذكي (v6 JARVIS) ═══════════
// 10 أقسام: الرئيسية / الجدول / بومودورو / ملاحظات / تقويم / مكافآت / روابط / إحصائيات / بروفايل / إعدادات

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Link, Note, Priority, Rewards, SessionRow, Settings, Task } from '@/components/study/types';
import HomeView from '@/components/study/HomeView';
import ScheduleView from '@/components/study/ScheduleView';
import PomodoroView from '@/components/study/PomodoroView';
import NotesView from '@/components/study/NotesView';
import CalendarView from '@/components/study/CalendarView';
import RewardsView from '@/components/study/RewardsView';
import ResourcesView from '@/components/study/ResourcesView';
import StatsView from '@/components/study/StatsView';
import ProfileView from '@/components/study/ProfileView';
import SettingsView from '@/components/study/SettingsView';

type Tab = 'home' | 'schedule' | 'pomodoro' | 'notes' | 'calendar' | 'rewards' | 'resources' | 'stats' | 'profile' | 'settings';

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'home', icon: '🎯', label: 'مهامي' },
  { id: 'schedule', icon: '📅', label: 'الجدول' },
  { id: 'pomodoro', icon: '🍅', label: 'بومودورو' },
  { id: 'notes', icon: '📝', label: 'ملاحظات' },
  { id: 'calendar', icon: '🗓️', label: 'تقويم' },
  { id: 'rewards', icon: '🏆', label: 'مكافآت' },
  { id: 'resources', icon: '🔗', label: 'روابط' },
  { id: 'stats', icon: '📊', label: 'إحصائيات' },
  { id: 'profile', icon: '👤', label: 'بروفايل' },
  { id: 'settings', icon: '⚙️', label: 'إعدادات' },
];

export default function StudyPage() {
  const [tab, setTab] = useState<Tab>('home');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [settings, setSettings] = useState<Settings>({ work_time: '25', break_time: '5', long_break_time: '15', theme: 'dark', notifications: 'true' });
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  const [aiOpen, setAiOpen] = useState(false);

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const [t, n, l, s, r, st] = await Promise.all([
        fetch('/study/api/tasks').then((r) => r.json()),
        fetch('/study/api/notes').then((r) => r.json()),
        fetch('/study/api/links').then((r) => r.json()),
        fetch('/study/api/sessions').then((r) => r.json()),
        fetch('/study/api/rewards').then((r) => r.json()),
        fetch('/study/api/settings').then((r) => r.json()),
      ]);
      setTasks(t.tasks || []);
      setNotes(n.notes || []);
      setLinks(l.links || []);
      setSessions(s.sessions || []);
      if (r.rewards) setRewards(r.rewards);
      if (st.settings) setSettings({ ...settings, ...st.settings });
    } catch (e: any) {
      showToast('فشل تحميل البيانات: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ─── المهام ───
  const addTask = async (t: { day: string; text: string; priority: Priority; notes?: string; link?: string }) => {
    const res = await fetch('/study/api/tasks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t),
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'فشل الإضافة', 'error'); return; }
    setTasks((prev) => [...prev, data.task]);
    showToast('تمت إضافة المهمة ✅', 'success');
    // نقاط إضافة
    try { await fetch('/study/api/points', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: 5, reason: 'إضافة مهمة' }) }); loadAll(); } catch {}
  };

  const updateTask = async (id: number, patch: Partial<Task>) => {
    const res = await fetch('/study/api/tasks', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'فشل التعديل', 'error'); return; }
    setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
    // لو اكتملت → نقاط
    if (patch.done === 1) {
      const pts = patch.priority === 'high' ? 30 : patch.priority === 'medium' ? 20 : 10;
      try { await fetch('/study/api/points', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: pts, reason: 'إكمال مهمة' }) }); loadAll(); } catch {}
    }
  };

  const deleteTask = async (id: number) => {
    const res = await fetch(`/study/api/tasks?id=${id}`, { method: 'DELETE' });
    if (!res.ok) { showToast('فشل الحذف', 'error'); return; }
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('تم حذف المهمة 🗑️', 'success');
  };

  // ─── الملاحظات ───
  const addNote = async (n: { title: string; content: string }) => {
    const res = await fetch('/study/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(n) });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'فشل الإضافة', 'error'); return; }
    setNotes((prev) => [data.note, ...prev]);
    showToast('تمت إضافة الملاحظة 📝', 'success');
  };

  const updateNote = async (id: number, patch: Partial<Note>) => {
    const res = await fetch('/study/api/notes', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...patch }) });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'فشل التعديل', 'error'); return; }
    setNotes((prev) => prev.map((n) => (n.id === id ? data.note : n)));
    showToast('تم تعديل الملاحظة ✏️', 'success');
  };

  const deleteNote = async (id: number) => {
    const res = await fetch(`/study/api/notes?id=${id}`, { method: 'DELETE' });
    if (!res.ok) { showToast('فشل الحذف', 'error'); return; }
    setNotes((prev) => prev.filter((n) => n.id !== id));
    showToast('تم حذف الملاحظة 🗑️', 'success');
  };

  // ─── الروابط ───
  const addLink = async (l: { name: string; url: string; description?: string }) => {
    const res = await fetch('/study/api/links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(l) });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'فشل الإضافة', 'error'); return; }
    setLinks((prev) => [data.link, ...prev]);
    showToast('تمت إضافة الرابط 🔗', 'success');
  };

  const deleteLink = async (id: number) => {
    const res = await fetch(`/study/api/links?id=${id}`, { method: 'DELETE' });
    if (!res.ok) { showToast('فشل الحذف', 'error'); return; }
    setLinks((prev) => prev.filter((l) => l.id !== id));
    showToast('تم حذف الرابط 🗑️', 'success');
  };

  // ─── البومودورو ───
  const onSessionComplete = async (type: string, duration: number) => {
    try {
      await fetch('/study/api/sessions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, duration_seconds: duration, planned_seconds: duration, date: new Date().toISOString().slice(0, 10) }),
      });
      const pts = type === 'work' ? 2 : 0;
      if (pts) await fetch('/study/api/points', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: pts, reason: 'جلسة بومودورو' }) });
      showToast(type === 'work' ? '🍅 جلسة بومودورو خلصت! استريح شوية' : '☕ الراحة خلصت — نرجع نشغل!', 'success');
      loadAll();
    } catch {}
  };

  const saveSetting = async (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    try {
      await fetch('/study/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) });
    } catch {}
  };

  const onImport = async (data: { tasks: Task[]; notes: Note[]; links: Link[] }) => {
    try {
      // استيراد المهام
      for (const t of data.tasks || []) {
        await fetch('/study/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ day: t.day, text: t.text, priority: t.priority, notes: t.notes, link: t.link }) });
      }
      for (const n of data.notes || []) {
        await fetch('/study/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: n.title, content: n.content }) });
      }
      for (const l of data.links || []) {
        await fetch('/study/api/links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: l.name, url: l.url, description: l.description }) });
      }
      loadAll();
    } catch (e: any) {
      showToast('فشل الاستيراد: ' + e.message, 'error');
    }
  };

  const onClearAll = async () => {
    try {
      for (const t of tasks) await fetch(`/study/api/tasks?id=${t.id}`, { method: 'DELETE' });
      for (const n of notes) await fetch(`/study/api/notes?id=${n.id}`, { method: 'DELETE' });
      for (const l of links) await fetch(`/study/api/links?id=${l.id}`, { method: 'DELETE' });
      for (const s of sessions) await fetch(`/study/api/sessions?id=${s.id}`, { method: 'DELETE' });
      loadAll();
      showToast('تم مسح كل البيانات 🗑️', 'success');
    } catch (e: any) {
      showToast('فشل المسح: ' + e.message, 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const points = rewards?.points ?? 0;
  const level = Math.floor(points / 100) + 1;
  const streak = rewards?.streak_days ?? 0;
  const completedTasksCount = tasks.filter((t) => t.done).length;
  const studyDays = new Set(sessions.map((s) => s.date)).size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* التبويبات */}
      <div className="study-tabs" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`study-tab ${tab === t.id ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
              padding: '9px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 700,
              cursor: 'pointer', border: '1px solid transparent', fontFamily: 'inherit',
              background: tab === t.id ? 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(41,121,255,0.08))' : 'transparent',
              color: tab === t.id ? '#00e5ff' : 'var(--dim)',
              borderColor: tab === t.id ? 'rgba(0,229,255,0.3)' : 'var(--border)',
              transition: 'all 0.15s',
            }}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* المحتوى */}
      <div className="anim-fade" key={tab}>
        {tab === 'home' && (
          <HomeView
            tasks={tasks} points={points} level={level} streak={streak}
            sessionsCount={sessions.length} onNavigate={(t) => setTab(t as Tab)}
            onUpdate={updateTask}
          />
        )}
        {tab === 'schedule' && (
          <ScheduleView tasks={tasks} onAdd={addTask} onUpdate={updateTask} onDelete={deleteTask} showToast={showToast} />
        )}
        {tab === 'pomodoro' && (
          <PomodoroView
            workTime={parseInt(settings.work_time) || 25}
            breakTime={parseInt(settings.break_time) || 5}
            longBreakTime={parseInt(settings.long_break_time) || 15}
            sessionsCount={sessions.length}
            onSessionComplete={onSessionComplete}
            onSaveSettings={saveSetting}
          />
        )}
        {tab === 'notes' && (
          <NotesView notes={notes} onAdd={addNote} onUpdate={updateNote} onDelete={deleteNote} showToast={showToast} />
        )}
        {tab === 'calendar' && <CalendarView tasks={tasks} />}
        {tab === 'rewards' && (
          <RewardsView
            points={points} completedTasksCount={completedTasksCount}
            streak={streak} sessionsCount={sessions.length}
            notes={notes} links={links} studyDays={studyDays}
          />
        )}
        {tab === 'resources' && (
          <ResourcesView links={links} onAdd={addLink} onDelete={deleteLink} showToast={showToast} />
        )}
        {tab === 'stats' && <StatsView tasks={tasks} sessions={sessions} streak={streak} />}
        {tab === 'profile' && (
          <ProfileView tasks={tasks} notes={notes} links={links} sessions={sessions} points={points} streak={streak} />
        )}
        {tab === 'settings' && (
          <SettingsView
            workTime={parseInt(settings.work_time) || 25}
            breakTime={parseInt(settings.break_time) || 5}
            longBreakTime={parseInt(settings.long_break_time) || 15}
            tasks={tasks} notes={notes} links={links} sessions={sessions}
            onSaveSetting={saveSetting} onImport={onImport} onClearAll={onClearAll} showToast={showToast}
          />
        )}
      </div>

      {/* زر الـ AI */}
      <button
        className="ai-fab"
        onClick={() => setAiOpen(!aiOpen)}
        title="إسلام — مساعد المذاكرة"
        style={{
          position: 'fixed', bottom: 24, left: 24, zIndex: 250,
          width: 54, height: 54, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #00e5ff, #2979ff)', color: '#fff',
          fontSize: 24, boxShadow: '0 4px 24px rgba(0,229,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.15s',
        }}
      >🤖</button>

      {/* شات الـ AI */}
      {aiOpen && <AiChat onClose={() => setAiOpen(false)} tasks={tasks} showToast={showToast} />}

      {/* الـ Toasts */}
      <div style={{ position: 'fixed', top: 70, right: 16, zIndex: 400, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="hud-toast"
            style={{
              padding: '11px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 600,
              background: 'var(--bg-card-solid)', border: '1px solid var(--border-strong)',
              borderInlineStart: `3px solid ${t.type === 'success' ? '#00e676' : t.type === 'error' ? '#ff5252' : '#00e5ff'}`,
              boxShadow: 'var(--shadow-md)', animation: 'slide-in-left 0.2s var(--ease)',
            }}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════ AI Chat — مساعد ذكي عائم ═══════════
function AiChat({ onClose, tasks, showToast }: { onClose: () => void; tasks: Task[]; showToast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'أهلاً يا محمود! 👋 أنا إسلام — مساعد المذاكرة. اسألني عن جدولك أو اطلب مني خطة مذاكرة!' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [typed, setTyped] = useState<{ [k: number]: string }>({});
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => { boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  // Typewriter effect
  useEffect(() => {
    const lastAi = messages.map((m, i) => ({ m, i })).filter((x) => x.m.role === 'ai').pop();
    if (!lastAi) return;
    const full = lastAi.m.text;
    if (typed[lastAi.i] === full) return;
    let idx = 0;
    const iv = setInterval(() => {
      idx = Math.min(idx + 3, full.length);
      setTyped((prev) => ({ ...prev, [lastAi.i]: full.slice(0, idx) }));
      if (idx >= full.length) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [messages, typed]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setBusy(true);
    setMessages((prev) => [...prev, { role: 'ai', text: '...' }]);
    try {
      const summary = `عندي ${tasks.length} مهمة، ${tasks.filter((t) => t.done).length} مكتملة. مهام اليوم: ${tasks.filter((t) => t.day === ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'][(new Date().getDay() + 1) % 7]).slice(0, 5).map((t) => t.text).join('، ') || 'مفيش'}`;
      const res = await fetch('/study/api/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `${summary}\n\nسؤال محمود: ${text}` }] }),
      });
      const data = await res.json();
      const reply = data.reply || 'آسف، حصلت مشكلة. جرب تاني.';
      setMessages((prev) => prev.map((m, i) => (i === prev.length - 1 ? { role: 'ai', text: reply } : m)));
    } catch {
      setMessages((prev) => prev.map((m, i) => (i === prev.length - 1 ? { role: 'ai', text: 'حصلت مشكلة في الاتصال. جرب تاني.' } : m)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', bottom: 88, left: 24, zIndex: 260,
      width: 'min(360px, calc(100vw - 32px))', maxHeight: '60vh',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-card-solid)', border: '1px solid var(--border-strong)',
      borderRadius: 16, boxShadow: '0 12px 48px rgba(0,0,0,0.5), 0 0 40px rgba(0,229,255,0.06)',
      overflow: 'hidden', animation: 'scale-in 0.2s var(--ease-spring)',
    }}>
      {/* الهيدر */}
      <div style={{
        padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(135deg, #00b8d4, #2979ff)', color: '#fff',
      }}>
        <b style={{ fontSize: 13.5 }}>🤖 إسلام — مساعد المذاكرة</b>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16 }}>✕</button>
      </div>
      {/* الرسايل */}
      <div ref={boxRef} style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '38vh' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%', padding: '9px 13px', borderRadius: 12,
            background: m.role === 'user' ? 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(41,121,255,0.15))' : 'var(--bg-soft)',
            border: `1px solid ${m.role === 'user' ? 'rgba(0,229,255,0.3)' : 'var(--border)'}`,
            fontSize: 12.5, lineHeight: 1.7, whiteSpace: 'pre-wrap',
          }}>
            {m.role === 'ai' && m.text === '...' ? (
              <span className="typing-dots"><span>.</span><span>.</span><span>.</span></span>
            ) : (
              (m.role === 'ai' ? (typed[i] || m.text) : m.text)
            )}
          </div>
        ))}
      </div>
      {/* الإدخال */}
      <div style={{ padding: 10, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="اسألني عن جدولك..."
          style={{
            flex: 1, padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--bg-soft)', color: 'var(--text)', fontSize: 12.5, outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button onClick={send} disabled={busy} style={{
          padding: '9px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #00e5ff, #2979ff)', color: '#fff', fontWeight: 700, fontSize: 13,
        }}>{busy ? '…' : '➤'}</button>
      </div>
    </div>
  );
}
