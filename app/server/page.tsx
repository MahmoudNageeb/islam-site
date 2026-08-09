'use client';

// ═══════════ السيرفر — غرفة التحكم: خدمات حية + نظام + Logs ═══════════

import { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import ProgressBar from '@/components/ui/ProgressBar';

interface Svc {
  name?: string;
  service?: string;
  id?: string;
  icon?: string;
  online?: boolean;
  port?: number;
  detail?: string;
}

export default function ServerPage() {
  const [services, setServices] = useState<Svc[]>([]);
  const [sys, setSys] = useState<any>({});
  const [checkedAt, setCheckedAt] = useState('');
  const [log, setLog] = useState('');
  const [busy, setBusy] = useState(false);
  const [health, setHealth] = useState<any>(null);

  const load = async () => {
    try {
      const r = await fetch('/api/control');
      const d = await r.json();
      const data = d.data || d;
      setServices(Array.isArray(data) ? data : data.services || []);
      setCheckedAt(data.checked_at || '');
    } catch {}

    try {
      const r = await fetch('/api/system');
      const d = await r.json();
      const data = d.data || d;
      setSys({
        cpu: data.cpu?.percent ?? data.cpu,
        ram: data.memory?.percent ?? data.ram,
        disk: data.disk?.percent ?? data.disk,
        uptime: data.uptime_seconds ?? data.uptime,
      });
    } catch {}
  };

  // فحص سريع
  const quickHealth = () => {
    const items = [
      { label: 'Disk', ok: (sys.disk ?? 100) < 85 },
      { label: 'RAM', ok: (sys.ram ?? 100) < 85 },
      { label: 'CPU', ok: (sys.cpu ?? 100) < 85 },
      ...services.map((s) => ({ label: s.name || s.service || s.id || '?', ok: !!s.online })),
    ];
    const okCount = items.filter((i) => i.ok).length;
    setHealth({ items, okCount, total: items.length });
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (services.length > 0 || sys.cpu !== undefined) quickHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, sys]);

  const runLog = async (cmd: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const d = await r.json();
      setLog((prev) => (prev ? prev + '\n$ ' + cmd + '\n' + (d.output || JSON.stringify(d)) : '$ ' + cmd + '\n' + (d.output || JSON.stringify(d))).slice(-4000));
    } catch (e: any) {
      setLog((prev) => prev + '\n❌ ' + e.message);
    }
    setBusy(false);
  };

  const onlineCount = services.filter((s) => s.online).length;

  return (
    <div className="anim-fade">
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>📊 السيرفر</h1>
      <p style={{ color: 'var(--dim)', fontSize: 13, marginBottom: 18 }}>
        غرفة التحكم — بفحص فعلي كل 8 ثواني {checkedAt && <>· آخر فحص {new Date(checkedAt).toLocaleTimeString('ar-EG')}</>}
      </p>

      {/* ═══ بطاقات النظام Live ═══ */}
      <div className="grid cols-4 mb">
        <GlassCard title="🖥️ CPU" glow={(sys.cpu ?? 0) > 80 ? 'red' : 'accent'}>
          <div className="card-value">{sys.cpu != null ? Math.round(sys.cpu) + '%' : '...'}</div>
          <div className="mt" style={{ marginTop: 8 }}>
            {sys.cpu != null && <ProgressBar pct={sys.cpu} size="sm" status={(sys.cpu ?? 0) > 80 ? 'failed' : 'working'} />}
          </div>
        </GlassCard>
        <GlassCard title="🧠 RAM" glow={(sys.ram ?? 0) > 80 ? 'red' : 'primary'}>
          <div className="card-value">{sys.ram != null ? Math.round(sys.ram) + '%' : '...'}</div>
          <div className="mt" style={{ marginTop: 8 }}>
            {sys.ram != null && <ProgressBar pct={sys.ram} size="sm" status={(sys.ram ?? 0) > 80 ? 'failed' : 'working'} />}
          </div>
        </GlassCard>
        <GlassCard title="💾 Disk" glow={(sys.disk ?? 0) > 85 ? 'red' : 'green'}>
          <div className="card-value">{sys.disk != null ? Math.round(sys.disk) + '%' : '...'}</div>
          <div className="mt" style={{ marginTop: 8 }}>
            {sys.disk != null && <ProgressBar pct={sys.disk} size="sm" status={(sys.disk ?? 0) > 85 ? 'failed' : 'working'} />}
          </div>
        </GlassCard>
        <GlassCard title="🕐 Uptime" glow="gold">
          <div className="card-value">{sys.uptime ? Math.round(sys.uptime / 3600) + ' س' : '...'}</div>
          <div className="card-sub">من آخر تشغيل</div>
        </GlassCard>
      </div>

      {/* ═══ فحص سريع ═══ */}
      {health && (
        <GlassCard title={`🔍 فحص سريع — ${health.okCount}/${health.total} تمام`} glow={health.okCount === health.total ? 'green' : 'red'} className="mb">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {health.items.map((it, i) => (
              <span key={i} className={`badge ${it.ok ? 'green' : 'red'}`}>
                {it.ok ? '✅' : '❌'} {it.label}
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      {/* ═══ الخدمات ═══ */}
      <GlassCard title={`🔌 الخدمات (${onlineCount}/${services.length} شغال)`} className="mb">
        {services.length === 0 ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10 }}>
            {services.map((s, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-card-solid)',
                  border: `1px solid ${s.online ? 'rgba(52,211,153,.3)' : 'rgba(248,113,113,.35)'}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: 13 }}>{s.icon} {s.name || s.service || s.id}</b>
                  <span className={`badge ${s.online ? 'green' : 'red'}`}>{s.online ? 'شغال' : 'واطي'}</span>
                </div>
                <div style={{ color: 'var(--dim)', fontSize: 11.5, marginTop: 4, direction: 'ltr', textAlign: 'start' }}>
                  {s.detail || (s.port ? ':' + s.port : '')}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* ═══ Live Terminal ═══ */}
      <GlassCard title="💻 Live Terminal" icon="💻">
        <div className="row" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
          <button className="btn sm" onClick={() => runLog('uptime')} disabled={busy}>🕐 Uptime</button>
          <button className="btn sm ghost" onClick={() => runLog('df -h / | tail -1')} disabled={busy}>💾 Disk</button>
          <button className="btn sm ghost" onClick={() => runLog('free -h | head -2')} disabled={busy}>🧠 RAM</button>
          <button className="btn sm ghost" onClick={() => runLog('systemctl list-units --type=service --state=running | head -10')} disabled={busy}>📦 Services</button>
        </div>
        <div className="live-terminal">
          {log ? log.split('\n').map((line, i) => (
            <div key={i} className={`term-line ${line.startsWith('❌') ? 'err' : line.startsWith('$') ? '' : ''}`}>
              {line.startsWith('$') ? <><span className="term-time">[{new Date().toLocaleTimeString('en-GB')}]</span> {line}</> : line}
            </div>
          )) : (
            <div className="term-line term-cursor">// اضغط على زر فحص — النتيجة الحقيقية هتظهر هنا</div>
          )}
          <div className="term-line term-cursor" style={{ marginTop: 4 }} />
        </div>
      </GlassCard>
    </div>
  );
}
