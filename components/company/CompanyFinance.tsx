'use client';

// ═══════ CompanyFinance — المالية (عرض فقط) ═══════

interface FinanceItem {
  time: string;
  type: string;
  amount: number;
  note?: string;
}

interface Props {
  finance: {
    budget?: number;
    starting_budget?: number;
    salaries_paid?: number;
    events_impact?: number;
    hires_cost?: number;
    history?: FinanceItem[];
  } | null;
}

const TYPE_ICONS: Record<string, string> = {
  salaries: '💰', hire: '🤝', event: '⚡', bonus: '🎁', penalty: '⚠️', training: '📚',
};

export default function CompanyFinance({ finance }: Props) {
  if (!finance) return <div className="card loading">جارِ تحميل المالية...</div>;

  const { budget = 0, starting_budget = 0, salaries_paid = 0, events_impact = 0, hires_cost = 0, history = [] } = finance;
  const spent = Math.abs(salaries_paid) + Math.abs(hires_cost);
  const spentPct = starting_budget ? Math.min(Math.round((spent / starting_budget) * 100), 100) : 0;

  const items = [...history].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* بطاقة الميزانية */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        <div className="card" style={{ padding: '16px', borderColor: 'rgba(0,229,255,0.25)', background: 'linear-gradient(135deg, rgba(0,229,255,0.06), transparent)' }}>
          <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>💼 الميزانية الحالية</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#00e5ff', fontFamily: 'var(--font-mono)' }}>
            {budget.toLocaleString('en-US')} <span style={{ fontSize: 13 }}>XPC</span>
          </div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>💰 رواتب مصروفة</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#ff5252', fontFamily: 'var(--font-mono)' }}>
            {salaries_paid.toLocaleString('en-US')}
          </div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>🤝 تكاليف التوظيف</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#ffd740', fontFamily: 'var(--font-mono)' }}>
            {hires_cost.toLocaleString('en-US')}
          </div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>⚡ تأثير الأحداث</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: events_impact >= 0 ? '#00e676' : '#ff5252', fontFamily: 'var(--font-mono)' }}>
            {events_impact >= 0 ? '+' : ''}{events_impact.toLocaleString('en-US')}
          </div>
        </div>
      </div>

      {/* شريط الصرف */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11.5 }}>
          <span style={{ color: 'var(--dim)' }}>إجمالي الصرف من رأس المال</span>
          <b style={{ fontFamily: 'var(--font-mono)' }}>{spentPct}%</b>
        </div>
        <div style={{ height: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${spentPct}%`, borderRadius: 4,
            background: spentPct > 80 ? 'linear-gradient(90deg, #ff5252, #ff8f00)' : 'linear-gradient(90deg, #00e5ff, #2979ff)',
            boxShadow: '0 0 12px rgba(0,229,255,0.4)',
            transition: 'width 0.6s var(--ease)',
          }} />
        </div>
      </div>

      {/* سجل الحركات */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <b style={{ fontSize: 14 }}>📒 سجل الحركات المالية</b>
          <span style={{ fontSize: 10.5, color: 'var(--dim-2)' }}>{items.length} حركة</span>
        </div>
        {items.length === 0 ? (
          <div className="loading">مفيش حركات مسجلة</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.slice(0, 15).map((it, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 11px', borderRadius: 9,
                background: 'var(--bg-soft)', border: '1px solid var(--border)', fontSize: 12,
              }}>
                <span style={{ fontSize: 15 }}>{TYPE_ICONS[it.type] || '📌'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.note || it.type}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--dim-2)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {new Date(it.time).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })} · {new Date(it.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)', flexShrink: 0,
                  color: it.amount >= 0 ? '#00e676' : '#ff5252',
                }}>
                  {it.amount >= 0 ? '+' : ''}{it.amount.toLocaleString('en-US')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
