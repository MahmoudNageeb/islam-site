'use client';

// ═══════════ ProgressBar — شريط تقدم متدرج (v5) ═══════════

interface ProgressBarProps {
  pct: number;               // 0-100
  label?: string;
  status?: 'working' | 'done' | 'failed';
  size?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({ pct, label, status = 'working', size = 'md' }: ProgressBarProps) {
  const h = size === 'sm' ? 6 : size === 'lg' ? 14 : 9;
  const color =
    status === 'done'
      ? 'linear-gradient(90deg, #3ddc97, #22c08a)'
      : status === 'failed'
        ? 'linear-gradient(90deg, #ff6b81, #ff4d6d)'
        : 'linear-gradient(90deg, #7c86ff, #b18cff, #4cc9f0)';

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 12.5 }}>
          <span style={{ color: status === 'done' ? 'var(--green)' : status === 'failed' ? 'var(--red)' : 'var(--text)' }}>
            {status === 'done' ? '✅' : status === 'failed' ? '❌' : '🔄'} {label}
          </span>
          <span style={{ color: 'var(--dim)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div style={{ background: 'rgba(255,255,255,.07)', borderRadius: 999, height: h, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,.3)' }}>
        <div
          style={{
            height: '100%',
            width: `${Math.min(Math.max(pct, 0), 100)}%`,
            borderRadius: 999,
            background: color,
            transition: 'width .6s cubic-bezier(.4,0,.2,1), background .4s',
            boxShadow: '0 0 14px rgba(124,134,255,.35)',
          }}
        />
      </div>
    </div>
  );
}
