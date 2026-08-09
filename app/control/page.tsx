'use client';
import { useEffect, useState } from 'react';

export default function ControlPage() {
  const [services, setServices] = useState<any[]>([]);
  const [devices, setDevices] = useState<any>({});
  const [cmd, setCmd] = useState('');
  const [out, setOut] = useState('');
  const [busy, setBusy] = useState(false);
  const [sys, setSys] = useState<any>(null);
  const [checkedAt, setCheckedAt] = useState('');

  const load = () => {
    // 🔥 فحص حقيقي للخدمات عبر /api/control
    fetch('/api/control').then(r => r.json()).then(d => {
      const data = d.data || d;
      setServices(Array.isArray(data) ? data : (data.services || []));
      setDevices(data.devices || {});
      setCheckedAt(data.checked_at || '');
    }).catch(() => {});
    fetch('/api/system').then(r => r.json()).then(d => {
      const data = d.data || d;
      setSys({
        cpu: data.cpu?.percent ?? data.cpu,
        ram: data.memory?.percent ?? data.ram,
        disk: data.disk?.percent ?? data.disk,
        uptime: data.uptime_seconds ?? data.uptime,
      });
    }).catch(() => {});
  };

  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, []);

  const run = async () => {
    if (!cmd.trim() || busy) return;
    setBusy(true);
    try {
      const r = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const d = await r.json();
      setOut(prev => (prev ? prev + '\n$ ' + cmd + '\n' + (d.output || d.data?.output || JSON.stringify(d)) : '$ ' + cmd + '\n' + (d.output || d.data?.output || JSON.stringify(d))).slice(-4000));
    } catch (e: any) {
      setOut(prev => prev + '\n❌ ' + e.message);
    }
    setBusy(false);
    setCmd('');
  };

  const allDevices = [
    ...(devices.phone ? [devices.phone] : []),
    ...(devices.tablet ? [devices.tablet] : []),
    ...(devices.tailscale ? [{ label: 'Tailscale', icon: '🔗', online: true, detail: devices.tailscale.detail }] : []),
  ];

  return (
    <>
      <h1>🎛️ التحكم</h1>
      <p className="subtitle">الخدمات والأجهزة والنظام + Terminal حقيقي — بفحص فعلي كل 10 ثواني</p>

      <div className="grid cols-4">
        <div className="card"><div className="title">🖥️ CPU</div><div className="value">{sys?.cpu != null ? Math.round(sys.cpu) + '%' : '...'}</div></div>
        <div className="card"><div className="title">🧮 RAM</div><div className="value">{sys?.ram != null ? Math.round(sys.ram) + '%' : '...'}</div></div>
        <div className="card"><div className="title">💾 Disk</div><div className="value">{sys?.disk != null ? Math.round(sys.disk) + '%' : '...'}</div></div>
        <div className="card"><div className="title">🕐 Uptime</div><div className="value">{sys?.uptime ? Math.round(sys.uptime/3600) + ' س' : '...'}</div></div>
      </div>

      <div className="card mt">
        <div className="title">🔌 الخدمات {checkedAt && <small style={{ color: 'var(--dim)', fontSize: 11 }}>آخر فحص {new Date(checkedAt).toLocaleTimeString('ar-EG')}</small>}</div>
        {services.length === 0 ? <div className="loading">جارِ التحميل...</div> : (
          <table>
            <thead><tr><th>الخدمة</th><th>الحالة</th><th>التفاصيل</th></tr></thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={i}>
                  <td><b>{s.icon} {s.name || s.service || s.id || '?'}</b></td>
                  <td>
                    {s.online
                      ? <span className="badge green">✅ شغال</span>
                      : <span className="badge err">❌ واطي</span>}
                  </td>
                  <td style={{ color: 'var(--dim)', fontSize: 12 }}>
                    {s.detail || (s.port ? 'بورت ' + s.port : '')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card mt">
        <div className="title">📱 الأجهزة</div>
        {allDevices.length === 0 ? <div className="loading">جارِ التحميل...</div> : (
          <table>
            <thead><tr><th>الجهاز</th><th>الحالة</th><th>التفاصيل</th></tr></thead>
            <tbody>
              {allDevices.map((d, i) => (
                <tr key={i}>
                  <td><b>{d.icon} {d.label}</b></td>
                  <td>
                    {d.online
                      ? <span className="badge green">✅ متصل</span>
                      : <span className="badge err">❌ أوفلاين</span>}
                  </td>
                  <td style={{ color: 'var(--dim)', fontSize: 12 }}>{d.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card mt">
        <div className="title">💻 Terminal</div>
        <div className="row" style={{ marginBottom: 10 }}>
          <input
            value={cmd}
            onChange={e => setCmd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && run()}
            placeholder="اكتب أمر — مثال: uptime"
            style={{
              flex: 1, background: 'var(--bg-card-solid)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 14, outline: 'none',
            }}
          />
          <button className="btn" onClick={run} disabled={busy}>{busy ? '⏳...' : '▶ تشغيل'}</button>
        </div>
        <pre style={{
          background: '#05070d', border: '1px solid var(--border)', borderRadius: 10,
          padding: 14, minHeight: 120, maxHeight: 280, overflow: 'auto',
          fontSize: 12.5, fontFamily: 'monospace', color: '#9db9ff', whiteSpace: 'pre-wrap',
        }}>{out || '// اكتب أمر وجرّبه — التنفيذ حقيقي على السيرفر\n// ملاحظة: rm -rf / ممنوع 😅'}</pre>
      </div>
    </>
  );
}
