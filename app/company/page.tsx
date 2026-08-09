'use client';

// ═══════════════════════════════════════════════════════════════
// 🏢 مركز قيادة الشركة — Mission Control (Display Mode v1)
// شاشة عرض حية — مفيش أي زر إجراءات. الكلام كله في تيليجرام.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react';
import CompanyHeader from '@/components/company/CompanyHeader';
import CompanyTopology from '@/components/company/CompanyTopology';
import CompanyStats from '@/components/company/CompanyStats';
import CompanyLeaderboard from '@/components/company/CompanyLeaderboard';
import CompanySystemStatus from '@/components/company/CompanySystemStatus';
import CompanyActivity from '@/components/company/CompanyActivity';
import CompanyEmployees from '@/components/company/CompanyEmployees';
import CompanyDepartments from '@/components/company/CompanyDepartments';
import CompanyMarket from '@/components/company/CompanyMarket';
import CompanyFinance from '@/components/company/CompanyFinance';
import CompanyAudit from '@/components/company/CompanyAudit';
import CompanyAgentResults from '@/components/company/CompanyAgentResults';

type Tab = 'command' | 'employees' | 'departments' | 'finance' | 'audit';

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'command', icon: '🛰️', label: 'القيادة' },
  { id: 'employees', icon: '👥', label: 'الموظفون' },
  { id: 'departments', icon: '🏢', label: 'الأقسام' },
  { id: 'finance', icon: '💰', label: 'المالية' },
  { id: 'audit', icon: '📜', label: 'السجل' },
];

export default function CompanyPage() {
  const [tab, setTab] = useState<Tab>('command');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [now, setNow] = useState(new Date());
  const [kiosk, setKiosk] = useState(false);

  // ─── البيانات ───
  const [state, setState] = useState<any>(null);           // /api/company/state
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [market, setMarket] = useState<any[]>([]);
  const [finance, setFinance] = useState<any>(null);
  const [events, setEvents] = useState<any>(null);
  const [audit, setAudit] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [agentResults, setAgentResults] = useState<any>(null);
  const [guardian, setGuardian] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [err, setErr] = useState('');

  const loadAll = useCallback(async () => {
    try {
      const [s, lb, mk, fn, ev, au, dp, ar, gd, nt] = await Promise.all([
        fetch('/api/company/state').then(r => r.json()).catch(() => null),
        fetch('/api/company/leaderboard').then(r => r.json()).catch(() => null),
        fetch('/api/company/market').then(r => r.json()).catch(() => null),
        fetch('/api/company/finance').then(r => r.json()).catch(() => null),
        fetch('/api/company/events').then(r => r.json()).catch(() => null),
        fetch('/api/company/audit').then(r => r.json()).catch(() => null),
        fetch('/api/company/departments').then(r => r.json()).catch(() => null),
        fetch('/api/company/agent-results').then(r => r.json()).catch(() => null),
        fetch('/api/guardian').then(r => r.json()).catch(() => null),
        fetch('/api/notifications').then(r => r.json()).catch(() => null),
      ]);
      setState(s?.data || s || null);
      setLeaderboard(Array.isArray(lb?.data) ? lb.data : Array.isArray(lb) ? lb : []);
      const mkData = mk?.data || mk || {};
      setMarket(Array.isArray(mkData) ? mkData : Array.isArray(mkData.market) ? mkData.market : []);
      setFinance(fn?.data || fn || null);
      setEvents(ev?.data || ev || null);
      setAudit(Array.isArray(au?.data) ? au.data : Array.isArray(au) ? au : []);
      setDepartments(Array.isArray(dp?.data) ? dp.data : Array.isArray(dp) ? dp : []);
      setAgentResults(ar?.data || ar || null);
      setGuardian(gd?.data || gd || null);
      const ntData = nt?.data || nt || {};
      setNotifications(Array.isArray(ntData.items) ? ntData.items : []);
      setConnected(true);
      setErr('');
    } catch (e: any) {
      setErr(e.message);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const t = setInterval(loadAll, 10000);
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => { clearInterval(t); clearInterval(clock); };
  }, [loadAll]);

  // ─── وضع Kiosk — عرض كامل على التابلت/التلفزيون ───
  useEffect(() => {
    if (!kiosk) return;
    document.body.classList.add('kiosk-mode');
    const el = document.documentElement as any;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    return () => {
      document.body.classList.remove('kiosk-mode');
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [kiosk]);

  const employees = state?.employees || [];
  const activeCount = employees.filter((e: any) => e.status === 'active').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 60 }}>
      {/* ═══ الهيدر ═══ */}
      <CompanyHeader
        connected={connected}
        now={now}
        budget={finance?.budget ?? state?.budget ?? 0}
        employeeCount={employees.length}
        activeCount={activeCount}
        kiosk={kiosk}
        onToggleKiosk={() => setKiosk(!kiosk)}
      />

      {/* شريط تبويبات — عرض فقط */}
      <div className="study-tabs" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`study-tab ${tab === t.id ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
              padding: '9px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 700,
              cursor: 'pointer', border: '1px solid transparent', fontFamily: 'inherit',
              background: tab === t.id ? 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(41,121,255,0.08))' : 'transparent',
              color: tab === t.id ? '#00e5ff' : 'var(--dim)',
              borderColor: tab === t.id ? 'rgba(0,229,255,0.3)' : 'var(--border)',
              transition: 'all 0.15s',
            }}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {err && (
        <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 12, color: '#ff5252', background: 'rgba(255,82,82,0.08)', border: '1px solid rgba(255,82,82,0.2)' }}>
          ⚠️ {err}
        </div>
      )}

      {loading ? <CompanySkeleton /> : (
        <div className="anim-fade" key={tab} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'command' && (
            <>
              <CompanyTopology employees={employees} departments={departments} />
              <CompanyStats
                budget={finance?.budget ?? state?.budget ?? 0}
                employeeCount={employees.length}
                activeCount={activeCount}
                deptCount={departments.length}
                totalXp={employees.reduce((a: number, e: any) => a + (e.xp || 0), 0)}
                tasksDone={employees.reduce((a: number, e: any) => a + (e.tasks_done || 0), 0)}
              />
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                <CompanyLeaderboard employees={leaderboard.length ? leaderboard : employees} />
                <CompanyActivity notifications={notifications} audit={audit} />
              </div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                <CompanySystemStatus guardian={guardian} connected={connected} />
                <CompanyAgentResults results={agentResults} />
              </div>
            </>
          )}
          {tab === 'employees' && <CompanyEmployees employees={employees} />}
          {tab === 'departments' && <CompanyDepartments departments={departments} employees={employees} />}
          {tab === 'finance' && <CompanyFinance finance={finance} />}
          {tab === 'audit' && <CompanyAudit audit={audit} events={events} market={market} />}
        </div>
      )}

      {/* ═══ Footer — التفاعل الوحيد: كلم إسلام ═══ */}
      <div style={{ textAlign: 'center', marginTop: 10, padding: '18px 14px', borderRadius: 14, border: '1px dashed rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.03)' }}>
        <div style={{ fontSize: 13.5, color: 'var(--dim)', marginBottom: 8, fontWeight: 600 }}>
          🎙️ التحكم الكامل بالكلام — في تيليجرام
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--dim-2)', lineHeight: 1.8, marginBottom: 10 }}>
          «ضيف موظف» · «احذف فلان» · «درّب المطور على كذا» · «وريني المتصدرين»<br />
          كل أمر يتنفذ فوراً والنتيجة بتيجي في محادثتنا.
        </div>
        <a
          href="https://t.me/mahmoud_nageeb_islam_bot"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 26px', borderRadius: 12, fontSize: 13.5, fontWeight: 800,
            background: 'linear-gradient(135deg, #00e5ff, #2979ff)', color: '#fff',
            textDecoration: 'none', boxShadow: '0 4px 24px rgba(0,229,255,0.35)',
            transition: 'transform 0.15s',
          }}
        >🎙️ كلم إسلام على تيليجرام</a>
      </div>
    </div>
  );
}

// ═══════ Skeleton — تحميل أنيق ═══════
function CompanySkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card" style={{ height: 220 }}>
        <div className="skeleton" style={{ width: '30%', height: 16 }} />
        <div className="skeleton" style={{ width: '50%', height: 12, marginTop: 10 }} />
        <div style={{ display: 'flex', gap: 14, marginTop: 18 }}>
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ width: 60, height: 60, borderRadius: '50%' }} />)}
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card" style={{ height: 84 }}>
            <div className="skeleton" style={{ width: '50%', height: 12 }} />
            <div className="skeleton" style={{ width: '70%', height: 24, marginTop: 12 }} />
          </div>
        ))}
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="card" style={{ height: 220 }}>
          <div className="skeleton" style={{ width: '40%', height: 14 }} />
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ width: '90%', height: 34, marginTop: 14 }} />)}
        </div>
        <div className="card" style={{ height: 220 }}>
          <div className="skeleton" style={{ width: '40%', height: 14 }} />
          {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ width: '85%', height: 40, marginTop: 14 }} />)}
        </div>
      </div>
    </div>
  );
}
