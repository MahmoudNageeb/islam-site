'use client';

import { useEffect, useState } from 'react';

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | 'unsupported'>('unsupported');

  const load = async () => {
    try {
      const r = await fetch('/api/notifications');
      const d = await r.json();
      setItems(d?.data?.items ?? d?.items ?? []);
    } catch {}
    setLoading(false);
  };

  const checkPerm = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return setNotifPerm('unsupported');
    setNotifPerm(Notification.permission);
  };

  const enableNotif = async () => {
    try {
      const p = await Notification.requestPermission();
      setNotifPerm(p);
      // إشعار تجريبي
      if (p === 'granted') {
        new Notification('🔔 إشعارات إسلام مفعّلة', {
          body: 'هتلاقي كل أخبار الشركة والتدريب هنا حتى والموقع مقفول',
          icon: '/icons/icon-192.png',
          dir: 'rtl',
          lang: 'ar',
        });
      }
    } catch {}
  };

  useEffect(() => {
    load();
    checkPerm();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  const unread = items.filter((n: any) => !n.read).length;

  return (
    <div className="anim-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>🔔 الإشعارات</h1>
        {notifPerm !== 'unsupported' && notifPerm !== 'granted' && (
          <button className="btn sm" onClick={enableNotif}>
            {notifPerm === 'denied' ? '🔕 الإشعارات مقفولة — اضغط للتفعيل' : '📲 فعّل إشعارات المتصفح'}
          </button>
        )}
        {notifPerm === 'granted' && <span className="badge green">✅ إشعارات مفعّلة</span>}
      </div>
      <p style={{ color: 'var(--dim)', marginBottom: 18 }}>
        مركز الإشعارات — كل نتايج الشركة والتدريب والسيرفر {unread > 0 && <b style={{ color: 'var(--primary-light)' }}>· {unread} غير مقروء</b>}
      </p>
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>🔕</div>
          <div className="loading">مفيش إشعارات لسه — هتظهر هنا فوراً</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((n, i) => (
            <div
              key={i}
              className="card"
              style={{
                padding: '12px 16px',
                borderInlineStart: `3px solid ${
                  n.type === 'error' ? 'var(--red)' : n.type === 'success' ? 'var(--green)' : 'var(--primary)'
                }`,
                opacity: n.read ? 0.55 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>{n.icon || '📌'} {n.title || 'إشعار'}</span>
                <span style={{ fontSize: 11, color: 'var(--dim)' }}>{n.time ? new Date(n.time).toLocaleTimeString('ar-EG') : ''}</span>
              </div>
              {n.body && <div style={{ fontSize: 12.5, color: 'var(--dim)', whiteSpace: 'pre-line' }}>{n.body}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
