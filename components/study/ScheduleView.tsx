'use client';

// ═══════════ ScheduleView — الجدول (إدارة مهام كاملة) ═══════════
// إضافة/تعديل/حذف/إكمال/تعليق/ملاحظات/رابط — زي table.html بالظبط

import { useState } from 'react';
import { DAYS, PRIORITY_COLOR, PRIORITY_ICON, PRIORITY_LABEL, type Priority, type Task } from './types';
import StudyModal, { fieldStyle, labelStyle } from './StudyModal';

interface Props {
  tasks: Task[];
  onAdd: (t: { day: string; text: string; priority: Priority; notes?: string; link?: string }) => Promise<void>;
  onUpdate: (id: number, patch: Partial<Task>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ScheduleView({ tasks, onAdd, onUpdate, onDelete, showToast }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [notesTask, setNotesTask] = useState<Task | null>(null);
  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'tomorrow' | 'week' | 'high' | 'medium' | 'low'>('all');
  const [search, setSearch] = useState('');

  // form state للإضافة
  const [form, setForm] = useState({ day: DAYS[0], text: '', priority: 'medium' as Priority, notes: '', link: '' });
  // form state للتعديل
  const [editForm, setEditForm] = useState({ day: '', text: '', priority: 'medium' as Priority, notes: '', link: '' });

  const todayIdx = new Date().getDay(); // JS: 0=Sunday
  const todayName = DAYS[(todayIdx + 1) % 7]; // تحويل: السبت index 0
  const tomorrowName = DAYS[(todayIdx + 2) % 7];

  const visibleTasks = tasks.filter((t) => {
    if (!showCompleted && t.done) return false;
    if (filter === 'high' || filter === 'medium' || filter === 'low') {
      if (t.priority !== filter) return false;
    }
    if (filter === 'today' && t.day !== todayName) return false;
    if (filter === 'tomorrow' && t.day !== tomorrowName) return false;
    if (filter === 'week') {
      // الأسبوع: من النهاردة لبعد 6 أيام
      const dayIdx = DAYS.indexOf(t.day);
      let inWeek = false;
      let i = (todayIdx + 1) % 7;
      for (let c = 0; c < 7; c++) {
        if (i === dayIdx) { inWeek = true; break; }
        i = (i + 1) % 7;
      }
      if (!inWeek) return false;
    }
    // البحث الفوري
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const inText = t.text.toLowerCase().includes(q);
      const inNotes = (t.notes || '').toLowerCase().includes(q);
      if (!inText && !inNotes) return false;
    }
    return true;
  });

  const openAdd = (day?: string) => {
    setForm({ day: day || todayName || DAYS[0], text: '', priority: 'medium', notes: '', link: '' });
    setAddOpen(true);
  };

  const openEdit = (t: Task) => {
    setEditTask(t);
    setEditForm({ day: t.day, text: t.text, priority: t.priority, notes: t.notes || '', link: t.link || '' });
  };

  const submitAdd = async () => {
    if (!form.text.trim()) { showToast('اكتب نص المهمة الأول', 'error'); return; }
    await onAdd({ day: form.day, text: form.text.trim(), priority: form.priority, notes: form.notes.trim() || undefined, link: form.link.trim() || undefined });
    setAddOpen(false);
  };

  const submitEdit = async () => {
    if (!editTask) return;
    if (!editForm.text.trim()) { showToast('اكتب نص المهمة الأول', 'error'); return; }
    await onUpdate(editTask.id, {
      day: editForm.day, text: editForm.text.trim(), priority: editForm.priority,
      notes: editForm.notes.trim() || null, link: editForm.link.trim() || null,
    });
    setEditTask(null);
  };

  const confirmDelete = (t: Task) => {
    setDeleteTaskConfirm(t);
  };

  const stats = {
    total: visibleTasks.length,
    done: visibleTasks.filter((t) => t.done).length,
    pct: visibleTasks.length ? Math.round((visibleTasks.filter((t) => t.done).length / visibleTasks.length) * 100) : 0,
  };

  // أيام العرض حسب الفلتر
  const visibleDays = filter === 'today' ? [todayName]
    : filter === 'tomorrow' ? [tomorrowName]
    : filter === 'week' ? Array.from({ length: 7 }, (_, i) => DAYS[(DAYS.indexOf(todayName) + i) % 7])
    : DAYS;

  return (
    <div>
      {/* البحث الفوري */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: 0.6 }}>🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في المهام..."
          style={{
            width: '100%', padding: '11px 38px', borderRadius: 10,
            background: 'var(--bg-soft)', border: '1px solid var(--border)',
            color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit',
            transition: 'border-color 0.15s',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 13,
            }}
          >✕</button>
        )}
      </div>

      {/* شريط الأدوات */}
      <div className="row spread" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => openAdd()}>➕ مهمة جديدة</button>
          <button className={`btn sm ${filter === 'all' ? '' : 'ghost'}`} onClick={() => setFilter('all')}>📋 الكل</button>
          <button className={`btn sm ${filter === 'today' ? '' : 'ghost'}`} onClick={() => setFilter('today')}>📅 النهاردة</button>
          <button className={`btn sm ${filter === 'tomorrow' ? '' : 'ghost'}`} onClick={() => setFilter('tomorrow')}>⏭️ بكرة</button>
          <button className={`btn sm ${filter === 'week' ? '' : 'ghost'}`} onClick={() => setFilter('week')}>🗓️ الأسبوع</button>
          <button className={`btn sm ${filter === 'high' ? '' : 'ghost'}`} onClick={() => setFilter('high')}>🔴 عالية</button>
          <button className={`btn sm ${filter === 'medium' ? '' : 'ghost'}`} onClick={() => setFilter('medium')}>🟡 متوسطة</button>
          <button className={`btn sm ${filter === 'low' ? '' : 'ghost'}`} onClick={() => setFilter('low')}>🔵 منخفضة</button>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--dim)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} />
          إظهار المكتملة
        </label>
      </div>

      {/* شريط التقدم */}
      <div className="card mb" style={{ padding: '12px 16px' }}>
        <div className="row spread" style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 12.5, color: 'var(--dim)' }}>تقدم الأسبوع</span>
          <b style={{ fontSize: 13 }}>{stats.done}/{stats.total} · {stats.pct}%</b>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${stats.pct}%`, borderRadius: 4,
            background: 'linear-gradient(90deg, #00e5ff, #2979ff)',
            boxShadow: '0 0 10px rgba(0,229,255,0.4)', transition: 'width 0.4s var(--ease)',
          }} />
        </div>
      </div>

      {/* أيام الأسبوع */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visibleDays.map((day) => {
          const dayTasks = visibleTasks.filter((t) => t.day === day);
          const doneCount = dayTasks.filter((t) => t.done).length;
          const dayPct = dayTasks.length ? Math.round((doneCount / dayTasks.length) * 100) : 0;
          const isToday = day === todayName;
          return (
            <div key={day} className="card" style={{ borderColor: isToday ? 'rgba(0,229,255,0.35)' : undefined }}>
              <div className="row spread" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <b style={{ fontSize: 14 }}>{day}</b>
                  {isToday && <span className="badge" style={{ background: 'rgba(0,229,255,0.15)', color: '#00e5ff', fontSize: 10 }}>اليوم</span>}
                  <span style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>{doneCount}/{dayTasks.length}</span>
                </div>
                <button
                  className="btn sm ghost"
                  style={{ padding: '4px 10px', fontSize: 12 }}
                  onClick={() => openAdd(day)}
                >➕</button>
              </div>

              {/* شريط تقدم اليوم */}
              {dayTasks.length > 0 && (
                <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{
                    height: '100%', width: `${dayPct}%`, borderRadius: 3,
                    background: 'linear-gradient(90deg, #00e5ff, #2979ff)', transition: 'width 0.4s',
                  }} />
                </div>
              )}

              {dayTasks.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--dim-2)', padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>مفيش مهام {filter === 'today' ? 'النهاردة' : filter === 'tomorrow' ? 'بكرة' : ''} — ضيف مهمة بالزر ➕</span>
                  <button className="btn sm ghost" style={{ padding: '3px 10px', fontSize: 11.5 }} onClick={() => openAdd(day)}>➕ ضيف</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {dayTasks.map((t) => {
                    const done = !!t.done;
                    const vacation = !!t.vacation;
                    return (
                      <div
                        key={t.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 12px', borderRadius: 10,
                          background: done ? 'rgba(0,230,118,0.04)' : vacation ? 'rgba(255,215,64,0.05)' : 'var(--bg-soft)',
                          border: '1px solid var(--border)',
                          borderInlineStart: `3px solid ${vacation ? '#ffd740' : done ? '#00e676' : PRIORITY_COLOR[t.priority]}`,
                          opacity: vacation ? 0.7 : 1,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => onUpdate(t.id, { done: done ? 0 : 1 })}
                          style={{ width: 17, height: 17, accentColor: '#00e5ff', cursor: 'pointer', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13.5, fontWeight: 600,
                            textDecoration: done ? 'line-through' : 'none',
                            color: done ? 'var(--dim)' : 'var(--text)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {t.text}
                          </div>
                          {(t.notes || t.link) && (
                            <div style={{ display: 'flex', gap: 10, marginTop: 2, fontSize: 11, color: 'var(--dim)' }}>
                              {t.notes && <span>📝 {t.notes.length > 40 ? t.notes.slice(0, 40) + '…' : t.notes}</span>}
                              {t.link && <span>🔗</span>}
                            </div>
                          )}
                        </div>
                        <span className="badge" style={{ fontSize: 10, background: `${PRIORITY_COLOR[t.priority]}22`, color: PRIORITY_COLOR[t.priority] }}>
                          {PRIORITY_ICON[t.priority]} {PRIORITY_LABEL[t.priority]}
                        </span>
                        {vacation && <span style={{ fontSize: 11, color: '#ffd740' }}>⏸️</span>}
                        {/* أزرار */}
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          <button title="ملاحظات" style={iconBtn} onClick={() => setNotesTask(t)}>📝</button>
                          {t.link && (
                            <a href={t.link} target="_blank" rel="noopener" title="فتح الرابط" style={iconBtn}>🔗</a>
                          )}
                          <button title="تعليق/إلغاء تعليق" style={iconBtn} onClick={() => onUpdate(t.id, { vacation: vacation ? 0 : 1 })}>
                            {vacation ? '▶️' : '⏸️'}
                          </button>
                          <button title="تعديل" style={iconBtn} onClick={() => openEdit(t)}>✏️</button>
                          <button title="حذف" style={{ ...iconBtn, color: 'var(--red)' }} onClick={() => confirmDelete(t)}>🗑️</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── مودال إضافة مهمة ─── */}
      {addOpen && (
        <StudyModal title="➕ إضافة مهمة جديدة" onClose={() => setAddOpen(false)} wide>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>نص المهمة *</label>
              <input style={fieldStyle} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="مثال: مراجعة الفيزياء - قوانين نيوتن" autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>اليوم</label>
                <select style={fieldStyle} value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>الأولوية</label>
                <select style={fieldStyle} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
                  <option value="high">🔴 عالية</option>
                  <option value="medium">🟡 متوسطة</option>
                  <option value="low">🔵 منخفضة</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>ملاحظات (اختياري)</label>
              <textarea style={{ ...fieldStyle, minHeight: 70, resize: 'vertical' }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="ملاحظات عن المهمة..." />
            </div>
            <div>
              <label style={labelStyle}>رابط (اختياري)</label>
              <input style={fieldStyle} value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." dir="ltr" />
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button className="btn ghost" onClick={() => setAddOpen(false)}>إلغاء</button>
              <button className="btn" onClick={submitAdd}>✅ إضافة</button>
            </div>
          </div>
        </StudyModal>
      )}

      {/* ─── مودال تعديل مهمة ─── */}
      {editTask && (
        <StudyModal title="✏️ تعديل المهمة" onClose={() => setEditTask(null)} wide>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>نص المهمة *</label>
              <input style={fieldStyle} value={editForm.text} onChange={(e) => setEditForm({ ...editForm, text: e.target.value })} autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>اليوم</label>
                <select style={fieldStyle} value={editForm.day} onChange={(e) => setEditForm({ ...editForm, day: e.target.value })}>
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>الأولوية</label>
                <select style={fieldStyle} value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Priority })}>
                  <option value="high">🔴 عالية</option>
                  <option value="medium">🟡 متوسطة</option>
                  <option value="low">🔵 منخفضة</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>ملاحظات</label>
              <textarea style={{ ...fieldStyle, minHeight: 70 }} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>رابط</label>
              <input style={fieldStyle} value={editForm.link} onChange={(e) => setEditForm({ ...editForm, link: e.target.value })} dir="ltr" />
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button className="btn ghost" onClick={() => setEditTask(null)}>إلغاء</button>
              <button className="btn" onClick={submitEdit}>💾 حفظ</button>
            </div>
          </div>
        </StudyModal>
      )}

      {/* ─── مودال تأكيد الحذف ─── */}
      {deleteTaskConfirm && (
        <StudyModal title="🗑️ تأكيد الحذف" onClose={() => setDeleteTaskConfirm(null)}>
          <div style={{ fontSize: 13.5, lineHeight: 1.8 }}>
            متأكد إنك عايز تحذف: <b>«{deleteTaskConfirm.text}»</b>؟<br />
            <span style={{ color: 'var(--dim)', fontSize: 12 }}>مفيش رجوع بعد الحذف.</span>
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
            <button className="btn ghost" onClick={() => setDeleteTaskConfirm(null)}>إلغاء</button>
            <button
              className="btn"
              style={{ background: 'linear-gradient(135deg, #ff5252, #d32f2f)', color: '#fff' }}
              onClick={() => { onDelete(deleteTaskConfirm.id); setDeleteTaskConfirm(null); }}
            >🗑️ نعم، احذف</button>
          </div>
        </StudyModal>
      )}

      {/* ─── مودال عرض ملاحظات المهمة ─── */}
      {notesTask && (
        <StudyModal title={`📝 ملاحظات: ${notesTask.text}`} onClose={() => setNotesTask(null)}>
          <div style={{ fontSize: 13.5, lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
            {notesTask.notes || 'مفيش ملاحظات على المهمة دي.'}
          </div>
          {notesTask.link && (
            <a href={notesTask.link} target="_blank" rel="noopener" className="btn sm" style={{ marginTop: 14 }}>
              🔗 فتح الرابط المرتبط
            </a>
          )}
        </StudyModal>
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontSize: 14, padding: 4, borderRadius: 6, color: 'var(--dim)',
  transition: 'all 0.12s',
};
