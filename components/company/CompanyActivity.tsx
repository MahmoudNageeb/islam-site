'use client';

// ═══════ CompanyActivity — Activity Feed حي ═══════

interface Notif {
  id: string;
  title: string;
  body?: string;
  status?: string;
  icon?: string;
  time?: string;
}

interface AuditItem {
  time: string;
  action: string;
  detail: string;
}

interface Props {
  notifications: Notif[];
  audit: AuditItem[];
}

const ACTION_ICONS: Record<string, string> = {
  hire: '🤝', fire: '🚪', train: '📚', promote: '🏆', market: '🆕', salaries: '💰', event: '⚡',
  compete: '🎯', reinstate: '🔄', xp: '⚡', department: '📂',
};

export default function CompanyActivity({ notifications, audit }: Props) {
  // Feed = آخر الإشعارات + آخر الـ audit
  const feed: { icon: string; title: string; detail?: string; time?: string; status?: string }[] = [];

  notifications.slice(0, 8).forEach((n) => {
    feed.push({
      icon: n.icon || '🔔',
      title: n.title,
      detail: n.body,
      time: n.time,
      status: n.status,
    });
  });

  audit.slice(0, 12).forEach((a) => {
    feed.push({
      icon: ACTION_ICONS[a.action] || '📌',
      title: a.action,
      detail: a.detail,
      time: a.time,
    });
  });

  feed.sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());

  const timeAgo = (iso?: string) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'الآن';
    if (min < 60) return `منذ ${min} د`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `منذ ${hr} س`;
    return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <b style={{ fontSize: 14 }}>⚡ النشاط الحي</b>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--dim)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5ff', animation: 'pulse-dot 1.5s infinite' }} />
          LIVE
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 380, overflowY: 'auto', paddingInlineEnd: 4 }}>
        {feed.length === 0 && <div className="loading">مفيش نشاط لسه...</div>}
        {feed.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex', gap: 9, padding: '8px 10px', borderRadius: 9,
              background: item.status === 'error' ? 'rgba(255,82,82,0.05)' : 'var(--bg-soft)',
              border: `1px solid ${item.status === 'error' ? 'rgba(255,82,82,0.15)' : 'var(--border)'}`,
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <b style={{ fontSize: 11.5 }}>{item.title}</b>
                <span style={{ fontSize: 9.5, color: 'var(--dim-2)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {timeAgo(item.time)}
                </span>
              </div>
              {item.detail && (
                <div style={{ fontSize: 10.5, color: 'var(--dim)', marginTop: 2, lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {item.detail}
                </div>
              )}
            </div>
            {item.status === 'error' && <span style={{ fontSize: 11, flexShrink: 0 }}>❌</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
