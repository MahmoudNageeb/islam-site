'use client';

// ═══════════ NotesHub — ملاحظات + روابط في تبويب واحد ═══════════
import { useState } from 'react';
import type { Link, Note } from './types';
import NotesView from './NotesView';
import ResourcesView from './ResourcesView';

interface Props {
  notes: Note[];
  links: Link[];
  onAddNote: (n: { title: string; content: string }) => Promise<void>;
  onUpdateNote: (id: number, patch: Partial<Note>) => Promise<void>;
  onDeleteNote: (id: number) => Promise<void>;
  onAddLink: (l: { name: string; url: string; description?: string }) => Promise<void>;
  onDeleteLink: (id: number) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function NotesHub(props: Props) {
  const [sub, setSub] = useState<'notes' | 'links'>('notes');

  return (
    <div>
      {/* سوب-تبويبات */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button
          onClick={() => setSub('notes')}
          style={{
            padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', border: '1px solid transparent', transition: 'all 0.15s',
            background: sub === 'notes' ? 'linear-gradient(135deg, rgba(255,215,64,0.15), rgba(255,152,0,0.08))' : 'var(--bg-soft)',
            color: sub === 'notes' ? '#ffd740' : 'var(--dim)',
            borderColor: sub === 'notes' ? 'rgba(255,215,64,0.3)' : 'var(--border)',
          }}
        >📝 ملاحظات ({props.notes.length})</button>
        <button
          onClick={() => setSub('links')}
          style={{
            padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', border: '1px solid transparent', transition: 'all 0.15s',
            background: sub === 'links' ? 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(41,121,255,0.08))' : 'var(--bg-soft)',
            color: sub === 'links' ? '#00e5ff' : 'var(--dim)',
            borderColor: sub === 'links' ? 'rgba(0,229,255,0.3)' : 'var(--border)',
          }}
        >🔗 روابط ({props.links.length})</button>
      </div>

      <div key={sub} className="anim-fade">
        {sub === 'notes' ? (
          <NotesView
            notes={props.notes}
            onAdd={props.onAddNote}
            onUpdate={props.onUpdateNote}
            onDelete={props.onDeleteNote}
            showToast={props.showToast}
          />
        ) : (
          <ResourcesView
            links={props.links}
            onAdd={props.onAddLink}
            onDelete={props.onDeleteLink}
            showToast={props.showToast}
          />
        )}
      </div>
    </div>
  );
}
