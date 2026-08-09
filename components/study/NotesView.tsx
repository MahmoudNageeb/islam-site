'use client';

// ═══════════ NotesView — الملاحظات (CRUD كامل) ═══════════

import { useState } from 'react';
import type { Note } from './types';
import StudyModal, { fieldStyle, labelStyle } from './StudyModal';

interface Props {
  notes: Note[];
  onAdd: (n: { title: string; content: string }) => Promise<void>;
  onUpdate: (id: number, patch: Partial<Note>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function NotesView({ notes, onAdd, onUpdate, onDelete, showToast }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [deleteNoteConfirm, setDeleteNoteConfirm] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: '', content: '' });

  const submitAdd = async () => {
    if (!form.title.trim() || !form.content.trim()) { showToast('اكتب عنوان ومحتوى الملاحظة', 'error'); return; }
    await onAdd({ title: form.title.trim(), content: form.content.trim() });
    setAddOpen(false);
    setForm({ title: '', content: '' });
  };

  const submitEdit = async () => {
    if (!editNote) return;
    await onUpdate(editNote.id, { title: form.title.trim(), content: form.content.trim() });
    setEditNote(null);
  };

  return (
    <div>
      <div className="row spread" style={{ marginBottom: 14 }}>
        <b style={{ fontSize: 14 }}>📝 ملاحظاتك ({notes.length})</b>
        <button className="btn" onClick={() => { setForm({ title: '', content: '' }); setAddOpen(true); }}>➕ ملاحظة جديدة</button>
      </div>

      {notes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--dim)' }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>📝</div>
          مفيش ملاحظات لسه — ابدأ دوّن أول ملاحظة!
        </div>
      ) : (
        <div className="grid cols-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {notes.map((n) => (
            <div key={n.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <b style={{ fontSize: 14 }}>{n.title}</b>
              <div style={{ fontSize: 12.5, color: 'var(--dim)', lineHeight: 1.7, flex: 1, whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'hidden' }}>
                {n.content}
              </div>
              <div className="row" style={{ gap: 6, justifyContent: 'flex-end', marginTop: 6 }}>
                <button className="btn sm ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => { setForm({ title: n.title, content: n.content }); setEditNote(n); }}>✏️ تعديل</button>
                <button className="btn sm ghost" style={{ padding: '4px 10px', fontSize: 12, color: 'var(--red)' }} onClick={() => setDeleteNoteConfirm(n)}>🗑️ حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* تأكيد الحذف */}
      {deleteNoteConfirm && (
        <StudyModal title="🗑️ تأكيد الحذف" onClose={() => setDeleteNoteConfirm(null)}>
          <div style={{ fontSize: 13.5, lineHeight: 1.8 }}>
            متأكد تحذف: <b>«{deleteNoteConfirm.title}»</b>؟
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
            <button className="btn ghost" onClick={() => setDeleteNoteConfirm(null)}>إلغاء</button>
            <button
              className="btn"
              style={{ background: 'linear-gradient(135deg, #ff5252, #d32f2f)', color: '#fff' }}
              onClick={() => { onDelete(deleteNoteConfirm.id); setDeleteNoteConfirm(null); }}
            >🗑️ نعم، احذف</button>
          </div>
        </StudyModal>
      )}

      {/* إضافة */}
      {addOpen && (
        <StudyModal title="➕ ملاحظة جديدة" onClose={() => setAddOpen(false)} wide>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>العنوان *</label>
              <input style={fieldStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان الملاحظة" autoFocus />
            </div>
            <div>
              <label style={labelStyle}>المحتوى *</label>
              <textarea style={{ ...fieldStyle, minHeight: 130, resize: 'vertical' }} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="اكتب ملاحظاتك هنا..." />
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn ghost" onClick={() => setAddOpen(false)}>إلغاء</button>
              <button className="btn" onClick={submitAdd}>💾 حفظ</button>
            </div>
          </div>
        </StudyModal>
      )}

      {/* تعديل */}
      {editNote && (
        <StudyModal title="✏️ تعديل الملاحظة" onClose={() => setEditNote(null)} wide>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>العنوان *</label>
              <input style={fieldStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
            </div>
            <div>
              <label style={labelStyle}>المحتوى *</label>
              <textarea style={{ ...fieldStyle, minHeight: 130, resize: 'vertical' }} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn ghost" onClick={() => setEditNote(null)}>إلغاء</button>
              <button className="btn" onClick={submitEdit}>💾 حفظ</button>
            </div>
          </div>
        </StudyModal>
      )}
    </div>
  );
}
