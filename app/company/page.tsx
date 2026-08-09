'use client';
import { useEffect, useState } from 'react';

// ═══════ صفحة الشركة — مركز القيادة (A1: الأساس والهيكل) ═══════
// 7 تبويبات: نظرة عامة / الموظفون / الأقسام / المالية / المهام / التدريب / السجل

async function api(path: string, opts?: any) {
  const r = await fetch('/api/' + path, {
    cache: 'no-store',
    ...(opts || {}),
  });
  const d = await r.json();
  if (d && d.data !== undefined) return d.data;
  return d;
}

// ═══════ التبويبات ═══════
const TABS = [
  { id: 'overview', icon: '📊', label: 'نظرة عامة' },
  { id: 'employees', icon: '👥', label: 'الموظفون' },
  { id: 'depts', icon: '🏢', label: 'الأقسام' },
  { id: 'finance', icon: '💰', label: 'المالية' },
  { id: 'tasks', icon: '🎯', label: 'المهام' },
  { id: 'training', icon: '🎓', label: 'التدريب' },
  { id: 'audit', icon: '📜', label: 'السجل' },
];

export default function CompanyPage() {
  const [tab, setTab] = useState('overview');
  const [state, setState] = useState<any>(null);
  const [lb, setLb] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [market, setMarket] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [events, setEvents] = useState<any>(null);
  const [finance, setFinance] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [agentResult, setAgentResult] = useState<any>(null);
  // 🔥 شريط تقدم لأي أكشن (مهمة/اختبار/تدريب/توظيف)
  const [progress, setProgress] = useState<{ label: string; pct: number; status: 'working' | 'done' | 'failed' } | null>(null);
  const [empProfile, setEmpProfile] = useState<any>(null);   // بروفايل موظف منبثق
  const [deptProfile, setDeptProfile] = useState<any>(null); // بروفايل قسم منبثق
  const [notifs, setNotifs] = useState<any[]>([]);           // آخر الإشعارات
  const [ownerTask, setOwnerTask] = useState('');            // 📋 مهمة من الرئيس
  const [ownerSent, setOwnerSent] = useState(false);         // اتسبعت للمدير؟
  const [ownerResult, setOwnerResult] = useState<any>(null); // نتيجة المهمة من الرئيس
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]); // 📎 ملفات مرفوعة مع المهمة
  const [uploading, setUploading] = useState(false);         // بيترفع دلوقتي؟

  const load = async () => {
    try {
      const [st, l, dp, mk, au, ev, fin, nt] = await Promise.all([
        api('company/state'), api('company/leaderboard'), api('company/departments'),
        api('company/market'), api('company/audit'), api('company/events'), api('company/finance'),
        api('notifications'),
      ]);
      setLb(Array.isArray(l) ? l : (l && (l.leaderboard || l.data)) || []);
      setDepts(Array.isArray(dp) ? dp : (dp && (dp.departments ? Object.values(dp.departments) : Object.values(dp))) || []);
      const mkArr = Array.isArray(mk) ? mk : (mk && mk.market) || [];
      let secureSt = st;
      if (st && st.employees && !Array.isArray(st.employees)) {
        secureSt = { ...st, employees: Object.values(st.employees), departments: st.departments ? Object.values(st.departments) : st.departments };
      }
      setState(secureSt); setMarket(mkArr); setAudit(au || []); setEvents(ev); setFinance(fin);
      const ntArr = nt?.items || nt || [];
      if (ntArr.length > 0) setNotifs(ntArr.slice(0, 8));
      // 📋 نتيجة مهمة من الرئيس (من ملف النتايج)
      try {
        const ar = await api('company/agent-results');
        if (ar && ar.owner_task) setOwnerResult(ar.owner_task);
      } catch { /* تجاهل */ }
    } catch (e: any) { setErr(e.message); }
  };

  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, []);

  const act = async (path: string, body: any, okMsg: string) => {
    try {
      setProgress({ label: okMsg + '...', pct: 10, status: 'working' });
      let pct = 10;
      const timer = setInterval(() => {
        pct = Math.min(pct + 12, 85);
        setProgress(prev => prev && prev.status === 'working' ? { ...prev, pct } : prev);
      }, 2000);
      const r = await api(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      clearInterval(timer);
      setProgress({ label: okMsg + (r?.name ? ' — ' + r.name : ''), pct: 100, status: 'done' });
      setMsg(okMsg + (r?.name ? ' — ' + r.name : ''));
      setErr('');
      if (r?.agent) {
        setAgentResult(r.agent);
        pollAgentResults();
      }
      load();
      setTimeout(() => { setMsg(''); setProgress(null); }, 3000);
    } catch (e: any) { setErr(e.message); setProgress(prev => prev ? { ...prev, status: 'failed' } : null); setTimeout(() => { setErr(''); setProgress(null); }, 4000); }
  };

  const pollAgentResults = async () => {
    try {
      const ar = await api('company/agent-results');
      const latest = ar ? (Array.isArray(ar) ? ar[0] : Object.values(ar)[Object.keys(ar).length - 1]) : null;
      if (latest && !latest?.scheduled && !latest?.working) setAgentResult(latest);
      // 📋 نتيجة مهمة من الرئيس (لو موجودة)
      if (ar && ar.owner_task) setOwnerResult(ar.owner_task);
    } catch { /* تجاهل */ }
  };

  // ═══════ الإجراءات ═══════
  const compete = async () => {
    const task = prompt('🎯 المهمة التنافسية؟ (مثال: حسّن أداء API)');
    if (!task) return;
    const empIds = (state?.employees || []).filter((e: any) => e.status === 'active').map((e: any) => e.id);
    if (empIds.length === 0) { setErr('مفيش موظفين نشطين'); setTimeout(() => setErr(''), 3000); return; }
    setAgentResult({ working: true, working_msg: '⏳ إسلام بيوزّع المهمة على الموظفين... كل موظف يشتغل ويبعت النتيجة' });
    await act('company/compete', { task, employee_ids: empIds }, '🎯 التنافس بدأ');
  };

  const hire = (id: string) => {
    const name = market.find(c => c.id === id)?.name || '';
    if (confirm(`🤝 توظيف "${name}"؟ التكلفة 300 XPC`)) act('company/hire', { cand_id: id }, '✅ انضم للفريق');
  };
  const train = (id: string, name: string) => {
    const cap = prompt(`🎓 تدريب ${name} — على إيه؟ (مثال: Kubernetes)`);
    if (cap) act('company/train', { employee_id: id, capability: cap }, '📚 اتدرب على');
  };
  const trainDirect = (id: string, name: string) => {
    const cap = prompt(`🎓 تدريب مباشر لـ ${name} — على إيه؟ (الموظف هيشتغل فعلياً والنتيجة هتيجي تيليجرام)`);
    if (!cap) return;
    const instr = prompt(`📝 تعليمات إضافية؟ (اختياري)`);
    act('company/train/direct', { employee_id: id, capability: cap, instructions: instr || '' }, '🎓 تدريب مباشر على ' + cap);
  };
  const addXp = (id: string, name: string) => {
    const xp = prompt(`🎖️ XP لـ ${name} — كام؟ (مثال: 200)`);
    if (xp) act('company/xp', { employee_id: id, xp: parseInt(xp), reason: 'ترقية يدوية' }, '⚡ XP اتضاف');
  };
  const fire = (id: string, name: string) => {
    const reason = prompt(`🚪 رفد ${name} — السبب؟`);
    if (reason !== null) act('company/fire', { employee_id: id, reason: reason || 'قرار إداري' }, '🚪 اترفد');
  };
  const promote = (id: string, name: string) => {
    if (confirm(`🏆 ترقية ${name}؟`) ) act('company/promote', { employee_id: id }, '🏆 اترقى');
  };
  const reinstate = (id: string, name: string) => {
    if (confirm(`🔄 إعادة تفعيل ${name}؟`)) act('company/reinstate', { employee_id: id }, '🔄 اترجع');
  };
  const mkDept = () => {
    const name = prompt('📂 اسم القسم الجديد؟');
    if (name) act('company/departments/create', { name }, '📂 قسم اتضاف');
  };
  const delDept = (id: string, name: string) => {
    if (confirm(`🗑️ حذف قسم "${name}"؟ الموظفين هيرجعوا بلا قسم`)) act('company/departments/delete', { department_id: id }, '🗑️ قسم اتشال');
  };
  const setManager = (dId: string, dName: string) => {
    const emps = (state?.employees || []).filter((e: any) => e.status === 'active');
    const list = emps.map((e: any) => `${e.id} — ${e.name} (${e.role})`).join('\n');
    const pick = prompt(`👔 اختر مدير لـ "${dName}" من الموظفين:\n${list}\n\nاكتب الـ id (مثال: developer)`);
    if (pick) act('company/departments/manager', { department_id: dId, employee_id: pick.trim() }, '👔 مدير اتحدد');
  };
  const assignDept = (eId: string, eName: string) => {
    const list = depts.map((d: any) => `${d.id} — ${d.name}`).join('\n');
    const pick = prompt(`📦 انقل "${eName}" لقسم:\n${list}\n\nاكتب الـ id`);
    if (pick) act('company/departments/assign', { employee_id: eId, department_id: pick.trim() }, '📦 اتغير قسمه');
  };
  const removeDept = (eId: string, eName: string) => {
    if (confirm(`🚫 شيل "${eName}" من قسمه؟`)) act('company/departments/remove', { employee_id: eId, department_id: '' }, '🚫 اتشال من القسم');
  };
  const resolveEvent = () => {
    if (!events?.active) return;
    const out = prompt(`⚡ حل الحدث "${events.active.title}"؟\nاكتب النتيجة (resolved = نجاح، failed = فشل)`);
    if (out) act('company/events/resolve', { outcome: out === 'failed' ? 'failed' : 'resolved' }, '⚡ الحدث اتحل');
  };
  const resolveComp = () => {
    const comps = (state?.competitions || []);
    if (comps.length === 0) { setErr('مفيش تنافسات نشطة'); setTimeout(() => setErr(''), 3000); return; }
    const list = comps.filter((c: any) => c.status === 'active').map((c: any) => `${c.id} — ${c.task?.slice(0, 40)}`).join('\n');
    const cid = prompt(`🏁 اختر تنافس للحل:\n${list}\n\nاكتب الـ id`);
    if (!cid) return;
    const emps = (state?.employees || []).filter((e: any) => e.status === 'active');
    const winners = emps.map((e: any) => `${e.id} — ${e.name}`).join('\n');
    const wid = prompt(`👑 اختر الفائز:\n${winners}\n\nاكتب الـ id`);
    if (wid) act('company/compete/resolve', { competition_id: cid.trim(), winner_id: wid.trim() }, '🏁 التنافس اتقفل');
  };
  const sendOwnerTask = async () => {
    if (!ownerTask.trim()) { setErr('اكتب المهمة الأول يا ريس'); setTimeout(() => setErr(''), 3000); return; }
    try {
      setOwnerSent(true);
      setProgress({ label: '📋 المهمة اتبعتت للمدير — بيحلل ويوزّع على الموظفين...', pct: 8, status: 'working' });
      const r = await api('company/owner-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: ownerTask, files: attachedFiles }),
      });
      setProgress(prev => prev ? { ...prev, pct: 100, status: 'done' } : prev);
      setMsg('📋 المهمة اتبعتت — المدير شغال، النتيجة هتيجي تيليجرام');
      setOwnerTask('');
      setAttachedFiles([]);
      setTimeout(() => { setMsg(''); setProgress(null); setOwnerSent(false); }, 4000);
      setTimeout(pollAgentResults, 5000);
      load();
    } catch (e: any) {
      setErr(e.message); setOwnerSent(false);
      setProgress(prev => prev ? { ...prev, status: 'failed' } : null);
      setTimeout(() => { setErr(''); setProgress(null); }, 4000);
    }
  };
  const uploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const uploaded: any[] = [];
      for (const f of Array.from(fileList)) {
        if (f.size > 5 * 1024 * 1024) { setErr(`📎 ${f.name} أكبر من 5MB`); continue; }
        const b64 = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => { const r = reader.result as string; res(r.split(',')[1] || ''); };
          reader.onerror = rej;
          reader.readAsDataURL(f);
        });
        const r = await api('company/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: f.name, content_base64: b64 }),
        });
        if (r && r.path) uploaded.push({ name: r.name, path: r.path, size: r.size });
      }
      if (uploaded.length > 0) {
        setAttachedFiles(prev => [...prev, ...uploaded]);
        setMsg(`📎 اتضاف ${uploaded.length} ملف`);
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (e: any) {
      setErr('📎 فشل الرفع: ' + e.message);
      setTimeout(() => setErr(''), 4000);
    } finally {
      setUploading(false);
    }
  };
  const removeFile = (i: number) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== i));
  };
  const refreshMarket = () => act('company/market/refresh', {}, '🆕 سوق جديد');
  const triggerEvent = () => act('company/events/trigger', {}, '⚡ حدث جديد');
  const pay = () => act('company/salaries', {}, '💰 رواتب اتصرفت');

  const openEmp = (id: string) => {
    const e = (state?.employees || []).find((x: any) => x.id === id);
    if (e) setEmpProfile(e);
  };
  const openDept = (id: string) => {
    const d = depts.find((x: any) => x.id === id);
    if (d) setDeptProfile(d);
  };
  const trainSkill = (id: string, skill: string) => {
    setEmpProfile(null);
    act('company/train', { employee_id: id, capability: skill }, '📚 اتدرب على ' + skill);
  };
  const skillTypeIcon = (t: string) => t === 'تقنية' ? '⚙️' : t === 'إدارية' ? '📋' : '🎨';

  if (err) {
    return (
      <>
        <h1>🏢 الشركة</h1>
        <div className="card" style={{ borderColor: 'rgba(248,113,113,.4)', color: '#fca5a5' }}>
          ❌ مشكلة في الاتصال بالداشبورد: {err}
        </div>
      </>
    );
  }

  // ═══ Skeleton loading ═══
  if (!state) {
    return (
      <>
        <h1>🏢 الشركة</h1>
        <div className="grid cols-4 mb">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ height: 90 }}>
              <div className="skeleton" style={{ width: '60%', height: 14 }} />
              <div className="skeleton" style={{ width: '40%', height: 24, marginTop: 12 }} />
            </div>
          ))}
        </div>
        <div className="card" style={{ height: 220 }}>
          <div className="skeleton" style={{ width: '40%', height: 14 }} />
          <div className="skeleton" style={{ width: '90%', height: 40, marginTop: 16 }} />
          <div className="skeleton" style={{ width: '85%', height: 40, marginTop: 10 }} />
          <div className="skeleton" style={{ width: '70%', height: 40, marginTop: 10 }} />
        </div>
      </>
    );
  }

  // ═══════ الأرقام الحية ═══════
  const activeCount = (state?.employees || []).filter((e: any) => e.status === 'active').length;
  const cards = [
    { icon: '💰', title: 'الميزانية', value: finance?.budget ?? state?.budget ?? '...', sub: 'XPC' },
    { icon: '👥', title: 'الموظفين', value: activeCount + '/' + (state?.employees?.length ?? 0), sub: 'نشط/إجمالي' },
    { icon: '📂', title: 'الأقسام', value: depts?.length ?? '...', sub: 'فريق' },
    { icon: '⚡', title: 'الحدث', value: events?.active?.title?.split(' ')[0] || 'لا شيء', sub: 'نشط' },
  ];

  // ═══════ تبويب: نظرة عامة ═══════
  const OverviewTab = () => (
    <>
      <div className="row mt" style={{ marginBottom: 18 }}>
        <button className="btn" onClick={mkDept}>📂 قسم جديد</button>
        <button className="btn" onClick={compete}>🎯 تنافس</button>
        <button className="btn ghost" onClick={refreshMarket}>🆕 سوق توظيف</button>
        <button className="btn ghost" onClick={triggerEvent}>⚡ حدث</button>
        <button className="btn ghost" onClick={pay}>💰 رواتب</button>
      </div>

      {agentResult && (
        <div className="card mt" style={{ borderColor: 'rgba(52,211,153,.35)', marginBottom: 18 }}>
          <div className="title">🤖 إسلام نفّذ المهمة الحقيقية</div>
          {agentResult?.working ? (
            <div className="loading">{agentResult.working_msg || '⏳ جارِ التنفيذ...'}</div>
          ) : agentResult?.results ? (
            <div>
              {agentResult.results.map((r: any, i: number) => (
                <div key={i} style={{ padding: '9px 4px', borderBottom: '1px solid rgba(35,48,82,.3)', fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b>{r.name} <span className="badge info">{r.role}</span></b>
                    <span className={r.success ? 'badge green' : 'badge err'}>{r.success ? '✅ نجح' : '❌ فشل'}</span>
                  </div>
                  <div style={{ color: 'var(--dim)', fontSize: 12, marginTop: 4, whiteSpace: 'pre-wrap' }}>{r.output}</div>
                </div>
              ))}
            </div>
          ) : (
            <pre style={{ fontSize: 12.5, whiteSpace: 'pre-wrap', color: 'var(--text)', margin: 0 }}>{JSON.stringify(agentResult, null, 2)}</pre>
          )}
        </div>
      )}

      <div className="grid cols-2">
        <div className="card">
          <div className="title">🏆 المتصدرون — اضغط للتحكم</div>
          {lb.length === 0 ? <div className="loading">جارِ التحميل...</div> : lb.map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 4px', borderBottom: '1px solid rgba(35,48,82,.4)', fontSize: 13, flexWrap: 'wrap', gap: 6 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => openEmp(e.id)}>
                <span style={{ fontWeight: 800, color: i < 3 ? 'var(--gold)' : 'var(--dim)', width: 18 }}>#{e.rank}</span>
                <span>{e.icon}</span>
                <b>{e.name}</b>
                <span className="badge info">{e.rank_name}</span>
                {e.probation && <span className="badge warn">🧪 اختبار</span>}
                {e.warnings > 0 && <span className="badge err">⚠={e.warnings}</span>}
              </span>
              <span style={{ color: 'var(--dim)' }}>⚡{e.xp} · {e.success_rate}%</span>
              <span style={{ display: 'flex', gap: 4 }}>
                <button className="btn sm" title="تدريب" onClick={() => train(e.id, e.name)}>📚</button>
                <button className="btn sm" title="XP" onClick={() => addXp(e.id, e.name)}>🎖️</button>
                <button className="btn sm danger" title="رفد" onClick={() => fire(e.id, e.name)}>🚪</button>
              </span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="title">🎪 سوق التوظيف</div>
          {market.length === 0 ? <div className="loading">مفيش مرشحين — اعمل 🆕 سوق</div> : market.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 4px', borderBottom: '1px solid rgba(35,48,82,.4)', fontSize: 13, gap: 6, flexWrap: 'wrap' }}>
              <span>{c.icon} <b>{c.name}</b> <span className="badge info">{c.role}</span> <span className="badge warn">{c.rank}</span></span>
              <button className="btn sm" onClick={() => hire(c.id)}>🤝 وظّف</button>
            </div>
          ))}
        </div>
      </div>

      {events?.active && (
        <div className="card mt" style={{ borderColor: 'rgba(245,158,11,.4)' }}>
          <div className="title">⚡ حدث نشط</div>
          <b>{events.active.title}</b>
          <div style={{ color: 'var(--dim)', fontSize: 12 }}>{events.active.description}</div>
        </div>
      )}

      {notifs.length > 0 && (
        <div className="card mt">
          <div className="title">🔔 آخر الإشعارات</div>
          <div style={{ maxHeight: 220, overflow: 'auto' }}>
            {notifs.map((n: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 2px', borderBottom: '1px solid rgba(35,48,82,.3)', fontSize: 12.5 }}>
                <span style={{ fontSize: 16 }}>{n.icon || '📌'}</span>
                <span style={{ flex: 1 }}>
                  <b>{n.title}</b>
                  {n.body && <span style={{ color: 'var(--dim)' }}> — {typeof n.body === 'string' ? n.body.slice(0, 80) : ''}</span>}
                </span>
                <span style={{ color: 'var(--dim)', fontSize: 11 }}>{n.time ? new Date(n.time).toLocaleTimeString('ar-EG') : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // ═══════ تبويب: الموظفون ═══════
  const EmployeesTab = () => (
    <div className="card" style={{ overflowX: 'auto' }}>
      <div className="title">👥 كل الموظفين ({state?.employees?.length || 0})</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 720 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid rgba(99,102,241,.3)', color: 'var(--dim)', textAlign: 'right' }}>
            <th style={{ padding: '8px 6px' }}>الموظف</th>
            <th style={{ padding: '8px 6px' }}>الدور</th>
            <th style={{ padding: '8px 6px' }}>القسم</th>
            <th style={{ padding: '8px 6px' }}>المهارات</th>
            <th style={{ padding: '8px 6px' }}>الرتبة</th>
            <th style={{ padding: '8px 6px' }}>XP</th>
            <th style={{ padding: '8px 6px' }}>الرصيد</th>
            <th style={{ padding: '8px 6px' }}>الحالة</th>
            <th style={{ padding: '8px 6px' }}>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {(state?.employees || []).map((e: any, i: number) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(35,48,82,.35)' }}>
              <td style={{ padding: '8px 6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700 }} onClick={() => openEmp(e.id)}>
                  {e.icon} {e.name}
                  {e.is_manager && <span className="badge gold" style={{ fontSize: 10 }}>👔 مدير</span>}
                </span>
              </td>
              <td style={{ padding: '8px 6px', color: 'var(--dim)' }}>{e.role}</td>
              <td style={{ padding: '8px 6px' }}>{e.department || '—'}</td>
              <td style={{ padding: '8px 6px' }}>
                <span className="badge info">{e.capabilities?.length || 0} مهارة</span>
              </td>
              <td style={{ padding: '8px 6px' }}>{e.rank_icon || ''} <b>{e.rank}</b></td>
              <td style={{ padding: '8px 6px', fontVariantNumeric: 'tabular-nums' }}>⚡{e.xp}</td>
              <td style={{ padding: '8px 6px', fontVariantNumeric: 'tabular-nums' }}>{e.balance} XPC</td>
              <td style={{ padding: '8px 6px' }}>
                <span className={`badge ${e.status === 'active' ? 'green' : 'err'}`}>{e.status === 'active' ? '🟢 نشط' : e.status}</span>
                {e.probation && <span className="badge warn" style={{ marginRight: 4 }}>🧪</span>}
              </td>
              <td style={{ padding: '8px 6px' }}>
                <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {e.status === 'active' ? (
                    <>
                      <button className="btn sm" title="ترقية" onClick={() => promote(e.id, e.name)}>🏆</button>
                      <button className="btn sm" title="تدريب" onClick={() => train(e.id, e.name)}>📚</button>
                      <button className="btn sm ghost" title="تدريب مباشر" onClick={() => trainDirect(e.id, e.name)}>🎓</button>
                      <button className="btn sm" title="XP يدوي" onClick={() => addXp(e.id, e.name)}>🎖️</button>
                      <button className="btn sm ghost" title="انقل لقسم" onClick={() => assignDept(e.id, e.name)}>📦</button>
                      <button className="btn sm danger" title="رفد" onClick={() => fire(e.id, e.name)}>🚪</button>
                    </>
                  ) : (
                    <button className="btn sm" title="إعادة تفعيل" onClick={() => reinstate(e.id, e.name)}>🔄</button>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ═══════ تبويب: الأقسام ═══════
  const DeptsTab = () => (
    <>
      <div className="row mb">
        <button className="btn" onClick={mkDept}>📂 قسم جديد</button>
        <button className="btn ghost" onClick={resolveComp}>🏁 حل تنافس</button>
      </div>
      <div className="grid cols-2">
        {depts.length === 0 ? <div className="card"><div className="loading">مفيش أقسام</div></div> : depts.map((d, i) => (
          <div key={i} className="card">
            <div className="title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => openDept(d.id)}>{d.icon} {d.name} <span className="badge info">{d.members?.length || 0} عضو</span></span>
              <span style={{ display: 'flex', gap: 4 }}>
                <button className="btn sm" title="تعيين مدير" onClick={() => setManager(d.id, d.name)}>👔</button>
                <button className="btn sm danger" title="حذف القسم" onClick={() => delDept(d.id, d.name)}>🗑️</button>
              </span>
            </div>
            <div style={{ color: 'var(--dim)', fontSize: 12, marginTop: 4 }}>
              👔 المدير: {d.manager_name || 'مفيش مدير'}
            </div>
            <div style={{ marginTop: 8 }}>
              {(!d.members || d.members.length === 0) ? (
                <div style={{ fontSize: 12, color: 'var(--dim)' }}>قسم فاضي — انقل موظفين</div>
              ) : d.members.map((m: any, j: number) => (
                <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 2px', borderBottom: '1px solid rgba(35,48,82,.2)', fontSize: 12 }}>
                  <span style={{ cursor: 'pointer' }} onClick={() => openEmp(m.id)}>{m.icon} {m.name} <span className="badge info" style={{ fontSize: 10 }}>{m.rank_name || m.rank}</span></span>
                  <button className="btn sm ghost" title="شيل من القسم" onClick={() => removeDept(m.id, m.name)}>🚫</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  // ═══════ تبويب: المالية ═══════
  const FinanceTab = () => {
    const budget = finance?.budget ?? state?.budget ?? 0;
    const spent = Math.abs(finance?.salaries_paid ?? 0);
    const earned = finance?.events_impact ?? 0;
    const total = spent + earned;
    const pct = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0;
    return (
      <div className="card">
        <div className="title">💰 المالية</div>
        <div style={{ fontSize: 13, lineHeight: 2.2 }}>
          <div className="row spread"><span>الميزانية الحالية</span><b style={{ fontSize: 22, color: 'var(--gold)' }}>{budget} XPC</b></div>
          <div className="row spread"><span>إجمالي الرواتب المدفوعة</span><b>{spent} XPC</b></div>
          <div className="row spread"><span>الإيرادات (الأحداث)</span><b style={{ color: '#6ee7b7' }}>{earned} XPC</b></div>
        </div>

        {/* 📊 رسم بياني بسيط */}
        {total > 0 && (
          <div style={{ marginTop: 16 }}>
            <div className="title" style={{ fontSize: 13 }}>📊 توزيع التدفق المالي</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,.06)', borderRadius: 8, height: 18, overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: pct(spent) + '%', background: 'linear-gradient(90deg,#f87171,#ef4444)', height: '100%', transition: 'width .8s' }} />
                <div style={{ width: pct(earned) + '%', background: 'linear-gradient(90deg,#34d399,#10b981)', height: '100%', transition: 'width .8s' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12 }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#ef4444', borderRadius: 3, marginLeft: 4 }} /> رواتب</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#10b981', borderRadius: 3, marginLeft: 4 }} /> إيرادات</span>
            </div>
          </div>
        )}

        {events?.active && (
          <div style={{ marginTop: 12, background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 8, padding: '10px 14px' }}>
            ⚡ <b>{events.active.title}</b>
            <div style={{ color: 'var(--dim)', fontSize: 12, marginTop: 2 }}>{events.active.description}</div>
          </div>
        )}
        <div className="row mt">
          <button className="btn" onClick={pay}>💰 صرف الرواتب</button>
          <button className="btn ghost" onClick={triggerEvent}>⚡ حدث جديد</button>
          <button className="btn ghost" onClick={resolveEvent}>🏁 حل الحدث</button>
        </div>
      </div>
    );
  };

  // ═══════ تبويب: المهام ═══════
  const TasksTab = () => {
    const comps = state?.competitions || [];
    const activeComps = comps.filter((c: any) => c.status === 'active');
    return (
      <>
        {/* 📋 مهمة من الرئيس → المدير → الأقسام */}
        <div className="card mb" style={{ borderColor: 'rgba(251,191,36,.35)' }}>
          <div className="title">👑 مهمة من الرئيس (إنت) → المدير (إسلام) → الأقسام</div>
          <div style={{ fontSize: 12.5, color: 'var(--dim)', marginBottom: 10 }}>
            اكتب المهمة — المدير هيحللها ويوزّعها على الموظفين المناسبين، كل واحد ينفذ فرعه فعلياً، والنتيجة الكاملة هتيجي تيليجرام.
          </div>
          <textarea
            value={ownerTask}
            onChange={e => setOwnerTask(e.target.value)}
            placeholder="مثال: جهّز تقرير أداء الشركة لآخر أسبوع يشمل إنجازات كل قسم وتوصيات للتحسين..."
            rows={3}
            disabled={ownerSent}
            style={{
              width: '100%', background: 'rgba(255,255,255,.05)', color: 'var(--text)',
              border: '1px solid rgba(99,102,241,.3)', borderRadius: 10, padding: '10px 12px',
              fontSize: 13, resize: 'vertical', fontFamily: 'inherit',
            }}
          />

          {/* 📎 رفع ملفات */}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <label className="btn ghost" style={{ cursor: 'pointer', fontSize: 12.5 }}>
                {uploading ? '⏳ بيترفع...' : '📎 ارفع ملفات'}
                <input
                  type="file"
                  multiple
                  accept="*"
                  disabled={uploading || ownerSent}
                  onChange={e => { uploadFiles(e.target.files); e.target.value = ''; }}
                  style={{ display: 'none' }}
                />
              </label>
              <span style={{ color: 'var(--dim)', fontSize: 11.5 }}>صور، PDF، مستندات (حد أقصى 5MB لكل ملف)</span>
            </div>
            {attachedFiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                {attachedFiles.map((f: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(35,48,82,.3)', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>
                    <span>📄</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <b>{f.name}</b> <span style={{ color: 'var(--dim)', fontSize: 11 }}>· {(f.size / 1024).toFixed(1)} KB</span>
                    </span>
                    <button className="btn sm danger" title="شيل الملف" onClick={() => removeFile(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="row mt">
            <button className="btn" onClick={sendOwnerTask} disabled={ownerSent || uploading}>
              {ownerSent ? '⏳ المهمة مع المدير...' : attachedFiles.length > 0 ? `📤 أرسل للمدير (${attachedFiles.length} ملف)` : '📤 أرسل للمدير'}
            </button>
          </div>
        </div>

        {/* 📋 نتيجة المهمة من الرئيس */}
        {ownerResult && !ownerResult?.scheduled && (
          <div className="card mb" style={{ borderColor: ownerResult?.success === false ? 'rgba(248,113,113,.35)' : 'rgba(52,211,153,.35)' }}>
            <div className="title">📋 نتيجة مهمة الرئيس</div>
            <div style={{ fontSize: 12.5, color: 'var(--dim)', marginBottom: 8 }}>
              {ownerResult.task || ''} — <b>{ownerResult.duration ? `⏱️ ${ownerResult.duration}s` : ''}</b>
            </div>
            {ownerResult?.results && Array.isArray(ownerResult.results) ? (
              ownerResult.results.map((r: any, i: number) => (
                <div key={i} style={{ padding: '9px 4px', borderBottom: '1px solid rgba(35,48,82,.3)', fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                    <span><b>{r.icon || '👤'} {r.name}</b> <span className="badge info">{r.role}</span> <span style={{ color: 'var(--dim)', fontSize: 11 }}>{r.dept}</span></span>
                    <span className={r.success ? 'badge green' : 'badge err'}>{r.success ? '✅ نجح' : '❌ فشل'}</span>
                  </div>
                  {r.task && <div style={{ color: 'var(--dim)', fontSize: 11.5, marginTop: 3 }}>🎯 {r.task}</div>}
                  {r.output && <div style={{ color: 'var(--dim)', fontSize: 12, marginTop: 4, whiteSpace: 'pre-wrap' }}>{r.output.slice(0, 300)}</div>}
                </div>
              ))
            ) : (
              <pre style={{ fontSize: 12.5, whiteSpace: 'pre-wrap', color: 'var(--text)', margin: 0 }}>{JSON.stringify(ownerResult, null, 2)}</pre>
            )}
          </div>
        )}

        <div className="row mb">
          <button className="btn" onClick={compete}>🎯 تنافس جديد</button>
          <button className="btn ghost" onClick={resolveComp}>🏁 حل تنافس</button>
        </div>

        {/* 🏁 التنافسات النشطة */}
        {activeComps.length > 0 && (
          <div className="card mb">
            <div className="title">🏁 تنافسات نشطة ({activeComps.length})</div>
            {activeComps.map((c: any, i: number) => (
              <div key={i} style={{ padding: '10px 4px', borderBottom: '1px solid rgba(35,48,82,.3)', fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <b>🎯 {c.task}</b>
                  <span className="badge warn">جاري</span>
                </div>
                <div style={{ color: 'var(--dim)', fontSize: 12, marginTop: 4 }}>
                  👥 {c.competitors?.length || 0} موظف · بدأ {c.started_at ? new Date(c.started_at).toLocaleTimeString('ar-EG') : '—'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🏆 التنافسات الماضية */}
        {comps.filter((c: any) => c.status !== 'active').length > 0 && (
          <div className="card mb">
            <div className="title">🏆 تنافسات ماضية</div>
            {comps.filter((c: any) => c.status !== 'active').slice(-5).reverse().map((c: any, i: number) => (
              <div key={i} style={{ padding: '8px 4px', borderBottom: '1px solid rgba(35,48,82,.3)', fontSize: 12.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🎯 {c.task}</span>
                  <span className={c.winner ? 'badge green' : 'badge err'}>
                    {c.winner ? `👑 ${c.winner_name || c.winner}` : '❌ من غير فائز'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card">
          <div className="title">🤖 نتايج المهام الحقيقية</div>
          {agentResult ? (
            agentResult?.working ? (
              <div className="loading">{agentResult.working_msg || '⏳ جارِ التنفيذ...'}</div>
            ) : agentResult?.results ? (
              agentResult.results.map((r: any, i: number) => (
                <div key={i} style={{ padding: '9px 4px', borderBottom: '1px solid rgba(35,48,82,.3)', fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b>{r.name} <span className="badge info">{r.role}</span></b>
                    <span className={r.success ? 'badge green' : 'badge err'}>{r.success ? '✅ نجح' : '❌ فشل'}</span>
                  </div>
                  <div style={{ color: 'var(--dim)', fontSize: 12, marginTop: 4, whiteSpace: 'pre-wrap' }}>{r.output}</div>
                </div>
              ))
            ) : (
              <pre style={{ fontSize: 12.5, whiteSpace: 'pre-wrap', color: 'var(--text)', margin: 0 }}>{JSON.stringify(agentResult, null, 2)}</pre>
            )
          ) : (
            <div className="loading">لسه مفيش نتايج — ابدأ تنافس 🎯</div>
          )}
        </div>
      </>
    );
  };

  // ═══════ تبويب: التدريب ═══════
  const TrainingTab = () => (
    <div className="card">
      <div className="title">🎓 تدريب الموظفين</div>
      <div style={{ fontSize: 12.5, color: 'var(--dim)', marginBottom: 12 }}>
        📚 = تدريب عادي (مهارة ← مستوى) · 🎓 = تدريب مباشر (الموظف يشتغل فعلياً والنتيجة تتبعت تيليجرام)
      </div>
      {(state?.employees || []).map((e: any, i: number) => (
        <div key={i} style={{ padding: '10px 4px', borderBottom: '1px solid rgba(35,48,82,.4)', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <span>
              {e.icon} <b>{e.name}</b> <span className="badge info">{e.role}</span>{' '}
              <span style={{ color: 'var(--dim)', fontSize: 12 }}>· {e.capabilities?.length || 0} مهارة</span>
            </span>
            <span style={{ display: 'flex', gap: 4 }}>
              <button className="btn sm" onClick={() => train(e.id, e.name)}>📚 تدريب</button>
              <button className="btn sm ghost" onClick={() => trainDirect(e.id, e.name)}>🎓 مباشر</button>
            </span>
          </div>
          {e.capabilities && e.capabilities.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {e.capabilities.slice(0, 8).map((c: any, j: number) => (
                <span key={j} className={`badge ${c.level === 'خبير' ? 'gold' : c.level === 'متقدم' ? 'green' : 'info'}`} style={{ fontSize: 11 }}>
                  {skillTypeIcon(c.type)} {c.name}: {c.level}
                </span>
              ))}
              {e.capabilities.length > 8 && <span className="badge" style={{ fontSize: 11 }}>+{e.capabilities.length - 8}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ═══════ تبويب: السجل والتحليلات ═══════
  const AuditTab = () => {
    // إحصائيات الأداء
    const totalDone = (state?.employees || []).reduce((s: number, e: any) => s + (e.tasks_done || 0), 0);
    const totalFail = (state?.employees || []).reduce((s: number, e: any) => s + (e.tasks_failed || 0), 0);
    const totalXp = (state?.employees || []).reduce((s: number, e: any) => s + (e.xp || 0), 0);
    const best = lb.length > 0 ? lb[0] : null;
    return (
      <>
        <div className="grid cols-3 mb">
          <div className="card">
            <div className="title">✅ مهام ناجحة</div>
            <div className="value" style={{ color: '#6ee7b7' }}>{totalDone}</div>
          </div>
          <div className="card">
            <div className="title">❌ مهام فاشلة</div>
            <div className="value" style={{ color: '#fca5a5' }}>{totalFail}</div>
          </div>
          <div className="card">
            <div className="title">⚡ إجمالي XP</div>
            <div className="value">{totalXp}</div>
          </div>
        </div>

        {best && (
          <div className="card mb" style={{ borderColor: 'rgba(251,191,36,.4)' }}>
            <div className="title">👑 أفضل موظف</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
              <span style={{ fontSize: 28 }}>{best.icon}</span>
              <div>
                <b>{best.name}</b> <span className="badge gold">{best.rank_name}</span>
                <div style={{ color: 'var(--dim)', fontSize: 12 }}>⚡{best.xp} XP · {best.success_rate}% نجاح · {best.tasks_done} مهمة</div>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="title">🏆 الترتيب الكامل</div>
          {lb.length === 0 ? <div className="loading">فاضي</div> : lb.map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 4px', borderBottom: '1px solid rgba(35,48,82,.3)', fontSize: 13, cursor: 'pointer' }} onClick={() => openEmp(e.id)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 800, color: i < 3 ? 'var(--gold)' : 'var(--dim)', width: 18 }}>#{e.rank}</span>
                <span>{e.icon}</span>
                <b>{e.name}</b>
                <span className="badge info">{e.rank_name}</span>
                {e.warnings > 0 && <span className="badge err">⚠={e.warnings}</span>}
              </span>
              <span style={{ color: 'var(--dim)' }}>⚡{e.xp} · {e.success_rate}%</span>
            </div>
          ))}
        </div>

        <div className="card mt">
          <div className="title">📜 سجل العمليات ({audit.length})</div>
          <div style={{ maxHeight: 400, overflow: 'auto' }}>
            {audit.length === 0 ? <div className="loading">فاضي</div> : audit.slice().reverse().map((a: any, i: number) => (
              <div key={i} style={{ padding: '8px 4px', borderBottom: '1px solid rgba(35,48,82,.3)', fontSize: 12.5 }}>
                <span style={{ color: 'var(--dim)' }}>{new Date(a.time).toLocaleString('ar-EG')}</span> — {a.detail}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <h1>🏢 الشركة</h1>
      <p className="subtitle">مركز قيادة الشركة — إدارة كاملة من مكان واحد، بيانات live</p>

      {msg && <div style={{ background: 'rgba(52,211,153,.12)', color: '#6ee7b7', border: '1px solid rgba(52,211,153,.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 14, fontSize: 13 }}>{msg}</div>}

      {/* 🔥 شريط التقدم */}
      {progress && (
        <div className="card" style={{ marginBottom: 14, padding: '12px 16px', borderColor: progress.status === 'done' ? 'rgba(52,211,153,.5)' : progress.status === 'failed' ? 'rgba(248,113,113,.5)' : 'rgba(59,130,246,.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: progress.status === 'done' ? '#6ee7b7' : progress.status === 'failed' ? '#fca5a5' : '#93c5fd' }}>
              {progress.status === 'done' ? '✅' : progress.status === 'failed' ? '❌' : '🔄'} {progress.label}
            </span>
            <span style={{ color: 'var(--dim)', fontVariantNumeric: 'tabular-nums' }}>{progress.pct}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,.07)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: progress.pct + '%',
              borderRadius: 8,
              background: progress.status === 'done' ? 'linear-gradient(90deg,#34d399,#10b981)' : progress.status === 'failed' ? 'linear-gradient(90deg,#f87171,#ef4444)' : 'linear-gradient(90deg,#60a5fa,#3b82f6)',
              transition: 'width .8s ease',
            }} />
          </div>
          {progress.status === 'working' && <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 6 }}>الموظف شغال في الخلفية — النتيجة هتتبعت تيليجرام</div>}
        </div>
      )}

      {/* ═══════ الأرقام الحية ═══════ */}
      <div className="grid cols-4">
        {cards.map((c, i) => (
          <div className="card" key={i}>
            <div className="title">{c.icon} {c.title}</div>
            <div className="value">{c.value} <small style={{ fontSize: 12, color: 'var(--dim)' }}>{c.sub}</small></div>
          </div>
        ))}
      </div>

      {/* ═══════ شريط التبويبات ═══════ */}
      <div className="row mt" style={{ marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`btn ${tab === t.id ? '' : 'ghost'}`}
            style={tab === t.id ? { boxShadow: '0 0 0 2px var(--primary), 0 0 14px rgba(99,102,241,.35)' } : {}}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ═══════ محتوى التبويب ═══════ */}
      {tab === 'overview' && <OverviewTab />}
      {tab === 'employees' && <EmployeesTab />}
      {tab === 'depts' && <DeptsTab />}
      {tab === 'finance' && <FinanceTab />}
      {tab === 'tasks' && <TasksTab />}
      {tab === 'training' && <TrainingTab />}
      {tab === 'audit' && <AuditTab />}

      {/* ═══════ بروفايل الموظف — Modal ═══════ */}
      {empProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setEmpProfile(null)}>
          <div className="card" style={{ maxWidth: 480, width: '100%', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{empProfile.icon} {empProfile.name} <span className="badge info">{empProfile.rank_name || empProfile.rank}</span></span>
              <button className="btn sm ghost" onClick={() => setEmpProfile(null)}>✕</button>
            </div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              <div className="row spread"><span style={{ color: 'var(--dim)' }}>الدور</span><b>{empProfile.role}</b></div>
              <div className="row spread"><span style={{ color: 'var(--dim)' }}>القسم</span><b>{empProfile.department || '—'}</b></div>
              <div className="row spread"><span style={{ color: 'var(--dim)' }}>الرصيد</span><b>{empProfile.balance} XPC</b></div>
              <div className="row spread"><span style={{ color: 'var(--dim)' }}>الخبرة</span><b>⚡{empProfile.xp} XP</b></div>
              <div className="row spread"><span style={{ color: 'var(--dim)' }}>المهام</span><b>{empProfile.tasks_done ?? 0} نجح · {empProfile.tasks_failed ?? 0} فشل</b></div>
              <div className="row spread"><span style={{ color: 'var(--dim)' }}>الراتب الأسبوعي</span><b>{empProfile.last_salary_breakdown?.total ?? '—'} XPC</b></div>
              <div className="row spread"><span style={{ color: 'var(--dim)' }}>انضم</span><b style={{ fontSize: 12 }}>{empProfile.hired_at ? new Date(empProfile.hired_at).toLocaleDateString('ar-EG') : '—'}</b></div>
              {empProfile.last_salary_breakdown && (
                <div style={{ background: 'rgba(35,48,82,.3)', borderRadius: 8, padding: '8px 12px', marginTop: 6, fontSize: 12 }}>
                  <div>أساس: {empProfile.last_salary_breakdown.base} + مهارات: {empProfile.last_salary_breakdown.skills} + خبرة: {empProfile.last_salary_breakdown.experience}</div>
                </div>
              )}
            </div>
            <div style={{ marginTop: 14 }}>
              <div className="title" style={{ fontSize: 13 }}>🧠 المهارات ({empProfile.capabilities?.length || 0})</div>
              {(!empProfile.capabilities || empProfile.capabilities.length === 0) ? (
                <div className="loading">مفيش مهارات — دُرّبه!</div>
              ) : empProfile.capabilities.map((c: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 2px', borderBottom: '1px solid rgba(35,48,82,.3)', fontSize: 12.5 }}>
                  <span>{skillTypeIcon(c.type)} <b>{c.name}</b></span>
                  <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge ${c.level === 'خبير' ? 'gold' : c.level === 'متقدم' ? 'green' : 'info'}`}>{c.level}</span>
                    <button className="btn sm" title="ارفع مستوى المهارة" onClick={() => trainSkill(empProfile.id, c.name)}>⬆️</button>
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn sm" onClick={() => trainDirect(empProfile.id, empProfile.name)}>🎓 تدريب مباشر (تنفيذ فعلي)</button>
              <button className="btn sm ghost" onClick={() => { const s = prompt('⚡ XP إضافي؟'); if (s) act('company/xp', { employee_id: empProfile.id, xp: parseInt(s), reason: 'يدوي' }, '⚡ XP اتضاف'); }}>⚡ XP يدوي</button>
            </div>
            <div style={{ marginTop: 14 }}>
              <div className="title" style={{ fontSize: 13 }}>🎓 التدريبات الأخيرة</div>
              {(!empProfile.trainings || empProfile.trainings.length === 0) ? (
                <div className="loading">لسه مفيش تدريبات</div>
              ) : empProfile.trainings.slice(-5).reverse().map((t: any, i: number) => (
                <div key={i} style={{ padding: '5px 2px', fontSize: 12, color: 'var(--dim)' }}>
                  {new Date(t.time).toLocaleDateString('ar-EG')} — {t.capability} ({t.type}/{t.level}) بـ {t.cost} XPC
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <div className="title" style={{ fontSize: 13 }}>📈 سجل الأداء ({empProfile.performance_history?.length || 0})</div>
              {(!empProfile.performance_history || empProfile.performance_history.length === 0) ? (
                <div className="loading">لسه مفيش أداء</div>
              ) : empProfile.performance_history.slice(-8).reverse().map((p: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 2px', borderBottom: '1px solid rgba(35,48,82,.25)', fontSize: 12 }}>
                  <span>
                    <span className={p.type === 'success' ? 'badge green' : 'badge err'} style={{ fontSize: 10 }}>{p.type === 'success' ? '✅ نجاح' : '❌ فشل'}</span>{' '}
                    <span style={{ color: 'var(--dim)' }}>{p.reason}</span>
                  </span>
                  <span style={{ color: p.type === 'success' ? '#6ee7b7' : '#fca5a5', fontWeight: 700 }}>+{p.xp} XP</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <div className="title" style={{ fontSize: 13 }}>🧠 التعلمات ({empProfile.learnings?.length || 0})</div>
              {(!empProfile.learnings || empProfile.learnings.length === 0) ? (
                <div className="loading">مفيش تعلمات</div>
              ) : empProfile.learnings.slice(-5).reverse().map((l: any, i: number) => (
                <div key={i} style={{ padding: '5px 2px', fontSize: 12, color: 'var(--dim)' }}>
                  💡 {l}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ بروفايل القسم — Modal ═══════ */}
      {deptProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setDeptProfile(null)}>
          <div className="card" style={{ maxWidth: 480, width: '100%', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{deptProfile.icon} {deptProfile.name} <span className="badge info">{deptProfile.members?.length || 0} عضو</span></span>
              <button className="btn sm ghost" onClick={() => setDeptProfile(null)}>✕</button>
            </div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              <div className="row spread"><span style={{ color: 'var(--dim)' }}>المدير</span><b>{deptProfile.manager_name || '—'}</b></div>
              {deptProfile.desc && <div style={{ color: 'var(--dim)', fontSize: 12, marginTop: 4 }}>{deptProfile.desc}</div>}
            </div>
            <div style={{ marginTop: 14 }}>
              <div className="title" style={{ fontSize: 13 }}>👥 الأعضاء ({deptProfile.members?.length || 0})</div>
              {(!deptProfile.members || deptProfile.members.length === 0) ? (
                <div className="loading">قسم فاضي — اتعين ناس</div>
              ) : deptProfile.members.map((m: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 2px', borderBottom: '1px solid rgba(35,48,82,.3)', fontSize: 13 }}>
                  <span>{m.icon} <b>{m.name}</b> <span className="badge info">{m.rank_name || m.rank}</span></span>
                  <span style={{ color: 'var(--dim)', fontSize: 12 }}>⚡{m.xp} · مهارات {m.capabilities?.length || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
