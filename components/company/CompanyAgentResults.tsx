'use client';

// ═══════ CompanyAgentResults — آخر نتائج الموظفين (عرض فقط) ═══════

interface Props {
  results: any;
}

const ACTION_LABELS: Record<string, string> = {
  fire: '🚪 رفد', hire: '🤝 توظيف', train: '📚 تدريب', promote: '🏆 ترقية', reinstate: '🔄 تفعيل',
  compete: '🎯 تنافس', 'train_direct': '🎓 تدريب مباشر', trial: '🧪 اختبار', xp: '⚡ XP',
};

export default function CompanyAgentResults({ results }: Props) {
  if (!results || Object.keys(results).length === 0) {
    return (
      <div className="card">
        <b style={{ fontSize: 14 }}>📋 آخر نتائج الموظفين</b>
        <div className="loading" style={{ marginTop: 10 }}>مفيش نتائج لسه — أول مهمة هتظهر هنا</div>
      </div>
    );
  }

  const entries = Object.entries(results).reverse();

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <b style={{ fontSize: 14 }}>📋 آخر نتائج الموظفين</b>
        <span style={{ fontSize: 10.5, color: 'var(--dim-2)' }}>{entries.length} نتيجة</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto', paddingInlineEnd: 4 }}>
        {entries.map(([key, val]: [string, any]) => {
          const ok = val?.success;
          const output = val?.output || '';
          const duration = val?.duration_s;
          const label = ACTION_LABELS[key] || key;
          return (
            <div key={key} style={{
              padding: '10px 12px', borderRadius: 10,
              background: ok ? 'rgba(0,230,118,0.04)' : 'rgba(255,82,82,0.04)',
              border: `1px solid ${ok ? 'rgba(0,230,118,0.18)' : 'rgba(255,82,82,0.18)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 800 }}>{label}</span>
                <span style={{
                  fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                  color: ok ? '#00e676' : '#ff5252',
                  background: ok ? 'rgba(0,230,118,0.1)' : 'rgba(255,82,82,0.1)',
                  border: `1px solid ${ok ? 'rgba(0,230,118,0.25)' : 'rgba(255,82,82,0.25)'}`,
                }}>
                  {ok ? '✅ نجح' : '❌ فشل'}
                </span>
              </div>
              <div style={{
                fontSize: 10.5, color: 'var(--dim)', lineHeight: 1.7,
                maxHeight: 72, overflow: 'hidden',
                display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
              }}>
                {output}
              </div>
              {duration != null && (
                <div style={{ fontSize: 9.5, color: 'var(--dim-2)', fontFamily: 'var(--font-mono)', marginTop: 5 }}>
                  ⏱️ {Math.round(duration)} ثانية
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
