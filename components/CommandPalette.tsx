'use client';

// ═══════════ CommandPalette — شريط الأوامر السريع (⌘K / Ctrl+K) ═══════════
// اضغط Ctrl+K في أي وقت: انتقل لأي صفحة + أوامر سريعة

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CmdItem {
  icon: string;
  label: string;
  hint?: string;
  action: () => void;
}

export default function CommandPalette({ onToggleTheme, onFocusMode }: {
  onToggleTheme: () => void;
  onFocusMode: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const items: CmdItem[] = [
    { icon: '🏠', label: 'الرئيسية', hint: '/', action: () => router.push('/') },
    { icon: '📚', label: 'مهامي', hint: '/study', action: () => router.push('/study') },
    { icon: '🏢', label: 'الشركة', hint: '/company', action: () => router.push('/company') },
    { icon: '🤖', label: 'ميكاترونكس', hint: '/mecha', action: () => router.push('/mecha') },
    { icon: '🎛️', label: 'التحكم', hint: '/control', action: () => router.push('/control') },
    { icon: '📊', label: 'السيرفر', hint: '/server', action: () => router.push('/server') },
    { icon: '🗓️', label: 'التقويم', hint: '/calendar', action: () => router.push('/calendar') },
    { icon: '🧬', label: 'DNA', hint: '/dna', action: () => router.push('/dna') },
    { icon: '🎮', label: 'الإنجازات', hint: '/profile', action: () => router.push('/profile') },
    { icon: '🛰️', label: 'السينما', hint: '/cinema', action: () => router.push('/cinema') },
    { icon: '🤖', label: 'الجارديان', hint: '/guardian', action: () => router.push('/guardian') },
    { icon: '⚙️', label: 'الإعدادات', hint: '/settings', action: () => router.push('/settings') },
    { icon: '🌙', label: 'بدّل الثيم', hint: 'T', action: () => onToggleTheme() },
    { icon: '🎯', label: 'وضع التركيز', hint: 'F', action: () => onFocusMode() },
  ];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement)) {
        onToggleTheme();
      } else if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement)) {
        onFocusMode();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onToggleTheme, onFocusMode]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = items.filter((i) =>
    i.label.includes(query.trim()) || (i.hint || '').includes(query.trim())
  );

  const run = (item: CmdItem) => {
    item.action();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="cmd-overlay" onClick={() => setOpen(false)}>
      <div className="cmd-palette" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <span style={{ fontSize: 16, opacity: 0.7 }}>⌘</span>
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="اكتب للبحث في الصفحات والأوامر..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtered.length - 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
              if (e.key === 'Enter' && filtered[activeIdx]) run(filtered[activeIdx]);
            }}
          />
          <span className="cmd-kbd">ESC</span>
        </div>
        <div className="cmd-list">
          {filtered.length === 0 ? (
            <div className="cmd-empty">مفيش نتائج — جرب كلمة تانية 🔍</div>
          ) : (
            filtered.map((item, i) => (
              <div
                key={item.label}
                className={`cmd-item ${i === activeIdx ? 'active' : ''}`}
                onClick={() => run(item)}
                onMouseEnter={() => setActiveIdx(i)}
              >
                <span className="cmd-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.hint && <span className="cmd-hint">{item.hint}</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
