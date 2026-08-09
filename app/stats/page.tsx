'use client';
import { useEffect, useState } from 'react';

export default function StatsPage() {
  const [lb, setLb] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    fetch('/api/company/leaderboard').then(r => r.json()).then(d => setLb(d.data || d || [])).catch(() => {});
    fetch('/api/company/audit').then(r => r.json()).then(d => setAudit(d.data || d || [])).catch(() => {});
    fetch('/api/company/state').then(r => r.json()).then(d => setState(d.data || d)).catch(() => {});
  }, []);

  const fin = state?.finance || {};

  return (
    <>
      <h1>📊 الإحصائيات</h1>
      <p className="subtitle">الشركة بالأرقام — المتصدرين، المالية، السجل</p>

      <div className="grid cols-4">
        <div className="card"><div className="title">💰 الميزانية</div><div className="value">{fin.budget ?? state?.budget ?? '...'} <small style={{fontSize:13,color:'var(--dim)'}}>XPC</small></div></div>
        <div className="card"><div className="title">👥 الموظفين</div><div className="value">{state?.employees?.length ?? '...'}</div></div>
        <div className="card"><div className="title">📂 الأقسام</div><div className="value">{Object.keys(state?.departments ?? {}).length ?? '...'}</div></div>
        <div className="card"><div className="title">📜 العمليات</div><div className="value">{audit.length}</div></div>
      </div>

      <div className="grid cols-2 mt">
        <div className="card">
          <div className="title">🏆 المتصدرون</div>
          {lb.length === 0 ? <div className="loading">جارِ التحميل...</div> : (
            <table>
              <thead><tr><th>#</th><th>الموظف</th><th>الرتبة</th><th>XP</th><th>نجاح</th></tr></thead>
              <tbody>
                {lb.map((e, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 800, color: i < 3 ? 'var(--gold)' : 'var(--dim)' }}>{e.rank}</td>
                    <td>{e.icon} {e.name}</td>
                    <td><span className="badge info">{e.rank_name}</span></td>
                    <td><b>{e.xp}</b></td>
                    <td style={{ color: 'var(--green)' }}>{e.success_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <div className="title">📜 آخر العمليات</div>
          {audit.length === 0 ? <div className="loading">جارِ التحميل...</div> : (
            <div style={{ maxHeight: 320, overflow: 'auto' }}>
              {audit.slice(-12).reverse().map((a, i) => (
                <div key={i} style={{ padding: '7px 4px', borderBottom: '1px solid rgba(35,48,82,.3)', fontSize: 12.5 }}>
                  <span style={{ color: 'var(--dim)' }}>{new Date(a.time).toLocaleTimeString('ar-EG')}</span> — {a.detail}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
