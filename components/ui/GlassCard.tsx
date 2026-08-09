'use client';

// ═══════════ GlassCard — بطاقة زجاجية فخمة (v5) ═══════════
// سطح شفاف + حد متدرج ناعم + hover يرفع البطاقة

interface GlassCardProps {
  children: React.ReactNode;
  title?: string;
  icon?: string;
  glow?: 'primary' | 'accent' | 'green' | 'gold' | 'red' | '';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function GlassCard({ children, title, icon, glow = '', className = '', style, onClick }: GlassCardProps) {
  return (
    <div
      className={`card ${glow ? `glow-${glow}` : ''} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ ...(onClick ? { cursor: 'pointer' } : {}), ...style }}
      onClick={onClick}
    >
      {title && (
        <div className="card-title">
          {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
