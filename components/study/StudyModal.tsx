'use client';

// ═══════════ StudyModal — نافذة منبثقة موحدة ═══════════

interface StudyModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

export default function StudyModal({ title, onClose, children, wide }: StudyModalProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        animation: 'fade-in 0.15s var(--ease)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: wide ? 560 : 460, maxHeight: '90vh', overflowY: 'auto',
          background: 'var(--bg-card-solid)',
          border: '1px solid var(--border-strong)',
          borderRadius: 14,
          boxShadow: 'var(--shadow-md), 0 0 40px rgba(0,229,255,0.08)',
          padding: 20,
          animation: 'scale-in 0.2s var(--ease-spring)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', color: 'var(--dim)',
              cursor: 'pointer', fontSize: 18, lineHeight: 1,
            }}
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// حقول موحدة
export const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: '1px solid var(--border)', background: 'var(--bg-soft)',
  color: 'var(--text)', fontSize: 13.5, outline: 'none', fontFamily: 'inherit',
};
export const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--dim)', marginBottom: 6,
};
