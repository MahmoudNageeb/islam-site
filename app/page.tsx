'use client';

// ═══════════ Mission Control — الرئيسية (مركز قيادة JARVIS) ═══════════
// HUD counters + Live Status + Activity Feed + Quick Actions

import { useEffect, useState } from 'react';
import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';
import ProgressBar from '@/components/ui/ProgressBar';
import { HUDNumber } from '@/lib/hud';
import { fetchLiveSys, type LiveSys } from '@/lib/theme';

export default function HomePage() {
  const [sys, setSys] = useState<LiveSys>({});
  const [company, setCompany] = useState<any>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [hour, setHour] = useState<number>(new Date().getHours());
  const [day, setDay] = useState<string>('');
  const [greeting, setGreeting] = useState(true);

  // ─── تحميل البيانات الحية ───
  useEffect(() => {
    const load = async () => {
      fetchLiveSys().then(setSys);

      try {
        const r = await fetch('/api/company/state');
        const d = await r.json();
        const data = d.data || d;
        setCompany({
          budget: data.budget,
          employees: data.employees && !Array.isArray(data.employees) ? Object.values(data.employees) : (data.employees || []),
          departments: data.departments ? Object.values(data.departments) : [],
        });
      } catch {}

      try {
        const r = await fetch('/api/notifications');
        const d = await r.json();
        setNotifs((d?.data?.items ?? d?.items ?? []).slice(0, 6));
      } catch {}
    };
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  // ─── الساعة الذكية ───
  useEffect(() => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const tick = () => {
      setHour(new Date().getHours());
      setDay(days[new Date().getDay()]);
    };
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, []);

  // رسالة ذكية حسب الوقت
  const smartMsg = () => {
    if (hour >= 5 && hour < 11) return 'صباحك نور يا محمود 🌅';
    if (hour >= 11 && hour < 16) return 'النهاردة ' + day + ' — لسه قدامك وقت كويس 💪';
    if (hour >= 16 && hour < 21) return 'مساء الخير يا صاحبي 🌆';
    if (hour >= 21 || hour < 2) return 'الليل — خد راحتك يا بطل 🌙';
    return 'ساعة متأخرة — جسمك محتاج نوم 😴';
  };

  const activeEmps = (company?.employees || []).filter((e: any) => e.status === 'active' || !e.status).length;
  const budget = company?.budget ?? 0;
  const cpu = sys.cpu !== undefined ? Math.round(Number(sys.cpu)) : null;
  const ram = sys.ram !== undefined ? Math.round(Number(sys.ram)) : null;
  const disk = sys.disk !== undefined ? Math.round(Number(sys.disk)) : null;
  const services = sys.services || [];
  const allGood = services.every((s: any) => s.status !== 'down' && s.status !== 'error');
  const upCount = services.filter((s: any) => s.status !== 'down' && s.status !== 'error').length;

  // Activity Feed — بناء من البيانات المتاحة
  const feedItems = [
    ...(notifs.length > 0 ? notifs.slice(0, 3).map((n, i) => ({
      icon: n.icon || '📌', text: n.title || '', time: n.created_at || n.time || '', type: 'notif',
    })) : []),
    ...(sys.services || []).slice(0, 3).map((s: any) => ({
      icon: s.status === 'down' || s.status === 'error' ? '❌' : '✅',
      text: `${s.name}: ${s.status === 'down' || s.status === 'error' ? 'واقع!' : 'شغال'}`,
      time: s.checked_at || '',
      type: s.status === 'down' || s.status === 'error' ? 'bad' : 'good',
    })),
  ].slice(0, 6);

  return (
    <div className="anim-fade">
      {/* ═══ الترحيب الذكي — جملة واسعة ═══ */}
      <div
        className="card glow-primary anim-up"
        style={{
          marginBottom: 18,
          background: 'linear-gradient(135deg, rgba(0,229,255,.12), rgba(41,121,255,.06), transparent)',
          borderColor: 'rgba(0,229,255,.3)',
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.3px' }}>
          {smartMsg()} <span style={{ fontSize: 16, color: 'var(--dim)' }}>{day}</span>
        </div>
        <p style={{ color: 'var(--dim)', fontSize: 13.5, marginBottom: 12 }}>
          كل الأنظمة تحت السيطرة — {upCount}/{services.length || '—'} خدمة شغالة
          {allGood ? ' · كل حاجة تمام ✅' : ' · فيه حاجة محتاجة نظرة 🔍'}
        </p>
        <div className="row wrap mt">
          <Link href="/company" className="btn">🏢 الشركة</Link>
          <Link href="/study" className="btn ghost">📚 مهامي</Link>
          <Link href="/mecha" className="btn ghost">🤖 ميكاترونكس</Link>
          <Link href="/server" className="btn ghost">📊 السيرفر</Link>
        </div>
      </div>

      {/* ═══ HUD Metrics — أرقام بتعد (JARVIS) ═══ */}
      <div className="grid cols-4 mb anim-stagger">
        <GlassCard title="🖥️ CPU" glow={cpu !== null && cpu > 80 ? 'red' : 'accent'}>
          <div className="card-value">
            {cpu !== null ? <HUDNumber value={cpu} suffix="%" /> : '...'}
          </div>
          <div className="mt" style={{ marginTop: 8 }}>
            {cpu !== null && <ProgressBar pct={cpu} size="sm" status={cpu > 80 ? 'failed' : 'working'} />}
          </div>
        </GlassCard>

        <GlassCard title="🧠 RAM" glow={ram !== null && ram > 80 ? 'red' : 'primary'}>
          <div className="card-value">
            {ram !== null ? <HUDNumber value={ram} suffix="%" /> : '...'}
          </div>
          <div className="mt" style={{ marginTop: 8 }}>
            {ram !== null && <ProgressBar pct={ram} size="sm" status={ram > 80 ? 'failed' : 'working'} />}
          </div>
        </GlassCard>

        <GlassCard title="💾 Disk" glow={disk !== null && disk > 85 ? 'red' : 'green'}>
          <div className="card-value">
            {disk !== null ? <HUDNumber value={disk} suffix="%" /> : '...'}
          </div>
          <div className="mt" style={{ marginTop: 8 }}>
            {disk !== null && <ProgressBar pct={disk} size="sm" status={disk > 85 ? 'failed' : 'working'} />}
          </div>
        </GlassCard>

        <GlassCard title="💰 الميزانية" glow="gold">
          <div className="card-value">
            <HUDNumber value={typeof budget === 'number' ? budget : 0} />
          </div>
          <div className="card-sub">XPC · {activeEmps} موظف نشط</div>
        </GlassCard>
      </div>

      {/* ═══ Activity Feed + الأخبار ═══ */}
      <div className="grid cols-2">
        <GlassCard title="📡 النشاط الحي" icon="📡">
          {feedItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛰️</div>
              <div className="empty-title">في انتظار النشاط...</div>
              <div className="empty-sub">لما يحصل أي حاجة، هتظهر هنا فوراً</div>
            </div>
          ) : (
            <div className="feed">
              {feedItems.map((item, i) => (
                <div className="feed-item" key={i}>
                  <div className="feed-dot" style={item.type === 'bad' ? { borderColor: 'rgba(255,82,82,.4)' } : item.type === 'good' ? { borderColor: 'rgba(0,230,118,.4)' } : {}}>
                    {item.icon}
                  </div>
                  <div className="feed-body">
                    <div className="feed-text">{item.text}</div>
                    {item.time && <div className="feed-time">{item.time}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard title="🏢 حالة الشركة" icon="🏢">
          {!company ? (
            <div className="loading"><div className="spinner" /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="row spread">
                <span style={{ color: 'var(--dim)', fontSize: 12.5 }}>الموظفون</span>
                <b><HUDNumber value={activeEmps} /></b>
              </div>
              <div className="row spread">
                <span style={{ color: 'var(--dim)', fontSize: 12.5 }}>الأقسام</span>
                <b><HUDNumber value={company.departments?.length || 0} /></b>
              </div>
              <div className="row spread">
                <span style={{ color: 'var(--dim)', fontSize: 12.5 }}>الميزانية</span>
                <b style={{ color: typeof budget === 'number' && budget < 0 ? 'var(--red)' : 'var(--green)' }}>
                  <HUDNumber value={typeof budget === 'number' ? budget : 0} /> XPC
                </b>
              </div>
              <Link href="/company" className="btn sm ghost" style={{ marginTop: 6, alignSelf: 'flex-start' }}>
                افتح الشركة ←
              </Link>
            </div>
          )}
        </GlassCard>
      </div>

      {/* ═══ Quick Actions — HUD ═══ */}
      <div className="grid cols-4 mt">
        <GlassCard title="🎛️ التحكم" icon="🎛️" glow="accent" onClick={() => window.location.href = '/control'}>
          <div className="card-sub">الأجهزة + Terminal</div>
        </GlassCard>
        <GlassCard title="📊 السيرفر" icon="📊" glow="primary" onClick={() => window.location.href = '/server'}>
          <div className="card-sub">الخدمات + Live Logs</div>
        </GlassCard>
        <GlassCard title="🤖 مشاريعك" icon="🤖" glow="green" onClick={() => window.location.href = '/mecha'}>
          <div className="card-sub">ميكاترونكس</div>
        </GlassCard>
        <GlassCard title="📚 المذاكرة" icon="📚" glow="gold" onClick={() => window.location.href = '/study'}>
          <div className="card-sub">كويز + بومودورو</div>
        </GlassCard>
      </div>
    </div>
  );
}
