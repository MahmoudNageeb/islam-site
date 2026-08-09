'use client';

// ═══════════ ResourcesView — الروابط المفيدة (زي table.html) ═══════════

import { useState } from 'react';
import type { Link } from './types';
import StudyModal, { fieldStyle, labelStyle } from './StudyModal';

interface Props {
  links: Link[];
  onAdd: (l: { name: string; url: string; description?: string }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ResourcesView({ links, onAdd, onDelete, showToast }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteLinkConfirm, setDeleteLinkConfirm] = useState<Link | null>(null);
  const [form, setForm] = useState({ name: '', url: '', description: '' });

  const submit = async () => {
    if (!form.name.trim() || !form.url.trim()) { showToast('اكتب اسم ورابط الموقع', 'error'); return; }
    let url = form.url.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    try { new URL(url); } catch { showToast('الرابط غير صالح', 'error'); return; }
    await onAdd({ name: form.name.trim(), url, description: form.description.trim() || undefined });
    setAddOpen(false);
    setForm({ name: '', url: '', description: '' });
  };

  return (
    <div>
      <div className="row spread" style={{ marginBottom: 14 }}>
        <b style={{ fontSize: 14 }}>🔗 الروابط المفيدة ({links.length})</b>
        <button className="btn" onClick={() => setAddOpen(true)}>➕ إضافة رابط</button>
      </div>

      {links.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--dim)' }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>🔗</div>
          مفيش روابط لسه — ضيف مواقع بتذاكر منها!
        </div>
      ) : (
        <div className="grid cols-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {links.map((l) => (
            <div key={l.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <b style={{ fontSize: 14 }}>🔗 {l.name}</b>
                <button
                  className="btn sm ghost"
                  style={{ padding: '2px 8px', fontSize: 12, color: 'var(--red)' }}
                  onClick={() => setDeleteLinkConfirm(l)}
                >🗑️</button>
              </div>
              {l.description && <div style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.6 }}>{l.description}</div>}
              <a href={l.url} target="_blank" rel="noopener" className="btn sm" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                فتح الموقع ↗
              </a>
            </div>
          ))}
        </div>
      )}

      {addOpen && (
        <StudyModal title="➕ رابط مفيد" onClose={() => setAddOpen(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>اسم الموقع *</label>
              <input style={fieldStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: خان أكاديمي" autoFocus />
            </div>
            <div>
              <label style={labelStyle}>الرابط *</label>
              <input style={fieldStyle} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." dir="ltr" />
            </div>
            <div>
              <label style={labelStyle}>وصف (اختياري)</label>
              <input style={fieldStyle} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="إيه اللي في الموقع؟" />
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn ghost" onClick={() => setAddOpen(false)}>إلغاء</button>
              <button className="btn" onClick={submit}>💾 إضافة</button>
            </div>
          </div>
        </StudyModal>
      )}

      {/* تأكيد الحذف */}
      {deleteLinkConfirm && (
        <StudyModal title="🗑️ تأكيد الحذف" onClose={() => setDeleteLinkConfirm(null)}>
          <div style={{ fontSize: 13.5, lineHeight: 1.8 }}>
            متأكد تحذف الرابط: <b>«{deleteLinkConfirm.name}»</b>؟
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
            <button className="btn ghost" onClick={() => setDeleteLinkConfirm(null)}>إلغاء</button>
            <button
              className="btn"
              style={{ background: 'linear-gradient(135deg, #ff5252, #d32f2f)', color: '#fff' }}
              onClick={() => { onDelete(deleteLinkConfirm.id); setDeleteLinkConfirm(null); }}
            >🗑️ نعم، احذف</button>
          </div>
        </StudyModal>
      )}
    </div>
  );
}
