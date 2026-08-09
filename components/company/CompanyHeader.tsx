'use client';

// ═══════ CompanyHeader — الهيدر: عنوان + مؤشر live + ساعة + ميزانية ═══════

interface Props {
  connected: boolean;
  now: Date;
  budget: number;
  employeeCount: number;
  activeCount: number;
  kiosk?: boolean;
  onToggleKiosk?: () => void;
}

export default function CompanyHeader({ connected, now, budget, employeeCount, activeCount, kiosk, onToggleKiosk }: Props) {
  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(135deg, rgba(0,229,255,0.07), rgba(41,121,255,0.02), transparent)',
        borderColor: 'rgba(0,229,255,0.2)',
        padding: '18px 20px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* HUD corner brackets */}
      <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderTop: '2px solid rgba(0,229,255,0.4)', borderRight: '2px solid rgba(0,229,255,0.4)', borderTopRightRadius: 6 }} />
      <div style={{ position: 'absolute', bottom: 8, left: 8, width: 22, height: 22, borderBottom: '2px solid rgba(0,229,255,0.4)', borderLeft: '2px solid rgba(0,229,255,0.4)', borderBottomLeftRadius: 6 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🏢</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>مركز قيادة الشركة</div>
              <div style={{ fontSize: 11.5, color: 'var(--dim)', marginTop: 2 }}>Mission Control · عرض حي · التحديث كل 10 ثواني</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <span style={{
              width: 9, height: 9, borderRadius: '50%',
              background: connected ? '#00e676' : '#ff5252',
              boxShadow: connected ? '0 0 10px rgba(0,230,118,0.8)' : '0 0 10px rgba(255,82,82,0.8)',
              animation: connected ? 'pulse-dot 1.6s infinite' : 'none',
            }} />
            <span style={{ fontSize: 11.5, color: 'var(--dim)' }}>
              {connected ? 'متصل بالداشبورد · بيانات حية' : 'غير متصل — بيحاول يتصل...'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {onToggleKiosk && (
            <button
              onClick={onToggleKiosk}
              title={kiosk ? 'خروج من وضع العرض' : 'وضع العرض الكامل (Kiosk)'}
              style={{
                padding: '8px 12px', borderRadius: 10, fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
                background: kiosk ? 'rgba(255,82,82,0.1)' : 'rgba(255,255,255,0.04)',
                color: kiosk ? '#ff5252' : 'var(--dim)',
                border: `1px solid ${kiosk ? 'rgba(255,82,82,0.3)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >{kiosk ? '✕ خروج' : '⛶ عرض كامل'}</button>
          )}
          <div style={{ textAlign: 'center', padding: '8px 14px', borderRadius: 10, background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#00e5ff', fontFamily: 'var(--font-mono)' }}>
              {budget.toLocaleString('en-US')}
            </div>
            <div style={{ fontSize: 10, color: 'var(--dim)' }}>XPC الميزانية</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px 14px', borderRadius: 10, background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.15)' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#00e676', fontFamily: 'var(--font-mono)' }}>
              {activeCount}/{employeeCount}
            </div>
            <div style={{ fontSize: 10, color: 'var(--dim)' }}>نشط/إجمالي</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
              {now.toLocaleTimeString('ar-EG')}
            </div>
            <div style={{ fontSize: 10, color: 'var(--dim)' }}>{now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
